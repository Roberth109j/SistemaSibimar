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
use Illuminate\Support\Facades\Log;
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
        
        // DETERMINAR TIPO DE USUARIO Y APLICAR FILTROS AUTOMÁTICOS
        $user = $request->user();
        $seccionId = null;
        $esAdmin = $user->hasRole('Administrador') || $user->hasRole('SuperAdministrador');
        
        if (!$esAdmin) {
            // FILTRO AUTOMÁTICO POR SECCIÓN PARA BIBLIOTECARIOS
            if ($user->hasRole('BibliotecarioPrimaria')) {
                $seccion = Seccion::where('nombre', 'PRIMARIA')->first();
                $seccionId = $seccion ? $seccion->id : null;
            } elseif ($user->hasRole('BibliotecarioBachillerato')) {
                $seccion = Seccion::where('nombre', 'BACHILLERATO')->first();
                $seccionId = $seccion ? $seccion->id : null;
            }
        } else {
            // PARA ADMINISTRADORES: permitir filtro manual de sección
            if (!empty($filters['seccion'])) {
                $seccion = Seccion::where('nombre', $filters['seccion'])->first();
                $seccionId = $seccion ? $seccion->id : null;
            }
        }
        
        // ✅ OPTIMIZACIÓN: Subconsulta agregada para ejemplares
        $ejemplaresSubquery = DB::table('ejemplares')
            ->select([
                'libro_id',
                DB::raw('COUNT(*) as total'),
                DB::raw('SUM(CASE WHEN estado = "' . Ejemplar::ESTADO_DISPONIBLE . '" THEN 1 ELSE 0 END) as disponibles'),
                DB::raw('SUM(CASE WHEN estado = "' . Ejemplar::ESTADO_PRESTADO . '" THEN 1 ELSE 0 END) as prestados'),
                DB::raw('SUM(CASE WHEN estado = "' . Ejemplar::ESTADO_DADO_DE_BAJA . '" THEN 1 ELSE 0 END) as dados_baja'),
                DB::raw('SUM(CASE WHEN estado = "' . Ejemplar::ESTADO_PERDIDO . '" THEN 1 ELSE 0 END) as perdidos'),
            ])
            ->groupBy('libro_id');
        
        // ✅ FIX: CAST a UNSIGNED para evitar concatenación de strings en frontend
        $query = Libro::query()
            ->with(['autor:id,nombres,apellidos', 'editorial:id,nombre', 'seccion:id,nombre', 'estanteria:id,cod_estante,descripcion'])
            ->leftJoinSub($ejemplaresSubquery, 'ej', function ($join) {
                $join->on('libros.id', '=', 'ej.libro_id');
            })
            ->select([
                'libros.*',
                DB::raw('CAST(COALESCE(ej.total, 0) AS UNSIGNED) as ejemplares_count'),
                DB::raw('CAST(COALESCE(ej.disponibles, 0) AS UNSIGNED) as ejemplares_disponibles_count'),
                DB::raw('CAST(COALESCE(ej.prestados, 0) AS UNSIGNED) as ejemplares_prestados_count'),
                DB::raw('CAST(COALESCE(ej.dados_baja, 0) AS UNSIGNED) as ejemplares_dados_baja_count'),
                DB::raw('CAST(COALESCE(ej.perdidos, 0) AS UNSIGNED) as ejemplares_perdidos_count'),
                // ✅ NUEVO: Campo calculado directamente en SQL para total_activos
                DB::raw('CAST((COALESCE(ej.disponibles, 0) + COALESCE(ej.prestados, 0)) AS UNSIGNED) as total_activos'),
            ]);

        // Aplicar filtro de sección si existe
        if ($seccionId) {
            $query->where('libros.seccion_id', $seccionId);
        }
            
        // APLICAR FILTROS DE BÚSQUEDA Y OTROS FILTROS SIMPLIFICADOS
        $this->aplicarFiltros($query, $filters);
        
        // CALCULAR ESTADÍSTICAS GLOBALES ANTES DE PAGINAR (OPTIMIZADO)
        $estadisticasGlobales = $this->calcularEstadisticasGlobalesOptimizado($query, $user, $esAdmin);
        
        // Ejecutar la consulta con paginación
        $libros = $query->orderBy('libros.titulo')
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
            'secciones' => $secciones,
            'seccionId' => $seccionId,
            'esAdmin' => $esAdmin,
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
     * ✅ OPTIMIZADO: Usa el JOIN ya existente para filtros de estado
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
                $q->where('libros.titulo', 'like', "%{$search}%")
                  ->orWhere('libros.codigo_unico', 'like', "%{$search}%")
                  ->orWhere('libros.contenido', 'like', "%{$search}%")
                  ->orWhereHas('autor', function ($q) use ($search) {
                      $q->where(DB::raw("CONCAT(nombres, ' ', apellidos)"), 'like', "%{$search}%");
                  });
            });
        }
        
        // Filtro por clase
        if (!empty($filters['clase'])) {
            $query->where('libros.clase', $filters['clase']);
        }

        // Filtro por área
        if (!empty($filters['area'])) {
            $query->where('libros.area', $filters['area']);
        }
        
        // ✅ OPTIMIZADO: Filtro por estado usando el JOIN ya calculado
        if (!empty($filters['estado'])) {
            switch ($filters['estado']) {
                case 'disponibles':
                    $query->where('ej.disponibles', '>', 0);
                    break;
                case 'prestados':
                    $query->where('ej.prestados', '>', 0);
                    break;
                case 'dados_baja':
                    $query->where('ej.dados_baja', '>', 0);
                    break;
                case 'perdidos':
                    $query->where('ej.perdidos', '>', 0);
                    break;
                case 'en_circulacion':
                    $query->whereRaw('(COALESCE(ej.disponibles, 0) + COALESCE(ej.prestados, 0)) > 0');
                    break;
            }
        }
    }
    
    /**
     * ✅ OPTIMIZADO: Calcula estadísticas globales con una sola consulta SQL
     * Reduce de 40,000+ subconsultas a 1 consulta con JOIN
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $baseQuery
     * @param  \App\Models\User  $user
     * @param  bool  $esAdmin
     * @return array
     */
    private function calcularEstadisticasGlobalesOptimizado($baseQuery, $user, $esAdmin)
    {
        // Clonar la consulta base
        $query = clone $baseQuery;
        
        // ✅ OPTIMIZACIÓN CRÍTICA: Subconsulta agregada para ejemplares
        $ejemplaresSubquery = DB::table('ejemplares')
            ->select([
                'libro_id',
                DB::raw('COUNT(*) as total'),
                DB::raw('SUM(CASE WHEN estado = "' . Ejemplar::ESTADO_DISPONIBLE . '" THEN 1 ELSE 0 END) as disponibles'),
                DB::raw('SUM(CASE WHEN estado = "' . Ejemplar::ESTADO_PRESTADO . '" THEN 1 ELSE 0 END) as prestados'),
                DB::raw('SUM(CASE WHEN estado = "' . Ejemplar::ESTADO_DADO_DE_BAJA . '" THEN 1 ELSE 0 END) as dados_baja'),
                DB::raw('SUM(CASE WHEN estado = "' . Ejemplar::ESTADO_PERDIDO . '" THEN 1 ELSE 0 END) as perdidos'),
            ])
            ->groupBy('libro_id');

        // Obtener estadísticas principales con JOIN
        $estadisticasPrincipales = DB::table('libros')
            ->leftJoinSub($ejemplaresSubquery, 'ej', function ($join) {
                $join->on('libros.id', '=', 'ej.libro_id');
            })
            ->when($baseQuery->getQuery()->wheres, function ($q) use ($baseQuery) {
                // Aplicar los mismos WHERE que la query base
                foreach ($baseQuery->getQuery()->wheres as $where) {
                    if (isset($where['column']) && isset($where['value'])) {
                        $q->where($where['column'], $where['operator'] ?? '=', $where['value']);
                    }
                }
            })
            ->select([
                DB::raw('COUNT(DISTINCT libros.id) as total_libros'),
                DB::raw('SUM(COALESCE(ej.total, 0)) as total_ejemplares'),
                DB::raw('SUM(COALESCE(ej.disponibles, 0)) as total_disponibles'),
                DB::raw('SUM(COALESCE(ej.prestados, 0)) as total_prestados'),
                DB::raw('SUM(COALESCE(ej.dados_baja, 0)) as total_dados_baja'),
                DB::raw('SUM(COALESCE(ej.perdidos, 0)) as total_perdidos'),
            ])
            ->first();

        // Estadísticas por clase
        $estadisticasPorClase = $this->obtenerEstadisticasPorCampo($baseQuery, 'clase');
        
        // Estadísticas por área
        $estadisticasPorArea = $this->obtenerEstadisticasPorCampo($baseQuery, 'area');
        
        $totalEnCirculacion = ($estadisticasPrincipales->total_disponibles ?? 0) + ($estadisticasPrincipales->total_prestados ?? 0);
        
        return [
            'total_libros' => (int) ($estadisticasPrincipales->total_libros ?? 0),
            'total_ejemplares' => (int) ($estadisticasPrincipales->total_ejemplares ?? 0),
            'total_disponibles' => (int) ($estadisticasPrincipales->total_disponibles ?? 0),
            'total_prestados' => (int) ($estadisticasPrincipales->total_prestados ?? 0),
            'total_dados_baja' => (int) ($estadisticasPrincipales->total_dados_baja ?? 0),
            'total_perdidos' => (int) ($estadisticasPrincipales->total_perdidos ?? 0),
            'total_en_circulacion' => $totalEnCirculacion,
            'por_clase' => $estadisticasPorClase,
            'por_area' => $estadisticasPorArea,
        ];
    }

    /**
     * ✅ OPTIMIZADO: Obtiene estadísticas agrupadas usando JOIN en lugar de subconsultas
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $baseQuery
     * @param  string  $campo
     * @return \Illuminate\Support\Collection
     */
    private function obtenerEstadisticasPorCampo($baseQuery, $campo)
    {
        // Subconsulta agregada para ejemplares
        $ejemplaresSubquery = DB::table('ejemplares')
            ->select([
                'libro_id',
                DB::raw('COUNT(*) as total'),
                DB::raw('SUM(CASE WHEN estado = "' . Ejemplar::ESTADO_DISPONIBLE . '" THEN 1 ELSE 0 END) as disponibles'),
                DB::raw('SUM(CASE WHEN estado = "' . Ejemplar::ESTADO_PRESTADO . '" THEN 1 ELSE 0 END) as prestados'),
            ])
            ->groupBy('libro_id');

        $query = DB::table('libros')
            ->leftJoinSub($ejemplaresSubquery, 'ej', function ($join) {
                $join->on('libros.id', '=', 'ej.libro_id');
            })
            ->when($baseQuery->getQuery()->wheres, function ($q) use ($baseQuery) {
                // Aplicar los mismos WHERE que la query base
                foreach ($baseQuery->getQuery()->wheres as $where) {
                    if (isset($where['column']) && isset($where['value'])) {
                        $q->where($where['column'], $where['operator'] ?? '=', $where['value']);
                    }
                }
            })
            ->select([
                DB::raw("libros.{$campo} as categoria"),
                DB::raw('COUNT(DISTINCT libros.id) as total_libros'),
                DB::raw('SUM(COALESCE(ej.total, 0)) as total_ejemplares'),
                DB::raw('SUM(COALESCE(ej.disponibles, 0)) as total_disponibles'),
                DB::raw('SUM(COALESCE(ej.prestados, 0)) as total_prestados'),
            ])
            ->groupBy("libros.{$campo}")
            ->havingRaw("libros.{$campo} IS NOT NULL")
            ->get();

        return $query->keyBy('categoria')->map(function ($item) {
            return [
                'total_libros' => (int) $item->total_libros,
                'total_ejemplares' => (int) $item->total_ejemplares,
                'total_disponibles' => (int) $item->total_disponibles,
                'total_prestados' => (int) $item->total_prestados,
            ];
        });
    }

    /**
     * Calcula las estadísticas globales del inventario (MÉTODO LEGACY - COMPATIBILIDAD)
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return array
     */
    private function calcularEstadisticasGlobales($query)
    {
        return $this->calcularEstadisticasGlobalesOptimizado($query, request()->user(), 
            request()->user()->hasRole('Administrador') || request()->user()->hasRole('SuperAdministrador'));
    }
    
    /**
     * ✅ OPTIMIZADO PARA 60,000 REGISTROS TOTALES
     * Genera un Excel con el inventario de libros separado por áreas (6 hojas ~10k cada una)
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse|\Illuminate\Http\RedirectResponse
     */
    public function exportarExcel(Request $request)
    {
        try {
            // ✅ CONFIGURACIÓN MEJORADA PARA 60,000 REGISTROS
            ini_set('memory_limit', '1024M');        // 1GB para manejar 60k registros
            ini_set('max_execution_time', '600');    // 10 minutos
            set_time_limit(600);
            
            $startTime = microtime(true);
            
            $user = $request->user();
            $esAdmin = $user->hasRole('Administrador') || $user->hasRole('SuperAdministrador');
            
            // SOLO APLICAR FILTRO DE SECCIÓN según el rol del usuario
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
            
            // ✅ VALIDACIÓN PREVIA: Contar registros antes de exportar
            $queryValidacion = DB::table('libros');
            if (!empty($filters['seccion_id'])) {
                $queryValidacion->where('seccion_id', $filters['seccion_id']);
            }
            $totalRegistros = $queryValidacion->count();
            
            Log::info('🔍 Validación pre-export', [
                'total_registros' => $totalRegistros,
                'memoria_disponible' => ini_get('memory_limit'),
                'tiempo_max' => ini_get('max_execution_time')
            ]);
            
            // ✅ ADVERTENCIA si excede capacidad
            if ($totalRegistros > 80000) {
                Log::warning('⚠️ Exportación muy grande', [
                    'registros' => $totalRegistros,
                    'recomendacion' => 'Considerar dividir en múltiples exports'
                ]);
            }
            
            // Generar nombre de archivo
            $filename = 'inventario-biblioteca-por-areas';
            
            if (!empty($filters['seccion_nombre'])) {
                $filename .= '-' . strtolower($filters['seccion_nombre']);
            }
            
            $filename .= '-' . Carbon::now()->format('Y-m-d') . '.xlsx';
            
            Log::info('🚀 Iniciando exportación Excel', [
                'usuario' => $user->email,
                'filtros' => $filters,
                'filename' => $filename,
                'total_registros' => $totalRegistros,
                'timestamp' => now()
            ]);
            
            $excel = Excel::download(new InventarioExport($filters), $filename);
            
            $elapsed = round(microtime(true) - $startTime, 2);
            $memoriaUsada = round(memory_get_peak_usage(true) / 1024 / 1024, 2);
            
            Log::info('✅ Excel generado exitosamente', [
                'filename' => $filename,
                'tiempo_segundos' => $elapsed,
                'memoria_mb' => $memoriaUsada,
                'registros_procesados' => $totalRegistros,
                'usuario' => $user->email
            ]);
            
            return $excel;
            
        } catch (\Exception $e) {
            $memoriaUsada = round(memory_get_peak_usage(true) / 1024 / 1024, 2);
            
            Log::error('❌ Error al generar Excel', [
                'usuario' => $user->email ?? 'desconocido',
                'error' => $e->getMessage(),
                'memoria_usada_mb' => $memoriaUsada,
                'linea' => $e->getLine(),
                'archivo' => $e->getFile(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return redirect()->back()->with('error', 
                'Error al generar el Excel. El archivo podría ser demasiado grande. ' .
                'Intente filtrar por sección o contacte al administrador.'
            );
        }
    }

    /**
     * ✅ OPTIMIZADO: Estadísticas por sección con una sola consulta
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getEstadisticasPorSeccion(Request $request)
    {
        $user = $request->user();
        $esAdmin = $user->hasRole('Administrador') || $user->hasRole('SuperAdministrador');
        
        // Determinar secciones permitidas
        $seccionesPermitidas = [];
        
        if (!$esAdmin) {
            if ($user->hasRole('BibliotecarioPrimaria')) {
                $seccion = Seccion::where('nombre', 'PRIMARIA')->first();
                if ($seccion) $seccionesPermitidas[] = $seccion->id;
            } elseif ($user->hasRole('BibliotecarioBachillerato')) {
                $seccion = Seccion::where('nombre', 'BACHILLERATO')->first();
                if ($seccion) $seccionesPermitidas[] = $seccion->id;
            }
        } else {
            $seccionesPermitidas = Seccion::pluck('id')->toArray();
        }

        // ✅ OPTIMIZACIÓN: Una sola consulta con JOIN
        $ejemplaresSubquery = DB::table('ejemplares')
            ->select([
                'libro_id',
                DB::raw('COUNT(*) as total'),
                DB::raw('SUM(CASE WHEN estado = "' . Ejemplar::ESTADO_DISPONIBLE . '" THEN 1 ELSE 0 END) as disponibles'),
                DB::raw('SUM(CASE WHEN estado = "' . Ejemplar::ESTADO_PRESTADO . '" THEN 1 ELSE 0 END) as prestados'),
                DB::raw('SUM(CASE WHEN estado = "' . Ejemplar::ESTADO_DADO_DE_BAJA . '" THEN 1 ELSE 0 END) as dados_baja'),
                DB::raw('SUM(CASE WHEN estado = "' . Ejemplar::ESTADO_PERDIDO . '" THEN 1 ELSE 0 END) as perdidos'),
            ])
            ->groupBy('libro_id');

        $estadisticas = DB::table('libros')
            ->join('secciones', 'libros.seccion_id', '=', 'secciones.id')
            ->leftJoinSub($ejemplaresSubquery, 'ej', function ($join) {
                $join->on('libros.id', '=', 'ej.libro_id');
            })
            ->whereIn('libros.seccion_id', $seccionesPermitidas)
            ->select([
                'secciones.nombre as seccion_nombre',
                DB::raw('COUNT(DISTINCT libros.id) as total_libros'),
                DB::raw('SUM(COALESCE(ej.total, 0)) as total_ejemplares'),
                DB::raw('SUM(COALESCE(ej.disponibles, 0)) as total_disponibles'),
                DB::raw('SUM(COALESCE(ej.prestados, 0)) as total_prestados'),
                DB::raw('SUM(COALESCE(ej.dados_baja, 0)) as total_dados_baja'),
                DB::raw('SUM(COALESCE(ej.perdidos, 0)) as total_perdidos'),
            ])
            ->groupBy('secciones.id', 'secciones.nombre')
            ->get()
            ->keyBy('seccion_nombre')
            ->map(function ($item) {
                return [
                    'total_libros' => (int) $item->total_libros,
                    'total_ejemplares' => (int) $item->total_ejemplares,
                    'total_disponibles' => (int) $item->total_disponibles,
                    'total_prestados' => (int) $item->total_prestados,
                    'total_dados_baja' => (int) $item->total_dados_baja,
                    'total_perdidos' => (int) $item->total_perdidos,
                    'total_en_circulacion' => (int) ($item->total_disponibles + $item->total_prestados),
                ];
            });

        return response()->json([
            'estadisticas' => $estadisticas,
            'es_admin' => $esAdmin,
            'usuario_rol' => $user->getRoleNames()->first()
        ]);
    }

    /**
     * ✅ OPTIMIZADO: Resumen general con una sola consulta
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getResumenGeneral(Request $request)
    {
        $user = $request->user();
        $esAdmin = $user->hasRole('Administrador') || $user->hasRole('SuperAdministrador');
        
        // Subconsulta agregada
        $ejemplaresSubquery = DB::table('ejemplares')
            ->select([
                'libro_id',
                DB::raw('COUNT(*) as total'),
                DB::raw('SUM(CASE WHEN estado = "' . Ejemplar::ESTADO_DISPONIBLE . '" THEN 1 ELSE 0 END) as disponibles'),
                DB::raw('SUM(CASE WHEN estado = "' . Ejemplar::ESTADO_PRESTADO . '" THEN 1 ELSE 0 END) as prestados'),
                DB::raw('SUM(CASE WHEN estado = "' . Ejemplar::ESTADO_DADO_DE_BAJA . '" THEN 1 ELSE 0 END) as dados_baja'),
                DB::raw('SUM(CASE WHEN estado = "' . Ejemplar::ESTADO_PERDIDO . '" THEN 1 ELSE 0 END) as perdidos'),
            ])
            ->groupBy('libro_id');

        // Construir query base
        $query = DB::table('libros')
            ->leftJoinSub($ejemplaresSubquery, 'ej', function ($join) {
                $join->on('libros.id', '=', 'ej.libro_id');
            });

        // Aplicar filtro automático de sección
        $seccionAsignada = null;
        if (!$esAdmin) {
            if ($user->hasRole('BibliotecarioPrimaria')) {
                $seccion = Seccion::where('nombre', 'PRIMARIA')->first();
                $seccionAsignada = 'PRIMARIA';
                if ($seccion) {
                    $query->where('libros.seccion_id', $seccion->id);
                }
            } elseif ($user->hasRole('BibliotecarioBachillerato')) {
                $seccion = Seccion::where('nombre', 'BACHILLERATO')->first();
                $seccionAsignada = 'BACHILLERATO';
                if ($seccion) {
                    $query->where('libros.seccion_id', $seccion->id);
                }
            }
        }
        
        // Obtener estadísticas
        $estadisticas = $query->select([
                DB::raw('COUNT(DISTINCT libros.id) as total_libros'),
                DB::raw('SUM(COALESCE(ej.total, 0)) as total_ejemplares'),
                DB::raw('SUM(COALESCE(ej.disponibles, 0)) as total_disponibles'),
                DB::raw('SUM(COALESCE(ej.prestados, 0)) as total_prestados'),
                DB::raw('SUM(COALESCE(ej.dados_baja, 0)) as total_dados_baja'),
                DB::raw('SUM(COALESCE(ej.perdidos, 0)) as total_perdidos'),
            ])
            ->first();

        $resumen = [
            'total_libros' => (int) ($estadisticas->total_libros ?? 0),
            'total_ejemplares' => (int) ($estadisticas->total_ejemplares ?? 0),
            'total_disponibles' => (int) ($estadisticas->total_disponibles ?? 0),
            'total_prestados' => (int) ($estadisticas->total_prestados ?? 0),
            'total_dados_baja' => (int) ($estadisticas->total_dados_baja ?? 0),
            'total_perdidos' => (int) ($estadisticas->total_perdidos ?? 0),
            'total_en_circulacion' => (int) (($estadisticas->total_disponibles ?? 0) + ($estadisticas->total_prestados ?? 0)),
        ];

        return response()->json([
            'resumen' => $resumen,
            'es_admin' => $esAdmin,
            'seccion_asignada' => $seccionAsignada
        ]);
    }
}