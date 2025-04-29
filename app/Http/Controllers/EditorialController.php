<?php

namespace App\Http\Controllers;

use App\Models\Editorial;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class EditorialController extends Controller
{
    /**
     * Muestra un listado de todas las editoriales.
     */
    public function index(): Response
    {
        // Forzar una consulta fresca a la base de datos sin caché
        $editoriales = Editorial::orderBy('id')->get();
        
        return Inertia::render('editorial', [
            'editoriales' => $editoriales
        ]);
    }

    /**
     * Muestra el formulario para crear una nueva editorial.
     */
    public function create(): Response
    {
        return Inertia::render('editorial');
    }

    /**
     * Almacena una nueva editorial en la base de datos.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255|unique:editoriales,nombre',
            'ciudad' => 'nullable|string|max:255',
            'pais' => 'nullable|string|max:255',
        ]);

        Editorial::create($validated);

        // Forzar un flash de los datos actualizados
        session()->flash('success', 'Editorial creada correctamente.');
        
        return redirect()->route('editoriales.index');
    }

    /**
     * Muestra los datos de una editorial específica.
     */
    public function show(Editorial $editorial): Response
    {
        return Inertia::render('editorial', [
            'editorial' => $editorial->fresh()->load('libros')
        ]);
    }

    /**
     * Muestra el formulario para editar una editorial existente.
     */
    public function edit(Editorial $editorial): Response
    {
        return Inertia::render('editorial', [
            'editorial' => $editorial->fresh()
        ]);
    }

    /**
     * Actualiza los datos de una editorial en la base de datos.
     */
    public function update(Request $request, Editorial $editorial): RedirectResponse
    {
        // Log para depuración
        Log::info('Actualización de editorial - Datos recibidos:', [
            'id' => $editorial->id,
            'nombre_actual' => $editorial->nombre,
            'nombre_nuevo' => $request->nombre,
            'ciudad' => $request->ciudad,
            'pais' => $request->pais
        ]);
        
        // Validación básica
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'ciudad' => 'nullable|string|max:255',
            'pais' => 'nullable|string|max:255',
        ]);
        
        // Verificación manual de unicidad solo si el nombre cambia
        if ($request->nombre !== $editorial->nombre) {
            $exists = DB::table('editoriales')
                ->where('nombre', $request->nombre)
                ->where('id', '!=', $editorial->id)
                ->exists();
            
            if ($exists) {
                return redirect()->back()
                    ->withErrors(['nombre' => 'El nombre ya ha sido registrado.'])
                    ->withInput();
            }
        }
        
        // 1. Actualizar datos directamente usando QueryBuilder para evitar problemas con el ORM
        DB::table('editoriales')
            ->where('id', $editorial->id)
            ->update([
                'nombre' => $validated['nombre'],
                'ciudad' => $validated['ciudad'],
                'pais' => $validated['pais'],
                'updated_at' => now()
            ]);
        
        // 2. Forzar commit (por si hay alguna transacción implícita)
        DB::commit();
            
        // 3. Log post-actualización
        Log::info('Editorial actualizada correctamente', [
            'id' => $editorial->id,
            'timestamp' => now()
        ]);
        
        // 4. Forzar un flash de los datos actualizados
        session()->flash('success', 'Editorial actualizada correctamente.');
        
        // 5. Redirigir con valor 303 para forzar una solicitud GET
        return redirect()->route('editoriales.index', [], 303);
    }
}