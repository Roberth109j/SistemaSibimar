<?php

namespace App\Http\Controllers;

use App\Models\Prestamo;
use App\Models\Lector;
use App\Models\Libro;
use App\Models\Grado;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;

class InformeController extends Controller
{
    /**
     * Mostrar la página principal de informes
     */
    public function index()
    {
        return Inertia::render('Informes/Index');
    }

    /**
     * Generar informe de préstamos realizados
     */
    public function prestamosRealizados(Request $request)
    {
        $validated = $request->validate([
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
            'periodo' => 'nullable|in:mensual,trimestral,semestral,anual',
            'formato' => 'required|in:vista,pdf'
        ]);

        try {
            $fechaInicio = Carbon::parse($validated['fecha_inicio'])->startOfDay();
            $fechaFin = Carbon::parse($validated['fecha_fin'])->endOfDay();

            // Verificar si existen préstamos en la base de datos
            $totalPrestamos = Prestamo::count();
            
            if ($totalPrestamos === 0) {
                return back()->with('error', 'No hay préstamos registrados en la base de datos.');
            }

            // Consulta base de préstamos
            $prestamos = Prestamo::with(['ejemplar.libro.autor', 'lector.grado'])
                ->whereBetween('fecha_prestamo', [$fechaInicio, $fechaFin])
                ->orderBy('fecha_prestamo', 'desc')
                ->get();

            // Estadísticas generales
            $estadisticas = [
                'total_prestamos' => $prestamos->count(),
                'prestamos_activos' => $prestamos->where('estado', 'ACTIVO')->count(),
                'prestamos_devueltos' => $prestamos->where('estado', 'DEVUELTO')->count(),
                'prestamos_vencidos' => $prestamos->where('estado', 'VENCIDO')->count(),
                'libros_mas_prestados' => $this->getLibrosMasPrestados($prestamos),
                'prestamos_por_mes' => $this->getPrestamosPorMes($prestamos, $fechaInicio, $fechaFin),
                'prestamos_por_grado' => $this->getPrestamosPorGrado($prestamos),
                'prestamos_por_estado' => $this->getPrestamosPorEstado($prestamos)
            ];

            $datos = [
                'prestamos' => $prestamos,
                'estadisticas' => $estadisticas,
                'periodo' => [
                    'inicio' => $fechaInicio->format('d/m/Y'),
                    'fin' => $fechaFin->format('d/m/Y'),
                    'tipo' => $validated['periodo'] ?? 'personalizado'
                ]
            ];

            if ($validated['formato'] === 'pdf') {
                return $this->generarPDFPrestamos($datos);
            }

            return Inertia::render('Informes/PrestamosRealizados', $datos);

        } catch (\Exception $e) {
            Log::error('Error generando informe de préstamos: ' . $e->getMessage());
            return back()->with('error', 'Error al generar el informe: ' . $e->getMessage());
        }
    }

