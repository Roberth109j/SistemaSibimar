<?php

namespace App\Http\Controllers;

use App\Models\Libro;
use App\Models\Ejemplar;
use App\Models\Seccion;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\InventarioExport;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\RedirectResponse;

class InventarioController extends Controller
{
    /**
     * Muestra la página de inventario de libros con filtros simplificados.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Inertia\Response
     */
    public function index(Request $request): RedirectResponse|\Inertia\Response
    {
        // Validación de parámetros de paginación
        $page = max(1, (int) $request->input('page', 1));
        $perPage = 15;

        // FILTROS SIMPLIFICADOS: solo los necesarios
        $filters = $request->only(['search', 'clase', 'area', 'estado', 'seccion']);
        
        // Consulta base con ejemplares y sus estados
        $query = Libro::with(['autor:id,nombres,apellidos', 'editorial:id,nombre', 'seccion:id,nombre', 'estanteria:id,cod_estante,descripcion'])
            ->withCount([
                'ejemplares',
                'ejemplares as ejemplares_disponibles_count' => function ($query) {
                    $query->where('estado', Ejemplar::ESTADO_DISPONIBLE);
                },
                'ejemplares as ejemplares_prestados_count' => function ($query) {
                    $query->where('estado', Ejemplar::ESTADO_PRESTADO);
                },
                'ejemplares as ejemplares_dados_baja_count' => function ($query) {
                    $query->where('estado', Ejemplar::ESTADO_DADO_DE_BAJA);
                },
                'ejemplares as ejemplares_perdidos_count' => function ($query) {
                    $query->where('estado', Ejemplar::ESTADO_PERDIDO);
                }
            ]);

        // DETERMINAR TIPO DE USUARIO Y APLICAR FILTROS AUTOMÁTICOS
        $user = $request->user();
        $seccionId = null;
        $esAdmin = $user->hasRole('Administrador') || $user->hasRole('SuperAdministrador');
        
        if (!$esAdmin) {
            // FILTRO AUTOMÁTICO POR SECCIÓN PARA BIBLIOTECARIOS
            if ($user->hasRole('BibliotecarioPrimaria')) {
                $seccion = Seccion::where('nombre', 'PRIMARIA')->first();
                $seccionId = $seccion ? $seccion->id : null;
                if ($seccionId) {
                    $query->where('seccion_id', $seccionId);
                }
            } elseif ($user->hasRole('BibliotecarioBachillerato')) {
                $seccion = Seccion::where('nombre', 'BACHILLERATO')->first();
                $seccionId = $seccion ? $seccion->id : null;
                if ($seccionId) {
                    $query->where('seccion_id', $seccionId);
                }
            }
        } else {
            // PARA ADMINISTRADORES: permitir filtro manual de sección
            if (!empty($filters['seccion'])) {
                $seccion = Seccion::where('nombre', $filters['seccion'])->first();
                if ($seccion) {
                    $query->where('seccion_id', $seccion->id);
                }
            }
        }
            
        // APLICAR FILTROS DE BÚSQUEDA Y OTROS FILTROS SIMPLIFICADOS
        $this->aplicarFiltros($query, $filters);
        
        // CALCULAR ESTADÍSTICAS GLOBALES ANTES DE PAGINAR (OPTIMIZADO)
        $estadisticasGlobales = $this->calcularEstadisticasGlobalesOptimizado($query, $user, $esAdmin);
        
        // Ejecutar la consulta con paginación
        $libros = $query->orderBy('titulo')
                       ->paginate($perPage, ['*'], 'page', $page)
                       ->withQueryString();
        
        // Redirigir si la página solicitada no existe pero hay resultados
        if ($page > $libros->lastPage() && $libros->lastPage() > 0) {
            return redirect()->route('inventario.index', 
                array_merge($request->query(), ['page' => $libros->lastPage()])
            );
        }
        
        // DATOS PARA FILTROS SIMPLIFICADOS
        $clases = [
            Libro::CLASE_LIBRO,
            Libro::CLASE_REVISTA,
        ];

        $areas = [
            Libro::AREA_CIENCIAS,
            Libro::AREA_MATEMATICAS,
            Libro::AREA_HUMANIDADES,
            Libro::AREA_IDIOMAS,
            Libro::AREA_TECNOLOGIA,
            Libro::AREA_OTRAS,
        ];
        
        $estados = [
            'todos' => 'Todos los estados',
            'disponibles' => 'Disponibles',
            'prestados' => 'Prestados',
            'dados_baja' => 'Dados de baja',
            'perdidos' => 'Perdidos',
            'en_circulacion' => 'En circulación',
        ];

        // Obtener todas las secciones (solo campos necesarios)
        $allSecciones = Seccion::select('id', 'nombre')->get();
        
        // Preparar secciones solo para administradores
        $secciones = $esAdmin ? $allSecciones->pluck('nombre')->toArray() : [];
        
        // RENDERIZAR VISTA CON DATOS SIMPLIFICADOS
        return Inertia::render('Inventario/Index', [
            'libros' => $libros,
            'estadisticas' => $estadisticasGlobales,
            'clases' => $clases,
            'areas' => $areas,
            'estados' => $estados,
            'all_secciones' => $allSecciones,
            'secciones' => $secciones, // Solo para administradores
            'seccionId' => $seccionId, // ID de sección filtrada automáticamente
            'esAdmin' => $esAdmin, // Indica si es administrador
            'filters' => $filters,
            'pagination' => [
                'current_page' => $libros->currentPage(),
                'last_page' => $libros->lastPage(),
                'per_page' => $libros->perPage(),
                'total' => $libros->total(),
                'from' => $libros->firstItem(),
                'to' => $libros->lastItem(),
                'has_pages' => $libros->hasPages(),
            ],
        ]);
    }

