<?php

namespace App\Http\Controllers;

use App\Models\Autor;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\QueryException;

class AutorController extends Controller
{
    /**
     * Muestra un listado de todos los autores.
     */
    public function index(): Response
    {
        $autores = Autor::orderBy('id')->get();
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
        Log::info('Received store request data:', $request->all());
        try {
            $validated = $request->validate([
                'apellidos' => 'required|string|max:255',
                'nombres' => 'required|string|max:255',
            ]);

            DB::beginTransaction();
            $autor = Autor::create($validated);
            if (!$autor) {
                throw new \Exception('Failed to create autor in database.');
            }
            DB::commit();

            Log::info('Autor creado correctamente', ['id' => $autor->id, 'data' => $autor->toArray()]);

            return redirect()->route('autores.index')
                ->with('success', 'Autor creado correctamente.');
        } catch (ValidationException $e) {
            DB::rollBack();
            Log::error('Validation error creating autor: ' . json_encode($e->errors()));
            return redirect()->back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (QueryException $e) {
            DB::rollBack();
            Log::error('Database error creating autor: ' . $e->getMessage());
            $errorMessage = 'Ha ocurrido un error al crear el autor.';
            if (str_contains($e->getMessage(), 'Duplicate entry')) {
                $errorMessage = 'El autor ya ha sido registrado.';
            } elseif (str_contains($e->getMessage(), 'Unknown column')) {
                $errorMessage = 'Error de estructura en la base de datos. Verifique las columnas.';
            }
            return redirect()->back()
                ->withErrors(['error' => $errorMessage])
                ->withInput();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Unexpected error creating autor: ' . $e->getMessage());
            return redirect()->back()
                ->withErrors(['error' => 'Ha ocurrido un error al crear el autor: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Muestra los datos de un autor específico.
     */
    public function show(Autor $autor): Response
    {
        return Inertia::render('Autor/Show', [
            'autor' => $autor->fresh()->load('libros')
        ]);
    }

    /**
     * Muestra el formulario para editar un autor existente.
     */
    public function edit(Autor $autor): Response
    {
        return Inertia::render('Autor/Edit', [
            'autor' => $autor->fresh()
        ]);
    }

    /**
     * Actualiza los datos de un autor en la base de datos.
     */
    public function update(Request $request, Autor $autor): RedirectResponse
    {
        Log::info('Received update request data:', $request->all());
        try {
            $validated = $request->validate([
                'apellidos' => 'required|string|max:255',
                'nombres' => 'required|string|max:255',
            ]);

            DB::beginTransaction();
            $originalData = $autor->toArray();
            $updated = $autor->update($validated);
            $autor->refresh();
            
            // Log whether any changes were actually made
            $changes = array_diff_assoc($autor->toArray(), $originalData);
            if (!$updated || empty($changes)) {
                Log::warning('No changes detected during update', [
                    'original' => $originalData,
                    'new' => $validated,
                    'after_update' => $autor->toArray()
                ]);
            } else {
                Log::info('Autor updated successfully, verified data:', [
                    'id' => $autor->id,
                    'changes' => $changes,
                    'after_update' => $autor->toArray()
                ]);
            }
            
            DB::commit();

            // Return updated autor data to refresh frontend props
            return redirect()->route('autores.index')
                ->with('success', 'Autor actualizado correctamente.')
                ->with('autores', Autor::orderBy('id')->get()); // Refresh autores list
        } catch (ValidationException $e) {
            DB::rollBack();
            Log::error('Validation error updating autor: ' . json_encode($e->errors()));
            return redirect()->back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (QueryException $e) {
            DB::rollBack();
            Log::error('Database error updating autor: ' . $e->getMessage());
            $errorMessage = 'Ha ocurrido un error al actualizar el autor.';
            if (str_contains($e->getMessage(), 'Duplicate entry')) {
                $errorMessage = 'El autor ya ha sido registrado anteriormente.';
            }
            return redirect()->back()
                ->withErrors(['error' => $errorMessage])
                ->withInput();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Unexpected error updating autor: ' . $e->getMessage());
            return redirect()->back()
                ->withErrors(['error' => 'Ha ocurrido un error al actualizar el autor: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Elimina un autor de la base de datos.
     */
    public function destroy(Autor $autor): RedirectResponse
    {
        try {
            DB::beginTransaction();
            $autor->delete();
            DB::commit();
            
            Log::info('Autor eliminado correctamente', ['id' => $autor->id]);
            
            return redirect()->route('autores.index')
                ->with('success', 'Autor eliminado correctamente.');
        } catch (QueryException $e) {
            DB::rollBack();
            Log::error('Database error deleting autor: ' . $e->getMessage());
            $errorMessage = 'Ha ocurrido un error al eliminar el autor.';
            if (str_contains($e->getMessage(), 'foreign key constraint')) {
                $errorMessage = 'No se puede eliminar el autor porque tiene libros asociados.';
            }
            return redirect()->route('autores.index')
                ->with('error', $errorMessage);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Unexpected error deleting autor: ' . $e->getMessage());
            return redirect()->route('autores.index')
                ->with('error', 'Ha ocurrido un error al eliminar el autor: ' . $e->getMessage());
        }
    }
}