    /**
     * Generar informe de libros no devueltos
     */
    public function librosNoDevueltos(Request $request)
    {
        $validated = $request->validate([
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
            'periodo' => 'nullable|in:mensual,trimestral,semestral,anual',
            'formato' => 'required|in:vista,pdf'
        ]);

        try {
            $fechaInicio = Carbon::parse($validated['fecha_inicio'])->startOfDay();
            $fechaFin = Carbon::parse($validated['fecha_fin'])->endOfDay();

            // Préstamos no devueltos (ACTIVO y VENCIDO)
            $prestamosNoDevueltos = Prestamo::with([
                'ejemplar.libro.autor', 
                'lector.grado'
            ])
                ->whereIn('estado', ['ACTIVO', 'VENCIDO'])
                ->whereBetween('fecha_prestamo', [$fechaInicio, $fechaFin])
                ->orderBy('fecha_devolucion', 'asc')
                ->get()
                ->map(function ($prestamo) {
                    $prestamo->dias_retraso = $prestamo->estado === 'VENCIDO' 
                        ? Carbon::now()->diffInDays(Carbon::parse($prestamo->fecha_devolucion))
                        : 0;
                    return $prestamo;
                });

            // Estadísticas específicas
            $estadisticas = [
                'total_no_devueltos' => $prestamosNoDevueltos->count(),
                'activos' => $prestamosNoDevueltos->where('estado', 'ACTIVO')->count(),
                'vencidos' => $prestamosNoDevueltos->where('estado', 'VENCIDO')->count(),
                'promedio_dias_retraso' => $prestamosNoDevueltos->where('estado', 'VENCIDO')->avg('dias_retraso') ?? 0,
                'por_grado' => $this->getNoDevueltosPorGrado($prestamosNoDevueltos),
                'por_severidad' => $this->getNoDevueltosPorSeveridad($prestamosNoDevueltos)
            ];

            $datos = [
                'prestamos_no_devueltos' => $prestamosNoDevueltos,
                'estadisticas' => $estadisticas,
                'periodo' => [
                    'inicio' => $fechaInicio->format('d/m/Y'),
                    'fin' => $fechaFin->format('d/m/Y'),
                    'tipo' => $validated['periodo'] ?? 'personalizado'
                ]
            ];

            if ($validated['formato'] === 'pdf') {
                return $this->generarPDFNoDevueltos($datos);
            }

            return Inertia::render('Informes/LibrosNoDevueltos', $datos);

        } catch (\Exception $e) {
            Log::error('Error generando informe de no devueltos: ' . $e->getMessage());
            return back()->with('error', 'Error al generar el informe: ' . $e->getMessage());
        }
    }

    /**
     * Obtener rangos de fechas predefinidos
     */
    public function getRangosFecha()
    {
        $hoy = Carbon::now();
        
        return response()->json([
            'mensual' => [
                'inicio' => $hoy->copy()->startOfMonth()->format('Y-m-d'),
                'fin' => $hoy->copy()->endOfMonth()->format('Y-m-d')
            ],
            'trimestral' => [
                'inicio' => $hoy->copy()->startOfQuarter()->format('Y-m-d'),
                'fin' => $hoy->copy()->endOfQuarter()->format('Y-m-d')
            ],
            'semestral' => [
                'inicio' => $hoy->month <= 6 
                    ? $hoy->copy()->startOfYear()->format('Y-m-d')
                    : $hoy->copy()->month(7)->startOfMonth()->format('Y-m-d'),
                'fin' => $hoy->month <= 6 
                    ? $hoy->copy()->month(6)->endOfMonth()->format('Y-m-d')
                    : $hoy->copy()->endOfYear()->format('Y-m-d')
            ],
            'anual' => [
                'inicio' => $hoy->copy()->startOfYear()->format('Y-m-d'),
                'fin' => $hoy->copy()->endOfYear()->format('Y-m-d')
            ]
        ]);
    }

    // MÉTODOS PRIVADOS PARA ESTADÍSTICAS
    
    private function getLibrosMasPrestados($prestamos)
    {
        try {
            return $prestamos->filter(function ($prestamo) {
                return $prestamo->ejemplar && 
                       $prestamo->ejemplar->libro && 
                       $prestamo->ejemplar->libro->autor;
            })->groupBy('ejemplar.libro.titulo')
                ->map(function ($group) {
                    $primer = $group->first();
                    return [
                        'titulo' => $primer->ejemplar->libro->titulo,
                        'autor' => $primer->ejemplar->libro->autor->nombres . ' ' . 
                                  $primer->ejemplar->libro->autor->apellidos,
                        'cantidad' => $group->count()
                    ];
                })
                ->sortByDesc('cantidad')
                ->take(10)
                ->values();
        } catch (\Exception $e) {
            return collect([]);
        }
    }

    private function getPrestamosPorMes($prestamos, $fechaInicio, $fechaFin)
    {
        try {
            $meses = [];
            $inicio = $fechaInicio->copy()->startOfMonth();
            $fin = $fechaFin->copy()->endOfMonth();

            while ($inicio <= $fin) {
                $mesKey = $inicio->format('Y-m');
                $meses[$mesKey] = [
                    'mes' => $inicio->format('M Y'),
                    'cantidad' => 0
                ];
                $inicio->addMonth();
            }

            $prestamos->groupBy(function ($prestamo) {
                return Carbon::parse($prestamo->fecha_prestamo)->format('Y-m');
            })->each(function ($group, $mesKey) use (&$meses) {
                if (isset($meses[$mesKey])) {
                    $meses[$mesKey]['cantidad'] = $group->count();
                }
            });

            return array_values($meses);
        } catch (\Exception $e) {
            return [];
        }
    }

