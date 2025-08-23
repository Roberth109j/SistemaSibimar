<?php

namespace App\Http\Controllers;

use App\Models\Grado;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\QueryException;
use Illuminate\Validation\Rule;

class GradoController extends Controller
{

/**
 * Muestra un listado de todos los grados con paginación, ordenamiento y búsqueda.
 */
public function index(Request $request): Response|RedirectResponse
{
    // Validación de parámetros de paginación
    $page = max(1, (int) $request->input('page', 1));
    $perPage = 10; // Valor fijo de 10 elementos por página

    // Parámetros de ordenamiento - SOLO GRADO
    $sortOrder = $request->get('sort_order', 'asc'); // Orden por defecto: ascendente (A-Z)
    
    // Solo permitir ordenamiento ascendente o descendente
    $allowedSortOrders = ['asc', 'desc'];
    if (!in_array($sortOrder, $allowedSortOrders)) {
        $sortOrder = 'asc';
    }

    // Parámetro de búsqueda
    $search = $request->get('search', '');

    // Query base - INCLUIR LA RELACIÓN CON SECCIÓN
    $query = Grado::with('seccion'); // Esta es la línea clave que faltaba
    
    // Filtrar por sección según el rol del usuario
    $user = request()->user();
    if ($user->hasRole('BibliotecarioPrimaria')) {
        $seccion = \App\Models\Seccion::where('nombre', 'PRIMARIA')->first();
        if ($seccion) {
            $query->where('seccion_id', $seccion->id);
        }
    } elseif ($user->hasRole('BibliotecarioBachillerato')) {
        $seccion = \App\Models\Seccion::where('nombre', 'BACHILLERATO')->first();
        if ($seccion) {
            $query->where('seccion_id', $seccion->id);
        }
    }
    // Los administradores pueden ver todos los grados

    // Aplicar filtro de búsqueda si existe
    if (!empty($search)) {
        $searchTerm = trim($search);
        $query->where(function($q) use ($searchTerm) {
            $q->where('grado', 'LIKE', "%{$searchTerm}%")
              ->orWhere('subGrado', 'LIKE', "%{$searchTerm}%")
              ->orWhereHas('seccion', function($subQuery) use ($searchTerm) {
                  $subQuery->where('nombre', 'LIKE', "%{$searchTerm}%");
              });
        });
    }

    // Aplicar filtros adicionales
    if ($request->filled('grado_filter')) {
        $query->where('grado', $request->input('grado_filter'));
    }

    if ($request->filled('estado')) {
        $query->where('estado', $request->input('estado'));
    }

    // Aplicar filtro de sección si se agrega
    if ($request->filled('seccion_filter')) {
        $query->where('seccion_id', $request->input('seccion_filter'));
    }

    // Ordenamiento jerárquico mejorado - ACTUALIZADO PARA MAYÚSCULAS
    if ($sortOrder === 'asc') {
        // Orden ascendente: PREESCOLAR -> PRIMERO -> SEGUNDO -> ... -> ONCE
        $query->orderByRaw("
            CASE grado
                WHEN 'PREESCOLAR' THEN 1
                WHEN 'PRIMERO' THEN 2
                WHEN 'SEGUNDO' THEN 3
                WHEN 'TERCERO' THEN 4
                WHEN 'CUARTO' THEN 5
                WHEN 'QUINTO' THEN 6
                WHEN 'SEXTO' THEN 7
                WHEN 'SÉPTIMO' THEN 8
                WHEN 'OCTAVO' THEN 9
                WHEN 'NOVENO' THEN 10
                WHEN 'DÉCIMO' THEN 11
                WHEN 'ONCE' THEN 12
                ELSE 99
            END ASC
        ");
    } else {
        // Orden descendente: ONCE -> DÉCIMO -> ... -> SEGUNDO -> PRIMERO -> PREESCOLAR
        $query->orderByRaw("
            CASE grado
                WHEN 'ONCE' THEN 1
                WHEN 'DÉCIMO' THEN 2
                WHEN 'NOVENO' THEN 3
                WHEN 'OCTAVO' THEN 4
                WHEN 'SÉPTIMO' THEN 5
                WHEN 'SEXTO' THEN 6
                WHEN 'QUINTO' THEN 7
                WHEN 'CUARTO' THEN 8
                WHEN 'TERCERO' THEN 9
                WHEN 'SEGUNDO' THEN 10
                WHEN 'PRIMERO' THEN 11
                WHEN 'PREESCOLAR' THEN 12
                ELSE 0
            END ASC
        ");
    }
    
    // ORDENAMIENTO SECUNDARIO POR SUBGRADO - SIEMPRE EN ORDEN NATURAL (UNO, DOS, TRES...)
    // Los subgrados SIEMPRE mantienen su orden natural independientemente del orden principal
    $query->orderByRaw("
        CASE 
            -- Manejo de subgrados que terminan en UNO (siempre primero)
            WHEN UPPER(TRIM(subGrado)) LIKE '%UNO' THEN 1
            -- Manejo de subgrados que terminan en DOS (siempre segundo)
            WHEN UPPER(TRIM(subGrado)) LIKE '%DOS' THEN 2
            -- Manejo de subgrados que terminan en TRES (siempre tercero)
            WHEN UPPER(TRIM(subGrado)) LIKE '%TRES' THEN 3
            -- Manejo de subgrados que terminan en CUATRO
            WHEN UPPER(TRIM(subGrado)) LIKE '%CUATRO' THEN 4
            -- Manejo de subgrados que terminan en CINCO
            WHEN UPPER(TRIM(subGrado)) LIKE '%CINCO' THEN 5
            -- Manejo de subgrados que terminan en SEIS
            WHEN UPPER(TRIM(subGrado)) LIKE '%SEIS' THEN 6
            -- Manejo de subgrados que terminan en SIETE
            WHEN UPPER(TRIM(subGrado)) LIKE '%SIETE' THEN 7
            -- Manejo de subgrados que terminan en OCHO
            WHEN UPPER(TRIM(subGrado)) LIKE '%OCHO' THEN 8
            -- Manejo de subgrados que terminan en NUEVE
            WHEN UPPER(TRIM(subGrado)) LIKE '%NUEVE' THEN 9
            -- Manejo de subgrados que terminan en DIEZ
            WHEN UPPER(TRIM(subGrado)) LIKE '%DIEZ' THEN 10
            -- Manejo de subgrados que terminan en ONCE
            WHEN UPPER(TRIM(subGrado)) LIKE '%ONCE' THEN 11
            -- Manejo de subgrados que terminan en DOCE
            WHEN UPPER(TRIM(subGrado)) LIKE '%DOCE' THEN 12
            -- Manejo de números al final (ej: SEXTO 1, SEXTO 2) - siempre en orden 1, 2, 3...
            WHEN subGrado REGEXP '[0-9]+$' THEN 
                CAST(SUBSTRING(subGrado, LENGTH(subGrado) - LENGTH(SUBSTRING_INDEX(subGrado, ' ', -1)) + 1) AS UNSIGNED)
            ELSE 999
        END ASC
    ");
    
    // Ordenamiento terciario alfabético como fallback - siempre ascendente
    $query->orderBy('subGrado', 'asc');

    // Paginación
    $grados = $query->paginate($perPage, ['*'], 'page', $page)->withQueryString();

    // Redirigir si la página solicitada no existe pero hay resultados
    if ($page > $grados->lastPage() && $grados->lastPage() > 0) {
        return redirect()->route('grados.index', 
            array_merge($request->query(), ['page' => $grados->lastPage()])
        );
    }

    // Calcular el número inicial para la numeración secuencial
    $startNumber = ($grados->currentPage() - 1) * $grados->perPage();

    // Obtener todos los grados únicos para el filtro - ordenados jerárquicamente
    $allGrados = [
        'PREESCOLAR',
        'PRIMERO', 
        'SEGUNDO',
        'TERCERO',
        'CUARTO',
        'QUINTO',
        'SEXTO',
        'SÉPTIMO',
        'OCTAVO',
        'NOVENO',
        'DÉCIMO',
        'ONCE'
    ];

    $allEstados = ['ACTIVO', 'INACTIVO'];

    // Obtener todas las secciones para el filtro
    $allSecciones = \App\Models\Seccion::orderBy('nombre')->get();
    
    // Determinar la sección predeterminada según el rol del usuario para el componente Create
    $seccionId = null;
    $user = request()->user();
    if ($user->hasRole('BibliotecarioPrimaria')) {
        $seccion = \App\Models\Seccion::where('nombre', 'PRIMARIA')->first();
        $seccionId = $seccion ? $seccion->id : null;
    } elseif ($user->hasRole('BibliotecarioBachillerato')) {
        $seccion = \App\Models\Seccion::where('nombre', 'BACHILLERATO')->first();
        $seccionId = $seccion ? $seccion->id : null;
    }

    return Inertia::render('Grado/Index', [
        'grados' => $grados,
        'sort_order' => $sortOrder,
        'search' => $search,
        'start_number' => $startNumber,
        'filters' => array_filter($request->only(['grado_filter', 'estado', 'seccion_filter'])),
        'all_grados' => $allGrados,
        'all_estados' => $allEstados,
        'all_secciones' => $allSecciones, // Agregar secciones para el filtro
        'seccionId' => $seccionId, // Pasar la sección predeterminada según el rol
        'pagination' => [
            'current_page' => $grados->currentPage(),
            'last_page' => $grados->lastPage(),
            'per_page' => $grados->perPage(),
            'total' => $grados->total(),
            'from' => $grados->firstItem(),
            'to' => $grados->lastItem(),
            'has_pages' => $grados->hasPages(),
        ],
    ]);
}

    /**
     * Muestra el formulario para crear un nuevo grado.
     */
    public function create(): Response
    {
        // Obtener todas las secciones disponibles
        $secciones = \App\Models\Seccion::orderBy('nombre')->get();
        
        // Determinar la sección predeterminada según el rol del usuario
        $seccionId = null;
        $user = request()->user();
        if ($user->hasRole('BibliotecarioPrimaria')) {
            $seccion = \App\Models\Seccion::where('nombre', 'PRIMARIA')->first();
            $seccionId = $seccion ? $seccion->id : null;
        } elseif ($user->hasRole('BibliotecarioBachillerato')) {
            $seccion = \App\Models\Seccion::where('nombre', 'BACHILLERATO')->first();
            $seccionId = $seccion ? $seccion->id : null;
        }
        
        return Inertia::render('Grado/Create', [
            'secciones' => $secciones,
            'seccionId' => $seccionId // Pasar la sección predeterminada según el rol
        ]);
    }

    /**
     * Almacena un nuevo grado en la base de datos.
     */
    public function store(Request $request): RedirectResponse
    {
        Log::info('Received store request data:', $request->all());
        try {
            // VALIDACIÓN ACTUALIZADA PARA MAYÚSCULAS
            $validated = $request->validate([
                'grado' => ['required', 'string', Rule::in([
                    'PREESCOLAR', 'PRIMERO', 'SEGUNDO', 'TERCERO', 'CUARTO',
                    'QUINTO', 'SEXTO', 'SÉPTIMO', 'OCTAVO', 'NOVENO',
                    'DÉCIMO', 'ONCE'
                ])],
                'subGrado' => 'nullable|string|max:255',
                'estado' => ['required', 'string', Rule::in(['ACTIVO', 'INACTIVO'])],
                'seccion_id' => 'required|exists:secciones,id'
            ]);
            
            // Validar que el usuario solo pueda actualizar grados en su sección asignada
             $user = request()->user();
             if ($user->hasRole('BibliotecarioPrimaria')) {
                 $seccion = \App\Models\Seccion::where('nombre', 'PRIMARIA')->first();
                 if ($seccion && $validated['seccion_id'] != $seccion->id) {
                     return redirect()->back()->withErrors(['seccion_id' => 'Como bibliotecario de primaria, solo puede actualizar grados para la sección PRIMARIA.']);
                 }
             } elseif ($user->hasRole('BibliotecarioBachillerato')) {
                 $seccion = \App\Models\Seccion::where('nombre', 'BACHILLERATO')->first();
                 if ($seccion && $validated['seccion_id'] != $seccion->id) {
                     return redirect()->back()->withErrors(['seccion_id' => 'Como bibliotecario de bachillerato, solo puede actualizar grados para la sección BACHILLERATO.']);
                 }
             }

            DB::beginTransaction();
            $grado = Grado::create($validated);
            if (!$grado) {
                throw new \Exception('Failed to create grado in database.');
            }
            DB::commit();

            Log::info('Grado creado correctamente', ['id' => $grado->id, 'data' => $grado->toArray()]);

            return redirect()->route('grados.index')
                ->with('success', 'Grado creado correctamente.');
        } catch (ValidationException $e) {
            DB::rollBack();
            Log::error('Validation error creating grado: ' . json_encode($e->errors()));
            return redirect()->back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (QueryException $e) {
            DB::rollBack();
            Log::error('Database error creating grado: ' . $e->getMessage());
            $errorMessage = 'Ha ocurrido un error al crear el grado.';
            if (str_contains($e->getMessage(), 'Duplicate entry')) {
                $errorMessage = 'El grado ya ha sido registrado.';
            } elseif (str_contains($e->getMessage(), 'Unknown column')) {
                $errorMessage = 'Error de estructura en la base de datos. Verifique las columnas.';
            }
            return redirect()->back()
                ->withErrors(['error' => $errorMessage])
                ->withInput();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Unexpected error creating grado: ' . $e->getMessage());
            return redirect()->back()
                ->withErrors(['error' => 'Ha ocurrido un error al crear el grado: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Muestra los datos de un grado específico.
     */
    public function show(Grado $grado): Response
    {
        return Inertia::render('Grado/Show', [
            'grado' => $grado->fresh()
        ]);
    }

    /**
     * Muestra el formulario para editar el grado especificado.
     */
    public function edit(Grado $grado): Response
    {
        // Validar que el usuario pueda editar este grado según su rol
        $user = request()->user();
        if ($user->hasRole('BibliotecarioPrimaria')) {
            $seccion = \App\Models\Seccion::where('nombre', 'PRIMARIA')->first();
            if ($seccion && $grado->seccion_id != $seccion->id) {
                abort(403, 'No tiene permisos para editar grados de esta sección.');
            }
        } elseif ($user->hasRole('BibliotecarioBachillerato')) {
            $seccion = \App\Models\Seccion::where('nombre', 'BACHILLERATO')->first();
            if ($seccion && $grado->seccion_id != $seccion->id) {
                abort(403, 'No tiene permisos para editar grados de esta sección.');
            }
        }
        
        // Obtener todas las secciones disponibles
        $secciones = \App\Models\Seccion::orderBy('nombre')->get();
        
        return Inertia::render('Grado/Edit', [
            'grado' => $grado->load('seccion'),
            'secciones' => $secciones
        ]);
    }

/**
 * Actualiza los datos de un grado en la base de datos.
 */
public function update(Request $request, Grado $grado): RedirectResponse
{
    Log::info('=== UPDATE REQUEST DEBUG ===');
    Log::info('All request data:', $request->all());
    Log::info('Query string from request:', ['query_string' => $request->getQueryString()]);
    
    try {
        // VALIDACIÓN ACTUALIZADA PARA MAYÚSCULAS
        $validated = $request->validate([
            'grado' => ['required', 'string', Rule::in([
                'PREESCOLAR', 'PRIMERO', 'SEGUNDO', 'TERCERO', 'CUARTO',
                'QUINTO', 'SEXTO', 'SÉPTIMO', 'OCTAVO', 'NOVENO',
                'DÉCIMO', 'ONCE'
            ])],
            'subGrado' => 'nullable|string|max:255',
            'estado' => ['required', 'string', Rule::in(['ACTIVO', 'INACTIVO'])],
            'seccion_id' => 'required|exists:secciones,id',
            'current_filters' => 'nullable|array' // Validar filtros enviados
        ]);

        Log::info('Validated data:', $validated);

        DB::beginTransaction();
        
        // Extraer los filtros antes de actualizar
        $currentFilters = $validated['current_filters'] ?? [];
        Log::info('Current filters extracted:', $currentFilters);
        
        unset($validated['current_filters']); // Remover de los datos a actualizar
        
        $originalData = $grado->toArray();
        $updated = $grado->update($validated);
        $grado->refresh();
        
        $changes = array_diff_assoc($grado->toArray(), $originalData);
        if (!$updated || empty($changes)) {
            Log::warning('No changes detected during update');
        } else {
            Log::info('Grado updated successfully');
        }
        
        DB::commit();

        // Construir la URL de redirección con filtros preservados
        $redirectUrl = route('grados.index');
        
        if (!empty($currentFilters)) {
            // Filtrar solo los parámetros que nos interesan y que no estén vacíos
            $allowedParams = ['search', 'grado_filter', 'estado', 'seccion_filter', 'sort_order', 'page'];
            $filteredParams = [];
            
            foreach ($allowedParams as $param) {
                if (isset($currentFilters[$param]) && $currentFilters[$param] !== '' && $currentFilters[$param] !== null) {
                    $filteredParams[$param] = $currentFilters[$param];
                }
            }
            
            Log::info('Filtered params for redirect:', $filteredParams);
            
            if (!empty($filteredParams)) {
                $redirectUrl .= '?' . http_build_query($filteredParams);
            }
        }
        
        Log::info('Final redirect URL:', ['url' => $redirectUrl]);

        return redirect($redirectUrl)
            ->with('success', 'Grado actualizado correctamente.');
            
    } catch (ValidationException $e) {
        DB::rollBack();
        Log::error('Validation error updating grado: ' . json_encode($e->errors()));
        return redirect()->back()
            ->withErrors($e->errors())
            ->withInput();
    } catch (QueryException $e) {
        DB::rollBack();
        Log::error('Database error updating grado: ' . $e->getMessage());
        $errorMessage = 'Ha ocurrido un error al actualizar el grado.';
        if (str_contains($e->getMessage(), 'Duplicate entry')) {
            $errorMessage = 'El grado ya ha sido registrado anteriormente.';
        }
        return redirect()->back()
            ->withErrors(['error' => $errorMessage])
            ->withInput();
    } catch (\Exception $e) {
        DB::rollBack();
        Log::error('Unexpected error updating grado: ' . $e->getMessage());
        return redirect()->back()
            ->withErrors(['error' => 'Ha ocurrido un error al actualizar el grado: ' . $e->getMessage()])
            ->withInput();
    }
}

    /**
     * Elimina el grado especificado del almacenamiento.
     */
    public function destroy(Grado $grado): RedirectResponse
    {
        try {
            // Validar que el usuario pueda eliminar este grado según su rol
            $user = request()->user();
            if ($user->hasRole('BibliotecarioPrimaria')) {
                $seccion = \App\Models\Seccion::where('nombre', 'PRIMARIA')->first();
                if ($seccion && $grado->seccion_id != $seccion->id) {
                    return redirect()->route('grados.index')
                        ->with('error', 'No tiene permisos para eliminar grados de esta sección.');
                }
            } elseif ($user->hasRole('BibliotecarioBachillerato')) {
                $seccion = \App\Models\Seccion::where('nombre', 'BACHILLERATO')->first();
                if ($seccion && $grado->seccion_id != $seccion->id) {
                    return redirect()->route('grados.index')
                        ->with('error', 'No tiene permisos para eliminar grados de esta sección.');
                }
            }
            
            $grado->delete();
            return redirect()->route('grados.index')
                ->with('success', 'Grado eliminado exitosamente.');
        } catch (\Exception $e) {
            Log::error('Error al eliminar grado: ' . $e->getMessage());
            return redirect()->route('grados.index')
                ->with('error', 'Error al eliminar el grado.');
        }
    }

}