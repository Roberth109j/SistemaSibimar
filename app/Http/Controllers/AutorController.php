<?php

namespace App\Http\Controllers;

use App\Models\Autor;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class AutorController extends Controller
{
    /**
     * Muestra un listado de todos los autores.
     */
    public function index(): Response
    {
        $autores = Autor::all();
        return Inertia::render('Autor/Index', [
            'autores' => $autores->map(function ($autor) {
                return [
                    'id' => $autor->id,
                    'nombres' => $autor->nombres,
                    'apellidos' => $autor->apellidos,
                    'libros' => $autor->libros ? $autor->libros->map(function ($libro) {
                        return [
                            'id' => $libro->id,
                            'titulo' => $libro->titulo,
                        ];
                    }) : [],
                ];
            }),
            // Flash messages will be handled by the Inertia middleware
        ]);
    }

    /**
     * Almacena un nuevo autor en la base de datos.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'apellidos' => 'required|string|max:255',
            'nombres' => 'required|string|max:255',
        ]);

        Autor::create($validated);

        return redirect()->route('autores.index') // Use route redirect for consistency
            ->with('success', 'Autor creado correctamente.');
    }

    /**
     * Muestra los datos de un autor específico.
     */
    public function show(Autor $autor): Response
    {
        return Inertia::render('Autor/Show', [
            'autor' => [
                'id' => $autor->id,
                'nombres' => $autor->nombres,
                'apellidos' => $autor->apellidos,
                'libros' => $autor->load('libros')->libros->map(function ($libro) {
                    return [
                        'id' => $libro->id,
                        'titulo' => $libro->titulo,
                    ];
                }),
            ],
        ]);
    }

    /**
     * Actualiza los datos de un autor en la base de datos.
     */
    public function update(Request $request, Autor $autor): RedirectResponse
    {
        $validated = $request->validate([
            'apellidos' => 'required|string|max:255',
            'nombres' => 'required|string|max:255',
        ]);

        $autor->update($validated);

        return redirect()->route('autores.index') // Use route redirect for consistency
            ->with('success', 'Autor actualizado correctamente.');
    }

    /**
     * Elimina un autor de la base de datos.
     */
    public function destroy(Autor $autor): RedirectResponse
    {
        try {
            $autor->delete();
            return redirect()->route('autores.index') // Use route redirect for consistency
                ->with('success', 'Autor eliminado correctamente.');
        } catch (\Exception $e) {
            \Log::error('Error al eliminar autor: ' . $e->getMessage());
            return redirect()->route('autores.index')
                ->with('error', 'No se pudo eliminar el autor. Puede que tenga libros asociados.');
        }
    }
}