    private function getPrestamosPorGrado($prestamos)
    {
        try {
            return $prestamos->filter(function ($prestamo) {
                return $prestamo->lector;
            })->groupBy(function ($prestamo) {
                return $prestamo->lector && $prestamo->lector->grado 
                    ? $prestamo->lector->grado->subGrado 
                    : 'Sin grado';
            })->map(function ($group, $grado) {
                return [
                    'grado' => $grado,
                    'cantidad' => $group->count()
                ];
            })->sortByDesc('cantidad')
              ->values();
        } catch (\Exception $e) {
            return collect([]);
        }
    }

    private function getPrestamosPorEstado($prestamos)
    {
        try {
            $total = $prestamos->count();
            if ($total === 0) {
                return collect([]);
            }

            return $prestamos->groupBy('estado')
                ->map(function ($group, $estado) use ($total) {
                    return [
                        'estado' => $estado,
                        'cantidad' => $group->count(),
                        'porcentaje' => round(($group->count() / $total) * 100, 1)
                    ];
                })
                ->values();
        } catch (\Exception $e) {
            return collect([]);
        }
    }

    private function getNoDevueltosPorGrado($prestamos)
    {
        return $prestamos->groupBy(function ($prestamo) {
            return $prestamo->lector && $prestamo->lector->grado 
                ? $prestamo->lector->grado->subGrado 
                : 'Sin grado';
        })->map(function ($group, $grado) {
            return [
                'grado' => $grado,
                'cantidad' => $group->count(),
                'activos' => $group->where('estado', 'ACTIVO')->count(),
                'vencidos' => $group->where('estado', 'VENCIDO')->count()
            ];
        })->sortByDesc('cantidad')
          ->values();
    }

    private function getNoDevueltosPorSeveridad($prestamos)
    {
        $vencidos = $prestamos->where('estado', 'VENCIDO');
        
        return [
            'critico' => $vencidos->where('dias_retraso', '>=', 30)->count(),
            'alto' => $vencidos->whereBetween('dias_retraso', [15, 29])->count(),
            'medio' => $vencidos->whereBetween('dias_retraso', [7, 14])->count(),
            'bajo' => $vencidos->where('dias_retraso', '<', 7)->where('dias_retraso', '>', 0)->count(),
            'activos' => $prestamos->where('estado', 'ACTIVO')->count()
        ];
    }

    // GENERACIÓN DE PDFs

    private function generarPDFPrestamos($datos)
    {
        try {
            $pdf = Pdf::loadView('pdfs.informe-prestamos', $datos)
                ->setPaper('a4', 'portrait')
                ->setOptions([
                    'defaultFont' => 'Arial',
                    'isHtml5ParserEnabled' => true,
                    'isRemoteEnabled' => true
                ]);

            $filename = 'informe-prestamos-' . date('Y-m-d-H-i-s') . '.pdf';
            
            return $pdf->download($filename);
        } catch (\Exception $e) {
            Log::error('Error generando PDF de préstamos: ' . $e->getMessage());
            throw $e;
        }
    }

    private function generarPDFNoDevueltos($datos)
    {
        try {
            $pdf = Pdf::loadView('pdfs.informe-no-devueltos', $datos)
                ->setPaper('a4', 'portrait')
                ->setOptions([
                    'defaultFont' => 'Arial',
                    'isHtml5ParserEnabled' => true,
                    'isRemoteEnabled' => true
                ]);

            $filename = 'informe-no-devueltos-' . date('Y-m-d-H-i-s') . '.pdf';
            
            return $pdf->download($filename);
        } catch (\Exception $e) {
            Log::error('Error generando PDF de no devueltos: ' . $e->getMessage());
            throw $e;
        }
    }
}