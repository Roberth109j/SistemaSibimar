<?php

namespace App\Http\Controllers;

use App\Models\Prestamo;
use App\Models\Ejemplar;
use App\Models\Lector;
use App\Models\Libro;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PrestamoController extends Controller
{
    /**
     * Mostrar la vista de gestión de préstamos
     */
    public function index()
    {
        // Solo renderizamos la vista inicial, los libros se buscarán por AJAX
        return Inertia::render('Prestamos/Index');
    }

    /**
     * Buscar lector por código para el préstamo
     * MEJORADO: Con logs detallados para debugging
     */
    public function buscarLector(Request $request)
    {
        $codigo = $request->input('codigo');

        Log::info('🔍 Búsqueda de lector iniciada:', [
            'codigo_solicitado' => $codigo,
            'request_data' => $request->all()
        ]);

        if (empty($codigo)) {
            Log::warning('⚠️ Búsqueda de lector sin código');
            return response()->json([
                'success' => false,
                'message' => 'Código de lector requerido'
            ], 400);
        }

        try {
            $lector = Lector::where('codigo', $codigo)
                ->where('estado', 'ACTIVO')
                ->with(['grado'])
                ->first();

            if (!$lector) {
                Log::info('❌ Lector no encontrado:', [
                    'codigo_buscado' => $codigo
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Lector no encontrado o inactivo'
                ], 404);
            }

            Log::info('✅ Lector encontrado exitosamente:', [
                'lector_id' => $lector->id,
                'lector_nombre' => $lector->nombre,
                'lector_codigo' => $lector->codigo,
                'lector_estado' => $lector->estado,
                'grado' => $lector->grado ? $lector->grado->nombre : 'Sin grado'
            ]);

            return response()->json([
                'success' => true,
                'lector' => $lector
            ]);
        } catch (\Exception $e) {
            Log::error('❌ Error en búsqueda de lector:', [
                'codigo' => $codigo,
                'error_message' => $e->getMessage(),
                'error_file' => $e->getFile(),
                'error_line' => $e->getLine()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error interno del servidor al buscar lector'
            ], 500);
        }
    }

    /**
     * Crear un nuevo préstamo
     * **CORREGIDO: Las observaciones ahora se guardan en el ejemplar**
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ejemplar_id' => 'required|exists:ejemplares,id',
            'codigo_lector' => 'required|exists:lectores,codigo',
            'fecha_prestamo' => 'required|date',
            'fecha_devolucion' => 'required|date|after:fecha_prestamo',
            'observaciones' => 'nullable|string|max:500'
        ], [
            'ejemplar_id.required' => 'Debe seleccionar un ejemplar.',
            'ejemplar_id.exists' => 'El ejemplar seleccionado no existe.',
            'codigo_lector.required' => 'El código de lector es obligatorio.',
            'codigo_lector.exists' => 'El lector no existe.',
            'fecha_prestamo.required' => 'La fecha de préstamo es obligatoria.',
            'fecha_prestamo.date' => 'La fecha de préstamo debe ser una fecha válida.',
            'fecha_devolucion.required' => 'La fecha de devolución es obligatoria.',
            'fecha_devolucion.date' => 'La fecha de devolución debe ser una fecha válida.',
            'fecha_devolucion.after' => 'La fecha de devolución debe ser posterior a la fecha de préstamo.',
            'observaciones.max' => 'Las observaciones no pueden exceder 500 caracteres.'
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator->errors());
        }

        // Verificar si el ejemplar está disponible
        $ejemplar = Ejemplar::findOrFail($request->input('ejemplar_id'));
        
        Log::info('🔍 Verificando disponibilidad de ejemplar para préstamo:', [
            'ejemplar_id' => $ejemplar->id,
            'ejemplar_numero' => $ejemplar->numEjemplar,
            'estado_actual' => $ejemplar->estado
        ]);

        if ($ejemplar->estado !== 'DISPONIBLE') {
            Log::warning('⚠️ Intento de préstamo con ejemplar no disponible:', [
                'ejemplar_id' => $ejemplar->id,
                'estado_actual' => $ejemplar->estado
            ]);
            
            return back()->with('error', 'El ejemplar #' . $ejemplar->numEjemplar . ' no está disponible para préstamo. Estado actual: ' . $ejemplar->estado);
        }

        // Obtener el lector por código
        $lector = Lector::where('codigo', $request->input('codigo_lector'))
            ->where('estado', 'ACTIVO')
            ->with('grado')
            ->first();

        if (!$lector) {
            Log::warning('⚠️ Lector no encontrado o inactivo para préstamo:', [
                'codigo_lector' => $request->input('codigo_lector')
            ]);
            
            return back()->with('error', 'El lector no existe o está inactivo.');
        }

        try {
            DB::beginTransaction();

            // **CORREGIDO: Crear el préstamo SIN observaciones (van al ejemplar)**
            $prestamo = Prestamo::create([
                'ejemplar_id' => $ejemplar->id,
                'lector_id' => $lector->id,
                'fecha_prestamo' => $request->input('fecha_prestamo'),
                'fecha_devolucion' => $request->input('fecha_devolucion'),
                'fecha_devuelto' => null,
                'estado' => 'ACTIVO',
                'observaciones' => '' // **Las observaciones del préstamo quedan vacías**
            ]);

            // **CORREGIDO: Actualizar estado del ejemplar Y guardar observaciones en el ejemplar**
            $ejemplar->update([
                'estado' => 'PRESTADO',
                'observaciones' => $request->input('observaciones', '') // **Observaciones van al ejemplar**
            ]);

            DB::commit();

            Log::info('✅ Préstamo creado exitosamente:', [
                'prestamo_id' => $prestamo->id,
                'ejemplar_id' => $ejemplar->id,
                'ejemplar_numero' => $ejemplar->numEjemplar,
                'lector_id' => $lector->id,
                'lector_nombre' => $lector->nombre,
                'fecha_prestamo' => $prestamo->fecha_prestamo,
                'fecha_devolucion' => $prestamo->fecha_devolucion,
                'observaciones_ejemplar' => $ejemplar->observaciones // **Log de observaciones**
            ]);

            return redirect()->route('prestamos.index')->with('success', 
                'Préstamo registrado exitosamente. Ejemplar #' . $ejemplar->numEjemplar . ' prestado a ' . $lector->nombre
            );

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('❌ Error al crear préstamo:', [
                'error_message' => $e->getMessage(),
                'ejemplar_id' => $ejemplar->id,
                'lector_codigo' => $request->input('codigo_lector'),
                'request_data' => $request->all()
            ]);
            
            return back()->with('error', 'Error al procesar el préstamo: ' . $e->getMessage());
        }
    }

    /**
     * Mostrar detalles de un préstamo
     */
    public function show(Prestamo $prestamo)
    {
        $prestamo->load(['ejemplar.libro.autor', 'lector.grado']);

        return Inertia::render('Prestamos/Show', [
            'prestamo' => $prestamo
        ]);
    }

    /**
     * Mostrar el formulario para editar un préstamo
     */
    public function edit(Prestamo $prestamo)
    {
        // Solo permitir editar préstamos ACTIVOS
        if ($prestamo->estado !== 'ACTIVO') {
            return redirect()->route('prestamos.index')
                ->with('error', 'Solo se pueden editar préstamos activos.');
        }

        $prestamo->load(['ejemplar.libro', 'lector.grado']);

        return Inertia::render('Prestamos/Edit', [
            'prestamo' => $prestamo
        ]);
    }

    /**
     * Actualizar un préstamo existente
     * **CORREGIDO: Las observaciones se actualizan en el ejemplar**
     */
    public function update(Request $request, Prestamo $prestamo)
    {
        // Solo permitir actualizar préstamos ACTIVOS
        if ($prestamo->estado !== 'ACTIVO') {
            return back()->with('error', 'Solo se pueden actualizar préstamos activos.');
        }

        $validator = Validator::make($request->all(), [
            'fecha_prestamo' => 'required|date',
            'fecha_devolucion' => 'required|date|after:fecha_prestamo',
            'observaciones' => 'nullable|string|max:500'
        ], [
            'fecha_prestamo.required' => 'La fecha de préstamo es obligatoria.',
            'fecha_prestamo.date' => 'La fecha de préstamo debe ser una fecha válida.',
            'fecha_devolucion.required' => 'La fecha de devolución es obligatoria.',
            'fecha_devolucion.date' => 'La fecha de devolución debe ser una fecha válida.',
            'fecha_devolucion.after' => 'La fecha de devolución debe ser posterior a la fecha de préstamo.',
            'observaciones.max' => 'Las observaciones no pueden exceder 500 caracteres.'
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator->errors());
        }

        try {
            DB::beginTransaction();

            // **CORREGIDO: Actualizar solo fechas en el préstamo**
            $prestamo->update([
                'fecha_prestamo' => $request->input('fecha_prestamo'),
                'fecha_devolucion' => $request->input('fecha_devolucion')
                // **NO actualizar observaciones en el préstamo**
            ]);

            // **CORREGIDO: Actualizar observaciones en el ejemplar**
            $prestamo->ejemplar->update([
                'observaciones' => $request->input('observaciones', '')
            ]);

            DB::commit();

            Log::info('✅ Préstamo actualizado exitosamente:', [
                'prestamo_id' => $prestamo->id,
                'fecha_prestamo' => $prestamo->fecha_prestamo,
                'fecha_devolucion' => $prestamo->fecha_devolucion,
                'observaciones_ejemplar' => $prestamo->ejemplar->fresh()->observaciones
            ]);

            return redirect()->route('prestamos.index')->with('success', 
                'Préstamo actualizado exitosamente.'
            );

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('❌ Error al actualizar préstamo:', [
                'error_message' => $e->getMessage(),
                'prestamo_id' => $prestamo->id
            ]);
            
            return back()->with('error', 'Error al actualizar el préstamo: ' . $e->getMessage());
        }
    }

    /**
     * Cancelar un préstamo activo
     * Útil para casos donde se registró mal o se necesita anular
     *
     * NOTA: Este método no tiene ruta registrada actualmente.
     * El estado se marca como DEVUELTO (no existe CANCELADO en ENUM).
     */
    public function cancelar(Request $request, Prestamo $prestamo)
    {
        // Solo permitir cancelar préstamos ACTIVOS
        if ($prestamo->estado !== 'ACTIVO') {
            return back()->with('error', 'Solo se pueden cancelar préstamos activos.');
        }

        $validator = Validator::make($request->all(), [
            'motivo_cancelacion' => 'required|string|max:500'
        ], [
            'motivo_cancelacion.required' => 'El motivo de cancelación es obligatorio.',
            'motivo_cancelacion.max' => 'El motivo no puede exceder 500 caracteres.'
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator->errors());
        }

        try {
            DB::beginTransaction();

            // Marcar como devuelto (estado CANCELADO no existe en ENUM)
            $prestamo->update([
                'estado' => Prestamo::ESTADO_DEVUELTO,
                'fecha_devuelto' => now()->format('Y-m-d')
            ]);

            // Devolver el ejemplar al estado DISPONIBLE usando el método del modelo
            $prestamo->ejemplar->marcarComoDisponible();

            DB::commit();

            Log::info('🚫 Préstamo cancelado (marcado como devuelto):', [
                'prestamo_id' => $prestamo->id,
                'motivo' => $request->input('motivo_cancelacion'),
                'ejemplar_id' => $prestamo->ejemplar_id,
                'lector_id' => $prestamo->lector_id,
                'nota' => 'Estado CANCELADO no existe en ENUM, se marca como DEVUELTO'
            ]);

            return redirect()->route('prestamos.index')->with('success',
                'Préstamo cancelado exitosamente. El ejemplar #' . $prestamo->ejemplar->numEjemplar . ' está nuevamente disponible.'
            );

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('❌ Error al cancelar préstamo:', [
                'error_message' => $e->getMessage(),
                'prestamo_id' => $prestamo->id
            ]);
            
            return back()->with('error', 'Error al cancelar el préstamo: ' . $e->getMessage());
        }
    }
}