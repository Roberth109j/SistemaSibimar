<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\Libro;
use App\Models\Ejemplar;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;

class EjemplarController extends Controller
{
    /**
     * Muestra una lista de los ejemplares de un libro.
     *
     * @param  int  $libroId
     * @return \Inertia\Response
     */
    public function index(int $libroId, Request $request)
    {
        // Cargar el libro con la relación del autor
        $libro = Libro::with('autor')->findOrFail($libroId);
        
        // Query base para ejemplares
        $query = Ejemplar::where('libro_id', $libroId);
        
        // Aplicar filtro de búsqueda por número de ejemplar si existe
        if ($request->filled('search')) {
            $searchNumber = $request->search;
            // Validar que sea un número
            if (is_numeric($searchNumber)) {
                $query->where('numEjemplar', $searchNumber);
            }
        }
        
        // Obtener ejemplares ordenados por número
        $ejemplares = $query->orderBy('numEjemplar')->get();
        
        return Inertia::render('Ejemplares/Index', [
            'libro' => $libro,
            'ejemplares' => $ejemplares,
            'search' => $request->search, // Pasar el término de búsqueda al frontend
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
        
        // Obtener el siguiente número de ejemplar disponible
        $ultimoEjemplar = Ejemplar::where('libro_id', $libroId)
            ->orderBy('numEjemplar', 'desc')
            ->first();
        
        $siguienteNumero = $ultimoEjemplar ? $ultimoEjemplar->numEjemplar + 1 : 1;
        
        return Inertia::render('Ejemplares/Create', [
            'libro' => $libro,
            'tiposAdquisicion' => Ejemplar::tiposAdquisicion(),
            'estados' => Ejemplar::estados(),
            'siguienteNumero' => $siguienteNumero,
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
        
        // **NUEVO: Calcular automáticamente el siguiente número de ejemplar**
        $ultimoEjemplar = Ejemplar::where('libro_id', $libroId)
            ->orderBy('numEjemplar', 'desc')
            ->first();
        
        $siguienteNumero = $ultimoEjemplar ? $ultimoEjemplar->numEjemplar + 1 : 1;
        
        // Validación con campo cantidad agregado
        $validatedData = $request->validate([
            'tipo_adquisicion' => [
                'required',
                Rule::in(Ejemplar::tiposAdquisicion()),
            ],
            'estado' => [
                'required',
                Rule::in(Ejemplar::estados()),
            ],
            'observaciones' => 'nullable|string|max:500',
            'cantidad' => 'required|integer|min:1|max:50', // **NUEVO CAMPO**
        ], [
            // Mensajes personalizados de error
            'tipo_adquisicion.required' => 'El tipo de adquisición es obligatorio.',
            'tipo_adquisicion.in' => 'El tipo de adquisición seleccionado no es válido.',
            'estado.required' => 'El estado es obligatorio.',
            'estado.in' => 'El estado seleccionado no es válido.',
            'observaciones.max' => 'Las observaciones no pueden exceder 500 caracteres.',
            'cantidad.required' => 'La cantidad es obligatoria.',
            'cantidad.integer' => 'La cantidad debe ser un número entero.',
            'cantidad.min' => 'Debe crear al menos 1 ejemplar.',
            'cantidad.max' => 'No se pueden crear más de 50 ejemplares a la vez.',
        ]);
        
        try {
            $cantidad = $validatedData['cantidad'];
            $ejemplaresCreados = [];
            
            // **NUEVO: Crear múltiples ejemplares en una transacción**
            DB::beginTransaction();
            
            for ($i = 0; $i < $cantidad; $i++) {
                $ejemplar = Ejemplar::create([
                    'libro_id' => $libroId,
                    'numEjemplar' => $siguienteNumero + $i, // **NÚMEROS CONSECUTIVOS**
                    'tipo_adquisicion' => $validatedData['tipo_adquisicion'],
                    'estado' => $validatedData['estado'],
                    'observaciones' => $validatedData['observaciones'] ?? null,
                ]);
                
                $ejemplaresCreados[] = $ejemplar;
            }
            
            DB::commit();

            Log::info('Ejemplares creados exitosamente en lote:', [
                'cantidad' => $cantidad,
                'libro_id' => $libroId,
                'numeros_creados' => array_map(fn($e) => $e->numEjemplar, $ejemplaresCreados)
            ]);
            
            // Mensaje de éxito personalizado según cantidad
            $mensaje = $cantidad === 1 
                ? "Ejemplar #{$ejemplaresCreados[0]->numEjemplar} registrado correctamente"
                : "Se crearon {$cantidad} ejemplares correctamente (#{$siguienteNumero} al #" . ($siguienteNumero + $cantidad - 1) . ")";
            
            return Redirect::route('ejemplares.index', $libroId)
                ->with('success', $mensaje);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al crear ejemplares:', [
                'error' => $e->getMessage(),
                'libro_id' => $libroId,
                'request_data' => $request->all()
            ]);
            
            return Redirect::back()
                ->withInput()
                ->with('error', 'Error al crear los ejemplares: ' . $e->getMessage());
        }
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
        // Cargar el libro con la relación del autor
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
        
        // Validación simplificada - removemos numEjemplar porque no se puede editar
        $validatedData = $request->validate([
            'tipo_adquisicion' => [
                'required',
                Rule::in(Ejemplar::tiposAdquisicion()),
            ],
            'estado' => [
                'required',
                Rule::in(Ejemplar::estados()),
            ],
            'observaciones' => 'nullable|string|max:500',
        ], [
            // Mensajes personalizados de error
            'tipo_adquisicion.required' => 'El tipo de adquisición es obligatorio.',
            'tipo_adquisicion.in' => 'El tipo de adquisición seleccionado no es válido.',
            'estado.required' => 'El estado es obligatorio.',
            'estado.in' => 'El estado seleccionado no es válido.',
            'observaciones.max' => 'Las observaciones no pueden exceder 500 caracteres.',
        ]);
        
        try {
            // Actualizar el ejemplar sin tocar numEjemplar
            $ejemplar->update([
                'tipo_adquisicion' => $validatedData['tipo_adquisicion'],
                'estado' => $validatedData['estado'],
                'observaciones' => $validatedData['observaciones'] ?? null,
            ]);

            Log::info('Ejemplar actualizado exitosamente:', [
                'ejemplar_id' => $ejemplar->id,
                'libro_id' => $libroId,
                'numEjemplar' => $ejemplar->numEjemplar
            ]);
            
            // ✅ REDIRECCIÓN CORREGIDA - va a la lista en lugar de show
            return Redirect::route('ejemplares.index', $libroId)
                ->with('success', 'Ejemplar #' . $ejemplar->numEjemplar . ' actualizado correctamente');

        } catch (\Exception $e) {
            Log::error('Error al actualizar ejemplar:', [
                'error' => $e->getMessage(),
                'ejemplar_id' => $ejemplarId,
                'libro_id' => $libroId,
                'request_data' => $request->all()
            ]);
            
            return Redirect::back()
                ->withInput()
                ->with('error', 'Error al actualizar el ejemplar: ' . $e->getMessage());
        }
    }
}