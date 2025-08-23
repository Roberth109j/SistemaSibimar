<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\Libro;
use App\Models\Ejemplar;
use App\Models\Prestamo; // **AGREGADO para manejar préstamos**
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
        
        // **SOLO DISPONIBLE para creación**
        $estadosCreacion = ['DISPONIBLE'];
        
        return Inertia::render('Ejemplares/Create', [
            'libro' => $libro,
            'tiposAdquisicion' => Ejemplar::tiposAdquisicion(),
            'estados' => $estadosCreacion, // **Solo DISPONIBLE**
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
        
        // Calcular automáticamente el siguiente número de ejemplar
        $ultimoEjemplar = Ejemplar::where('libro_id', $libroId)
            ->orderBy('numEjemplar', 'desc')
            ->first();
        
        $siguienteNumero = $ultimoEjemplar ? $ultimoEjemplar->numEjemplar + 1 : 1;
        
        // **Estados permitidos solo para creación**
        $estadosCreacion = ['DISPONIBLE'];
        
        // Validación con campo cantidad agregado
        $validatedData = $request->validate([
            'tipo_adquisicion' => [
                'required',
                Rule::in(Ejemplar::tiposAdquisicion()),
            ],
            'estado' => [
                'required',
                Rule::in($estadosCreacion), // **Solo acepta DISPONIBLE**
            ],
            'observaciones' => 'nullable|string|max:500',
            'cantidad' => 'required|integer|min:1|max:50',
        ], [
            // Mensajes personalizados de error
            'tipo_adquisicion.required' => 'El tipo de adquisición es obligatorio.',
            'tipo_adquisicion.in' => 'El tipo de adquisición seleccionado no es válido.',
            'estado.required' => 'El estado es obligatorio.',
            'estado.in' => 'Al crear un ejemplar, el estado debe ser DISPONIBLE.',
            'observaciones.max' => 'Las observaciones no pueden exceder 500 caracteres.',
            'cantidad.required' => 'La cantidad es obligatoria.',
            'cantidad.integer' => 'La cantidad debe ser un número entero.',
            'cantidad.min' => 'Debe crear al menos 1 ejemplar.',
            'cantidad.max' => 'No se pueden crear más de 50 ejemplares a la vez.',
        ]);
        
        try {
            $cantidad = $validatedData['cantidad'];
            $ejemplaresCreados = [];
            
            DB::beginTransaction();
            
            for ($i = 0; $i < $cantidad; $i++) {
                $ejemplar = Ejemplar::create([
                    'libro_id' => $libroId,
                    'numEjemplar' => $siguienteNumero + $i,
                    'tipo_adquisicion' => $validatedData['tipo_adquisicion'],
                    'estado' => 'DISPONIBLE', // **FORZAR SIEMPRE DISPONIBLE**
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
        
        // **SOLO estados permitidos en edición: DADO DE BAJA y PERDIDO**
        $estadosEdicion = ['DADO DE BAJA', 'PERDIDO'];
        
        return Inertia::render('Ejemplares/Edit', [
            'libro' => $libro,
            'ejemplar' => $ejemplar,
            'tiposAdquisicion' => Ejemplar::tiposAdquisicion(),
            'estados' => $estadosEdicion, // **Solo DADO DE BAJA y PERDIDO**
        ]);
    }
    
    /**
     * **MÉTODO PRIVADO: Manejar ejemplar marcado como PERDIDO**
     * Marca préstamos activos como vencidos y libera al lector
     */
    private function manejarEjemplarPerdido(Ejemplar $ejemplar): void
    {
        try {
            // Buscar préstamos activos del ejemplar
            $prestamosActivos = Prestamo::where('ejemplar_id', $ejemplar->id)
                ->where('estado', 'ACTIVO')
                ->get();

            Log::info('🔍 Buscando préstamos activos para ejemplar perdido:', [
                'ejemplar_id' => $ejemplar->id,
                'ejemplar_numero' => $ejemplar->numEjemplar,
                'prestamos_encontrados' => $prestamosActivos->count()
            ]);

            foreach ($prestamosActivos as $prestamo) {
                Log::info('📋 Procesando préstamo activo:', [
                    'prestamo_id' => $prestamo->id,
                    'lector_id' => $prestamo->lector_id,
                    'fecha_prestamo' => $prestamo->fecha_prestamo,
                    'fecha_devolucion' => $prestamo->fecha_devolucion
                ]);

                // Marcar préstamo como vencido por pérdida del ejemplar
                $prestamo->update([
                    'estado' => 'VENCIDO',
                    'observaciones_devolucion' => 'Préstamo marcado como vencido debido a pérdida del ejemplar #' . $ejemplar->numEjemplar
                ]);

                Log::info('✅ Préstamo marcado como vencido por pérdida:', [
                    'prestamo_id' => $prestamo->id,
                    'nuevo_estado' => 'VENCIDO'
                ]);
            }

            // Log del resultado
            if ($prestamosActivos->count() > 0) {
                Log::info('🎯 Préstamos procesados por pérdida de ejemplar:', [
                    'ejemplar_id' => $ejemplar->id,
                    'ejemplar_numero' => $ejemplar->numEjemplar,
                    'prestamos_marcados_vencidos' => $prestamosActivos->count()
                ]);
            } else {
                Log::info('ℹ️ No se encontraron préstamos activos para el ejemplar perdido:', [
                    'ejemplar_id' => $ejemplar->id,
                    'ejemplar_numero' => $ejemplar->numEjemplar
                ]);
            }

        } catch (\Exception $e) {
            Log::error('❌ Error al manejar ejemplar perdido:', [
                'ejemplar_id' => $ejemplar->id,
                'error_message' => $e->getMessage(),
                'error_file' => $e->getFile(),
                'error_line' => $e->getLine()
            ]);
            
            // Re-lanzar la excepción para que sea manejada por el método que llama
            throw $e;
        }
    }
    
    /**
     * Actualiza un ejemplar específico en la base de datos.
     * **MODIFICADO: Incluye lógica para manejar estado PERDIDO**
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
        
        // **Estados permitidos solo para edición: DADO DE BAJA y PERDIDO**
        $estadosEdicion = ['DADO DE BAJA', 'PERDIDO'];
        
        // Validación
        $validatedData = $request->validate([
            'tipo_adquisicion' => [
                'required',
                Rule::in(Ejemplar::tiposAdquisicion()),
            ],
            'estado' => [
                'required',
                Rule::in($estadosEdicion), // **Solo acepta DADO DE BAJA y PERDIDO**
            ],
            'observaciones' => 'nullable|string|max:500',
        ], [
            // Mensajes personalizados de error
            'tipo_adquisicion.required' => 'El tipo de adquisición es obligatorio.',
            'tipo_adquisicion.in' => 'El tipo de adquisición seleccionado no es válido.',
            'estado.required' => 'El estado es obligatorio.',
            'estado.in' => 'Solo se puede cambiar el estado a "Dado de Baja" o "Perdido".',
            'observaciones.max' => 'Las observaciones no pueden exceder 500 caracteres.',
        ]);
        
        try {
            DB::beginTransaction();

            // **NUEVA LÓGICA: Verificar si se está marcando como PERDIDO**
            $estadoAnterior = $ejemplar->estado;
            $estadoNuevo = $validatedData['estado'];

            Log::info('🔄 Iniciando actualización de ejemplar:', [
                'ejemplar_id' => $ejemplar->id,
                'ejemplar_numero' => $ejemplar->numEjemplar,
                'estado_anterior' => $estadoAnterior,
                'estado_nuevo' => $estadoNuevo
            ]);

            // Si se está marcando como PERDIDO, manejar préstamos activos
            if ($estadoNuevo === 'PERDIDO' && $estadoAnterior !== 'PERDIDO') {
                Log::info('⚠️ Ejemplar siendo marcado como PERDIDO - Procesando préstamos activos');
                $this->manejarEjemplarPerdido($ejemplar);
            }

            // Actualizar el ejemplar
            $ejemplar->update([
                'tipo_adquisicion' => $validatedData['tipo_adquisicion'],
                'estado' => $validatedData['estado'],
                'observaciones' => $validatedData['observaciones'] ?? null,
            ]);

            DB::commit();

            Log::info('✅ Ejemplar actualizado exitosamente:', [
                'ejemplar_id' => $ejemplar->id,
                'libro_id' => $libroId,
                'numEjemplar' => $ejemplar->numEjemplar,
                'estado_final' => $ejemplar->estado
            ]);

            // Mensaje personalizado según el estado
            $mensaje = $estadoNuevo === 'PERDIDO' 
                ? 'Ejemplar #' . $ejemplar->numEjemplar . ' marcado como perdido. Los préstamos activos han sido actualizados.'
                : 'Ejemplar #' . $ejemplar->numEjemplar . ' actualizado correctamente';

            return Redirect::route('ejemplares.index', $libroId)
                ->with('success', $mensaje);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('❌ Error al actualizar ejemplar:', [
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