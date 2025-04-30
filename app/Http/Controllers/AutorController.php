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
            'autores' => $autores
        ]);
    }

    /**
     * Muestra el formulario para crear un nuevo autor.
     */
    public function create(): Response
    {
        return Inertia::render('Autor/Create');
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

        return redirect()->route('autores.index')
            ->with('success', 'Autor creado correctamente.');
    }

    /**
     * Muestra los datos de un autor específico.
     */
    public function show(Autor $autor): Response
    {
        return Inertia::render('Autor/Show', [
            'autor' => $autor->load('libros')
        ]);
    }

    /**
     * Muestra el formulario para editar un autor existente.
     */
    public function edit(Autor $autor): Response
    {
        return Inertia::render('Autor/Edit', [
            'autor' => $autor
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

        return redirect()->route('autores.index')
            ->with('success', 'Autor actualizado correctamente.');
    }

    /**
     * Elimina un autor de la base de datos.
     */
    public function destroy(Autor $autor): RedirectResponse
    {
        try {
            $autor->delete();
            return redirect()->route('autores.index')
                ->with('success', 'Autor eliminado correctamente.');
        } catch (\Exception $e) {
            return redirect()->route('autores.index')
                ->with('error', 'No se pudo eliminar el autor. Puede que tenga libros asociados.');
        }
    }
}