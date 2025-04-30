<?php

namespace App\Http\Controllers;

use App\Models\Estanteria;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EstanteriaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $estanterias = Estanteria::all();
        
        return Inertia::render('Estanteria/index', [
            'estanterias' => $estanterias,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
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