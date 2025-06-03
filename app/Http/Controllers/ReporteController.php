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
        $query = Prestamo::with(['ejemplar.libro', 'lector'])
            ->orderBy('fecha_prestamo', 'desc');

        // Aplicar filtros si existen
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('lector', function ($q) use ($search) {
                    $q->where('codigo', 'like', "%{$search}%")
                        ->orWhere('nombre', 'like', "%{$search}%");
                })
                ->orWhereHas('ejemplar', function ($q) use ($search) {
                    $q->where('codigo', 'like', "%{$search}%")
                        ->orWhereHas('libro', function ($q) use ($search) {
                            $q->where('titulo', 'like', "%{$search}%");
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

        $prestamos = $query->paginate(10)
            ->through(function ($prestamo) {
                return [
                    'id' => $prestamo->id,
                    'ejemplar' => [
                        'id' => $prestamo->ejemplar->id,
                        'codigo' => $prestamo->ejemplar->codigo,
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
                    ],
                    'fecha_prestamo' => $prestamo->fecha_prestamo,
                    'fecha_devolucion' => $prestamo->fecha_devolucion,
                    'fecha_devuelto' => $prestamo->fecha_devuelto,
                    'estado' => $prestamo->estado,
                    'observaciones' => $prestamo->observaciones,
                ];
            });

        return Inertia::render('Reportes/HistorialPrestamos', [
            'prestamos' => $prestamos,
        ]);
    }
}