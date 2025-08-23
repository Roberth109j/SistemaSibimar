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
     * Actualizar automáticamente el estado de préstamos vencidos
     */
    private function actualizarPrestamosVencidos()
    {
        $fechaActual = Carbon::now();

        $prestamosVencidos = Prestamo::where('estado', 'ACTIVO')
            ->where('fecha_devolucion', '<', $fechaActual)
            ->get();

        foreach ($prestamosVencidos as $prestamo) {
            $prestamo->update([
                'estado' => 'VENCIDO',
                'observaciones_devolucion' => 'Préstamo vencido automáticamente por fecha'
            ]);
            
            Log::info('📅 Préstamo marcado como vencido por fecha:', [
                'prestamo_id' => $prestamo->id,
                'fecha_devolucion' => $prestamo->fecha_devolucion,
                'fecha_actual' => $fechaActual
            ]);
        }
    }

    /**
     * Mostrar la vista de gestión de préstamos
     */
    public function index()
    {
        // Actualizar estado de préstamos vencidos
        $this->actualizarPrestamosVencidos();

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
     * **MEJORADO: Con mejor validación y manejo de estados**
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

            // Crear el préstamo con estado ACTIVO
            $prestamo = Prestamo::create([
                'ejemplar_id' => $ejemplar->id,
                'lector_id' => $lector->id,
                'fecha_prestamo' => $request->input('fecha_prestamo'),
                'fecha_devolucion' => $request->input('fecha_devolucion'),
                'fecha_devuelto' => null,
                'estado' => 'ACTIVO',
                'observaciones' => $request->input('observaciones', '')
            ]);

            // Actualizar estado del ejemplar a PRESTADO
            $ejemplar->update([
                'estado' => 'PRESTADO'
            ]);

            DB::commit();

            Log::info('✅ Préstamo creado exitosamente:', [
                'prestamo_id' => $prestamo->id,
                'ejemplar_id' => $ejemplar->id,
                'ejemplar_numero' => $ejemplar->numEjemplar,
                'lector_id' => $lector->id,
                'lector_nombre' => $lector->nombre,
                'fecha_prestamo' => $prestamo->fecha_prestamo,
                'fecha_devolucion' => $prestamo->fecha_devolucion
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
     * **NUEVO MÉTODO: Procesar devolución de préstamo**
     */
    public function devolver(Request $request, Prestamo $prestamo)
    {
        if ($prestamo->estado !== 'ACTIVO') {
            return back()->with('error', 'Este préstamo ya no está activo.');
        }

        $validator = Validator::make($request->all(), [
            'observaciones_devolucion' => 'nullable|string|max:500'
        ], [
            'observaciones_devolucion.max' => 'Las observaciones de devolución no pueden exceder 500 caracteres.'
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator->errors());
        }

        try {
            DB::beginTransaction();

            // Marcar préstamo como devuelto
            $prestamo->update([
                'estado' => 'DEVUELTO',
                'fecha_devuelto' => Carbon::now(),
                'observaciones_devolucion' => $request->input('observaciones_devolucion', '')
            ]);

            // Cambiar estado del ejemplar a DISPONIBLE
            $prestamo->ejemplar->update([
                'estado' => 'DISPONIBLE'
            ]);

            DB::commit();

            Log::info('✅ Préstamo devuelto exitosamente:', [
                'prestamo_id' => $prestamo->id,
                'ejemplar_id' => $prestamo->ejemplar_id,
                'lector_id' => $prestamo->lector_id,
                'fecha_devuelto' => $prestamo->fecha_devuelto
            ]);

            return redirect()->route('prestamos.index')->with('success', 
                'Devolución procesada exitosamente. Ejemplar #' . $prestamo->ejemplar->numEjemplar . ' nuevamente disponible.'
            );

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('❌ Error al procesar devolución:', [
                'error_message' => $e->getMessage(),
                'prestamo_id' => $prestamo->id
            ]);
            
            return back()->with('error', 'Error al procesar la devolución: ' . $e->getMessage());
        }
    }

    /**
     * **NUEVO MÉTODO: Marcar préstamo como vencido manualmente**
     */
    public function marcarVencido(Request $request, Prestamo $prestamo)
    {
        if ($prestamo->estado !== 'ACTIVO') {
            return back()->with('error', 'Este préstamo ya no está activo.');
        }

        $validator = Validator::make($request->all(), [
            'motivo' => 'nullable|string|max:500'
        ], [
            'motivo.max' => 'El motivo no puede exceder 500 caracteres.'
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator->errors());
        }

        try {
            $motivo = $request->input('motivo', 'Marcado como vencido manualmente');

            $prestamo->update([
                'estado' => 'VENCIDO',
                'observaciones_devolucion' => $motivo
            ]);

            Log::info('⚠️ Préstamo marcado como vencido manualmente:', [
                'prestamo_id' => $prestamo->id,
                'motivo' => $motivo,
                'ejemplar_id' => $prestamo->ejemplar_id,
                'lector_id' => $prestamo->lector_id
            ]);

            return redirect()->route('prestamos.index')->with('success', 
                'Préstamo marcado como vencido. El ejemplar #' . $prestamo->ejemplar->numEjemplar . ' mantiene su estado actual.'
            );

        } catch (\Exception $e) {
            Log::error('❌ Error al marcar préstamo como vencido:', [
                'error_message' => $e->getMessage(),
                'prestamo_id' => $prestamo->id
            ]);
            
            return back()->with('error', 'Error al marcar el préstamo como vencido: ' . $e->getMessage());
        }
    }
}