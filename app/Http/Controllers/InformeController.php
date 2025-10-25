<?php

namespace App\Http\Controllers;

use App\Models\Prestamo;
use App\Models\Lector;
use App\Models\Libro;
use App\Models\Grado;
use App\Models\Ejemplar; 
use App\Models\Seccion; // AGREGADO para control de roles
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;

class InformeController extends Controller
{
    /**
     * Obtener la sección según el rol del usuario - NUEVO MÉTODO
     */
    private function getSeccionByRole(Request $request)
    {
        $user = $request->user();
        $seccionId = null;
        
        if ($user->hasRole('BibliotecarioPrimaria')) {
            $seccion = Seccion::where('nombre', 'PRIMARIA')->first();
            $seccionId = $seccion ? $seccion->id : null;
        } elseif ($user->hasRole('BibliotecarioBachillerato')) {
            $seccion = Seccion::where('nombre', 'BACHILLERATO')->first();
            $seccionId = $seccion ? $seccion->id : null;
        }
        // Si es Administrador, $seccionId queda null y verá todos los datos
        
        return $seccionId;
    }

    /**
     * Aplicar filtro de sección a consulta de préstamos - NUEVO MÉTODO
     */
    private function aplicarFiltroSeccion($query, $seccionId)
    {
        if ($seccionId) {
            $query->where(function($q) use ($seccionId) {
                $q->whereHas('ejemplar.libro.estanteria', function ($subQuery) use ($seccionId) {
                    $subQuery->where('seccion_id', $seccionId);
                })
                ->orWhereDoesntHave('ejemplar.libro.estanteria');
            });
        }
        return $query;
    }

    /**
     * Aplicar filtro de sección a consulta de ejemplares - NUEVO MÉTODO
     */
    private function aplicarFiltroSeccionEjemplares($query, $seccionId)
    {
        if ($seccionId) {
            $query->where(function($q) use ($seccionId) {
                $q->whereHas('libro.estanteria', function ($subQuery) use ($seccionId) {
                    $subQuery->where('seccion_id', $seccionId);
                })
                ->orWhereDoesntHave('libro.estanteria');
            });
        }
        return $query;
    }

    /**
     * Mostrar la página principal de informes
     */
    public function index()
    {
        return Inertia::render('Informes/Index');
    }

