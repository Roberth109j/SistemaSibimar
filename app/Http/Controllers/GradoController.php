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
     * Muestra un listado de todos los grados con paginación.
     */
    public function index(Request $request): Response
    {
        // Validación de parámetros de paginación
        $page = max(1, (int) $request->input('page', 1));
        $perPage = 10; // Valor fijo de 10 elementos por página

        // Query base con orden específico
        $query = Grado::query()
            ->orderBy('id');

        // Aplicar filtros si existen
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('grado', 'LIKE', "%{$search}%")
                  ->orWhere('subGrado', 'LIKE', "%{$search}%");
            });
        }

        if ($request->filled('seccion_id')) {
            $query->where('seccion_id', $request->seccion_id);
        }

        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }

        // Paginación
        $grados = $query->paginate($perPage, ['*'], 'page', $page)->withQueryString();

        // Redirigir si la página solicitada no existe pero hay resultados
        if ($page > $grados->lastPage() && $grados->lastPage() > 0) {
            return redirect()->route('grados.index', 
                array_merge($request->query(), ['page' => $grados->lastPage()])
            );
        }

        return Inertia::render('Grado/Index', [
            'grados' => $grados,
            'filters' => array_filter($request->only(['search', 'seccion_id', 'estado'])),
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
        return Inertia::render('Grado/Create');
    }

    /**
     * Almacena un nuevo grado en la base de datos.
     */
    public function store(Request $request): RedirectResponse
    {
        Log::info('Received store request data:', $request->all());
        try {
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
     * Muestra el formulario para editar un grado existente.
     */
    public function edit(Grado $grado): Response
    {
        return Inertia::render('Grado/Edit', [
            'grado' => $grado->fresh()
        ]);
    }

    /**
     * Actualiza los datos de un grado en la base de datos.
     */
    public function update(Request $request, Grado $grado): RedirectResponse
    {
        Log::info('Received update request data:', $request->all());
        try {
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

            DB::beginTransaction();
            $originalData = $grado->toArray();
            $updated = $grado->update($validated);
            $grado->refresh();
            
            $changes = array_diff_assoc($grado->toArray(), $originalData);
            if (!$updated || empty($changes)) {
                Log::warning('No changes detected during update', [
                    'original' => $originalData,
                    'new' => $validated,
                    'after_update' => $grado->toArray()
                ]);
            } else {
                Log::info('Grado updated successfully, verified data:', [
                    'id' => $grado->id,
                    'changes' => $changes,
                    'after_update' => $grado->toArray()
                ]);
            }
            
            DB::commit();

            return redirect()->route('grados.index')
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
     * Elimina un grado de la base de datos.
     */
    public function destroy(Grado $grado): RedirectResponse
    {
        try {
            DB::beginTransaction();
            $grado->delete();
            DB::commit();
            
            Log::info('Grado eliminado correctamente', ['id' => $grado->id]);
            
            return redirect()->route('grados.index')
                ->with('success', 'Grado eliminado correctamente.');
        } catch (QueryException $e) {
            DB::rollBack();
            Log::error('Database error deleting grado: ' . $e->getMessage());
            $errorMessage = 'Ha ocurrido un error al eliminar el grado.';
            if (str_contains($e->getMessage(), 'foreign key constraint')) {
                $errorMessage = 'No se puede eliminar el grado porque tiene registros asociados.';
            }
            return redirect()->route('grados.index')
                ->with('error', $errorMessage);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Unexpected error deleting grado: ' . $e->getMessage());
            return redirect()->route('grados.index')
                ->with('error', 'Ha ocurrido un error al eliminar el grado: ' . $e->getMessage());
        }
    }
}