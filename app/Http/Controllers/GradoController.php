<?php

namespace App\Http\Controllers;

use App\Models\Grado;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class GradoController extends Controller
{
    // Listar todos los grados
    public function index(): Response
    {
        $grados = Grado::with('seccion')->paginate(10);
        return Inertia::render('Grado/Index', [
            'grados' => $grados,
            'filters' => request()->all('search', 'trashed')
        ]);    
    }

    // Crear un nuevo grado
    public function create(): Response
    {
        return Inertia::render('Grado/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'grado' => ['required', 'string', Rule::in([
                'Prescolar', 'Primero', 'Segundo', 'Tercero', 'Cuarto',
                'Quinto', 'Sexto', 'Séptimo', 'Octavo', 'Noveno',
                'Décimo', 'Once'
            ])],
            'subGrado' => 'nullable|string|max:255',
            'estado' => ['required', 'string', Rule::in(['ACTIVO', 'INACTIVO'])],
            'seccion_id' => 'required|exists:secciones,id'
        ]);

        Grado::create($validated);

        return redirect()->route('grados.index')
            ->with('success', 'Grado creado exitosamente.');
    }

    // Mostrar un grado específico
    public function show(Grado $grado): Response
    {
        return Inertia::render('Grado/Show', [
            'grado' => $grado
        ]);
    }

    // Editar un grado
    public function edit(Grado $grado): Response
    {
        return Inertia::render('Grado/Edit', [
            'grado' => $grado
        ]);
    }

    // Actualizar un grado
    public function update(Request $request, Grado $grado): RedirectResponse
    {
        $validated = $request->validate([
            'grado' => ['required', 'string', Rule::in([
                'Prescolar', 'Primero', 'Segundo', 'Tercero', 'Cuarto',
                'Quinto', 'Sexto', 'Séptimo', 'Octavo', 'Noveno',
                'Décimo', 'Once'
            ])],
            'subGrado' => 'nullable|string|max:255',
            'estado' => ['required', 'string', Rule::in(['ACTIVO', 'INACTIVO'])],
            'seccion_id' => 'required|exists:secciones,id'
        ]);

        $grado->update($validated);

        return redirect()->route('grados.index')
            ->with('success', 'Grado actualizado exitosamente.');
    }

    // Eliminar un grado
    public function destroy(Grado $grado): RedirectResponse
    {
        $grado->delete();

        return redirect()->route('grados.index')
            ->with('success', 'Grado eliminado exitosamente');
    }
}