    /**
     * Generar informe de préstamos realizados - ACTUALIZADO CON CONTROL DE ROLES
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

            // NUEVO: Obtener sección según rol del usuario
            $seccionId = $this->getSeccionByRole($request);

            // Verificar si existen préstamos en la base de datos
            $totalPrestamos = Prestamo::count();
            
            if ($totalPrestamos === 0) {
                return back()->with('error', 'No hay préstamos registrados en la base de datos.');
            }

            // Consulta base de préstamos con filtro de sección
            $prestamosQuery = Prestamo::with(['ejemplar.libro.autor', 'ejemplar.libro.estanteria.seccion', 'lector.grado'])
                ->whereBetween('fecha_prestamo', [$fechaInicio, $fechaFin])
                ->orderBy('fecha_prestamo', 'desc');

            // NUEVO: Aplicar filtro de sección según rol
            $prestamosQuery = $this->aplicarFiltroSeccion($prestamosQuery, $seccionId);

            // Para estadísticas usamos todos los registros
            $todosPrestamos = $prestamosQuery->get();

            // Para vista con paginación
            $prestamos = $validated['formato'] === 'vista' 
                ? $prestamosQuery->paginate(50) 
                : $todosPrestamos;

            // Estadísticas generales
            $estadisticas = [
                'total_prestamos' => $todosPrestamos->count(),
                'prestamos_activos' => $todosPrestamos->where('estado', 'ACTIVO')->count(),
                'prestamos_devueltos' => $todosPrestamos->where('estado', 'DEVUELTO')->count(),
                'prestamos_vencidos' => $todosPrestamos->where('estado', 'VENCIDO')->count(),
                'libros_mas_prestados' => $this->getLibrosMasPrestados($todosPrestamos),
                'prestamos_por_mes' => $this->getPrestamosPorMes($todosPrestamos, $fechaInicio, $fechaFin),
                'prestamos_por_grado' => $this->getPrestamosPorGrado($todosPrestamos),
                'prestamos_por_estado' => $this->getPrestamosPorEstado($todosPrestamos)
            ];

            $datos = [
                'prestamos' => $validated['formato'] === 'vista' ? $prestamos->items() : $prestamos,
                'estadisticas' => $estadisticas,
                'periodo' => [
                    'inicio' => $fechaInicio->format('d/m/Y'),
                    'fin' => $fechaFin->format('d/m/Y'),
                    'tipo' => $validated['periodo'] ?? 'personalizado'
                ],
                'seccion_info' => $seccionId ? Seccion::find($seccionId)->nombre : 'TODAS LAS SECCIONES', // NUEVO
                'pagination' => $validated['formato'] === 'vista' ? [
                    'current_page' => $prestamos->currentPage(),
                    'last_page' => $prestamos->lastPage(),
                    'per_page' => $prestamos->perPage(),
                    'total' => $prestamos->total(),
                    'from' => $prestamos->firstItem(),
                    'to' => $prestamos->lastItem(),
                    'has_pages' => $prestamos->hasPages()
                ] : null
            ];

            if ($validated['formato'] === 'pdf') {
                // Para PDF usamos todos los registros sin paginación
                $datos['prestamos'] = $todosPrestamos;
                return $this->descargarPDF('prestamos', $datos);
            }

            return Inertia::render('Informes/PrestamosRealizados', $datos);

        } catch (\Exception $e) {
            Log::error('Error generando informe de préstamos: ' . $e->getMessage());
            return back()->with('error', 'Error al generar el informe: ' . $e->getMessage());
        }
    }

    /**
     * Generar informe de libros no devueltos - ACTUALIZADO CON CONTROL DE ROLES
     */

/**
     * Generar informe de libros no devueltos - ACTUALIZADO CON CONTROL DE ROLES
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
            $hoy = Carbon::now()->startOfDay();

            // NUEVO: Obtener sección según rol del usuario
            $seccionId = $this->getSeccionByRole($request);

            // SOLO préstamos VENCIDOS con cálculo CORRECTO de días y filtro de sección
            $prestamosNoDevueltosQuery = Prestamo::with([
                'ejemplar.libro.autor', 
                'ejemplar.libro.estanteria.seccion',
                'lector.grado'
            ])
                ->where('estado', 'VENCIDO')
                ->whereBetween('fecha_prestamo', [$fechaInicio, $fechaFin])
                ->orderBy('fecha_devolucion', 'asc');

            // NUEVO: Aplicar filtro de sección según rol
            $prestamosNoDevueltosQuery = $this->aplicarFiltroSeccion($prestamosNoDevueltosQuery, $seccionId);

            $prestamosNoDevueltos = $prestamosNoDevueltosQuery->get()
                ->map(function ($prestamo) use ($hoy) {
                    $fechaVencimiento = Carbon::parse($prestamo->fecha_devolucion)->startOfDay();
                    $diasRetraso = $hoy->diffInDays($fechaVencimiento, false);
                    $prestamo->dias_retraso = abs($diasRetraso);
                    return $prestamo;
                })
                ->sortBy(function ($prestamo) {
                    return $prestamo->lector && $prestamo->lector->grado 
                        ? $prestamo->lector->grado->subGrado 
                        : 'ZZZ';
                })
                ->values();

            // Preparar datos del informe
            $datos = [
                'prestamos_no_devueltos' => $prestamosNoDevueltos,
                'estadisticas' => [
                    'total_no_devueltos' => $prestamosNoDevueltos->count(),
                    'vencidos' => $prestamosNoDevueltos->count(),
                    'promedio_dias_retraso' => $prestamosNoDevueltos->count() > 0 ? round($prestamosNoDevueltos->avg('dias_retraso')) : 0,
                    'maximo_dias_retraso' => $prestamosNoDevueltos->count() > 0 ? $prestamosNoDevueltos->max('dias_retraso') : 0,
                    'por_grado' => $this->getNoDevueltosPorGrado($prestamosNoDevueltos)->toArray(),
                    'por_severidad' => $this->getNoDevueltosPorSeveridad($prestamosNoDevueltos)
                ],
                'periodo' => [
                    'inicio' => $fechaInicio->format('d/m/Y'),
                    'fin' => $fechaFin->format('d/m/Y'),
                    'tipo' => $validated['periodo'] ?? 'personalizado'
                ],
                'seccion_info' => $seccionId ? Seccion::find($seccionId)->nombre : 'TODAS LAS SECCIONES'
            ];

            // Generar PDF o retornar vista
            if ($validated['formato'] === 'pdf') {
                return $this->descargarPDF('no-devueltos', $datos);
            }

            return Inertia::render('Informes/LibrosNoDevueltos', $datos);

        } catch (\Exception $e) {
            Log::error('Error generando informe de libros no devueltos: ' . $e->getMessage());
            return back()->with('error', 'Error al generar el informe: ' . $e->getMessage());
        }
    }

    /**
     * Generar informe de libros perdidos - ACTUALIZADO CON CONTROL DE ROLES
     */
    public function librosPerdidos(Request $request)
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

