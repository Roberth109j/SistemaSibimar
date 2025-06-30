<?php

namespace App\Http\Controllers;

use App\Models\Libro;
use App\Models\Lector;
use App\Models\Prestamo;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        // Obtener los 5 libros más prestados
        $librosMasPrestados = Libro::select('libros.*', DB::raw('COUNT(prestamos.id) as total_prestamos'))
            ->join('ejemplares', 'libros.id', '=', 'ejemplares.libro_id')
            ->join('prestamos', 'ejemplares.id', '=', 'prestamos.ejemplar_id')
            ->groupBy('libros.id')
            ->orderBy('total_prestamos', 'desc')
            ->limit(5)
            ->get();

        // Obtener los 5 lectores más frecuentes
        $lectoresFrecuentes = Lector::select('lectores.*', DB::raw('COUNT(prestamos.id) as total_prestamos'))
            ->join('prestamos', 'lectores.id', '=', 'prestamos.lector_id')
            ->groupBy('lectores.id')
            ->orderBy('total_prestamos', 'desc')
            ->limit(5)
            ->get();

        // Obtener estadísticas generales
        $estadisticasGenerales = [
            'total_prestamos' => Prestamo::count(),
            'prestamos_activos' => Prestamo::where('estado', Prestamo::ESTADO_ACTIVO)->count(),
            'prestamos_vencidos' => Prestamo::where('estado', Prestamo::ESTADO_VENCIDO)->count(),
            'total_libros' => Libro::count(),
            'total_lectores' => Lector::count(),
        ];

        // Obtener datos para el gráfico de préstamos por mes
        $prestamosPorMes = Prestamo::select(DB::raw('MONTH(fecha_prestamo) as mes'), DB::raw('COUNT(*) as total'))
            ->whereYear('fecha_prestamo', date('Y'))
            ->groupBy('mes')
            ->orderBy('mes')
            ->get()
            ->map(function ($item) {
                return [
                    'mes' => date('F', mktime(0, 0, 0, $item->mes, 1)),
                    'total' => $item->total
                ];
            });

        // Obtener estadísticas de devolución
        $estadisticasDevolucion = [
            'devueltos_tiempo' => Prestamo::where('estado', 'DEVUELTO')
                ->whereNotNull('fecha_devuelto')
                ->whereRaw('DATE(fecha_devuelto) <= DATE(fecha_devolucion)')
                ->count(),
            'devueltos_tarde' => Prestamo::whereIn('estado', ['DEVUELTO', 'VENCIDO'])
                ->whereNotNull('fecha_devuelto')
                ->whereRaw('DATE(fecha_devuelto) > DATE(fecha_devolucion)')
                ->count(),
        ];

        // Calcular tasa de devolución a tiempo
        $totalDevueltos = $estadisticasDevolucion['devueltos_tiempo'] + $estadisticasDevolucion['devueltos_tarde'];
        $tasaDevolucionTiempo = $totalDevueltos > 0 
            ? round(($estadisticasDevolucion['devueltos_tiempo'] / $totalDevueltos) * 100, 2)
            : 0;

        return Inertia::render('dashboard', [
            'librosMasPrestados' => $librosMasPrestados,
            'lectoresFrecuentes' => $lectoresFrecuentes,
            'estadisticasGenerales' => $estadisticasGenerales,
            'prestamosPorMes' => $prestamosPorMes,
            'estadisticasDevolucion' => $estadisticasDevolucion,
            'tasaDevolucionTiempo' => $tasaDevolucionTiempo,
        ]);
    }
}