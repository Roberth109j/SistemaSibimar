<?php

namespace App\Http\Controllers;

use App\Models\Libro;
use App\Models\Lector;
use App\Models\Prestamo;
use App\Models\Ejemplar;
use App\Models\Seccion;
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
        
        // Obtener la sección del usuario según su rol
        $user = auth()->user();
        $seccionId = null;
        
        if ($user->hasRole('BibliotecarioPrimaria')) {
            $seccion = Seccion::where('nombre', 'PRIMARIA')->first();
            $seccionId = $seccion ? $seccion->id : null;
        } elseif ($user->hasRole('BibliotecarioBachillerato')) {
            $seccion = Seccion::where('nombre', 'BACHILLERATO')->first();
            $seccionId = $seccion ? $seccion->id : null;
        }
        // Si es Admin, $seccionId permanece null para ver todos los datos

        // Obtener los 5 libros más prestados del año actual (filtrado por sección si aplica)
        $librosMasPrestadosQuery = Libro::select('libros.*', DB::raw('COUNT(prestamos.id) as total_prestamos'))
            ->join('ejemplares', 'libros.id', '=', 'ejemplares.libro_id')
            ->join('prestamos', 'ejemplares.id', '=', 'prestamos.ejemplar_id')
            ->join('lectores', 'prestamos.lector_id', '=', 'lectores.id')
            ->leftJoin('grados', 'lectores.grado_id', '=', 'grados.id')
            ->whereBetween('prestamos.fecha_prestamo', [$yearStart, $yearEnd]);
            
        if ($seccionId) {
            $librosMasPrestadosQuery->where('grados.seccion_id', $seccionId);
        }
        
        $librosMasPrestados = $librosMasPrestadosQuery
            ->groupBy('libros.id')
            ->orderBy('total_prestamos', 'desc')
            ->limit(5)
            ->get();

        // Obtener los 5 lectores docentes más frecuentes del año actual
        $docentesFrecuentes = Lector::select('lectores.*', DB::raw('COUNT(prestamos.id) as total_prestamos'))
            ->join('prestamos', 'lectores.id', '=', 'prestamos.lector_id')
            ->where('lectores.tipo', 'DOCENTE')
            ->whereBetween('prestamos.fecha_prestamo', [$yearStart, $yearEnd])
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
                    'grado' => null
                ];
            });

        // Obtener los 5 estudiantes más frecuentes del año actual (filtrado por sección si aplica)
        $estudiantesFrecuentesQuery = Lector::select('lectores.*', DB::raw('COUNT(prestamos.id) as total_prestamos'))
            ->join('prestamos', 'lectores.id', '=', 'prestamos.lector_id')
            ->leftJoin('grados', 'lectores.grado_id', '=', 'grados.id')
            ->where('lectores.tipo', 'ESTUDIANTE')
            ->whereBetween('prestamos.fecha_prestamo', [$yearStart, $yearEnd]);
            
        if ($seccionId) {
            $estudiantesFrecuentesQuery->where('grados.seccion_id', $seccionId);
        }
        
        $estudiantesFrecuentes = $estudiantesFrecuentesQuery
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

        // Preparar consultas para estadísticas generales (filtrado por sección si aplica)
        $prestamosQuery = Prestamo::join('lectores', 'prestamos.lector_id', '=', 'lectores.id')
            ->leftJoin('grados', 'lectores.grado_id', '=', 'grados.id')
            ->whereBetween('prestamos.fecha_prestamo', [$yearStart, $yearEnd]);
            
        if ($seccionId) {
            $prestamosQuery->where('grados.seccion_id', $seccionId);
        }
        
        $prestamosActivosQuery = Prestamo::join('lectores', 'prestamos.lector_id', '=', 'lectores.id')
            ->leftJoin('grados', 'lectores.grado_id', '=', 'grados.id')
            ->where('prestamos.estado', Prestamo::ESTADO_ACTIVO)
            ->whereBetween('prestamos.fecha_prestamo', [$yearStart, $yearEnd]);
            
        if ($seccionId) {
            $prestamosActivosQuery->where('grados.seccion_id', $seccionId);
        }
        
        $prestamosVencidosQuery = Prestamo::join('lectores', 'prestamos.lector_id', '=', 'lectores.id')
            ->leftJoin('grados', 'lectores.grado_id', '=', 'grados.id')
            ->where('prestamos.estado', Prestamo::ESTADO_VENCIDO)
            ->whereBetween('prestamos.fecha_prestamo', [$yearStart, $yearEnd]);
            
        if ($seccionId) {
            $prestamosVencidosQuery->where('grados.seccion_id', $seccionId);
        }
        
        $lectoresQuery = Lector::leftJoin('grados', 'lectores.grado_id', '=', 'grados.id');
        $docentesQuery = Lector::where('tipo', 'DOCENTE');
        $estudiantesQuery = Lector::leftJoin('grados', 'lectores.grado_id', '=', 'grados.id')
            ->where('lectores.tipo', 'ESTUDIANTE');
            
        if ($seccionId) {
            $lectoresQuery->where('grados.seccion_id', $seccionId);
            $docentesQuery = Lector::where('tipo', 'DOCENTE');
            $estudiantesQuery->where('grados.seccion_id', $seccionId);
        }
        
        // Contar ejemplares marcados como reposición (independientemente del estado)
        $librosReposicion = Ejemplar::where('tipo_adquisicion', 'REPOSICION')->count();

        // Preparar consultas para libros y ejemplares (filtrado por sección si aplica)
        $librosQuery = Libro::query();
        $ejemplaresQuery = Ejemplar::join('libros', 'ejemplares.libro_id', '=', 'libros.id');
        
        if ($seccionId) {
            $librosQuery->where('seccion_id', $seccionId);
            $ejemplaresQuery->where('libros.seccion_id', $seccionId);
        }
        
        // Obtener estadísticas generales del año actual
        $estadisticasGenerales = [
            'total_prestamos' => $prestamosQuery->count(),
            'prestamos_activos' => $prestamosActivosQuery->count(),
            'prestamos_vencidos' => $prestamosVencidosQuery->count(),
            'libros_reposicion' => $librosReposicion,
            'total_libros' => $librosQuery->count(),
            'total_lectores' => $lectoresQuery->count(),
            'total_ejemplares' => $ejemplaresQuery->count(),
            'total_docentes' => $docentesQuery->count(),
            'total_estudiantes' => $estudiantesQuery->count(),
        ];

        // Obtener datos para el gráfico de préstamos por mes del año actual (filtrado por sección si aplica)
        $prestamosPorMes = collect();
        for ($mes = 1; $mes <= 12; $mes++) {
            $prestamosMesQuery = Prestamo::join('lectores', 'prestamos.lector_id', '=', 'lectores.id')
                ->leftJoin('grados', 'lectores.grado_id', '=', 'grados.id')
                ->whereYear('prestamos.fecha_prestamo', $currentYear)
                ->whereMonth('prestamos.fecha_prestamo', $mes);
                
            if ($seccionId) {
                $prestamosMesQuery->where('grados.seccion_id', $seccionId);
            }
            
            $totalPrestamos = $prestamosMesQuery->count();
            
            $prestamosPorMes->push([
                'mes' => date('M', mktime(0, 0, 0, $mes, 1)),
                'mes_nombre' => date('F', mktime(0, 0, 0, $mes, 1)),
                'total' => $totalPrestamos
            ]);
        }

        // Obtener estadísticas de devolución del año actual (filtrado por sección si aplica)
        $devueltosTiempoQuery = Prestamo::join('lectores', 'prestamos.lector_id', '=', 'lectores.id')
            ->leftJoin('grados', 'lectores.grado_id', '=', 'grados.id')
            ->where('prestamos.estado', 'DEVUELTO')
            ->whereBetween('prestamos.fecha_prestamo', [$yearStart, $yearEnd])
            ->whereNotNull('prestamos.fecha_devuelto')
            ->whereRaw('DATE(prestamos.fecha_devuelto) <= DATE(prestamos.fecha_devolucion)');
            
        if ($seccionId) {
            $devueltosTiempoQuery->where('grados.seccion_id', $seccionId);
        }
        
        $devueltosTardeQuery = Prestamo::join('lectores', 'prestamos.lector_id', '=', 'lectores.id')
            ->leftJoin('grados', 'lectores.grado_id', '=', 'grados.id')
            ->whereIn('prestamos.estado', ['DEVUELTO', 'VENCIDO'])
            ->whereBetween('prestamos.fecha_prestamo', [$yearStart, $yearEnd])
            ->whereNotNull('prestamos.fecha_devuelto')
            ->whereRaw('DATE(prestamos.fecha_devuelto) > DATE(prestamos.fecha_devolucion)');
            
        if ($seccionId) {
            $devueltosTardeQuery->where('grados.seccion_id', $seccionId);
        }
        
        $estadisticasDevolucion = [
            'devueltos_tiempo' => $devueltosTiempoQuery->count(),
            'devueltos_tarde' => $devueltosTardeQuery->count(),
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

        // Estadísticas por grados (para estudiantes) (filtrado por sección si aplica)
        $prestamosPorGradoQuery = Lector::select('grados.grado', DB::raw('COUNT(prestamos.id) as total_prestamos'))
            ->join('prestamos', 'lectores.id', '=', 'prestamos.lector_id')
            ->join('grados', 'lectores.grado_id', '=', 'grados.id')
            ->where('lectores.tipo', 'ESTUDIANTE')
            ->whereBetween('prestamos.fecha_prestamo', [$yearStart, $yearEnd]);
            
        if ($seccionId) {
            $prestamosPorGradoQuery->where('grados.seccion_id', $seccionId);
        }
        
        $prestamosPorGrado = $prestamosPorGradoQuery
            ->groupBy('grados.grado')
            ->orderBy('total_prestamos', 'desc')
            ->get();

        // Distribución de lectores por tipo (filtrado por sección si aplica)
        $distribucionLectores = [
            ['tipo' => 'Docentes', 'cantidad' => $estadisticasGenerales['total_docentes']],
            ['tipo' => 'Estudiantes', 'cantidad' => $estadisticasGenerales['total_estudiantes']]
        ];

        // Tendencia semanal de los últimos 30 días (filtrado por sección si aplica)
        $tendenciaSemanal = collect();
        for ($i = 0; $i < 4; $i++) {
            $weekStart = now()->subWeeks($i)->startOfWeek();
            $weekEnd = now()->subWeeks($i)->endOfWeek();
            
            $tendenciaSemanalQuery = Prestamo::join('lectores', 'prestamos.lector_id', '=', 'lectores.id')
                ->leftJoin('grados', 'lectores.grado_id', '=', 'grados.id')
                ->whereBetween('prestamos.fecha_prestamo', [$weekStart, $weekEnd]);
                
            if ($seccionId) {
                $tendenciaSemanalQuery->where('grados.seccion_id', $seccionId);
            }
            
            $totalSemana = $tendenciaSemanalQuery->count();
            
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