            // NUEVO: Obtener sección según rol del usuario
            $seccionId = $this->getSeccionByRole($request);

            // Obtener ejemplares marcados como PERDIDO en el período especificado con filtro de sección
            $ejemplaresPerdidosQuery = Ejemplar::with(['libro.autor', 'libro.estanteria.seccion'])
                ->where('estado', 'PERDIDO')
                ->whereBetween('updated_at', [$fechaInicio, $fechaFin])
                ->orderBy('updated_at', 'desc');

            // NUEVO: Aplicar filtro de sección según rol
            $ejemplaresPerdidosQuery = $this->aplicarFiltroSeccionEjemplares($ejemplaresPerdidosQuery, $seccionId);

            $ejemplaresPerdidos = $ejemplaresPerdidosQuery->get()
                ->map(function ($ejemplar) {
                    // Agregar fecha formateada para facilitar el manejo en frontend
                    $ejemplar->fecha_perdida = $ejemplar->updated_at->format('Y-m-d H:i:s');
                    $ejemplar->fecha_perdida_formateada = $ejemplar->updated_at->format('d/m/Y');
                    return $ejemplar;
                });

            // NUEVA CONSULTA: Pérdidas del año actual completo (con filtro de sección)
            $añoActual = Carbon::now()->year;
            $inicioAño = Carbon::create($añoActual, 1, 1)->startOfDay();
            $finAño = Carbon::create($añoActual, 12, 31)->endOfDay();
            
            $perdidasAñoActualQuery = Ejemplar::where('estado', 'PERDIDO')
                ->whereBetween('updated_at', [$inicioAño, $finAño]);

            // NUEVO: Aplicar filtro de sección según rol para estadística anual
            $perdidasAñoActualQuery = $this->aplicarFiltroSeccionEjemplares($perdidasAñoActualQuery, $seccionId);
            $perdidasAñoActual = $perdidasAñoActualQuery->count();

            // Estadísticas básicas - ACTUALIZADA
            $estadisticas = [
                'total_perdidos' => $ejemplaresPerdidos->count(),
                'por_mes' => $this->getEjemplaresPerdidosPorMes($ejemplaresPerdidos, $fechaInicio, $fechaFin),
                'libros_afectados' => $ejemplaresPerdidos->groupBy('libro.titulo')->count(),
                'valor_estimado' => $ejemplaresPerdidos->count() * 25000, // Valor promedio estimado por libro
                'perdidas_año_actual' => $perdidasAñoActual, // NUEVA ESTADÍSTICA
            ];

            $datos = [
                'ejemplares_perdidos' => $ejemplaresPerdidos,
                'estadisticas' => $estadisticas,
                'periodo' => [
                    'inicio' => $fechaInicio->format('d/m/Y'),
                    'fin' => $fechaFin->format('d/m/Y'),
                    'tipo' => $validated['periodo'] ?? 'personalizado'
                ],
                'seccion_info' => $seccionId ? Seccion::find($seccionId)->nombre : 'TODAS LAS SECCIONES', // NUEVO
            ];

