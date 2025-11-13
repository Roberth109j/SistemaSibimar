<?php

namespace App\Http\Controllers;

use App\Models\Prestamo;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class PrestamoVencidoController extends Controller
{
    /**
     * Actualizar automáticamente el estado de préstamos vencidos
     *
     * Este método se ejecuta cuando:
     * - Un usuario inicia sesión
     * - Se accede al dashboard
     * - Se accede a la gestión de préstamos
     *
     * Optimización: Solo se ejecuta si han pasado al menos 5 minutos desde la última actualización
     * para evitar consultas innecesarias a la base de datos
     */
    public static function actualizarEstados(): array
    {
        // Obtener fecha actual solo como DATE (sin hora)
        $fechaActual = Carbon::now()->format('Y-m-d');

        Log::info('🔍 Iniciando verificación de préstamos vencidos:', [
            'fecha_actual' => $fechaActual
        ]);

        // Buscar préstamos que deben ser marcados como vencidos
        // IMPORTANTE: Usar whereDate para comparar solo fechas, no timestamp
        $prestamosVencidos = Prestamo::where('estado', Prestamo::ESTADO_ACTIVO)
            ->whereDate('fecha_devolucion', '<', $fechaActual)
            ->whereHas('ejemplar', function($query) {
                // Excluir ejemplares perdidos (no tiene sentido marcar como vencido un libro perdido)
                $query->where('estado', '!=', 'PERDIDO');
            })
            ->get();

        Log::info('📊 Préstamos encontrados para verificar:', [
            'total_encontrados' => $prestamosVencidos->count()
        ]);

        $cantidadActualizados = 0;

        foreach ($prestamosVencidos as $prestamo) {
            try {
                Log::info('🔄 Procesando préstamo:', [
                    'prestamo_id' => $prestamo->id,
                    'estado_actual' => $prestamo->estado,
                    'fecha_devolucion' => $prestamo->fecha_devolucion,
                    'ejemplar_id' => $prestamo->ejemplar_id,
                    'ejemplar_estado' => $prestamo->ejemplar->estado ?? 'N/A'
                ]);

                $prestamo->marcarComoVencido();
                $cantidadActualizados++;

                Log::info('✅ Préstamo marcado como vencido automáticamente:', [
                    'prestamo_id' => $prestamo->id,
                    'ejemplar_id' => $prestamo->ejemplar_id,
                    'lector_id' => $prestamo->lector_id,
                    'fecha_devolucion_esperada' => $prestamo->fecha_devolucion,
                    'dias_vencido' => Carbon::parse($prestamo->fecha_devolucion)->diffInDays(Carbon::now())
                ]);
            } catch (\Exception $e) {
                Log::error('❌ Error al marcar préstamo como vencido:', [
                    'prestamo_id' => $prestamo->id,
                    'error_message' => $e->getMessage(),
                    'error_trace' => $e->getTraceAsString()
                ]);
            }
        }

        if ($cantidadActualizados > 0) {
            Log::info('✅ Actualización de préstamos vencidos completada:', [
                'total_actualizados' => $cantidadActualizados,
                'fecha_ejecucion' => Carbon::now()->format('Y-m-d H:i:s')
            ]);
        } else {
            Log::info('ℹ️ No se encontraron préstamos vencidos para actualizar');
        }

        return [
            'actualizados' => $cantidadActualizados,
            'mensaje' => $cantidadActualizados > 0
                ? "Se actualizaron {$cantidadActualizados} préstamo(s) vencido(s)"
                : 'No hay préstamos vencidos para actualizar',
            'omitida' => false
        ];
    }

    /**
     * Obtener estadísticas de préstamos vencidos
     * Útil para dashboards y reportes
     */
    public static function obtenerEstadisticas(): array
    {
        $fechaActual = Carbon::now();

        return [
            'total_vencidos' => Prestamo::where('estado', Prestamo::ESTADO_VENCIDO)->count(),
            'total_activos_proximos_vencer' => Prestamo::where('estado', Prestamo::ESTADO_ACTIVO)
                ->whereBetween('fecha_devolucion', [$fechaActual, $fechaActual->copy()->addDays(3)])
                ->count(),
            'total_activos_vencidos_hoy' => Prestamo::where('estado', Prestamo::ESTADO_ACTIVO)
                ->whereDate('fecha_devolucion', '<', $fechaActual)
                ->count(),
        ];
    }

    /**
     * Forzar actualización ignorando el caché
     * Útil para actualizaciones manuales desde el frontend
     */
    public static function forzarActualizacion(): array
    {
        Cache::forget('prestamos_vencidos_ultima_actualizacion');

        Log::info('🔄 Actualización forzada de préstamos vencidos solicitada');

        return self::actualizarEstados();
    }
}
