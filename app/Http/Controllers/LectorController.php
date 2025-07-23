<?php

namespace App\Http\Controllers;

use App\Models\Lector;
use App\Models\Grado;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Database\Eloquent\Builder;
use Inertia\Inertia;
use Inertia\Response;

class LectorController extends Controller
{
    /**
     * Obtiene un listado de lectores con sus grados, secciones y conteo de préstamos activos
     */
    public function index(Request $request): Response
    {
        // Validación de parámetros de paginación
        $page = max(1, (int) $request->input('page', 1));
        $perPage = 10; // Valor fijo de 10 elementos por página

        // Query base con relaciones necesarias y conteo de préstamos activos
        $query = Lector::with(['grado.seccion'])
            ->leftJoin('grados', 'lectores.grado_id', '=', 'grados.id')
            ->select([
                'lectores.*',
                \DB::raw("(SELECT COUNT(*) FROM prestamos WHERE prestamos.lector_id = lectores.id AND prestamos.estado = 'ACTIVO') as prestamos_count")
            ])
            //  Primero ordenar por estado (ACTIVO primero, INACTIVO al final)
            ->orderByRaw("CASE WHEN lectores.estado = 'ACTIVO' THEN 0 ELSE 1 END")
            ->orderBy('grados.grado')
            ->orderBy('grados.subGrado')
            ->orderBy('lectores.nombre');

        // Aplicar filtros
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('lectores.nombre', 'LIKE', "%{$search}%")
                ->orWhere('lectores.codigo', 'LIKE', "%{$search}%");
            });
        }

        if ($request->filled('tipo')) {
            $query->where('lectores.tipo', $request->tipo);
        }

        // Filtro por subgrado en lugar de grado_id
        if ($request->filled('subgrado')) {
            $query->where('grados.subGrado', $request->subgrado);
        }

        if ($request->filled('estado')) {
            $query->where('lectores.estado', $request->estado); // Especificar tabla lectores
        }

        // Paginación mejorada
        $lectores = $query->paginate($perPage, ['*'], 'page', $page)->withQueryString();

        // Redirigir si la página solicitada no existe pero hay resultados
        if ($page > $lectores->lastPage() && $lectores->lastPage() > 0) {
            return redirect()->route('lectores.index', 
                array_merge($request->query(), ['page' => $lectores->lastPage()])
            );
        }

        // Datos para filtros
        $grados = Grado::select('id', 'grado', 'subGrado')
            ->where('estado', 'ACTIVO')
            ->orderBy('grado')
            ->orderBy('subGrado')
            ->get();

        $tipos = [
            Lector::TIPO_ESTUDIANTE,
            Lector::TIPO_DOCENTE,
            Lector::TIPO_OTRO,
        ];

        $estados = [
            Lector::ESTADO_ACTIVO,
            Lector::ESTADO_INACTIVO,
        ];

        // Obtener todos los lectores para la asignación masiva
        $todosLosLectores = Lector::with(['grado'])
            ->where('tipo', Lector::TIPO_ESTUDIANTE)
            ->where('estado', Lector::ESTADO_ACTIVO)
            ->orderBy('nombre')
            ->get();

        return Inertia::render('Lector/Index', [
            'lectores' => $lectores,
            'todosLosLectores' => $todosLosLectores, // Para el componente de asignación masiva
            'grados' => $grados,
            'tipos' => $tipos,
            'estados' => $estados,
            'filters' => array_filter($request->only(['search', 'tipo', 'subgrado', 'estado'])), // ⭐ CAMBIADO: 'grado' por 'subgrado'
            'pagination' => [
                'current_page' => $lectores->currentPage(),
                'last_page' => $lectores->lastPage(),
                'per_page' => $lectores->perPage(),
                'total' => $lectores->total(),
                'from' => $lectores->firstItem(),
                'to' => $lectores->lastItem(),
                'has_pages' => $lectores->hasPages(),
            ],
        ]);
    }
    
    /**
     * Almacena un nuevo lector
     */
    public function create(): Response
    {
        $grados = Grado::select('id', 'grado', 'subGrado')
            ->where('estado', 'ACTIVO')
            ->orderBy('grado')
            ->orderBy('subGrado')
            ->get();

        $tipos = [
            Lector::TIPO_ESTUDIANTE,
            Lector::TIPO_DOCENTE,
            Lector::TIPO_OTRO,
        ];

        $estados = [
            Lector::ESTADO_ACTIVO,
            Lector::ESTADO_INACTIVO,
        ];

        return Inertia::render('Lector/Create', [
            'grados' => $grados,
            'tipos' => $tipos,
            'estados' => $estados,
        ]);
    }

    // store() con conversión automática a mayúsculas
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'codigo' => 'required|string|unique:lectores,codigo',
            'tipo' => 'required|in:' . implode(',', [
                Lector::TIPO_ESTUDIANTE,
                Lector::TIPO_DOCENTE,
                Lector::TIPO_OTRO,
            ]),
            'grado_id' => 'required_if:tipo,' . Lector::TIPO_ESTUDIANTE . '|exists:grados,id|nullable',
            'estado' => 'required|in:' . implode(',', [
                Lector::ESTADO_ACTIVO,
                Lector::ESTADO_INACTIVO,
            ]),
        ]);

        // Convertir automáticamente el nombre a mayúsculas
        $validated['nombre'] = strtoupper($validated['nombre']);

        $lector = Lector::create($validated);

        return redirect()->route('lectores.index')
            ->with('success', 'Lector creado exitosamente.');
    }

    /**
     * Muestra un lector específico con su información de grado
     */
    public function show(Lector $lector): Response
    {
        // Cargar relaciones y conteo de préstamos activos
        $lector->load(['grado.seccion'])
            ->loadCount([
                'prestamos as prestamos_count' => function ($query) {
                    $query->where('estado', 'ACTIVO');
                }
            ]);

        return Inertia::render('Lector/Show', [
            'lector' => $lector,
        ]);
    }

    /**
     * Actualiza un lector existente
     */
    public function edit(Lector $lector): Response
    {
        $grados = Grado::select('id', 'grado', 'subGrado')
            ->where('estado', 'ACTIVO')
            ->orderBy('grado')
            ->orderBy('subGrado')
            ->get();

        $tipos = [
            Lector::TIPO_ESTUDIANTE,
            Lector::TIPO_DOCENTE,
            Lector::TIPO_OTRO,
        ];

        $estados = [
            Lector::ESTADO_ACTIVO,
            Lector::ESTADO_INACTIVO,
        ];

        return Inertia::render('Lector/Edit', [
            'lector' => $lector,
            'grados' => $grados,
            'tipos' => $tipos,
            'estados' => $estados,
        ]);
    }

    // update() con conversión automática a mayúsculas
    public function update(Request $request, Lector $lector): RedirectResponse
    {
        $validated = $request->validate([
            'nombre' => 'sometimes|required|string|max:255',
            'codigo' => 'sometimes|required|string|unique:lectores,codigo,' . $lector->id,
            'tipo' => 'sometimes|required|in:' . implode(',', [
                Lector::TIPO_ESTUDIANTE,
                Lector::TIPO_DOCENTE,
                Lector::TIPO_OTRO,
            ]),
            'grado_id' => 'required_if:tipo,' . Lector::TIPO_ESTUDIANTE . '|exists:grados,id|nullable',
            'estado' => 'sometimes|required|in:' . implode(',', [
                Lector::ESTADO_ACTIVO,
                Lector::ESTADO_INACTIVO,
            ]),
        ]);

        // Convertir automáticamente el nombre a mayúsculas si está presente
        if (isset($validated['nombre'])) {
            $validated['nombre'] = strtoupper($validated['nombre']);
        }

        $lector->update($validated);

        return redirect()->route('lectores.index')
            ->with('success', 'Lector actualizado exitosamente.');
    }

    /**
     * Elimina un lector
     */
    public function destroy(Lector $lector): RedirectResponse
    {
        // Verificar si tiene préstamos activos antes de eliminar
        if ($lector->tienePrestamosActivos()) {
            return back()->with('error', 'No se puede eliminar el lector porque tiene préstamos activos');
        }

        $lector->delete();

        return redirect()->route('lectores.index')
            ->with('success', 'Lector eliminado exitosamente.');
    }

    //Busca por código de lector         
    public function buscarPorCodigo(Request $request): JsonResponse     
    {         
        $codigo = $request->input('codigo');
        
        \Log::info('Buscando lector con código: ' . $codigo);
        
        $lector = Lector::where('codigo', $codigo)
            ->where('estado', Lector::ESTADO_ACTIVO)
             ->with('grado')
            ->first();
        
        \Log::info('Lector encontrado: ' . ($lector ? 'SÍ' : 'NO'));
                    
        if (!$lector) {
            return response()->json([
                'success' => false,
                'message' => 'Lector no encontrado o inactivo'
            ], 404);
        }
                
        return response()->json([
            'success' => true,
            'lector' => $lector
        ]);
    }

    /**
     * Obtiene lectores por tipo con su información de grado
     */
    public function getByTipo(string $tipo): JsonResponse
    {
        $lectores = Lector::where('tipo', $tipo)
            ->when($tipo === Lector::TIPO_ESTUDIANTE, function (Builder $query) {
                $query->with('grado.seccion');
            })
            ->orderBy('nombre')
            ->get();

        return response()->json($lectores);
    }

    /**
     *Mostrar página de asignación masiva
     */
    public function showAsignacionMasiva(): Response
    {
        // Obtener todos los lectores estudiantes activos con sus grados
        $lectores = Lector::with(['grado'])
            ->where('tipo', Lector::TIPO_ESTUDIANTE)
            ->where('estado', Lector::ESTADO_ACTIVO)
            ->orderBy('nombre')
            ->get();

        // Obtener todos los grados disponibles
        $grados = Grado::select('id', 'grado', 'subGrado')
            ->where('estado', 'ACTIVO')
            ->orderBy('grado')
            ->orderBy('subGrado')
            ->get();

        return Inertia::render('Lector/AsignacionMasiva', [
            'lectores' => $lectores,
            'grados' => $grados,
        ]);
    }

    /**
     * Cambio masivo de estado de estudiantes
     */
    public function cambioEstadoMasivo(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'lector_ids' => 'required|array|min:1',
            'lector_ids.*' => 'exists:lectores,id',
            'nuevo_estado' => 'required|in:ACTIVO,INACTIVO'
        ]);

        try {
            // Verificar que todos los lectores sean estudiantes
            $lectores = Lector::whereIn('id', $validated['lector_ids'])
                ->where('tipo', Lector::TIPO_ESTUDIANTE)
                ->get();

            if ($lectores->count() !== count($validated['lector_ids'])) {
                return back()->with('error', 'Algunos de los lectores seleccionados no son estudiantes válidos.');
            }

            // Realizar la actualización masiva
            $actualizados = Lector::whereIn('id', $validated['lector_ids'])
                ->update([
                    'estado' => $validated['nuevo_estado'],
                ]);

            $estadoTexto = $validated['nuevo_estado'] === 'ACTIVO' ? 'activo' : 'inactivo';
            
            return back()->with('success', "Se cambió exitosamente el estado de {$actualizados} estudiantes a {$estadoTexto}.");
            
        } catch (\Exception $e) {
            \Log::error('Error en cambio masivo de estado:', [
                'error' => $e->getMessage(),
                'lector_ids' => $validated['lector_ids'],
                'nuevo_estado' => $validated['nuevo_estado']
            ]);

            return back()->with('error', 'Error al procesar el cambio de estado masivo: ' . $e->getMessage());
        }
    }
    
    public function asignacionMasiva(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'lector_ids' => 'required|array|min:1',
            'lector_ids.*' => 'exists:lectores,id',
            'nuevo_grado_id' => 'required|exists:grados,id'
        ]);

        try {
            // Verificar que todos los lectores sean estudiantes activos
            $lectores = Lector::whereIn('id', $validated['lector_ids'])
                ->where('tipo', Lector::TIPO_ESTUDIANTE)
                ->where('estado', Lector::ESTADO_ACTIVO)
                ->get();

            if ($lectores->count() !== count($validated['lector_ids'])) {
                return back()->with('error', 'Algunos de los lectores seleccionados no son estudiantes activos válidos.');
            }

            // Obtener información del grado de destino
            $gradoDestino = Grado::find($validated['nuevo_grado_id']);

            // Realizar la actualización masiva
            $actualizados = Lector::whereIn('id', $validated['lector_ids'])
                ->update([
                    'grado_id' => $validated['nuevo_grado_id'],
                ]);

            return back()->with('success', "Se asignaron exitosamente {$actualizados} estudiantes al grado {$gradoDestino->grado}° {$gradoDestino->subGrado}.");
            
        } catch (\Exception $e) {
            \Log::error('Error en asignación masiva de grados:', [
                'error' => $e->getMessage(),
                'lector_ids' => $validated['lector_ids'],
                'nuevo_grado_id' => $validated['nuevo_grado_id']
            ]);

            return back()->with('error', 'Error al procesar la asignación masiva: ' . $e->getMessage());
        }
    }
}