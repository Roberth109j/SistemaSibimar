<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\Libro;
use App\Models\Ejemplar;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class EjemplarController extends Controller
{
    /**
     * Muestra una lista de los ejemplares de un libro.
     *
     * @param  int  $libroId
     * @return \Inertia\Response
     */
    public function index(int $libroId)
    {
        // Cargar el libro con la relación del autor
        $libro = Libro::with('autor')->findOrFail($libroId);
        $ejemplares = Ejemplar::where('libro_id', $libroId)->get();
        
        return Inertia::render('Ejemplares/Index', [
            'libro' => $libro,
            'ejemplares' => $ejemplares,
        ]);
    }

    /**
     * Muestra el formulario para crear un nuevo ejemplar.
     *
     * @param  int  $libroId
     * @return \Inertia\Response
     */
    public function create(int $libroId)
    {
        // Cargar el libro con la relación del autor
        $libro = Libro::with('autor')->findOrFail($libroId);
        
        return Inertia::render('Ejemplares/Create', [
            'libro' => $libro,
            'tiposAdquisicion' => Ejemplar::tiposAdquisicion(),
            'estados' => Ejemplar::estados(),
        ]);
    }
    
    /**
     * Almacena un nuevo ejemplar en la base de datos.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $libroId
     * @return \Illuminate\Http\RedirectResponse
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request, int $libroId): RedirectResponse
    {
        // Aseguramos que el libro existe
        $libro = Libro::findOrFail($libroId);
        
        // Validación con las reglas actualizadas
        $validatedData = $request->validate([
            'numEjemplar' => 'required|integer|min:1',
            'tipo_adquisicion' => [
                'required',
                Rule::in(Ejemplar::tiposAdquisicion()),
            ],
            'estado' => [
                'required',
                Rule::in(Ejemplar::estados()),
            ],
            'observaciones' => 'nullable|string|max:255',
        ]);
        
        // Crear el ejemplar con los datos validados
        Ejemplar::create([
            'libro_id' => $libroId,
            'numEjemplar' => $validatedData['numEjemplar'],
            'tipo_adquisicion' => $validatedData['tipo_adquisicion'],
            'estado' => $validatedData['estado'],
            'observaciones' => $validatedData['observaciones'] ?? null,
        ]);
        
        // Redireccionar usando Redirect facade para mayor compatibilidad
        return Redirect::route('ejemplares.index', $libroId)
            ->with('success', 'Ejemplar registrado correctamente');
    }
    
    /**
     * Muestra los detalles de un ejemplar específico.
     *
     * @param  int  $libroId
     * @param  int  $ejemplarId
     * @return \Inertia\Response
     */
    public function show(int $libroId, int $ejemplarId)
    {
        // AQUÍ ESTÁ EL CAMBIO PRINCIPAL - Cargar el libro con la relación del autor
        $libro = Libro::with('autor')->findOrFail($libroId);
        $ejemplar = Ejemplar::where('libro_id', $libroId)
            ->where('id', $ejemplarId)
            ->firstOrFail();
        
        return Inertia::render('Ejemplares/Show', [
            'libro' => $libro,
            'ejemplar' => $ejemplar,
        ]);
    }
    
    /**
     * Muestra el formulario para editar un ejemplar específico.
     *
     * @param  int  $libroId
     * @param  int  $ejemplarId
     * @return \Inertia\Response
     */
    public function edit(int $libroId, int $ejemplarId)
    {
        // Cargar el libro con la relación del autor
        $libro = Libro::with('autor')->findOrFail($libroId);
        $ejemplar = Ejemplar::where('libro_id', $libroId)
            ->where('id', $ejemplarId)
            ->firstOrFail();
        
        return Inertia::render('Ejemplares/Edit', [
            'libro' => $libro,
            'ejemplar' => $ejemplar,
            'tiposAdquisicion' => Ejemplar::tiposAdquisicion(),
            'estados' => Ejemplar::estados(),
        ]);
    }
    
    /**
     * Actualiza un ejemplar específico en la base de datos.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $libroId
     * @param  int  $ejemplarId
     * @return \Illuminate\Http\RedirectResponse
     * @throws \Illuminate\Validation\ValidationException
     */
    public function update(Request $request, int $libroId, int $ejemplarId): RedirectResponse
    {
        // Aseguramos que el libro y el ejemplar existen
        $libro = Libro::findOrFail($libroId);
        $ejemplar = Ejemplar::where('libro_id', $libroId)
            ->where('id', $ejemplarId)
            ->firstOrFail();
        
        // Validación con las reglas actualizadas
        $validatedData = $request->validate([
            'numEjemplar' => 'required|integer|min:1',
            'tipo_adquisicion' => [
                'required',
                Rule::in(Ejemplar::tiposAdquisicion()),
            ],
            'estado' => [
                'required',
                Rule::in(Ejemplar::estados()),
            ],
            'observaciones' => 'nullable|string|max:255',
        ]);
        
        // Actualizar el ejemplar con los datos validados
        $ejemplar->update([
            'numEjemplar' => $validatedData['numEjemplar'],
            'tipo_adquisicion' => $validatedData['tipo_adquisicion'],
            'estado' => $validatedData['estado'],
            'observaciones' => $validatedData['observaciones'] ?? null,
        ]);
        
        // Redireccionar
        return Redirect::route('ejemplares.show', [$libroId, $ejemplarId])
            ->with('success', 'Ejemplar actualizado correctamente');
    }
    
    /**
     * Elimina un ejemplar específico de la base de datos.
     *
     * @param  int  $libroId
     * @param  int  $ejemplarId
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(int $libroId, int $ejemplarId): RedirectResponse
    {
        // Aseguramos que el libro y el ejemplar existen
        $libro = Libro::findOrFail($libroId);
        $ejemplar = Ejemplar::where('libro_id', $libroId)
            ->where('id', $ejemplarId)
            ->firstOrFail();
        
        // Eliminar el ejemplar
        $ejemplar->delete();
        
        // Redireccionar
        return Redirect::route('ejemplares.index', $libroId)
            ->with('success', 'Ejemplar eliminado correctamente');
    }
}