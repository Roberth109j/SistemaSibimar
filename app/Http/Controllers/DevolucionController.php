<?php

namespace App\Http\Controllers;

use App\Models\Prestamo;
use App\Models\Ejemplar;
use App\Models\Lector;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class DevolucionController extends Controller
{
    /**
     * Mostrar la vista principal de devoluciones
     */
    public function index()
    {
        return Inertia::render('Devoluciones/Index');
    }

    /**
     * Buscar préstamos pendientes de un lector por código
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
            $lectorQuery = Lector::where('codigo', $codigo)
                ->where('estado', 'ACTIVO')
                ->with(['grado']);
                
            // 🆕 FILTRO POR SECCIÓN BASADO EN EL USUARIO AUTENTICADO
            $user = $request->user();
            if ($user->seccion_id) {
                $lectorQuery->where(function ($q) use ($user) {
                    // Para estudiantes: filtrar por sección del grado
                    $q->whereHas('grado', function ($subQ) use ($user) {
                        $subQ->where('grados.seccion_id', $user->seccion_id);
                    })
                    // Para profesores: permitir búsqueda (no tienen grado asignado)
                    ->orWhere('tipo', 'DOCENTE');
                });
            }
            // Si es Administrador (seccion_id = null), puede buscar cualquier lector
            
            $lector = $lectorQuery->first();

            if (!$lector) {
                Log::info('❌ Lector no encontrado:', [
                    'codigo_buscado' => $codigo,
                    'user_seccion_id' => $user->seccion_id
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Lector no encontrado o inactivo'
                ], 404);
            }

            $prestamos = Prestamo::with([
                    'ejemplar:id,libro_id,numEjemplar,estado,observaciones',
                    'ejemplar.libro:id,titulo,codigo_unico,autor_id,editorial_id',
                    'ejemplar.libro.autor:id,nombres,apellidos',
                    'ejemplar.libro.editorial:id,nombre',
                    'lector:id,codigo,nombre,tipo'
                ])
                ->select('id', 'ejemplar_id', 'lector_id', 'fecha_prestamo', 'fecha_devolucion', 'fecha_devuelto', 'estado')
                ->where('lector_id', $lector->id)
                ->whereIn('estado', ['ACTIVO', 'VENCIDO'])
                ->whereHas('ejemplar', function($query) {
                    $query->where('estado', '!=', 'PERDIDO');
                })
                ->orderBy('fecha_prestamo', 'desc')
                ->get();

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
                'prestamos_excluidos_perdidos' => $prestamosExcluidosPorPerdidos
            ]);

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
                'error_line' => $e->getLine(),
                'error_trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error interno del servidor al buscar préstamos'
            ], 500);
        }
    }

    /**
     * Procesar devolución de un préstamo individual (mantiene compatibilidad)
     */
    public function devolver(Request $request, $id)
    {
        Log::info('📤 Iniciando devolución individual de préstamo:', [
            'prestamo_id' => $id,
            'request_data' => $request->all()
        ]);

        $request->validate([
            'fecha_devuelto' => 'required|date',
            'observaciones' => 'nullable|string|max:500',
        ], [
            'fecha_devuelto.required' => 'La fecha de devolución es obligatoria.',
            'fecha_devuelto.date' => 'La fecha de devolución debe ser una fecha válida.',
            'observaciones.max' => 'Las observaciones no pueden exceder 500 caracteres.'
        ]);

        try {
            $prestamo = Prestamo::with([
                    'ejemplar:id,libro_id,numEjemplar,estado,observaciones',
                    'ejemplar.libro:id,titulo,codigo_unico,autor_id,editorial_id',
                    'ejemplar.libro.autor:id,nombres,apellidos',
                    'ejemplar.libro.editorial:id,nombre',
                    'lector:id,codigo,nombre,tipo'
                ])
                ->select('id', 'ejemplar_id', 'lector_id', 'fecha_prestamo', 'fecha_devolucion', 'fecha_devuelto', 'estado')
                ->findOrFail($id);

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

            if ($prestamo->estado === 'DEVUELTO') {
                return response()->json([
                    'success' => false,
                    'message' => 'Este préstamo ya ha sido devuelto.'
                ], 400);
            }

            if (!in_array($prestamo->estado, ['ACTIVO', 'VENCIDO'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Este préstamo no está en un estado válido para devolución.'
                ], 400);
            }

            \DB::beginTransaction();

            $prestamo->update([
                'estado' => 'DEVUELTO',
                'fecha_devuelto' => $request->input('fecha_devuelto')
            ]);

            // Actualizar ejemplar: NO borrar observaciones si el campo viene vacío
            $observacionesInput = trim($request->input('observaciones', ''));
            $ejemplarUpdateData = [
                'estado' => 'DISPONIBLE'
            ];
            if ($observacionesInput !== '') {
                $ejemplarUpdateData['observaciones'] = $observacionesInput;
            }
            $prestamo->ejemplar->update($ejemplarUpdateData);

            \DB::commit();

            Log::info('✅ Préstamo devuelto exitosamente:', [
                'prestamo_id' => $prestamo->id,
                'ejemplar_numero' => $prestamo->ejemplar->numEjemplar,
                'lector_codigo' => $prestamo->lector->codigo,
                'libro_titulo' => $prestamo->ejemplar->libro->titulo,
                'fecha_devuelto' => $request->input('fecha_devuelto')
            ]);

            $prestamoActualizado = $prestamo->fresh([
                'ejemplar:id,libro_id,numEjemplar,estado,observaciones',
                'ejemplar.libro:id,titulo,codigo_unico,autor_id,editorial_id',
                'ejemplar.libro.autor:id,nombres,apellidos',
                'ejemplar.libro.editorial:id,nombre',
                'lector:id,codigo,nombre,tipo'
            ]);

            return response()->json([
                'success' => true,
                'message' => "Devolución procesada exitosamente. Ejemplar #{$prestamo->ejemplar->numEjemplar} nuevamente disponible.",
                'prestamo' => $prestamoActualizado
            ]);

        } catch (\Exception $e) {
            \DB::rollBack();
            
            Log::error('❌ Error en devolución de préstamo:', [
                'prestamo_id' => $id,
                'error_message' => $e->getMessage(),
                'error_file' => $e->getFile(),
                'error_line' => $e->getLine(),
                'error_trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al procesar la devolución: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * MEJORADO: Procesar devolución múltiple de préstamos sin límite
     */
    public function devolverMultiple(Request $request)
    {
        Log::info('📤🔄 Iniciando devolución múltiple de préstamos:', [
            'total_prestamos' => is_array($request->input('prestamos')) ? count($request->input('prestamos')) : 0,
            'fecha_devuelto' => $request->input('fecha_devuelto'),
            'tiene_observaciones_globales' => !empty($request->input('observaciones_globales'))
        ]);

        // Validar datos de entrada - SIN LÍMITE MÁXIMO
        $request->validate([
            'prestamos' => 'required|array|min:1',
            'prestamos.*.id' => 'required|integer|exists:prestamos,id',
            'prestamos.*.observaciones' => 'nullable|string|max:500',
            'fecha_devuelto' => 'required|date',
            'observaciones_globales' => 'nullable|string|max:1000',
        ], [
            'prestamos.required' => 'Debe especificar al menos un préstamo para devolver.',
            'prestamos.min' => 'Debe especificar al menos un préstamo para devolver.',
            'prestamos.*.id.required' => 'ID de préstamo requerido.',
            'prestamos.*.id.exists' => 'Uno o más préstamos no existen.',
            'prestamos.*.observaciones.max' => 'Las observaciones específicas no pueden exceder 500 caracteres.',
            'fecha_devuelto.required' => 'La fecha de devolución es obligatoria.',
            'fecha_devuelto.date' => 'La fecha de devolución debe ser una fecha válida.',
            'observaciones_globales.max' => 'Las observaciones globales no pueden exceder 1000 caracteres.'
        ]);

        $prestamosData = $request->input('prestamos');
        $fechaDevuelto = $request->input('fecha_devuelto');
        $observacionesGlobales = trim($request->input('observaciones_globales', ''));

        try {
            // Verificar que todos los préstamos existen y están en estado válido
            $prestamosIds = collect($prestamosData)->pluck('id')->toArray();
            
            // 🆕 FILTRO POR SECCIÓN BASADO EN EL USUARIO AUTENTICADO
            $user = $request->user();
            $prestamosQuery = Prestamo::with([
                    'ejemplar:id,libro_id,numEjemplar,estado,observaciones',
                    'ejemplar.libro:id,titulo,codigo_unico,autor_id,editorial_id',
                    'ejemplar.libro.autor:id,nombres,apellidos',
                    'lector:id,codigo,nombre,tipo,grado_id',
                    'lector.grado:id,seccion_id'
                ])
                ->select('id', 'ejemplar_id', 'lector_id', 'fecha_prestamo', 'fecha_devolucion', 'fecha_devuelto', 'estado')
                ->whereIn('id', $prestamosIds);
                
            // Si el usuario es bibliotecario, filtrar por la sección del libro prestado
            if ($user->seccion_id) {
                $prestamosQuery->whereHas('ejemplar.libro', function ($q) use ($user) {
                    $q->where('libros.seccion_id', $user->seccion_id);
                });
            }
            // Si es Administrador (seccion_id = null), puede procesar cualquier préstamo
            
            $prestamos = $prestamosQuery->get();

            // Validaciones de negocio
            $errores = [];
            $prestamosValidos = [];
            $prestamosYaDevueltos = [];
            $prestamosEjemplarPerdido = [];
            $prestamosEstadoInvalido = [];

            foreach ($prestamosData as $prestamoData) {
                $prestamo = $prestamos->firstWhere('id', $prestamoData['id']);
                
                if (!$prestamo) {
                    $errores[] = "Préstamo con ID {$prestamoData['id']} no encontrado.";
                    continue;
                }

                // Verificar si el ejemplar está perdido
                if ($prestamo->ejemplar->estado === 'PERDIDO') {
                    $prestamosEjemplarPerdido[] = $prestamo;
                    continue;
                }

                // Verificar si ya está devuelto
                if ($prestamo->estado === 'DEVUELTO') {
                    $prestamosYaDevueltos[] = $prestamo;
                    continue;
                }

                // Verificar estado válido
                if (!in_array($prestamo->estado, ['ACTIVO', 'VENCIDO'])) {
                    $prestamosEstadoInvalido[] = $prestamo;
                    continue;
                }

                // Determinar las observaciones a usar
                $observacionesEspecificas = trim($prestamoData['observaciones'] ?? '');
                $observacionesFinales = '';
                
                if (!empty($observacionesEspecificas)) {
                    $observacionesFinales = $observacionesEspecificas;
                } elseif (!empty($observacionesGlobales)) {
                    $observacionesFinales = $observacionesGlobales;
                }

                // Si llega aquí, el préstamo es válido para devolución
                $prestamosValidos[] = [
                    'prestamo' => $prestamo,
                    'observaciones' => $observacionesFinales
                ];
            }

            // Generar errores descriptivos si hay problemas
            if (!empty($prestamosEjemplarPerdido)) {
                $ejemplaresPerdidos = collect($prestamosEjemplarPerdido)->map(function($p) {
                    return "#{$p->ejemplar->numEjemplar}";
                })->join(', ');
                $errores[] = "Los siguientes ejemplares están marcados como perdidos: {$ejemplaresPerdidos}";
            }

            if (!empty($prestamosYaDevueltos)) {
                $ejemplaresDevueltos = collect($prestamosYaDevueltos)->map(function($p) {
                    return "#{$p->ejemplar->numEjemplar}";
                })->join(', ');
                $errores[] = "Los siguientes préstamos ya fueron devueltos: {$ejemplaresDevueltos}";
            }

            if (!empty($prestamosEstadoInvalido)) {
                $ejemplaresInvalidos = collect($prestamosEstadoInvalido)->map(function($p) {
                    return "#{$p->ejemplar->numEjemplar} ({$p->estado})";
                })->join(', ');
                $errores[] = "Los siguientes préstamos no están en estado válido: {$ejemplaresInvalidos}";
            }

            if (!empty($errores)) {
                Log::warning('⚠️ Errores de validación en devolución múltiple:', [
                    'errores' => $errores,
                    'prestamos_solicitados' => count($prestamosData),
                    'prestamos_validos' => count($prestamosValidos)
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Se encontraron errores en la solicitud:',
                    'errors' => $errores
                ], 400);
            }

            if (empty($prestamosValidos)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No hay préstamos válidos para procesar.'
                ], 400);
            }

            // Procesar devoluciones en transacción
            \DB::beginTransaction();

            $prestamosDevueltos = [];
            $erroresEnProcesamiento = [];

            foreach ($prestamosValidos as $item) {
                try {
                    $prestamo = $item['prestamo'];
                    $observaciones = $item['observaciones'];

                    // Actualizar préstamo
                    $prestamo->update([
                        'estado' => 'DEVUELTO',
                        'fecha_devuelto' => $fechaDevuelto
                    ]);

                    // Actualizar ejemplar: NO borrar observaciones si no hay texto
                    $ejemplarUpdateData = [
                        'estado' => 'DISPONIBLE'
                    ];
                    if (!empty(trim($observaciones))) {
                        $ejemplarUpdateData['observaciones'] = $observaciones;
                    }
                    $prestamo->ejemplar->update($ejemplarUpdateData);

                    $prestamosDevueltos[] = $prestamo;

                    Log::info('✅ Préstamo devuelto en lote:', [
                        'prestamo_id' => $prestamo->id,
                        'ejemplar_numero' => $prestamo->ejemplar->numEjemplar,
                        'libro_titulo' => $prestamo->ejemplar->libro->titulo,
                        'tiene_observaciones' => !empty($observaciones)
                    ]);

                } catch (\Exception $e) {
                    $erroresEnProcesamiento[] = "Error procesando préstamo #{$prestamo->ejemplar->numEjemplar}: {$e->getMessage()}";
                    Log::error('❌ Error procesando préstamo individual en lote:', [
                        'prestamo_id' => $prestamo->id,
                        'error' => $e->getMessage()
                    ]);
                }
            }

            if (!empty($erroresEnProcesamiento)) {
                \DB::rollBack();
                
                Log::error('❌ Errores en procesamiento de devolución múltiple:', [
                    'errores' => $erroresEnProcesamiento,
                    'prestamos_procesados' => count($prestamosDevueltos)
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Errores durante el procesamiento:',
                    'errors' => $erroresEnProcesamiento
                ], 500);
            }

            \DB::commit();

            Log::info('🎉 Devolución múltiple completada exitosamente:', [
                'total_procesados' => count($prestamosDevueltos),
                'fecha_devuelto' => $fechaDevuelto,
                'lector_codigo' => $prestamosDevueltos[0]->lector->codigo ?? 'N/A'
            ]);

            // Preparar respuesta con detalles
            $librosDevueltos = collect($prestamosDevueltos)->map(function($prestamo) {
                return [
                    'ejemplar_numero' => $prestamo->ejemplar->numEjemplar,
                    'titulo' => $prestamo->ejemplar->libro->titulo,
                    'codigo' => $prestamo->ejemplar->libro->codigo_unico
                ];
            });

            return response()->json([
                'success' => true,
                'message' => count($prestamosDevueltos) === 1 
                    ? "1 préstamo devuelto exitosamente." 
                    : count($prestamosDevueltos) . " préstamos devueltos exitosamente.",
                'prestamos_devueltos' => count($prestamosDevueltos),
                'libros_devueltos' => $librosDevueltos,
                'fecha_devolucion' => $fechaDevuelto
            ]);

        } catch (ValidationException $e) {
            Log::warning('⚠️ Errores de validación en devolución múltiple:', [
                'errors' => $e->errors()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Errores de validación.',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            \DB::rollBack();
            
            Log::error('❌ Error crítico en devolución múltiple:', [
                'error_message' => $e->getMessage(),
                'error_file' => $e->getFile(),
                'error_line' => $e->getLine(),
                'error_trace' => $e->getTraceAsString(),
                'total_prestamos' => count($prestamosData ?? [])
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error interno del servidor al procesar las devoluciones múltiples.'
            ], 500);
        }
    }

    /**
     * Obtener información sobre préstamos afectados por ejemplares perdidos
     */
    public function obtenerPrestamosAfectadosPorPerdidos($lectorId)
    {
        try {
            $prestamosAfectados = Prestamo::with([
                    'ejemplar:id,libro_id,numEjemplar,estado,observaciones',
                    'ejemplar.libro:id,titulo,codigo_unico,autor_id,editorial_id',
                    'ejemplar.libro.autor:id,nombres,apellidos',
                    'ejemplar.libro.editorial:id,nombre'
                ])
                ->select('id', 'ejemplar_id', 'lector_id', 'fecha_prestamo', 'fecha_devolucion', 'fecha_devuelto', 'estado')
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
                'error' => $e->getMessage(),
                'error_trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al obtener información de préstamos afectados'
            ], 500);
        }
    }

    /**
     * MÉTODO DE DEBUG: Verificar estructura de todas las tablas relevantes
     */
    public function verificarEstructuraCompleta()
    {
        try {
            $tablas = ['libros', 'lectores', 'ejemplares', 'prestamos', 'autores', 'editoriales'];
            $estructuras = [];

            foreach ($tablas as $tabla) {
                $columnas = \DB::select("DESCRIBE {$tabla}");
                $ejemplo = \DB::table($tabla)->first();
                
                $estructuras[$tabla] = [
                    'columnas' => collect($columnas)->map(function($col) {
                        return [
                            'nombre' => $col->Field,
                            'tipo' => $col->Type,
                            'nulo' => $col->Null,
                            'clave' => $col->Key,
                            'default' => $col->Default
                        ];
                    })->toArray(),
                    'columnas_disponibles' => $ejemplo ? array_keys((array) $ejemplo) : [],
                    'total_registros' => \DB::table($tabla)->count()
                ];
            }
            
            Log::info('📊 Estructura completa de todas las tablas:', $estructuras);

            return response()->json([
                'success' => true,
                'estructuras' => $estructuras,
                'message' => 'Análisis completo de estructuras de tablas realizado'
            ]);
            
        } catch (\Exception $e) {
            Log::error('❌ Error verificando estructuras completas:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al verificar estructuras: ' . $e->getMessage()
            ], 500);
        }
    }
}