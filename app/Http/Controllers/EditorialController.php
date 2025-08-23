<?php

namespace App\Http\Controllers;

use App\Models\Editorial;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\QueryException;

class EditorialController extends Controller
{
    /**
     * Obtiene un listado de editoriales con paginación, ordenamiento y búsqueda
     */
    public function index(Request $request): Response|RedirectResponse
    {
        // Validación de parámetros de paginación
        $page = max(1, (int) $request->input('page', 1));
        $perPage = 20; // Valor fijo de 20 elementos por página

        // Parámetros de ordenamiento - SOLO NOMBRE
        $sortOrder = $request->get('sort_order', 'asc'); // Orden por defecto: ascendente (A-Z)
        
        // Solo permitir ordenamiento ascendente o descendente
        $allowedSortOrders = ['asc', 'desc'];
        if (!in_array($sortOrder, $allowedSortOrders)) {
            $sortOrder = 'asc';
        }

        // Parámetro de búsqueda
        $search = $request->get('search', '');

        // Query base con ordenamiento por nombre
        $query = Editorial::query();

        // Aplicar filtro de búsqueda si existe
        if (!empty($search)) {
            $searchTerm = trim($search);
            $query->where(function($q) use ($searchTerm) {
                $q->where('nombre', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('ciudad', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('pais', 'LIKE', "%{$searchTerm}%");
            });
        }

        // Aplicar filtros adicionales
        if ($request->filled('ciudad')) {
            $query->where('ciudad', $request->input('ciudad'));
        }

        if ($request->filled('pais')) {
            $query->where('pais', $request->input('pais'));
        }

        // Aplicar ordenamiento por nombre
        $query->orderBy('nombre', $sortOrder);

        // Paginación
        $editoriales = $query->paginate($perPage, ['*'], 'page', $page)->withQueryString();

        // Redirigir si la página solicitada no existe pero hay resultados
        if ($page > $editoriales->lastPage() && $editoriales->lastPage() > 0) {
            return redirect()->route('editoriales.index', 
                array_merge($request->query(), ['page' => $editoriales->lastPage()])
            );
        }

        // Calcular el número inicial para la numeración secuencial
        $startNumber = ($editoriales->currentPage() - 1) * $editoriales->perPage();

        // Obtener todas las ciudades y países únicos para los filtros (sin aplicar filtros)
        $allCiudades = Editorial::whereNotNull('ciudad')
                               ->where('ciudad', '!=', '')
                               ->distinct()
                               ->pluck('ciudad')
                               ->sort()
                               ->values();

        $allPaises = Editorial::whereNotNull('pais')
                             ->where('pais', '!=', '')
                             ->distinct()
                             ->pluck('pais')
                             ->sort()
                             ->values();

        return Inertia::render('Editorial/Index', [
            'editoriales' => $editoriales,
            'sort_order' => $sortOrder,
            'search' => $search,
            'start_number' => $startNumber,
            'filters' => array_filter($request->only(['ciudad', 'pais'])),
            'all_ciudades' => $allCiudades,
            'all_paises' => $allPaises,
            'pagination' => [
                'current_page' => $editoriales->currentPage(),
                'last_page' => $editoriales->lastPage(),
                'per_page' => $editoriales->perPage(),
                'total' => $editoriales->total(),
                'from' => $editoriales->firstItem(),
                'to' => $editoriales->lastItem(),
                'has_pages' => $editoriales->hasPages(),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Editorial/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        Log::info('Received store request data:', $request->all());
        try {
            $validated = $request->validate([
                'nombre' => 'required|string|max:255',
                'ciudad' => 'nullable|string|max:255',
                'pais' => 'nullable|string|max:255',
            ]);

            // Verificar si ya existe una editorial con el mismo nombre
            $existingEditorial = Editorial::where('nombre', $validated['nombre'])->first();

            if ($existingEditorial) {
                Log::warning('Attempted to create duplicate editorial', [
                    'nombre' => $validated['nombre'],
                    'existing_id' => $existingEditorial->id
                ]);
                
                return redirect()->back()
                    ->withErrors(['duplicate' => 'Esta editorial ya existe en el sistema'])
                    ->withInput();
            }

            DB::beginTransaction();
            $editorial = Editorial::create($validated);
            if (!$editorial) {
                throw new \Exception('Failed to create editorial in database.');
            }
            DB::commit();

            Log::info('Editorial creada correctamente', ['id' => $editorial->id, 'data' => $editorial->toArray()]);

            return redirect()->route('editoriales.index')
                ->with('success', 'Editorial creada correctamente.');
        } catch (ValidationException $e) {
            DB::rollBack();
            Log::error('Validation error creating editorial: ' . json_encode($e->errors()));
            return redirect()->back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (QueryException $e) {
            DB::rollBack();
            Log::error('Database error creating editorial: ' . $e->getMessage());
            $errorMessage = 'Ha ocurrido un error al crear la editorial.';
            if (str_contains($e->getMessage(), 'Duplicate entry')) {
                $errorMessage = 'El nombre ya ha sido registrado.';
            } elseif (str_contains($e->getMessage(), 'Unknown column')) {
                $errorMessage = 'Error de estructura en la base de datos. Verifique las columnas.';
            }
            return redirect()->back()
                ->withErrors(['error' => $errorMessage])
                ->withInput();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Unexpected error creating editorial: ' . $e->getMessage());
            return redirect()->back()
                ->withErrors(['error' => 'Ha ocurrido un error al crear la editorial: ' . $e->getMessage()])
                ->withInput();
        }
    }

    public function show(Editorial $editorial): Response
    {
        return Inertia::render('Editorial/Show', [
            'editorial' => $editorial->fresh()->load('libros')
        ]);
    }

    public function edit(Editorial $editorial): Response
    {
        return Inertia::render('Editorial/Edit', [
            'editorial' => $editorial->fresh()
        ]);
    }

    public function update(Request $request, Editorial $editorial): RedirectResponse
    {
        Log::info('Received update request data:', $request->all());
        try {
            $validated = $request->validate([
                'nombre' => 'required|string|max:255|unique:editoriales,nombre,' . $editorial->id,
                'ciudad' => 'nullable|string|max:255',
                'pais' => 'nullable|string|max:255',
            ]);

            DB::beginTransaction();
            $originalData = $editorial->toArray();
            $updated = $editorial->update($validated);
            $editorial->refresh();
            
            // Log whether any changes were actually made
            $changes = array_diff_assoc($editorial->toArray(), $originalData);
            if (!$updated || empty($changes)) {
                Log::warning('No changes detected during update', [
                    'original' => $originalData,
                    'new' => $validated,
                    'after_update' => $editorial->toArray()
                ]);
            } else {
                Log::info('Editorial updated successfully, verified data:', [
                    'id' => $editorial->id,
                    'changes' => $changes,
                    'after_update' => $editorial->toArray()
                ]);
            }
            
            DB::commit();

            // Return to index with success message and preserve filters
            return redirect()->route('editoriales.index', $request->query())
                ->with('success', 'Editorial actualizada correctamente.');
        } catch (ValidationException $e) {
            DB::rollBack();
            Log::error('Validation error updating editorial: ' . json_encode($e->errors()));
            return redirect()->back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (QueryException $e) {
            DB::rollBack();
            Log::error('Database error updating editorial: ' . $e->getMessage());
            $errorMessage = 'Ha ocurrido un error al actualizar la editorial.';
            if (str_contains($e->getMessage(), 'Duplicate entry')) {
                $errorMessage = 'El nombre ya ha sido registrado por otra editorial.';
            }
            return redirect()->back()
                ->withErrors(['error' => $errorMessage])
                ->withInput();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Unexpected error updating editorial: ' . $e->getMessage());
            return redirect()->back()
                ->withErrors(['error' => 'Ha ocurrido un error al actualizar la editorial: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Elimina una editorial
     */
    public function destroy(Editorial $editorial): RedirectResponse
    {
        try {
            // Verificar si tiene libros asociados antes de eliminar
            if ($editorial->libros()->exists()) {
                return back()->with('error', 'No se puede eliminar la editorial porque tiene libros asociados');
            }

            DB::beginTransaction();
            $editorial->delete();
            DB::commit();

            Log::info('Editorial eliminada correctamente', ['id' => $editorial->id]);

            return redirect()->route('editoriales.index')
                ->with('success', 'Editorial eliminada correctamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error deleting editorial: ' . $e->getMessage());
            return back()->with('error', 'Ha ocurrido un error al eliminar la editorial');
        }
    }

    /**
     * Obtiene editoriales para autocompletado/búsqueda
     */
    public function search(Request $request)
    {
        $search = $request->input('search', '');
        
        $editoriales = Editorial::where('nombre', 'LIKE', "%{$search}%")
            ->orderBy('nombre')
            ->limit(10)
            ->get(['id', 'nombre', 'ciudad', 'pais']);

        return response()->json($editoriales);
    }
}