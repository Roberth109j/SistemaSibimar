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

        // **MEJORADO: Solo actualizar préstamos de ejemplares que NO estén perdidos**
        $prestamosVencidos = Prestamo::where('estado', 'ACTIVO')
            ->where('fecha_devolucion', '<', $fechaActual)
            ->whereHas('ejemplar', function($query) {
                $query->where('estado', '!=', 'PERDIDO'); // **Excluir ejemplares perdidos**
            })
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
     * **MODIFICADO: Excluye préstamos de ejemplares perdidos**
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

            // **MODIFICADO: Buscar préstamos pendientes EXCLUYENDO ejemplares perdidos**
            $prestamos = Prestamo::with(['ejemplar.libro', 'lector'])
                ->where('lector_id', $lector->id)
                ->whereIn('estado', ['ACTIVO', 'VENCIDO'])
                ->whereHas('ejemplar', function($query) {
                    // **CLAVE: Solo incluir ejemplares que NO estén perdidos**
                    $query->where('estado', '!=', 'PERDIDO');
                })
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

            // **AGREGADO: Contar préstamos excluidos por ejemplares perdidos para logging**
            $prestamosExcluidosPorPerdidos = Prestamo::where('lector_id', $lector->id)
                ->whereIn('estado', ['ACTIVO', 'VENCIDO'])
                ->whereHas('ejemplar', function($query) {
                    $query->where('estado', 'PERDIDO');
                })
                ->count();

            Log::info('✅ Préstamos encontrados exitosamente:', [
                'lector_id' => $lector->id,
                'lector_nombre' => $lector->nombre,
                'total_prestamos' => $prestamos->count(),
                'prestamos_activos' => $prestamos->where('estado', 'ACTIVO')->count(),
                'prestamos_vencidos' => $prestamos->where('estado', 'VENCIDO')->count(),
                'prestamos_excluidos_perdidos' => $prestamosExcluidosPorPerdidos // **Info adicional**
            ]);

            // **MENSAJE PERSONALIZADO si hay préstamos excluidos**
            $mensaje = '';
            if ($prestamos->count() === 0 && $prestamosExcluidosPorPerdidos > 0) {
                $mensaje = "Lector encontrado. Sus préstamos están asociados a ejemplares marcados como perdidos.";
            } elseif ($prestamos->count() === 0) {
                $mensaje = "Lector encontrado. No tiene préstamos pendientes de devolución.";
            } else {
                $mensaje = "Se encontraron {$prestamos->count()} préstamo(s) pendiente(s) de devolución";
                if ($prestamosExcluidosPorPerdidos > 0) {
                    $mensaje .= " ({$prestamosExcluidosPorPerdidos} préstamo(s) de ejemplares perdidos no se muestran)";
                }
            }

            return response()->json([
                'success' => true,
                'lector' => $lector,
                'prestamos' => $prestamos,
                'message' => $mensaje
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
     * **MEJORADO: Verificar que el ejemplar no esté perdido**
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
        ], [
            'fecha_devuelto.required' => 'La fecha de devolución es obligatoria.',
            'fecha_devuelto.date' => 'La fecha de devolución debe ser una fecha válida.',
            'observaciones.max' => 'Las observaciones no pueden exceder 500 caracteres.'
        ]);

        try {
            $prestamo = Prestamo::with(['ejemplar', 'lector'])->findOrFail($id);

            // **NUEVA VALIDACIÓN: Verificar que el ejemplar no esté perdido**
            if ($prestamo->ejemplar->estado === 'PERDIDO') {
                Log::warning('⚠️ Intento de devolución de ejemplar perdido:', [
                    'prestamo_id' => $prestamo->id,
                    'ejemplar_id' => $prestamo->ejemplar->id,
                    'ejemplar_numero' => $prestamo->ejemplar->numEjemplar,
                    'estado_ejemplar' => $prestamo->ejemplar->estado
                ]);

                return response()->json([
                    'success' => false,
                    'message' => "No se puede procesar la devolución. El ejemplar #{$prestamo->ejemplar->numEjemplar} está marcado como perdido."
                ], 400);
            }

            // Verificar que el préstamo no esté ya devuelto
            if ($prestamo->estado === 'DEVUELTO') {
                return response()->json([
                    'success' => false,
                    'message' => 'Este préstamo ya ha sido devuelto.'
                ], 400);
            }

            // Verificar que el préstamo esté en estado válido para devolución
            if (!in_array($prestamo->estado, ['ACTIVO', 'VENCIDO'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Este préstamo no está en un estado válido para devolución.'
                ], 400);
            }

            // **TRANSACCIÓN PARA ASEGURAR CONSISTENCIA**
            \DB::beginTransaction();

            // Actualizar solo el préstamo
            $prestamo->update([
                'estado' => 'DEVUELTO',
                'fecha_devuelto' => $request->input('fecha_devuelto')
            ]);

            // Actualizar estado del ejemplar y guardar observaciones en el ejemplar
            $prestamo->ejemplar->update([
                'estado' => 'DISPONIBLE',
                'observaciones' => $request->input('observaciones', '')
            ]);

            \DB::commit();

            Log::info('✅ Préstamo devuelto exitosamente:', [
                'prestamo_id' => $prestamo->id,
                'ejemplar_numero' => $prestamo->ejemplar->numEjemplar,
                'lector_codigo' => $prestamo->lector->codigo,
                'libro_titulo' => $prestamo->ejemplar->libro->titulo,
                'fecha_devuelto' => $request->input('fecha_devuelto')
            ]);

            return response()->json([
                'success' => true,
                'message' => "Devolución procesada exitosamente. Ejemplar #{$prestamo->ejemplar->numEjemplar} nuevamente disponible.",
                'prestamo' => $prestamo->fresh(['ejemplar.libro', 'lector'])
            ]);

        } catch (\Exception $e) {
            \DB::rollBack();
            
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

    /**
     * **NUEVO MÉTODO: Obtener información sobre préstamos afectados por ejemplares perdidos**
     */
    public function obtenerPrestamosAfectadosPorPerdidos($lectorId)
    {
        try {
            $prestamosAfectados = Prestamo::with(['ejemplar.libro'])
                ->where('lector_id', $lectorId)
                ->whereIn('estado', ['ACTIVO', 'VENCIDO'])
                ->whereHas('ejemplar', function($query) {
                    $query->where('estado', 'PERDIDO');
                })
                ->get();

            return response()->json([
                'success' => true,
                'prestamos_afectados' => $prestamosAfectados,
                'total' => $prestamosAfectados->count()
            ]);
        } catch (\Exception $e) {
            Log::error('❌ Error obteniendo préstamos afectados por pérdidas:', [
                'lector_id' => $lectorId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al obtener información de préstamos afectados'
            ], 500);
        }
    }
}