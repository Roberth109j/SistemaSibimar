<?php

namespace App\Http\Controllers;

use App\Models\Prestamo;
use App\Models\Ejemplar;
use App\Models\Lector;
use App\Models\Libro;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PrestamoController extends Controller
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
     * Mostrar la vista de gestión de préstamos
     */
    public function index()
    {
        // Actualizar estado de préstamos vencidos
        $this->actualizarPrestamosVencidos();

        // Solo renderizamos la vista inicial, los libros se buscarán por AJAX
        return Inertia::render('Prestamos/Index');
    }

    /**
     * Buscar lector por código para el préstamo
     * MEJORADO: Con logs detallados para debugging
     */
    public function buscarLector(Request $request)
    {
        $codigo = $request->input('codigo');

        Log::info('🔍 Búsqueda de lector iniciada:', [
            'codigo_solicitado' => $codigo,
            'request_data' => $request->all()
        ]);

        if (empty($codigo)) {
            Log::warning('⚠️ Búsqueda de lector sin código');
            return response()->json([
                'success' => false,
                'message' => 'Código de lector requerido'
            ], 400);
        }

        try {
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

            Log::info('✅ Lector encontrado exitosamente:', [
                'lector_id' => $lector->id,
                'lector_nombre' => $lector->nombre,
                'lector_codigo' => $lector->codigo,
                'lector_estado' => $lector->estado,
                'grado' => $lector->grado ? $lector->grado->nombre : 'Sin grado'
            ]);

            return response()->json([
                'success' => true,
                'lector' => $lector
            ]);
        } catch (\Exception $e) {
            Log::error('❌ Error en búsqueda de lector:', [
                'codigo' => $codigo,
                'error_message' => $e->getMessage(),
                'error_file' => $e->getFile(),
                'error_line' => $e->getLine()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error interno del servidor al buscar lector'
            ], 500);
        }
    }

    /**
     * Crear un nuevo préstamo
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ejemplar_id' => 'required|exists:ejemplares,id',
            'codigo_lector' => 'required|exists:lectores,codigo',
            'fecha_prestamo' => 'required|date',
            'fecha_devolucion' => 'required|date|after:fecha_prestamo',
            'observaciones' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator->errors());
        }

        // Verificar si el ejemplar está disponible
        $ejemplar = Ejemplar::findOrFail($request->input('ejemplar_id'));
        if ($ejemplar->estado !== Ejemplar::ESTADO_DISPONIBLE) {
            return back()->with('error', 'El ejemplar no está disponible para préstamo.');
        }

        // Obtener el lector por código
        $lector = Lector::where('codigo', $request->input('codigo_lector'))
            ->where('estado', 'ACTIVO')
            ->with('grado')
            ->first();

        if (!$lector) {
            return back()->with('error', 'El lector no existe o está inactivo.');
        }

        // Validar si el lector ya tiene demasiados préstamos activos
        $prestamosActivos = Prestamo::where('lector_id', $lector->id)
            ->where('estado', 'ACTIVO')
            ->count();

        // Usar input() para acceder a la propiedad tipo
        $maxPrestamos = $lector->tipo === 'ESTUDIANTE' ? 2 : 3;

        if ($prestamosActivos >= $maxPrestamos) {
            return back()->with('error', "El lector ya tiene $prestamosActivos préstamos activos (máximo $maxPrestamos).");
        }

        try {
            // Crear el préstamo con estado ACTIVO usando input()
            $prestamo = Prestamo::create([
                'ejemplar_id' => $ejemplar->id,
                'lector_id' => $lector->id,
                'fecha_prestamo' => $request->input('fecha_prestamo'),
                'fecha_devolucion' => $request->input('fecha_devolucion'),
                'fecha_devuelto' => null,
                'estado' => 'ACTIVO',
                'observaciones' => $request->input('observaciones', '')
            ]);

            // Actualizar estado del ejemplar
            $ejemplar->update(['estado' => Ejemplar::ESTADO_PRESTADO]);

            return redirect()->route('prestamos.index')->with('success', 'Préstamo registrado exitosamente');
        } catch (\Exception $e) {
            return back()->with('error', 'Error al procesar el préstamo: ' . $e->getMessage());
        }
    }

    /**
     * Mostrar detalles de un préstamo
     */
    public function show(Prestamo $prestamo)
    {
        $prestamo->load(['ejemplar.libro', 'lector']);

        return Inertia::render('Prestamos/Show', [
            'prestamo' => $prestamo
        ]);
    }

    /**
     * Marcar un préstamo como devuelto (para préstamos activos)
     */
    public function devolver(Request $request, Prestamo $prestamo)
    {
        // Validar los datos recibidos
        $request->validate([
            'fecha_devuelto' => 'required|date',
            'observaciones' => 'nullable|string|max:500',
        ]);

        if ($prestamo->estado === 'DEVUELTO') {
            return back()->with('error', 'Este préstamo ya ha sido devuelto.');
        }

        // Verificar que el préstamo esté activo (no vencido)
        if ($prestamo->estado === 'VENCIDO') {
            return back()->with('error', 'Este préstamo está vencido. Use la función de devolución de préstamos vencidos.');
        }

        try {
            // Actualizar el préstamo (compatible con timestamps = false)
            $prestamo->update([
                'estado' => 'DEVUELTO',
                'fecha_devuelto' => $request->fecha_devuelto,
                'observaciones' => $request->observaciones ?? $prestamo->observaciones,
            ]);

            // Actualizar estado del ejemplar
            $prestamo->ejemplar->update(['estado' => Ejemplar::ESTADO_DISPONIBLE]);

            return redirect()->route('prestamos.listado')
                ->with('success', 'Préstamo devuelto exitosamente.');
        } catch (\Exception $e) {
            return back()->with('error', 'Error al procesar la devolución: ' . $e->getMessage());
        }
    }

    /**
     * Lista de préstamos activos
     */
    public function listado(Request $request)
    {
        try {
            // Actualizar estado de préstamos vencidos
            $this->actualizarPrestamosVencidos();

            $query = Prestamo::with(['ejemplar.libro', 'lector'])
                ->where('estado', 'ACTIVO')
                ->orderBy('fecha_prestamo', 'desc');

            if ($request->has('search')) {
                $search = $request->input('search');
                $query->where(function ($q) use ($search) {
                    $q->whereHas('lector', function ($q) use ($search) {
                        $q->where('nombre', 'LIKE', "%{$search}%")
                            ->orWhere('codigo', 'LIKE', "%{$search}%");
                    })
                        ->orWhereHas('ejemplar', function ($q) use ($search) {
                            $q->where('codigo', 'LIKE', "%{$search}%")
                                ->orWhereHas('libro', function ($q) use ($search) {
                                    $q->where('titulo', 'LIKE', "%{$search}%");
                                });
                        });
                });
            }

            if ($request->has('codigo_lector')) {
                $query->whereHas('lector', function ($q) use ($request) {
                    $q->where('codigo', $request->input('codigo_lector'));
                });
            }

            $prestamos = $query->paginate(10);

            return Inertia::render('Devoluciones/Index', [
                'prestamos' => $prestamos
            ]);
        } catch (\Exception $e) {
            return back()->with('error', 'Error al cargar la lista de préstamos: ' . $e->getMessage());
        }
    }

    /**
     * 🔍 Lista de préstamos vencidos con BÚSQUEDA GLOBAL COMPLETA Y OPTIMIZADA
     * ✅ VERSIÓN FINAL: Compatible con tu modelo Prestamo personalizado
     */
    /**
     * 🔍 Lista de préstamos vencidos con BÚSQUEDA GLOBAL SEGURA
     * ✅ VERSIÓN SEGURA: Sin asumir estructura de columnas
     */
    public function vencidos(Request $request)
    {
        try {
            // 📝 LOG: Debug detallado de la petición
            Log::info('🔍 PETICIÓN COMPLETA - Préstamos Vencidos (Versión Segura):', [
                'all_request' => $request->all(),
                'search_methods' => [
                    'input' => $request->input('search'),
                    'get' => $request->get('search'),
                    'query' => $request->query('search'),
                ],
                'method' => $request->method(),
                'url' => $request->fullUrl()
            ]);

            // Actualizar estado de préstamos vencidos
            $this->actualizarPrestamosVencidos();

            // ===== 🔍 EXTRACCIÓN SEGURA DE PARÁMETROS =====
            $searchTerm = $request->input('search') ?? $request->get('search') ?? $request->query('search') ?? '';
            $diasVencido = $request->input('dias_vencido') ?? $request->get('dias_vencido') ?? $request->query('dias_vencido') ?? '';

            // Limpiar y validar parámetros
            $searchTerm = is_string($searchTerm) ? trim($searchTerm) : '';
            $diasVencido = is_string($diasVencido) ? trim($diasVencido) : '';

            Log::info('🎯 PARÁMETROS PROCESADOS:', [
                'searchTerm_final' => $searchTerm,
                'diasVencido_final' => $diasVencido,
                'will_apply_search' => !empty($searchTerm)
            ]);

            // ===== 🔍 CONSTRUIR CONSULTA BASE SEGURA =====
            $query = Prestamo::query()
                ->with(['ejemplar.libro', 'lector.grado']) // Carga simple sin especificar columnas
                ->where('estado', Prestamo::ESTADO_VENCIDO)
                ->orderBy('fecha_devolucion', 'asc');

            // ===== 🔍 APLICAR BÚSQUEDA SEGURA =====
            if (!empty($searchTerm)) {
                Log::info('🚀 APLICANDO BÚSQUEDA SEGURA:', [
                    'search_term' => $searchTerm,
                    'search_strategy' => 'safe_search_without_column_assumptions'
                ]);

                $query->where(function ($mainQuery) use ($searchTerm) {
                    // 👤 BÚSQUEDA EN LECTOR (solo campos que sabemos que existen)
                    $mainQuery->whereHas('lector', function ($lectorQuery) use ($searchTerm) {
                        $lectorQuery->where('nombre', 'LIKE', "%{$searchTerm}%")
                            ->orWhere('codigo', 'LIKE', "%{$searchTerm}%");
                    })
                        // 📚 BÚSQUEDA EN LIBRO (solo título, que seguramente existe)
                        ->orWhereHas('ejemplar.libro', function ($libroQuery) use ($searchTerm) {
                            $libroQuery->where('titulo', 'LIKE', "%{$searchTerm}%");
                        });
                });

                // Log de la query SQL generada
                try {
                    $sql = $query->toSql();
                    Log::info('📊 SQL QUERY SEGURO GENERADO:', [
                        'sql' => $sql,
                        'search_fields' => ['lector.nombre', 'lector.codigo', 'libro.titulo']
                    ]);
                } catch (\Exception $e) {
                    Log::warning('⚠️ No se pudo generar SQL de debug:', ['error' => $e->getMessage()]);
                }
            }

            // ===== 📅 APLICAR FILTRO POR DÍAS VENCIDOS =====
            if (!empty($diasVencido) && is_numeric($diasVencido)) {
                $diasMinimos = (int) $diasVencido;
                if ($diasMinimos > 0) {
                    Log::info('📅 APLICANDO FILTRO DE DÍAS:', ['dias_minimos' => $diasMinimos]);
                    $query->whereRaw('DATEDIFF(CURDATE(), fecha_devolucion) >= ?', [$diasMinimos]);
                }
            }

            // ===== 📊 CONTEO TOTAL =====
            $totalResults = $query->count();
            Log::info('📊 RESULTADOS ENCONTRADOS:', [
                'total_results' => $totalResults,
                'search_applied' => !empty($searchTerm)
            ]);

            // ===== 📄 PAGINACIÓN =====
            $prestamos = $query->paginate(10)->withQueryString();

            // ===== 📊 CALCULAR DÍAS DE RETRASO =====
            $prestamos->getCollection()->transform(function ($prestamo) {
                if ($prestamo && $prestamo->fecha_devolucion) {
                    try {
                        $fechaDevolucion = Carbon::parse($prestamo->fecha_devolucion)->startOfDay();
                        $fechaActual = Carbon::now()->startOfDay();
                        $diasRetraso = $fechaActual->diffInDays($fechaDevolucion);
                        $prestamo->dias_retraso = max(0, $diasRetraso);
                    } catch (\Exception $e) {
                        Log::warning('⚠️ Error calculando días de retraso:', [
                            'prestamo_id' => $prestamo->id,
                            'error' => $e->getMessage()
                        ]);
                        $prestamo->dias_retraso = 0;
                    }
                } else {
                    $prestamo->dias_retraso = 0;
                }
                return $prestamo;
            });

            // ===== 📤 PREPARAR RESPUESTA =====
            $filtersToSend = [
                'search' => $searchTerm,
                'dias_vencido' => $diasVencido,
            ];

            $searchStatsToSend = [
                'total_found' => $totalResults,
                'has_filters' => !empty($searchTerm) || !empty($diasVencido),
                'search_term' => $searchTerm,
                'dias_filter' => $diasVencido,
            ];

            Log::info('📤 ENVIANDO RESPUESTA SEGURA:', [
                'filters_sent' => $filtersToSend,
                'search_stats_sent' => $searchStatsToSend,
                'prestamos_count' => $prestamos->count()
            ]);

            return Inertia::render('Prestamos/Vencidos', [
                'prestamos' => $prestamos,
                'filters' => $filtersToSend,
                'search_stats' => $searchStatsToSend
            ]);
        } catch (\Exception $e) {
            Log::error('❌ ERROR EN BÚSQUEDA SEGURA:', [
                'error_message' => $e->getMessage(),
                'error_file' => $e->getFile(),
                'error_line' => $e->getLine(),
                'request_data' => $request->all()
            ]);

            return back()->with('error', 'Error al cargar la lista de préstamos vencidos: ' . $e->getMessage());
        }
    }

    /**
     * Procesar devolución de préstamo vencido - VERSIÓN SEGURA
     */
    public function devolverVencido(Request $request, $id)
    {
        Log::info('📤 DEVOLUCIÓN SEGURA INICIADA:', [
            'prestamo_id' => $id,
            'request_data' => $request->all()
        ]);

        $request->validate([
            'fecha_devuelto' => 'required|date',
            'observaciones' => 'nullable|string|max:500',
        ]);

        try {
            $prestamo = Prestamo::findOrFail($id);

            if ($prestamo->estado !== Prestamo::ESTADO_VENCIDO) {
                return back()->with('error', 'Este préstamo no está en estado vencido.');
            }

            // Actualizar préstamo
            $prestamo->update([
                'estado' => Prestamo::ESTADO_DEVUELTO,
                'fecha_devuelto' => $request->input('fecha_devuelto'),
                'observaciones' => $request->input('observaciones'),
            ]);

            // Actualizar ejemplar
            $prestamo->ejemplar->update([
                'estado' => Ejemplar::ESTADO_DISPONIBLE
            ]);

            // Preservar filtros
            $redirectParams = [];
            if ($request->filled('search')) {
                $redirectParams['search'] = trim($request->input('search'));
            }
            if ($request->filled('dias_vencido')) {
                $redirectParams['dias_vencido'] = trim($request->input('dias_vencido'));
            }
            if ($request->filled('page')) {
                $redirectParams['page'] = (int) $request->input('page');
            }

            return redirect()->route('prestamos.vencidos', $redirectParams)
                ->with('success', 'Préstamo devuelto exitosamente');
        } catch (\Exception $e) {
            Log::error('❌ ERROR EN DEVOLUCIÓN SEGURA:', [
                'prestamo_id' => $id,
                'error' => $e->getMessage()
            ]);

            return back()->with('error', 'Error al procesar la devolución: ' . $e->getMessage());
        }
    }

    /**
     * Método temporal para debugging - Puedes eliminar en producción
     */
    public function debugVencidos(Request $request)
    {
        Log::info('🔧 DEBUG SIMPLE - Datos recibidos en vencidos:', [
            'request_all' => $request->all(),
            'search_methods' => [
                'input' => $request->input('search'),
                'get' => $request->get('search'),
                'query' => $request->query('search'),
            ],
            'query_string' => $request->getQueryString(),
            'url' => $request->fullUrl()
        ]);

        return response()->json([
            'status' => 'debug_success',
            'message' => 'Debug de parámetros completado',
            'received' => [
                'all' => $request->all(),
                'search_input' => $request->input('search'),
                'search_get' => $request->get('search'),
                'query_string' => $request->getQueryString()
            ]
        ]);
    }
}