    /**
     * Aplica filtros a la consulta (método extraído para reutilización)
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  array  $filters
     * @return void
     */
    private function aplicarFiltros($query, array $filters)
    {
        // Filtro de búsqueda
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('titulo', 'like', "%{$search}%")
                  ->orWhere('codigo_unico', 'like', "%{$search}%")
                  ->orWhere('contenido', 'like', "%{$search}%")
                  ->orWhereHas('autor', function ($q) use ($search) {
                      $q->where(DB::raw("CONCAT(nombres, ' ', apellidos)"), 'like', "%{$search}%");
                  });
            });
        }
        
        // Filtro por clase
        if (!empty($filters['clase'])) {
            $query->where('clase', $filters['clase']);
        }

        // Filtro por área
        if (!empty($filters['area'])) {
            $query->where('area', $filters['area']);
        }
        
        // Filtro por estado de ejemplares
        if (!empty($filters['estado'])) {
            switch ($filters['estado']) {
                case 'disponibles':
                    $query->whereHas('ejemplares', function ($q) {
                        $q->where('estado', Ejemplar::ESTADO_DISPONIBLE);
                    });
                    break;
                case 'prestados':
                    $query->whereHas('ejemplares', function ($q) {
                        $q->where('estado', Ejemplar::ESTADO_PRESTADO);
                    });
                    break;
                case 'dados_baja':
                    $query->whereHas('ejemplares', function ($q) {
                        $q->where('estado', Ejemplar::ESTADO_DADO_DE_BAJA);
                    });
                    break;
                case 'perdidos':
                    $query->whereHas('ejemplares', function ($q) {
                        $q->where('estado', Ejemplar::ESTADO_PERDIDO);
                    });
                    break;
                case 'en_circulacion':
                    $query->whereHas('ejemplares', function ($q) {
                        $q->whereIn('estado', [Ejemplar::ESTADO_DISPONIBLE, Ejemplar::ESTADO_PRESTADO]);
                    });
                    break;
            }
        }
    }
    
    /**
     * Calcula las estadísticas globales del inventario de forma optimizada
     * usando agregaciones SQL directas sin cargar registros en memoria
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $baseQuery
     * @param  \App\Models\User  $user
     * @param  bool  $esAdmin
     * @return array
     */
    private function calcularEstadisticasGlobalesOptimizado($baseQuery, $user, $esAdmin)
    {
        // Clonar la consulta base para no afectar la paginación
        $query = clone $baseQuery;
        
        // Obtener estadísticas principales usando agregaciones SQL directas
        $estadisticasPrincipales = $query->select([
            DB::raw('COUNT(DISTINCT libros.id) as total_libros'),
            DB::raw('COALESCE(SUM(
                (SELECT COUNT(*) FROM ejemplares WHERE ejemplares.libro_id = libros.id)
            ), 0) as total_ejemplares'),
            DB::raw('COALESCE(SUM(
                (SELECT COUNT(*) FROM ejemplares WHERE ejemplares.libro_id = libros.id AND ejemplares.estado = "' . Ejemplar::ESTADO_DISPONIBLE . '")
            ), 0) as total_disponibles'),
            DB::raw('COALESCE(SUM(
                (SELECT COUNT(*) FROM ejemplares WHERE ejemplares.libro_id = libros.id AND ejemplares.estado = "' . Ejemplar::ESTADO_PRESTADO . '")
            ), 0) as total_prestados'),
            DB::raw('COALESCE(SUM(
                (SELECT COUNT(*) FROM ejemplares WHERE ejemplares.libro_id = libros.id AND ejemplares.estado = "' . Ejemplar::ESTADO_DADO_DE_BAJA . '")
            ), 0) as total_dados_baja'),
            DB::raw('COALESCE(SUM(
                (SELECT COUNT(*) FROM ejemplares WHERE ejemplares.libro_id = libros.id AND ejemplares.estado = "' . Ejemplar::ESTADO_PERDIDO . '")
            ), 0) as total_perdidos')
        ])->first();

        // Calcular estadísticas por clase de forma optimizada
        $estadisticasPorClase = $this->obtenerEstadisticasPorCampo(clone $baseQuery, 'clase');
        
        // Calcular estadísticas por área de forma optimizada
        $estadisticasPorArea = $this->obtenerEstadisticasPorCampo(clone $baseQuery, 'area');
        
        $totalEnCirculacion = ($estadisticasPrincipales->total_disponibles ?? 0) + ($estadisticasPrincipales->total_prestados ?? 0);
        
        return [
            'total_libros' => $estadisticasPrincipales->total_libros ?? 0,
            'total_ejemplares' => $estadisticasPrincipales->total_ejemplares ?? 0,
            'total_disponibles' => $estadisticasPrincipales->total_disponibles ?? 0,
            'total_prestados' => $estadisticasPrincipales->total_prestados ?? 0,
            'total_dados_baja' => $estadisticasPrincipales->total_dados_baja ?? 0,
            'total_perdidos' => $estadisticasPrincipales->total_perdidos ?? 0,
            'total_en_circulacion' => $totalEnCirculacion,
            'por_clase' => $estadisticasPorClase,
            'por_area' => $estadisticasPorArea,
        ];
    }

    /**
     * Obtiene estadísticas agrupadas por un campo específico usando SQL optimizado
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $campo
     * @return \Illuminate\Support\Collection
     */
    private function obtenerEstadisticasPorCampo($query, $campo)
    {
        return $query->select([
            DB::raw("libros.{$campo} as categoria"),
            DB::raw('COUNT(DISTINCT libros.id) as total_libros'),
            DB::raw('COALESCE(SUM(
                (SELECT COUNT(*) FROM ejemplares WHERE ejemplares.libro_id = libros.id)
            ), 0) as total_ejemplares'),
            DB::raw('COALESCE(SUM(
                (SELECT COUNT(*) FROM ejemplares WHERE ejemplares.libro_id = libros.id AND ejemplares.estado = "' . Ejemplar::ESTADO_DISPONIBLE . '")
            ), 0) as total_disponibles'),
            DB::raw('COALESCE(SUM(
                (SELECT COUNT(*) FROM ejemplares WHERE ejemplares.libro_id = libros.id AND ejemplares.estado = "' . Ejemplar::ESTADO_PRESTADO . '")
            ), 0) as total_prestados')
        ])
        ->groupBy("libros.{$campo}")
        ->havingRaw("libros.{$campo} IS NOT NULL")
        ->get()
        ->keyBy('categoria')
        ->map(function ($item) {
            return [
                'total_libros' => $item->total_libros,
                'total_ejemplares' => $item->total_ejemplares,
                'total_disponibles' => $item->total_disponibles,
                'total_prestados' => $item->total_prestados,
            ];
        });
    }

    /**
     * Calcula las estadísticas globales del inventario (MÉTODO LEGACY - MANTENER COMPATIBILIDAD)
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return array
     */
    private function calcularEstadisticasGlobales($query)
    {
        // Usar el método optimizado
        return $this->calcularEstadisticasGlobalesOptimizado($query, request()->user(), 
            request()->user()->hasRole('Administrador') || request()->user()->hasRole('SuperAdministrador'));
    }
    
    /**
     * Genera un Excel con el inventario de libros separado por áreas (ignora filtros de tabla)
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse|\Illuminate\Http\RedirectResponse
     */
    public function exportarExcel(Request $request)
    {
        try {
            $user = $request->user();
            $esAdmin = $user->hasRole('Administrador') || $user->hasRole('SuperAdministrador');
            
            // SOLO APLICAR FILTRO DE SECCIÓN según el rol del usuario (ignorar otros filtros)
            $filters = [];
            
            if (!$esAdmin) {
                if ($user->hasRole('BibliotecarioPrimaria')) {
                    $seccion = Seccion::where('nombre', 'PRIMARIA')->first();
                    if ($seccion) {
                        $filters['seccion_id'] = $seccion->id;
                        $filters['seccion_nombre'] = 'PRIMARIA';
                    }
                } elseif ($user->hasRole('BibliotecarioBachillerato')) {
                    $seccion = Seccion::where('nombre', 'BACHILLERATO')->first();
                    if ($seccion) {
                        $filters['seccion_id'] = $seccion->id;
                        $filters['seccion_nombre'] = 'BACHILLERATO';
                    }
                }
            }
            
            // Generar nombre de archivo simple
            $filename = 'inventario-biblioteca-por-areas';
            
            if (!empty($filters['seccion_nombre'])) {
                $filename .= '-' . strtolower($filters['seccion_nombre']);
            }
            
            $filename .= '-' . Carbon::now()->format('Y-m-d') . '.xlsx';
            
            return Excel::download(new InventarioExport($filters), $filename);
            
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al generar el Excel: ' . $e->getMessage());
        }
    }

    /**
     * Método para obtener estadísticas específicas por sección (API endpoint) - OPTIMIZADO
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getEstadisticasPorSeccion(Request $request)
    {
        $user = $request->user();
        $esAdmin = $user->hasRole('Administrador') || $user->hasRole('SuperAdministrador');
        
        // Determinar qué secciones puede ver el usuario
        $seccionesPermitidas = [];
        
        if (!$esAdmin) {
            // Bibliotecarios solo ven su sección asignada
            if ($user->hasRole('BibliotecarioPrimaria')) {
                $seccion = Seccion::where('nombre', 'PRIMARIA')->first();
                if ($seccion) $seccionesPermitidas[] = $seccion->id;
            } elseif ($user->hasRole('BibliotecarioBachillerato')) {
                $seccion = Seccion::where('nombre', 'BACHILLERATO')->first();
                if ($seccion) $seccionesPermitidas[] = $seccion->id;
            }
        } else {
            // Administradores ven todas las secciones
            $seccionesPermitidas = Seccion::pluck('id')->toArray();
        }

        // OPTIMIZACIÓN: Una sola consulta para todas las secciones
        $estadisticas = DB::table('libros')
            ->join('secciones', 'libros.seccion_id', '=', 'secciones.id')
            ->whereIn('libros.seccion_id', $seccionesPermitidas)
            ->select([
                'secciones.nombre as seccion_nombre',
                DB::raw('COUNT(DISTINCT libros.id) as total_libros'),
                DB::raw('COALESCE(SUM(
                    (SELECT COUNT(*) FROM ejemplares WHERE ejemplares.libro_id = libros.id)
                ), 0) as total_ejemplares'),
                DB::raw('COALESCE(SUM(
                    (SELECT COUNT(*) FROM ejemplares WHERE ejemplares.libro_id = libros.id AND ejemplares.estado = "' . Ejemplar::ESTADO_DISPONIBLE . '")
                ), 0) as total_disponibles'),
                DB::raw('COALESCE(SUM(
                    (SELECT COUNT(*) FROM ejemplares WHERE ejemplares.libro_id = libros.id AND ejemplares.estado = "' . Ejemplar::ESTADO_PRESTADO . '")
                ), 0) as total_prestados'),
                DB::raw('COALESCE(SUM(
                    (SELECT COUNT(*) FROM ejemplares WHERE ejemplares.libro_id = libros.id AND ejemplares.estado = "' . Ejemplar::ESTADO_DADO_DE_BAJA . '")
                ), 0) as total_dados_baja'),
                DB::raw('COALESCE(SUM(
                    (SELECT COUNT(*) FROM ejemplares WHERE ejemplares.libro_id = libros.id AND ejemplares.estado = "' . Ejemplar::ESTADO_PERDIDO . '")
                ), 0) as total_perdidos')
            ])
            ->groupBy('secciones.id', 'secciones.nombre')
            ->get()
            ->keyBy('seccion_nombre')
            ->map(function ($item) {
                return [
                    'total_libros' => $item->total_libros,
                    'total_ejemplares' => $item->total_ejemplares,
                    'total_disponibles' => $item->total_disponibles,
                    'total_prestados' => $item->total_prestados,
                    'total_dados_baja' => $item->total_dados_baja,
                    'total_perdidos' => $item->total_perdidos,
                    'total_en_circulacion' => $item->total_disponibles + $item->total_prestados,
                ];
            });

        return response()->json([
            'estadisticas' => $estadisticas,
            'es_admin' => $esAdmin,
            'usuario_rol' => $user->getRoleNames()->first()
        ]);
    }

    /**
     * Método adicional para obtener resumen general (útil para dashboards) - OPTIMIZADO
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getResumenGeneral(Request $request)
    {
        $user = $request->user();
        $esAdmin = $user->hasRole('Administrador') || $user->hasRole('SuperAdministrador');
        
        // Construir query base optimizada (solo campos necesarios)
        $query = Libro::select('libros.*');

        // Aplicar filtro automático de sección para bibliotecarios
        $seccionAsignada = null;
        if (!$esAdmin) {
            if ($user->hasRole('BibliotecarioPrimaria')) {
                $seccion = Seccion::where('nombre', 'PRIMARIA')->first();
                $seccionAsignada = 'PRIMARIA';
                if ($seccion) {
                    $query->where('seccion_id', $seccion->id);
                }
            } elseif ($user->hasRole('BibliotecarioBachillerato')) {
                $seccion = Seccion::where('nombre', 'BACHILLERATO')->first();
                $seccionAsignada = 'BACHILLERATO';
                if ($seccion) {
                    $query->where('seccion_id', $seccion->id);
                }
            }
        }
        
        // Usar el método optimizado para calcular estadísticas
        $estadisticasGlobales = $this->calcularEstadisticasGlobalesOptimizado($query, $user, $esAdmin);

        return response()->json([
            'resumen' => $estadisticasGlobales,
            'es_admin' => $esAdmin,
            'seccion_asignada' => $seccionAsignada
        ]);
    }
}