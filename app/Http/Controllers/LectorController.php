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
     * Obtiene un listado de lectores con sus grados y secciones
     */
    public function index(): Response
    {
        $lectores = Lector::with(['grado.seccion'])
            ->orderBy('nombre')
            ->paginate(10);

        return Inertia::render('Lector/Index', [
            'lectores' => $lectores,
            'filters' => request()->all('search', 'trashed')
        ]);
    }

    /**
     * Almacena un nuevo lector
     */
    public function create(): Response
    {
        return Inertia::render('Lector/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'codigo' => 'required|string|unique:lectores,codigo',
            'tipo' => 'required|in:ESTUDIANTE,DOCENTE,OTRO',
            'grado_id' => 'required_if:tipo,ESTUDIANTE|exists:grados,id|nullable',
            'estado' => 'required|in:ACTIVO,INACTIVO'
        ]);

        $lector = Lector::create($validated);

        return redirect()->route('lectores.index')
            ->with('success', 'Lector creado exitosamente.');
    }

    /**
     * Muestra un lector específico con su información de grado
     */
    public function show(Lector $lector): Response
    {
        // Cargamos el grado y su sección si es estudiante
        if ($lector->esEstudiante()) {
            $lector->load('grado.seccion');
        }

        return Inertia::render('Lector/Show', [
            'lector' => $lector
        ]);
    }

    /**
     * Actualiza un lector existente
     */
    public function edit(Lector $lector): Response
    {
        return Inertia::render('Lector/Edit', [
            'lector' => $lector
        ]);
    }

    public function update(Request $request, Lector $lector): RedirectResponse
    {
        $validated = $request->validate([
            'nombre' => 'sometimes|required|string|max:255',
            'codigo' => 'sometimes|required|string|unique:lectores,codigo,' . $lector->id,
            'tipo' => 'sometimes|required|in:ESTUDIANTE,DOCENTE,OTRO',
            'grado_id' => 'required_if:tipo,ESTUDIANTE|exists:grados,id|nullable',
            'estado' => 'sometimes|required|in:ACTIVO,INACTIVO'
        ]);

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
}