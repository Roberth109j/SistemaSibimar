<?php

namespace App\Http\Controllers;

use App\Models\Estanteria;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EstanteriaController extends Controller
{
    /**
     * Display a listing of the resource with pagination.
     */
    public function index(Request $request): Response
    {
        // Validación de parámetros de paginación
        $page = max(1, (int) $request->input('page', 1));
        $perPage = 10; // Valor fijo de 10 elementos por página

        // Query base
        $query = Estanteria::query()->orderBy('cod_estante');

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

        return Inertia::render('Estanteria/index', [
            'estanterias' => $estanterias,
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
    public function create()
    {
        return Inertia::render('Estanteria/Create', [
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
        ]);
        
        Estanteria::create($validated);
        
        return redirect()->route('estanterias.index')
            ->with('success', 'Estantería creada correctamente');
    }

    /**
     * Display the specified resource.
     */
    public function show(Estanteria $estanteria)
    {
        return Inertia::render('Estanteria/Show', [
            'estanteria' => $estanteria,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Estanteria $estanteria)
    {
        return Inertia::render('Estanteria/Edit', [
            'estanteria' => $estanteria,
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
        ]);
        
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