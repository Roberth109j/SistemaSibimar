<?php

namespace App\Http\Controllers;

use App\Models\Prestamo;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class ReporteController extends Controller
{
    public function historialPrestamos(Request $request)
    {
        // Validación de parámetros de paginación
        $page = max(1, (int) $request->input('page', 1));
        $perPage = 10; // Valor fijo de 10 elementos por página

        // ✅ CARGAR LA RELACIÓN CON GRADO para obtener el subGrado
        $query = Prestamo::with(['ejemplar.libro', 'lector.grado'])
            // MODIFICACIÓN: Ordenar primero por estado (ACTIVO primero) y luego por fecha
            ->orderByRaw("CASE 
                WHEN estado = 'ACTIVO' THEN 1 
                WHEN estado = 'VENCIDO' THEN 2 
                WHEN estado = 'DEVUELTO' THEN 3 
                ELSE 4 
            END")
            ->orderBy('fecha_prestamo', 'desc');

        // Aplicar filtros si existen - CORREGIDO
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('lector', function ($q) use ($search) {
                    $q->where('lectores.codigo', 'like', "%{$search}%")
                        ->orWhere('lectores.nombre', 'like', "%{$search}%");
                })
                // ✅ AGREGAR BÚSQUEDA POR SUBGRADO
                ->orWhereHas('lector.grado', function ($q) use ($search) {
                    $q->where('grados.subGrado', 'like', "%{$search}%");
                })
                ->orWhereHas('ejemplar', function ($q) use ($search) {
                    $q->whereHas('libro', function ($q) use ($search) {
                        $q->where('libros.titulo', 'like', "%{$search}%");
                    });
                });
            });
        }

        if ($request->has('estado') && $request->estado) {
            $query->where('estado', $request->estado);
        }

        if ($request->has('fechaInicio') && $request->fechaInicio) {
            $query->where('fecha_prestamo', '>=', $request->fechaInicio);
        }

        if ($request->has('fechaFin') && $request->fechaFin) {
            $query->where('fecha_prestamo', '<=', $request->fechaFin);
        }

        // Paginación mejorada
        $prestamos = $query->paginate($perPage, ['*'], 'page', $page)->withQueryString();

        // Redirigir si la página solicitada no existe pero hay resultados
        if ($page > $prestamos->lastPage() && $prestamos->lastPage() > 0) {
            return redirect()->route('reportes.historial-prestamos', 
                array_merge($request->query(), ['page' => $prestamos->lastPage()])
            );
        }

        // Transformar los datos incluyendo el subgrado desde la relación
        $prestamos->through(function ($prestamo) {
            return [
                'id' => $prestamo->id,
                'ejemplar' => [
                    'id' => $prestamo->ejemplar->id,
                    'codigo' => $prestamo->ejemplar->codigo ?? null,
                    'numEjemplar' => $prestamo->ejemplar->numEjemplar,
                    'libro' => [
                        'titulo' => $prestamo->ejemplar->libro->titulo,
                        'isbn' => $prestamo->ejemplar->libro->isbn,
                    ],
                ],
                'lector' => [
                    'id' => $prestamo->lector->id,
                    'nombre' => $prestamo->lector->nombre,
                    'codigo' => $prestamo->lector->codigo,
                    // ✅ OBTENER EL SUBGRADO DESDE LA RELACIÓN CON GRADO
                    'subgrado' => $prestamo->lector->grado ? $prestamo->lector->grado->subGrado : null,
                ],
                // Ajustar las fechas sumando un día para compensar la zona horaria
                'fecha_prestamo' => Carbon::parse($prestamo->fecha_prestamo)->addDay()->format('Y-m-d'),
                'fecha_devolucion' => Carbon::parse($prestamo->fecha_devolucion)->addDay()->format('Y-m-d'),
                'fecha_devuelto' => $prestamo->fecha_devuelto 
                    ? Carbon::parse($prestamo->fecha_devuelto)->addDay()->format('Y-m-d') 
                    : null,
                'estado' => $prestamo->estado,
                'observaciones' => $prestamo->observaciones,
            ];
        });

        return Inertia::render('Reportes/HistorialPrestamos', [
            'prestamos' => $prestamos,
            'filters' => array_filter($request->only(['search', 'estado', 'fechaInicio', 'fechaFin'])),
            'pagination' => [
                'current_page' => $prestamos->currentPage(),
                'last_page' => $prestamos->lastPage(),
                'per_page' => $prestamos->perPage(),
                'total' => $prestamos->total(),
                'from' => $prestamos->firstItem(),
                'to' => $prestamos->lastItem(),
                'has_pages' => $prestamos->hasPages(),
            ],
        ]);
    }
}