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

        $prestamosVencidos = Prestamo::where('estado', Prestamo::ESTADO_ACTIVO)
            ->where('fecha_devolucion', '<', $fechaActual)
            ->get();

        foreach ($prestamosVencidos as $prestamo) {
            $prestamo->marcarComoVencido();
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
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ejemplar_id' => 'required|exists:ejemplares,id',
            'codigo_lector' => 'required|exists:lectores,codigo',
            'fecha_prestamo' => 'required|date',
            'fecha_devolucion' => 'required|date|after:fecha_prestamo',
            'observaciones' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator->errors());
        }

        // Verificar si el ejemplar está disponible
        $ejemplar = Ejemplar::findOrFail($request->input('ejemplar_id'));
        if ($ejemplar->estado !== Ejemplar::ESTADO_DISPONIBLE) {
            return back()->with('error', 'El ejemplar no está disponible para préstamo.');
        }

        // Obtener el lector por código
        $lector = Lector::where('codigo', $request->input('codigo_lector'))
            ->where('estado', 'ACTIVO')
            ->with('grado')
            ->first();

        if (!$lector) {
            return back()->with('error', 'El lector no existe o está inactivo.');
        }



        try {
            // Crear el préstamo con estado ACTIVO (sin observaciones)
            $prestamo = Prestamo::create([
                'ejemplar_id' => $ejemplar->id,
                'lector_id' => $lector->id,
                'fecha_prestamo' => $request->input('fecha_prestamo'),
                'fecha_devolucion' => $request->input('fecha_devolucion'),
                'fecha_devuelto' => null,
                'estado' => 'ACTIVO'
            ]);

            // Actualizar estado del ejemplar y guardar observaciones en el ejemplar
            $ejemplar->update([
                'estado' => Ejemplar::ESTADO_PRESTADO,
                'observaciones' => $request->input('observaciones', '')
            ]);

            return redirect()->route('prestamos.index')->with('success', 'Préstamo registrado exitosamente');
        } catch (\Exception $e) {
            return back()->with('error', 'Error al procesar el préstamo: ' . $e->getMessage());
        }
    }

    /**
     * Mostrar detalles de un préstamo
     */
    public function show(Prestamo $prestamo)
    {
        $prestamo->load(['ejemplar.libro', 'lector']);

        return Inertia::render('Prestamos/Show', [
            'prestamo' => $prestamo
        ]);
    }
}