<?php

namespace App\Http\Controllers;

use App\Models\Estanteria;
use App\Models\Seccion;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class EstanteriaController extends Controller
{
    /**
     * Display a listing of the resource with pagination.
     */
    public function index(Request $request): Response|RedirectResponse
    {
        // Validación de parámetros de paginación
        $page = max(1, (int) $request->input('page', 1));
        $perPage = 20; // Valor fijo de 20 elementos por página

        // Query base con relación de sección
        $query = Estanteria::with('seccion')->orderBy('cod_estante');

        // Filtrar por sección según el rol del usuario
        $user = $request->user();
        $seccionId = null;
        
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
        
        // Obtener todas las secciones para el formulario
        $allSecciones = Seccion::all();

        // Aplicar filtros de búsqueda
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('cod_estante', 'LIKE', "%{$search}%")
                  ->orWhere('descripcion', 'LIKE', "%{$search}%");
            });
        }

        // Paginación
        $estanterias = $query->paginate($perPage, ['*'], 'page', $page)->withQueryString();

        // Redirigir si la página solicitada no existe pero hay resultados
        if ($page > $estanterias->lastPage() && $estanterias->lastPage() > 0) {
            return redirect()->route('estanterias.index', 
                array_merge($request->query(), ['page' => $estanterias->lastPage()])
            );
        }

        // Agregar número de posición a cada elemento
        $estanterias->getCollection()->transform(function ($estanteria, $index) use ($estanterias) {
            $estanteria->position = (($estanterias->currentPage() - 1) * $estanterias->perPage()) + $index + 1;
            return $estanteria;
        });

        return Inertia::render('Estanteria/index', [
            'estanterias' => $estanterias,
            'all_secciones' => $allSecciones,
            'seccionId' => $seccionId,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
            'filters' => array_filter($request->only(['search'])),
            'pagination' => [
                'current_page' => $estanterias->currentPage(),
                'last_page' => $estanterias->lastPage(),
                'per_page' => $estanterias->perPage(),
                'total' => $estanterias->total(),
                'from' => $estanterias->firstItem(),
                'to' => $estanterias->lastItem(),
                'has_pages' => $estanterias->hasPages(),
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        // Obtener la sección del usuario según su rol
        $user = $request->user();
        $seccionId = null;
        
        if ($user->hasRole('BibliotecarioPrimaria')) {
            $seccion = Seccion::where('nombre', 'PRIMARIA')->first();
            $seccionId = $seccion ? $seccion->id : null;
        } elseif ($user->hasRole('BibliotecarioBachillerato')) {
            $seccion = Seccion::where('nombre', 'BACHILLERATO')->first();
            $seccionId = $seccion ? $seccion->id : null;
        }
        
        // Obtener todas las secciones para el formulario
        $allSecciones = Seccion::all();
        
        return Inertia::render('Estanteria/Create', [
            'all_secciones' => $allSecciones,
            'seccionId' => $seccionId,
            'errors' => session('errors') ? session('errors')->getBag('default')->getMessages() : (object) [],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'cod_estante' => 'required|string|max:10|unique:estanterias',
            'descripcion' => 'nullable|string|max:255',
            'seccion_id' => 'required|exists:secciones,id',
        ]);
        
        // Verificar que el usuario tenga permisos para crear en esta sección
        $user = $request->user();
        $seccionNombre = Seccion::find($validated['seccion_id'])->nombre;
        
        if ($user->hasRole('BibliotecarioPrimaria') && $seccionNombre !== 'PRIMARIA') {
            return redirect()->back()
                ->withErrors(['seccion_id' => 'No tienes permisos para crear estanterías en esta sección.'])
                ->withInput();
        }
        
        if ($user->hasRole('BibliotecarioBachillerato') && $seccionNombre !== 'BACHILLERATO') {
            return redirect()->back()
                ->withErrors(['seccion_id' => 'No tienes permisos para crear estanterías en esta sección.'])
                ->withInput();
        }

        // Convertir a mayúsculas antes de guardar
        $validated['cod_estante'] = strtoupper($validated['cod_estante']);
        if (isset($validated['descripcion'])) {
            $validated['descripcion'] = strtoupper($validated['descripcion']);
        }

        Estanteria::create($validated);
        
        return redirect()->route('estanterias.index')
            ->with('success', 'Estantería creada correctamente');
    }

    /**
     * Display the specified resource.
     */
    public function show(Estanteria $estanteria)
    {
        // Cargar la relación con sección
        $estanteria->load('seccion');
        
        return Inertia::render('Estanteria/Show', [
            'estanteria' => $estanteria,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, Estanteria $estanteria)
    {
        // Cargar la relación con sección
        $estanteria->load('seccion');
        
        // Obtener la sección del usuario según su rol
        $user = $request->user();
        $seccionId = null;
        
        if ($user->hasRole('BibliotecarioPrimaria')) {
            $seccion = Seccion::where('nombre', 'PRIMARIA')->first();
            $seccionId = $seccion ? $seccion->id : null;
        } elseif ($user->hasRole('BibliotecarioBachillerato')) {
            $seccion = Seccion::where('nombre', 'BACHILLERATO')->first();
            $seccionId = $seccion ? $seccion->id : null;
        }
        
        // Obtener todas las secciones para el formulario
        $allSecciones = Seccion::all();
        
        return Inertia::render('Estanteria/Edit', [
            'estanteria' => $estanteria,
            'all_secciones' => $allSecciones,
            'seccionId' => $seccionId,
            'errors' => session('errors') ? session('errors')->getBag('default')->getMessages() : (object) [],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Estanteria $estanteria)
    {
        $validated = $request->validate([
            'cod_estante' => 'required|string|max:10|unique:estanterias,cod_estante,'.$estanteria->id,
            'descripcion' => 'nullable|string|max:255',
            'seccion_id' => 'required|exists:secciones,id',
        ]);
        
        // Verificar que el usuario tenga permisos para editar en esta sección
        $user = $request->user();
        $seccionNombre = Seccion::find($validated['seccion_id'])->nombre;
        
        if ($user->hasRole('BibliotecarioPrimaria') && $seccionNombre !== 'PRIMARIA') {
            return redirect()->back()
                ->withErrors(['seccion_id' => 'No tienes permisos para editar estanterías en esta sección.'])
                ->withInput();
        }
        
        if ($user->hasRole('BibliotecarioBachillerato') && $seccionNombre !== 'BACHILLERATO') {
            return redirect()->back()
                ->withErrors(['seccion_id' => 'No tienes permisos para editar estanterías en esta sección.'])
                ->withInput();
        }

        // Convertir a mayúsculas antes de actualizar
        $validated['cod_estante'] = strtoupper($validated['cod_estante']);
        if (isset($validated['descripcion'])) {
            $validated['descripcion'] = strtoupper($validated['descripcion']);
        }

        $estanteria->update($validated);
        
        return redirect()->route('estanterias.index')
            ->with('success', 'Estantería actualizada correctamente');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Estanteria $estanteria)
    {
        try {
            $estanteria->delete();
            return redirect()->route('estanterias.index')
                ->with('success', 'Estantería eliminada correctamente');
        } catch (\Exception $e) {
            return redirect()->route('estanterias.index')
                ->with('error', 'No se puede eliminar la estantería porque tiene registros asociados');
        }
    }
}