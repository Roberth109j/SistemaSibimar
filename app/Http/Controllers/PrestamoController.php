<?php

namespace App\Http\Controllers;

use App\Models\Prestamo;
use App\Models\Ejemplar;
use App\Models\Lector;
use App\Models\Libro;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class PrestamoController extends Controller
{
    /**
     * Mostrar la vista de gestión de préstamos
     */
    private function actualizarPrestamosVencidos()
    {
        $fechaActual = Carbon::now();
        
        // Buscar préstamos activos que han pasado su fecha de devolución
        $prestamosVencidos = Prestamo::where('estado', Prestamo::ESTADO_ACTIVO)
            ->where('fecha_devolucion', '<', $fechaActual)
            ->get();
            
        foreach ($prestamosVencidos as $prestamo) {
            $prestamo->marcarComoVencido();
        }
    }

    public function index()
    {
        // Actualizar estado de préstamos vencidos
        $this->actualizarPrestamosVencidos();
        
        // Solo renderizamos la vista inicial, los libros se buscarán por AJAX
        return Inertia::render('Prestamos/Index');
    }

    /**
     * Buscar lector por código para el préstamo
     */
    public function buscarLector(Request $request)
    {
        $codigo = $request->input('codigo');
        
        $lector = Lector::where('codigo', $codigo)
            ->where('estado', 'ACTIVO')
            ->first();
            
        if (!$lector) {
            return response()->json([
                'success' => false,
                'message' => 'Lector no encontrado o inactivo'
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'lector' => $lector
        ]);
    }

    /**
     * Crear un nuevo préstamo
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ejemplar_id' => 'required|exists:ejemplares,id',
            'codigo_lector' => 'required|exists:lectores,codigo',
            'fecha_prestamo' => 'required|date',
            'fecha_devolucion' => 'required|date|after:fecha_prestamo',
            'observaciones' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator->errors());
        }

        // Verificar si el ejemplar está disponible
        $ejemplar = Ejemplar::findOrFail($request->ejemplar_id);
        if ($ejemplar->estado !== Ejemplar::ESTADO_DISPONIBLE) {
            return back()->with('error', 'El ejemplar no está disponible para préstamo.');
        }

        // Obtener el lector por código
        $lector = Lector::where('codigo', $request->codigo_lector)
                        ->where('estado', 'ACTIVO')
                        ->first();
        
        if (!$lector) {
            return back()->with('error', 'El lector no existe o está inactivo.');
        }

        // Validar si el lector ya tiene demasiados préstamos activos
        $prestamosActivos = Prestamo::where('lector_id', $lector->id)
                                    ->where('estado', 'ACTIVO')
                                    ->count();
                                    
        $maxPrestamos = $lector->tipo === 'ESTUDIANTE' ? 2 : 3;
        
        if ($prestamosActivos >= $maxPrestamos) {
            return back()->with('error', "El lector ya tiene $prestamosActivos préstamos activos (máximo $maxPrestamos).");
        }

        try {
            // Crear el préstamo con estado ACTIVO
            $prestamo = Prestamo::create([
                'ejemplar_id' => $ejemplar->id,
                'lector_id' => $lector->id,
                'fecha_prestamo' => $request->fecha_prestamo,
                'fecha_devolucion' => $request->fecha_devolucion,
                'fecha_devuelto' => null,
                'estado' => 'ACTIVO',
                'observaciones' => $request->observaciones ?? 'Préstamo generado desde el sistema'
            ]);

            // Actualizar estado del ejemplar
            $ejemplar->update(['estado' => Ejemplar::ESTADO_PRESTADO]);

            return redirect()->route('prestamos.index')->with('success', 'Préstamo registrado exitosamente');

        } catch (\Exception $e) {
            return back()->with('error', 'Error al procesar el préstamo: ' . $e->getMessage());
        }
    }

    /**
     * Mostrar detalles de un préstamo
     */
    public function show(Prestamo $prestamo)
    {
        $prestamo->load(['ejemplar.libro', 'lector']);
        
        return Inertia::render('Prestamos/Show', [
            'prestamo' => $prestamo
        ]);
    }

    /**
     * Marcar un préstamo como devuelto
     */
    public function devolver(Prestamo $prestamo)
    {
        if ($prestamo->estado === 'DEVUELTO') {
            return back()->with('error', 'Este préstamo ya ha sido devuelto.');
        }

        try {
            $prestamo->update([
                'estado' => 'DEVUELTO',
                'fecha_devuelto' => Carbon::now()
            ]);

            // Actualizar estado del ejemplar
            $prestamo->ejemplar->update(['estado' => Ejemplar::ESTADO_DISPONIBLE]);

            return redirect()->route('prestamos.index')
                ->with('success', 'Préstamo marcado como devuelto exitosamente.');
        } catch (\Exception $e) {
            return back()->with('error', 'Error al procesar la devolución: ' . $e->getMessage());
        }
    }

    /**
     * Lista de préstamos activos
     */
    public function listado(Request $request)
    {
        try {
            // Actualizar estado de préstamos vencidos
            $this->actualizarPrestamosVencidos();
            
            $query = Prestamo::with(['ejemplar.libro', 'lector'])
                            ->where('estado', 'ACTIVO')
                            ->orderBy('fecha_prestamo', 'desc');

            if ($request->has('codigo_lector')) {
                $query->whereHas('lector', function($q) use ($request) {
                    $q->where('codigo', $request->codigo_lector);
                });
            }

            $prestamos = $query->paginate(10);
                            
            return Inertia::render('Prestamos/Listado', [
                'prestamos' => $prestamos
            ]);
        } catch (\Exception $e) {
            return back()->with('error', 'Error al cargar la lista de préstamos: ' . $e->getMessage());
        }
    }

    /**
     * Lista de préstamos vencidos
     */
    public function vencidos(Request $request)
    {
        try {
            // Actualizar estado de préstamos vencidos
            $this->actualizarPrestamosVencidos();
            
            $prestamos = Prestamo::with(['ejemplar.libro', 'lector'])
                            ->where('estado', Prestamo::ESTADO_VENCIDO)
                            ->orderBy('fecha_devolucion', 'asc')
                            ->get()
                            ->map(function ($prestamo) {
                                $prestamo->fecha_prestamo = Carbon::parse($prestamo->fecha_prestamo)->addDay()->format('Y-m-d');
                                $prestamo->fecha_devolucion = Carbon::parse($prestamo->fecha_devolucion)->addDay()->format('Y-m-d');
                                $prestamo->dias_retraso = Carbon::now()->diffInDays(Carbon::parse($prestamo->fecha_devolucion));
                                return $prestamo;
                            })
                            ->when($request->has('dias_vencido'), function ($collection) use ($request) {
                                return $collection->filter(function ($prestamo) use ($request) {
                                    return $prestamo->dias_retraso >= (int)$request->dias_vencido;
                                });
                            });

            if ($request->has('search')) {
                $search = $request->search;
                $prestamos = $prestamos->filter(function($prestamo) use ($search) {
                    return str_contains(strtolower($prestamo->lector->nombre), strtolower($search)) ||
                           str_contains(strtolower($prestamo->lector->codigo), strtolower($search)) ||
                           str_contains(strtolower($prestamo->ejemplar->libro->titulo), strtolower($search)) ||
                           str_contains(strtolower($prestamo->ejemplar->codigo), strtolower($search));
                });
            }

            // Paginar la colección manualmente
            $page = $request->input('page', 1);
            $perPage = 10;
            $items = $prestamos->forPage($page, $perPage);
            
            return Inertia::render('Prestamos/Vencidos', [
                'prestamos' => new \Illuminate\Pagination\LengthAwarePaginator(
                    $items,
                    $prestamos->count(),
                    $perPage,
                    $page,
                    ['path' => $request->url()]
                )
            ]);

            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->whereHas('lector', function($q) use ($search) {
                        $q->where('nombre', 'LIKE', "%{$search}%")
                          ->orWhere('codigo', 'LIKE', "%{$search}%");
                    })->orWhereHas('ejemplar.libro', function($q) use ($search) {
                        $q->where('titulo', 'LIKE', "%{$search}%")
                          ->orWhere('codigo', 'LIKE', "%{$search}%");
                    });
                });
            }

            if ($request->has('dias_vencido')) {
                $dias = $request->dias_vencido;
                $query->where('fecha_devolucion', '<=', Carbon::now()->subDays($dias));
            }

            $prestamos = $query->paginate(10);
            
            return Inertia::render('Prestamos/Vencidos', [
                'prestamos' => $prestamos
            ]);
        } catch (\Exception $e) {
            return back()->with('error', 'Error al cargar la lista de préstamos vencidos: ' . $e->getMessage());
        }
    }
}