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
    public function index(Request $request): Response
    {
        $query = Lector::with(['grado.seccion'])
            ->leftJoin('grados', 'lectores.grado_id', '=', 'grados.id')
            ->orderBy('grados.grado')
            ->orderBy('grados.subGrado')
            ->orderBy('lectores.nombre')
            ->select('lectores.*');

        // Aplicar filtros
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nombre', 'LIKE', "%{$search}%")
                  ->orWhere('codigo', 'LIKE', "%{$search}%");
            });
        }

        if ($request->has('tipo') && $request->tipo) {
            $query->where('tipo', $request->tipo);
        }

        if ($request->has('grado') && $request->grado) {
            $query->where('grado_id', $request->grado);
        }

        if ($request->has('estado') && $request->estado) {
            $query->where('estado', $request->estado);
        }

        $lectores = $query->paginate(10)->withQueryString();
        $grados = Grado::select('id', 'grado')
            ->where('estado', 'ACTIVO')
            ->orderBy('grado')
            ->get();

        return Inertia::render('Lector/Index', [
            'lectores' => $lectores,
            'filters' => $request->only(['search', 'tipo', 'grado', 'estado']),
            'grados' => $grados
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

        return Inertia::render('Lector/Create', [
            'grados' => $grados
        ]);
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
        $grados = Grado::select('id', 'grado', 'subGrado')
            ->where('estado', 'ACTIVO')
            ->orderBy('grado')
            ->orderBy('subGrado')
            ->get();

        return Inertia::render('Lector/Edit', [
            'lector' => $lector,
            'grados' => $grados
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