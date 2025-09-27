<?php

namespace App\Http\Controllers;

use App\Models\Prestamo;
use App\Models\Ejemplar;
use App\Models\Lector;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PrestamoMasivoController extends Controller
{
    /**
     * Crear múltiples préstamos de forma masiva
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ejemplar_ids' => 'required|array|min:1',
            'ejemplar_ids.*' => 'required|exists:ejemplares,id',
            'codigo_lector' => 'required|exists:lectores,codigo',
            'fecha_prestamo' => 'required|date',
            'fecha_devolucion' => 'required|date|after:fecha_prestamo'
        ], [
            'ejemplar_ids.required' => 'Debe seleccionar al menos un ejemplar.',
            'ejemplar_ids.array' => 'Los ejemplares deben ser un arreglo válido.',
            'ejemplar_ids.min' => 'Debe seleccionar al menos un ejemplar.',
            'ejemplar_ids.*.exists' => 'Uno o más ejemplares seleccionados no existen.',
            'codigo_lector.required' => 'El código de lector es obligatorio.',
            'codigo_lector.exists' => 'El lector no existe.',
            'fecha_prestamo.required' => 'La fecha de préstamo es obligatoria.',
            'fecha_prestamo.date' => 'La fecha de préstamo debe ser una fecha válida.',
            'fecha_devolucion.required' => 'La fecha de devolución es obligatoria.',
            'fecha_devolucion.date' => 'La fecha de devolución debe ser una fecha válida.',
            'fecha_devolucion.after' => 'La fecha de devolución debe ser posterior a la fecha de préstamo.'
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator->errors());
        }

        // Obtener el lector por código
        $lector = Lector::where('codigo', $request->input('codigo_lector'))
            ->where('estado', 'ACTIVO')
            ->with('grado')
            ->first();

        if (!$lector) {
            Log::warning('Lector no encontrado o inactivo para préstamo masivo:', [
                'codigo_lector' => $request->input('codigo_lector')
            ]);
            
            return back()->with('error', 'El lector no existe o está inactivo.');
        }

        // Verificar que todos los ejemplares estén disponibles
        $ejemplarIds = $request->input('ejemplar_ids');
        $ejemplares = Ejemplar::whereIn('id', $ejemplarIds)->get();
        
        $ejemplaresNoDisponibles = $ejemplares->filter(function ($ejemplar) {
            return $ejemplar->estado !== 'DISPONIBLE';
        });

        if ($ejemplaresNoDisponibles->count() > 0) {
            $numerosEjemplares = $ejemplaresNoDisponibles->pluck('numEjemplar')->toArray();
            Log::warning('Intento de préstamo masivo con ejemplares no disponibles:', [
                'ejemplares_no_disponibles' => $numerosEjemplares
            ]);
            
            return back()->with('error', 
                'Los siguientes ejemplares no están disponibles: #' . implode(', #', $numerosEjemplares)
            );
        }

        try {
            DB::beginTransaction();

            $prestamosCreados = [];
            $ejemplaresPrestados = [];

            // Crear un préstamo por cada ejemplar
            foreach ($ejemplares as $ejemplar) {
                $prestamo = Prestamo::create([
                    'ejemplar_id' => $ejemplar->id,
                    'lector_id' => $lector->id,
                    'fecha_prestamo' => $request->input('fecha_prestamo'),
                    'fecha_devolucion' => $request->input('fecha_devolucion'),
                    'fecha_devuelto' => null,
                    'estado' => 'ACTIVO'
                ]);

                // Actualizar estado del ejemplar a PRESTADO
                $ejemplar->update([
                    'estado' => 'PRESTADO'
                ]);

                $prestamosCreados[] = $prestamo->id;
                $ejemplaresPrestados[] = $ejemplar->numEjemplar;

                Log::info('Préstamo individual creado en lote masivo:', [
                    'prestamo_id' => $prestamo->id,
                    'ejemplar_id' => $ejemplar->id,
                    'ejemplar_numero' => $ejemplar->numEjemplar,
                    'lector_id' => $lector->id
                ]);
            }

            DB::commit();

            $totalPrestamos = count($prestamosCreados);
            $mensaje = "Préstamos masivos registrados exitosamente. " . 
                      "{$totalPrestamos} ejemplares prestados a {$lector->nombre}: #" . 
                      implode(', #', $ejemplaresPrestados);

            Log::info('Préstamo masivo completado exitosamente:', [
                'total_prestamos' => $totalPrestamos,
                'prestamos_ids' => $prestamosCreados,
                'ejemplares_numeros' => $ejemplaresPrestados,
                'lector_id' => $lector->id,
                'lector_nombre' => $lector->nombre,
                'fecha_prestamo' => $request->input('fecha_prestamo'),
                'fecha_devolucion' => $request->input('fecha_devolucion')
            ]);

            return redirect()->route('prestamos.index')->with('success', $mensaje);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Error al crear préstamos masivos:', [
                'error_message' => $e->getMessage(),
                'ejemplar_ids' => $ejemplarIds,
                'lector_codigo' => $request->input('codigo_lector'),
                'request_data' => $request->all()
            ]);
            
            return back()->with('error', 'Error al procesar los préstamos masivos: ' . $e->getMessage());
        }
    }
}