            if ($validated['formato'] === 'pdf') {
                return $this->descargarPDF('libros-perdidos', $datos);
            }

            return Inertia::render('Informes/LibrosPerdidos', $datos);

        } catch (\Exception $e) {
            Log::error('Error generando informe de libros perdidos: ' . $e->getMessage());
            return back()->with('error', 'Error al generar el informe: ' . $e->getMessage());
        }
    }

    /**
     * Descarga directa de PDF de préstamos (GET) - ACTUALIZADO CON CONTROL DE ROLES
     */
    public function descargarPDFPrestamos(Request $request)
    {
        $validated = $request->validate([
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
            'periodo' => 'nullable|in:mensual,trimestral,semestral,anual'
        ]);

        try {
            $fechaInicio = Carbon::parse($validated['fecha_inicio'])->startOfDay();
            $fechaFin = Carbon::parse($validated['fecha_fin'])->endOfDay();

            // NUEVO: Obtener sección según rol del usuario
            $seccionId = $this->getSeccionByRole($request);

            $prestamosQuery = Prestamo::with(['ejemplar.libro.autor', 'ejemplar.libro.estanteria.seccion', 'lector.grado'])
                ->whereBetween('fecha_prestamo', [$fechaInicio, $fechaFin])
                ->orderBy('fecha_prestamo', 'desc');

            // NUEVO: Aplicar filtro de sección según rol
            $prestamosQuery = $this->aplicarFiltroSeccion($prestamosQuery, $seccionId);
            $prestamos = $prestamosQuery->get();

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
                ],
                'seccion_info' => $seccionId ? Seccion::find($seccionId)->nombre : 'TODAS LAS SECCIONES', // NUEVO
            ];

            return $this->descargarPDF('prestamos', $datos);

        } catch (\Exception $e) {
            Log::error('Error en descarga directa PDF prestamos: ' . $e->getMessage());
            return back()->with('error', 'Error al descargar el PDF: ' . $e->getMessage());
        }
    }

    /**
     * Descarga directa de PDF de no devueltos (GET) - ACTUALIZADO CON CONTROL DE ROLES
     */
    public function descargarPDFNoDevueltos(Request $request)
    {
        $validated = $request->validate([
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
            'periodo' => 'nullable|in:mensual,trimestral,semestral,anual'
        ]);

        try {
            $fechaInicio = Carbon::parse($validated['fecha_inicio'])->startOfDay();
            $fechaFin = Carbon::parse($validated['fecha_fin'])->endOfDay();
            $hoy = Carbon::now();

            // NUEVO: Obtener sección según rol del usuario
            $seccionId = $this->getSeccionByRole($request);

            // SOLO VENCIDOS con cálculo corregido y filtro de sección
            $prestamosNoDevueltosQuery = Prestamo::with(['ejemplar.libro.autor', 'ejemplar.libro.estanteria.seccion', 'lector.grado'])
                ->join('lectores', 'prestamos.lector_id', '=', 'lectores.id')
                ->join('grados', 'lectores.grado_id', '=', 'grados.id')
                ->where('prestamos.estado', 'VENCIDO')
                ->whereBetween('prestamos.fecha_prestamo', [$fechaInicio, $fechaFin])
                ->orderBy('grados.subGrado', 'asc')
                ->orderBy('prestamos.fecha_devolucion', 'asc')
                ->select('prestamos.*');

            // NUEVO: Aplicar filtro de sección según rol
            $prestamosNoDevueltosQuery = $this->aplicarFiltroSeccion($prestamosNoDevueltosQuery, $seccionId);

            $prestamosNoDevueltos = $prestamosNoDevueltosQuery->get()
                ->map(function ($prestamo) use ($hoy) {
                    // CORRECCIÓN CRÍTICA: Calcular días de retraso correctamente
                    $fechaVencimiento = Carbon::parse($prestamo->fecha_devolucion)->startOfDay();
                    
                    if ($hoy->startOfDay()->greaterThan($fechaVencimiento)) {
                        $prestamo->dias_retraso = (int) $fechaVencimiento->diffInDays($hoy->startOfDay());
                    } else {
                        $prestamo->dias_retraso = 0;
                    }
                    
                    return $prestamo;
                })
                ->filter(function ($prestamo) {
                    return $prestamo->dias_retraso > 0;
                });

            $estadisticas = [
                'total_no_devueltos' => $prestamosNoDevueltos->count(),
                'vencidos' => $prestamosNoDevueltos->count(),
                'promedio_dias_retraso' => $prestamosNoDevueltos->count() > 0 
                    ? round($prestamosNoDevueltos->avg('dias_retraso'), 0) 
                    : 0,
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
                ],
                'seccion_info' => $seccionId ? Seccion::find($seccionId)->nombre : 'TODAS LAS SECCIONES', // NUEVO
            ];

            return $this->descargarPDF('no-devueltos', $datos);

        } catch (\Exception $e) {
            Log::error('Error en descarga directa PDF no devueltos: ' . $e->getMessage());
            return back()->with('error', 'Error al descargar el PDF: ' . $e->getMessage());
        }
    }

    /**
     * Descarga directa de PDF de libros perdidos (GET) - ACTUALIZADO CON CONTROL DE ROLES
     */
    public function descargarPDFLibrosPerdidos(Request $request)
    {
        $validated = $request->validate([
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
            'periodo' => 'nullable|in:mensual,trimestral,semestral,anual'
        ]);

        try {
            $fechaInicio = Carbon::parse($validated['fecha_inicio'])->startOfDay();
            $fechaFin = Carbon::parse($validated['fecha_fin'])->endOfDay();

            // NUEVO: Obtener sección según rol del usuario
            $seccionId = $this->getSeccionByRole($request);

            $ejemplaresPerdidosQuery = Ejemplar::with(['libro.autor', 'libro.estanteria.seccion'])
                ->where('estado', 'PERDIDO')
                ->whereBetween('updated_at', [$fechaInicio, $fechaFin])
                ->orderBy('updated_at', 'desc');

            // NUEVO: Aplicar filtro de sección según rol
            $ejemplaresPerdidosQuery = $this->aplicarFiltroSeccionEjemplares($ejemplaresPerdidosQuery, $seccionId);

            $ejemplaresPerdidos = $ejemplaresPerdidosQuery->get()
                ->map(function ($ejemplar) {
                    $ejemplar->fecha_perdida = $ejemplar->updated_at->format('Y-m-d H:i:s');
                    $ejemplar->fecha_perdida_formateada = $ejemplar->updated_at->format('d/m/Y');
                    return $ejemplar;
                });

            // NUEVA CONSULTA: Pérdidas del año actual completo con filtro de sección
            $añoActual = Carbon::now()->year;
            $inicioAño = Carbon::create($añoActual, 1, 1)->startOfDay();
            $finAño = Carbon::create($añoActual, 12, 31)->endOfDay();
            
            $perdidasAñoActualQuery = Ejemplar::where('estado', 'PERDIDO')
                ->whereBetween('updated_at', [$inicioAño, $finAño]);

            // NUEVO: Aplicar filtro de sección según rol para estadística anual
            $perdidasAñoActualQuery = $this->aplicarFiltroSeccionEjemplares($perdidasAñoActualQuery, $seccionId);
            $perdidasAñoActual = $perdidasAñoActualQuery->count();

            $estadisticas = [
                'total_perdidos' => $ejemplaresPerdidos->count(),
                'por_mes' => $this->getEjemplaresPerdidosPorMes($ejemplaresPerdidos, $fechaInicio, $fechaFin),
                'libros_afectados' => $ejemplaresPerdidos->groupBy('libro.titulo')->count(),
                'valor_estimado' => $ejemplaresPerdidos->count() * 25000,
                'perdidas_año_actual' => $perdidasAñoActual, // NUEVA ESTADÍSTICA
            ];

            $datos = [
                'ejemplares_perdidos' => $ejemplaresPerdidos,
                'estadisticas' => $estadisticas,
                'periodo' => [
                    'inicio' => $fechaInicio->format('d/m/Y'),
                    'fin' => $fechaFin->format('d/m/Y'),
                    'tipo' => $validated['periodo'] ?? 'personalizado'
                ],
                'seccion_info' => $seccionId ? Seccion::find($seccionId)->nombre : 'TODAS LAS SECCIONES', // NUEVO
            ];

            return $this->descargarPDF('libros-perdidos', $datos);

        } catch (\Exception $e) {
            Log::error('Error en descarga directa PDF libros perdidos: ' . $e->getMessage());
            return back()->with('error', 'Error al descargar el PDF: ' . $e->getMessage());
        }
    }

    /**
     * Obtener rangos de fechas predefinidos - CORREGIDO
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

    // MÉTODOS CORREGIDOS PARA NO DEVUELTOS
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
                'vencidos' => $group->count() // Todos son vencidos
            ];
        })->sortByDesc('cantidad')
          ->values();
    }

    private function getNoDevueltosPorSeveridad($prestamos)
    {
        // CORRECCIÓN: Usar where en lugar de whereBetween para evitar problemas
        $critico = $prestamos->filter(function ($prestamo) {
            return $prestamo->dias_retraso >= 30;
        })->count();

        $alto = $prestamos->filter(function ($prestamo) {
            return $prestamo->dias_retraso >= 15 && $prestamo->dias_retraso <= 29;
        })->count();

        $medio = $prestamos->filter(function ($prestamo) {
            return $prestamo->dias_retraso >= 7 && $prestamo->dias_retraso <= 14;
        })->count();

        $bajo = $prestamos->filter(function ($prestamo) {
            return $prestamo->dias_retraso >= 1 && $prestamo->dias_retraso <= 6;
        })->count();

        return [
            'critico' => $critico,
            'alto' => $alto,
            'medio' => $medio,
            'bajo' => $bajo,
        ];
    }

    /**
     * Método privado: Obtener ejemplares perdidos por mes - NUEVO
     */
    private function getEjemplaresPerdidosPorMes($ejemplares, $fechaInicio, $fechaFin)
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

            $ejemplares->groupBy(function ($ejemplar) {
                return Carbon::parse($ejemplar->updated_at)->format('Y-m');
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

    /**
     * Método unificado para descargar PDF - Compatible con todos los navegadores - ACTUALIZADO
     */
    private function descargarPDF($tipo, $datos)
    {
        try {
            Log::info("Iniciando generación de PDF: {$tipo}");

            // Seleccionar template según tipo - ACTUALIZADO PARA INCLUIR LIBROS PERDIDOS
            $template = match($tipo) {
                'prestamos' => 'pdfs.informe-prestamos',
                'no-devueltos' => 'pdfs.informe-no-devueltos',
                'libros-perdidos' => 'pdfs.informe-libros-perdidos',
                default => 'pdfs.informe-prestamos'
            };

            // Crear el PDF
            $pdf = Pdf::loadView($template, $datos);
            $pdf->setPaper('A4', 'portrait');

            // Generar nombre único
            $timestamp = now()->format('Y-m-d_H-i-s');
            $filename = "informe-{$tipo}_{$timestamp}.pdf";

            // Crear directorio temporal si no existe
            $tempDir = storage_path('app/temp');
            if (!file_exists($tempDir)) {
                mkdir($tempDir, 0755, true);
            }

            // Guardar archivo temporalmente
            $tempPath = $tempDir . '/' . $filename;
            file_put_contents($tempPath, $pdf->output());

            Log::info("PDF generado exitosamente: {$filename}");

            // Retornar descarga y eliminar archivo después
            return response()->download($tempPath, $filename, [
                'Content-Type' => 'application/pdf',
                'Cache-Control' => 'no-cache, no-store, must-revalidate',
                'Pragma' => 'no-cache',
                'Expires' => '0'
            ])->deleteFileAfterSend();

        } catch (\Exception $e) {
            Log::error("Error generando PDF {$tipo}", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->with('error', 'Error al generar el PDF: ' . $e->getMessage());
        }
    }
}