<?php

namespace App\Http\Controllers;

use App\Models\Prestamo;
use App\Models\Ejemplar;
use App\Models\Lector;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class DevolucionController extends Controller
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
     * Mostrar la vista principal de devoluciones
     */
    public function index()
    {
        // Actualizar estado de préstamos vencidos antes de mostrar la vista
        $this->actualizarPrestamosVencidos();

        return Inertia::render('Devoluciones/Index');
    }

    /**
     * Buscar préstamos pendientes de un lector por código
     */
    public function buscarPrestamos(Request $request)
    {
        $codigo = $request->input('codigo');

        Log::info('🔍 Búsqueda de préstamos para devolución:', [
            'codigo_lector' => $codigo,
            'request_data' => $request->all()
        ]);

        if (empty($codigo)) {
            Log::warning('⚠️ Búsqueda sin código de lector');
            return response()->json([
                'success' => false,
                'message' => 'Código de lector requerido'
            ], 400);
        }

        try {
            // Buscar el lector
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

            // Actualizar estado de préstamos vencidos
            $this->actualizarPrestamosVencidos();

            // Buscar préstamos pendientes (ACTIVOS y VENCIDOS)
            $prestamos = Prestamo::with(['ejemplar.libro', 'lector'])
                ->where('lector_id', $lector->id)
                ->whereIn('estado', [Prestamo::ESTADO_ACTIVO, Prestamo::ESTADO_VENCIDO])
                ->orderBy('fecha_prestamo', 'desc')
                ->get();

            // Calcular días de retraso para cada préstamo
            $prestamos->transform(function ($prestamo) {
                if ($prestamo->fecha_devolucion) {
                    try {
                        $fechaDevolucion = Carbon::parse($prestamo->fecha_devolucion)->startOfDay();
                        $fechaActual = Carbon::now()->startOfDay();
                        
                        if ($fechaActual->gt($fechaDevolucion)) {
                            $prestamo->dias_retraso = $fechaActual->diffInDays($fechaDevolucion);
                            $prestamo->esta_vencido = true;
                        } else {
                            $prestamo->dias_retraso = 0;
                            $prestamo->esta_vencido = false;
                        }
                    } catch (\Exception $e) {
                        Log::warning('⚠️ Error calculando días de retraso:', [
                            'prestamo_id' => $prestamo->id,
                            'error' => $e->getMessage()
                        ]);
                        $prestamo->dias_retraso = 0;
                        $prestamo->esta_vencido = false;
                    }
                } else {
                    $prestamo->dias_retraso = 0;
                    $prestamo->esta_vencido = false;
                }
                return $prestamo;
            });

            Log::info('✅ Préstamos encontrados exitosamente:', [
                'lector_id' => $lector->id,
                'lector_nombre' => $lector->nombre,
                'total_prestamos' => $prestamos->count(),
                'prestamos_activos' => $prestamos->where('estado', 'ACTIVO')->count(),
                'prestamos_vencidos' => $prestamos->where('estado', 'VENCIDO')->count()
            ]);

            return response()->json([
                'success' => true,
                'lector' => $lector,
                'prestamos' => $prestamos
            ]);

        } catch (\Exception $e) {
            Log::error('❌ Error en búsqueda de préstamos:', [
                'codigo' => $codigo,
                'error_message' => $e->getMessage(),
                'error_file' => $e->getFile(),
                'error_line' => $e->getLine()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error interno del servidor al buscar préstamos'
            ], 500);
        }
    }

    /**
     * Procesar devolución de un préstamo (activo o vencido)
     */
    public function devolver(Request $request, $id)
    {
        Log::info('📤 Iniciando devolución de préstamo:', [
            'prestamo_id' => $id,
            'request_data' => $request->all()
        ]);

        // Validar los datos recibidos
        $request->validate([
            'fecha_devuelto' => 'required|date',
            'observaciones' => 'nullable|string|max:500',
        ]);

        try {
            $prestamo = Prestamo::findOrFail($id);

            // Verificar que el préstamo no esté ya devuelto
            if ($prestamo->estado === Prestamo::ESTADO_DEVUELTO) {
                return response()->json([
                    'success' => false,
                    'message' => 'Este préstamo ya ha sido devuelto.'
                ], 400);
            }

            // Verificar que el préstamo esté en estado válido para devolución
            if (!in_array($prestamo->estado, [Prestamo::ESTADO_ACTIVO, Prestamo::ESTADO_VENCIDO])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Este préstamo no está en un estado válido para devolución.'
                ], 400);
            }

            // Actualizar solo el préstamo (sin observaciones)
            $prestamo->update([
                'estado' => Prestamo::ESTADO_DEVUELTO,
                'fecha_devuelto' => $request->input('fecha_devuelto')
            ]);

            // Actualizar estado del ejemplar y guardar observaciones en el ejemplar
            $prestamo->ejemplar->update([
                'estado' => Ejemplar::ESTADO_DISPONIBLE,
                'observaciones' => $request->input('observaciones', '')
            ]);

            Log::info('✅ Préstamo devuelto exitosamente:', [
                'prestamo_id' => $prestamo->id,
                'lector_codigo' => $prestamo->lector->codigo,
                'libro_titulo' => $prestamo->ejemplar->libro->titulo,
                'fecha_devuelto' => $request->input('fecha_devuelto')
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Préstamo devuelto exitosamente',
                'prestamo' => $prestamo->load(['ejemplar.libro', 'lector'])
            ]);

        } catch (\Exception $e) {
            Log::error('❌ Error en devolución de préstamo:', [
                'prestamo_id' => $id,
                'error_message' => $e->getMessage(),
                'error_file' => $e->getFile(),
                'error_line' => $e->getLine()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al procesar la devolución: ' . $e->getMessage()
            ], 500);
        }
    }
}