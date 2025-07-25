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
     * Actualizar automáticamente el estado de préstamos vencidos
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

    /**
     * Mostrar la vista de gestión de préstamos
     */
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
                'observaciones' => $request->observaciones ?? ''
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
     * Marcar un préstamo como devuelto (para préstamos activos)
     */
    public function devolver(Request $request, Prestamo $prestamo)
    {
        // Validar los datos recibidos
        $request->validate([
            'fecha_devuelto' => 'required|date',
            'observaciones' => 'nullable|string|max:500',
        ]);

        if ($prestamo->estado === 'DEVUELTO') {
            return back()->with('error', 'Este préstamo ya ha sido devuelto.');
        }

        // Verificar que el préstamo esté activo (no vencido)
        if ($prestamo->estado === 'VENCIDO') {
            return back()->with('error', 'Este préstamo está vencido. Use la función de devolución de préstamos vencidos.');
        }

        try {
            // Actualizar el préstamo con los datos recibidos
            $prestamo->update([
                'estado' => 'DEVUELTO',
                'fecha_devuelto' => $request->fecha_devuelto,
                'observaciones' => $request->observaciones ?? $prestamo->observaciones,
                'updated_at' => now(),
            ]);

            // Actualizar estado del ejemplar
            $prestamo->ejemplar->update(['estado' => Ejemplar::ESTADO_DISPONIBLE]);

            return redirect()->route('prestamos.listado')
                ->with('success', 'Préstamo devuelto exitosamente.');
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

            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->whereHas('lector', function ($q) use ($search) {
                        $q->where('nombre', 'LIKE', "%{$search}%")
                            ->orWhere('codigo', 'LIKE', "%{$search}%");
                    })
                        ->orWhereHas('ejemplar', function ($q) use ($search) {
                            $q->where('codigo', 'LIKE', "%{$search}%")
                                ->orWhereHas('libro', function ($q) use ($search) {
                                    $q->where('titulo', 'LIKE', "%{$search}%");
                                });
                        });
                });
            }

            if ($request->has('codigo_lector')) {
                $query->whereHas('lector', function ($q) use ($request) {
                    $q->where('codigo', $request->codigo_lector);
                });
            }

            $prestamos = $query->paginate(10);

            return Inertia::render('Devoluciones/Index', [
                'prestamos' => $prestamos
            ]);
        } catch (\Exception $e) {
            return back()->with('error', 'Error al cargar la lista de préstamos: ' . $e->getMessage());
        }
    }

    /**
     * Lista de préstamos vencidos con paginación y filtros del servidor
     */
    public function vencidos(Request $request)
    {
        try {
            $this->actualizarPrestamosVencidos();

            $query = Prestamo::with(['ejemplar.libro', 'lector'])
                ->where('estado', 'VENCIDO')
                ->orderBy('fecha_devolucion', 'asc');

            if ($request->filled('search')) {
                $search = trim($request->search);
                $query->where(function ($q) use ($search) {
                    $q->whereHas('lector', function ($q) use ($search) {
                        $q->where('nombre', 'LIKE', "%{$search}%")
                            ->orWhere('codigo', 'LIKE', "%{$search}%");
                    })
                        ->orWhereHas('ejemplar', function ($q) use ($search) {
                            $q->where('codigo', 'LIKE', "%{$search}%")
                                ->orWhereHas('libro', function ($q) use ($search) {
                                    $q->where('titulo', 'LIKE', "%{$search}%");
                                });
                        });
                });
            }

            if ($request->filled('dias_vencido')) {
                $diasMinimos = (int) $request->dias_vencido;
                if ($diasMinimos > 0) {
                    $query->whereRaw('DATEDIFF(CURDATE(), fecha_devolucion) >= ?', [$diasMinimos]);
                }
            }

            $prestamos = $query->paginate(10)->withQueryString();

            $prestamos->getCollection()->transform(function ($prestamo) {
                $fechaDevolucion = Carbon::parse($prestamo->fecha_devolucion)->startOfDay();
                $fechaActual = Carbon::now()->startOfDay();
                $diasRetraso = $fechaActual->diffInDays($fechaDevolucion);
                $prestamo->dias_retraso = max(0, $diasRetraso);
                return $prestamo;
            });

            return Inertia::render('Prestamos/Vencidos', [
                'prestamos' => $prestamos,
                'filters' => [
                    'search' => $request->search,
                    'dias_vencido' => $request->dias_vencido,
                ]
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error en búsqueda de préstamos vencidos:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', 'Error al cargar la lista de préstamos vencidos: ' . $e->getMessage());
        }
    }


    /**
     * Procesar devolución de préstamo vencido
     */
    public function devolverVencido(Request $request, $id)
    {
        $request->validate([
            'fecha_devuelto' => 'required|date',
            'observaciones' => 'nullable|string|max:500',
        ]);

        try {
            $prestamo = Prestamo::findOrFail($id);

            // Verificar que el préstamo esté vencido
            if ($prestamo->estado !== Prestamo::ESTADO_VENCIDO) {
                return back()->with('error', 'Este préstamo no está en estado vencido.');
            }

            $prestamo->update([
                'estado' => 'DEVUELTO',
                'fecha_devuelto' => $request->fecha_devuelto,
                'observaciones' => $request->observaciones,
                'updated_at' => now(),
            ]);

            // Actualizar estado del ejemplar
            $prestamo->ejemplar->update([
                'estado' => Ejemplar::ESTADO_DISPONIBLE
            ]);

            // Preparar parámetros para redirigir con filtros preservados
            $redirectParams = [];
            // Aquí se toman los parámetros directamente del Request,
            // ya que el frontend los envía en el 'data' del POST.
            if ($request->input('search')) {
                $redirectParams['search'] = $request->input('search');
            }
            if ($request->input('dias_vencido')) {
                $redirectParams['dias_vencido'] = $request->input('dias_vencido');
            }
            if ($request->input('page')) {
                $redirectParams['page'] = $request->input('page');
            }

            return redirect()->route('prestamos.vencidos', $redirectParams)
                ->with('success', 'Préstamo devuelto exitosamente');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al procesar la devolución: ' . $e->getMessage());
        }
    }
}
