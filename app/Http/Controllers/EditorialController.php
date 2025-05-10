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
    public function index(): Response
    {
        $editoriales = Editorial::orderBy('id')->get();
        return Inertia::render('Editorial/Index', [
            'editoriales' => $editoriales
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
                'nombre' => 'required|string|max:255|unique:editoriales,nombre',
                'ciudad' => 'nullable|string|max:255',
                'pais' => 'nullable|string|max:255',
            ]);

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

            // Return updated editorial data to refresh frontend props
            return redirect()->route('editoriales.index')
                ->with('success', 'Editorial actualizada correctamente.')
                ->with('editoriales', Editorial::orderBy('id')->get()); // Refresh editoriales list
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
}