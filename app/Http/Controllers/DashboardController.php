<?php

namespace App\Http\Controllers;

use App\Models\Libro;
use App\Models\Lector;
use App\Models\Prestamo;
use App\Models\Ejemplar;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $currentYear = date('Y');
        $yearStart = $currentYear . '-01-01';
        $yearEnd = $currentYear . '-12-31';

        // Obtener los 5 libros más prestados del año actual
        $librosMasPrestados = Libro::select('libros.*', DB::raw('COUNT(prestamos.id) as total_prestamos'))
            ->join('ejemplares', 'libros.id', '=', 'ejemplares.libro_id')
            ->join('prestamos', 'ejemplares.id', '=', 'prestamos.ejemplar_id')
            ->whereBetween('prestamos.fecha_prestamo', [$yearStart, $yearEnd])
            ->groupBy('libros.id')
            ->orderBy('total_prestamos', 'desc')
            ->limit(5)
            ->get();

        // Obtener los 5 lectores docentes más frecuentes del año actual
        $docentesFrecuentes = Lector::select('lectores.*', DB::raw('COUNT(prestamos.id) as total_prestamos'))
            ->join('prestamos', 'lectores.id', '=', 'prestamos.lector_id')
            ->leftJoin('grados', 'lectores.grado_id', '=', 'grados.id')
            ->where('lectores.tipo', 'DOCENTE')
            ->whereBetween('prestamos.fecha_prestamo', [$yearStart, $yearEnd])
            ->with('grado')
            ->groupBy('lectores.id')
            ->orderBy('total_prestamos', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($lector) {
                return [
                    'id' => $lector->id,
                    'nombre' => $lector->nombre,
                    'total_prestamos' => $lector->total_prestamos,
                    'tipo' => $lector->tipo,
                    'grado' => $lector->grado ? [
                        'grado' => $lector->grado->grado,
                        'subGrado' => $lector->grado->subGrado
                    ] : null
                ];
            });

        // Obtener los 5 estudiantes más frecuentes del año actual
        $estudiantesFrecuentes = Lector::select('lectores.*', DB::raw('COUNT(prestamos.id) as total_prestamos'))
            ->join('prestamos', 'lectores.id', '=', 'prestamos.lector_id')
            ->leftJoin('grados', 'lectores.grado_id', '=', 'grados.id')
            ->where('lectores.tipo', 'ESTUDIANTE')
            ->whereBetween('prestamos.fecha_prestamo', [$yearStart, $yearEnd])
            ->with('grado')
            ->groupBy('lectores.id')
            ->orderBy('total_prestamos', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($lector) {
                return [
                    'id' => $lector->id,
                    'nombre' => $lector->nombre,
                    'total_prestamos' => $lector->total_prestamos,
                    'tipo' => $lector->tipo,
                    'grado' => $lector->grado ? [
                        'grado' => $lector->grado->grado,
                        'subGrado' => $lector->grado->subGrado
                    ] : null
                ];
            });

        // Obtener estadísticas generales del año actual
        $estadisticasGenerales = [
            'total_prestamos' => Prestamo::whereBetween('fecha_prestamo', [$yearStart, $yearEnd])->count(),
            'prestamos_activos' => Prestamo::where('estado', Prestamo::ESTADO_ACTIVO)
                ->whereBetween('fecha_prestamo', [$yearStart, $yearEnd])
                ->count(),
            'prestamos_vencidos' => Prestamo::where('estado', Prestamo::ESTADO_VENCIDO)
                ->whereBetween('fecha_prestamo', [$yearStart, $yearEnd])
                ->count(),
            'total_libros' => Libro::count(),
            'total_lectores' => Lector::count(),
            'total_ejemplares' => Ejemplar::count(),
            'total_docentes' => Lector::where('tipo', 'DOCENTE')->count(),
            'total_estudiantes' => Lector::where('tipo', 'ESTUDIANTE')->count(),
        ];

        // Obtener datos para el gráfico de préstamos por mes del año actual
        $prestamosPorMes = collect();
        for ($mes = 1; $mes <= 12; $mes++) {
            $totalPrestamos = Prestamo::whereYear('fecha_prestamo', $currentYear)
                ->whereMonth('fecha_prestamo', $mes)
                ->count();
            
            $prestamosPorMes->push([
                'mes' => date('M', mktime(0, 0, 0, $mes, 1)),
                'mes_nombre' => date('F', mktime(0, 0, 0, $mes, 1)),
                'total' => $totalPrestamos
            ]);
        }

        // Obtener estadísticas de devolución del año actual
        $estadisticasDevolucion = [
            'devueltos_tiempo' => Prestamo::where('estado', 'DEVUELTO')
                ->whereBetween('fecha_prestamo', [$yearStart, $yearEnd])
                ->whereNotNull('fecha_devuelto')
                ->whereRaw('DATE(fecha_devuelto) <= DATE(fecha_devolucion)')
                ->count(),
            'devueltos_tarde' => Prestamo::whereIn('estado', ['DEVUELTO', 'VENCIDO'])
                ->whereBetween('fecha_prestamo', [$yearStart, $yearEnd])
                ->whereNotNull('fecha_devuelto')
                ->whereRaw('DATE(fecha_devuelto) > DATE(fecha_devolucion)')
                ->count(),
        ];

        // Calcular tasa de devolución a tiempo
        $totalDevueltos = $estadisticasDevolucion['devueltos_tiempo'] + $estadisticasDevolucion['devueltos_tarde'];
        $tasaDevolucionTiempo = $totalDevueltos > 0
            ? round(($estadisticasDevolucion['devueltos_tiempo'] / $totalDevueltos) * 100, 2)
            : 0;

        // Estadísticas adicionales para el nuevo diseño
        $estadisticasAdicionales = [
            'promedio_prestamos_mes' => round($estadisticasGenerales['total_prestamos'] / 12, 1),
            'libro_mas_popular' => $librosMasPrestados->first(),
            'mes_mas_activo' => $prestamosPorMes->sortByDesc('total')->first(),
        ];

        // Estadísticas por grados (para estudiantes)
        $prestamosPorGrado = Lector::select('grados.grado', DB::raw('COUNT(prestamos.id) as total_prestamos'))
            ->join('prestamos', 'lectores.id', '=', 'prestamos.lector_id')
            ->join('grados', 'lectores.grado_id', '=', 'grados.id')
            ->where('lectores.tipo', 'ESTUDIANTE')
            ->whereBetween('prestamos.fecha_prestamo', [$yearStart, $yearEnd])
            ->groupBy('grados.grado')
            ->orderBy('total_prestamos', 'desc')
            ->get();

        // Distribución de lectores por tipo
        $distribucionLectores = [
            ['tipo' => 'Docentes', 'cantidad' => $estadisticasGenerales['total_docentes']],
            ['tipo' => 'Estudiantes', 'cantidad' => $estadisticasGenerales['total_estudiantes']]
        ];

        // Tendencia semanal de los últimos 30 días
        $tendenciaSemanal = collect();
        for ($i = 0; $i < 4; $i++) {
            $weekStart = now()->subWeeks($i)->startOfWeek();
            $weekEnd = now()->subWeeks($i)->endOfWeek();
            
            $totalSemana = Prestamo::whereBetween('fecha_prestamo', [$weekStart, $weekEnd])->count();
            
            $tendenciaSemanal->push([
                'semana' => 'Sem ' . ($i + 1),
                'total' => $totalSemana
            ]);
        }
        $tendenciaSemanal = $tendenciaSemanal->reverse()->values();

        return Inertia::render('dashboard', [
            'librosMasPrestados' => $librosMasPrestados,
            'docentesFrecuentes' => $docentesFrecuentes,
            'estudiantesFrecuentes' => $estudiantesFrecuentes,
            'estadisticasGenerales' => $estadisticasGenerales,
            'prestamosPorMes' => $prestamosPorMes->values(),
            'estadisticasDevolucion' => $estadisticasDevolucion,
            'tasaDevolucionTiempo' => $tasaDevolucionTiempo,
            'estadisticasAdicionales' => $estadisticasAdicionales,
            'prestamosPorGrado' => $prestamosPorGrado,
            'distribucionLectores' => $distribucionLectores,
            'tendenciaSemanal' => $tendenciaSemanal,
            'yearCurrent' => $currentYear,
        ]);
    }
}