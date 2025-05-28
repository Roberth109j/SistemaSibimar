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
     * Muestra un listado de todos los grados.
     */
    public function index(): Response
    {
        $grados = Grado::orderBy('id')->get();
        return Inertia::render('Grado/Index', [
            'grados' => $grados
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
                ->with('success', 'Grado actualizado correctamente.')
                ->with('grados', Grado::orderBy('id')->get());
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