<?php

namespace App\Http\Controllers;

use App\Models\Prestamo;
use App\Models\Grado;
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

        // ✅ OBTENER TODOS LOS SUBGRADOS ÚNICOS PARA EL FILTRO CON ORDEN NATURAL
        $subgradosCollection = Grado::whereNotNull('subGrado')
            ->where('subGrado', '!=', '')
            ->distinct()
            ->pluck('subGrado')
            ->sort(function ($a, $b) {
                // Función de ordenamiento natural para subgrados empezando desde Primero
                $orden = [
                    'PRIMERO' => 1, 'SEGUNDO' => 2, 'TERCERO' => 3, 'CUARTO' => 4, 'QUINTO' => 5,
                    'SEXTO' => 6, 'SÉPTIMO' => 7, 'SEPTIMO' => 7, 'OCTAVO' => 8, 'NOVENO' => 9, 'DÉCIMO' => 10, 'DECIMO' => 10
                ];
                
                // Intentar con formato de texto (PRIMERO A, SEGUNDO B, etc.)
                $valorA = 999; $letraA = '';
                $valorB = 999; $letraB = '';
                
                // Buscar formato "PRIMERO A", "SEGUNDO B", etc.
                foreach ($orden as $texto => $num) {
                    if (strpos(strtoupper($a), $texto) === 0) {
                        $valorA = $num;
                        $letraA = trim(str_replace($texto, '', strtoupper($a)));
                        break;
                    }
                }
                
                foreach ($orden as $texto => $num) {
                    if (strpos(strtoupper($b), $texto) === 0) {
                        $valorB = $num;
                        $letraB = trim(str_replace($texto, '', strtoupper($b)));
                        break;
                    }
                }
                
                // Si no encuentra formato de texto, intentar con números (1A, 2B, etc.)
                if ($valorA === 999) {
                    preg_match('/^(\d+)([A-Z]?)/', strtoupper($a), $matchesA);
                    $valorA = isset($matchesA[1]) ? (int)$matchesA[1] + 100 : 999; // +100 para poner números después de texto
                    $letraA = isset($matchesA[2]) ? $matchesA[2] : '';
                }
                
                if ($valorB === 999) {
                    preg_match('/^(\d+)([A-Z]?)/', strtoupper($b), $matchesB);
                    $valorB = isset($matchesB[1]) ? (int)$matchesB[1] + 100 : 999;
                    $letraB = isset($matchesB[2]) ? $matchesB[2] : '';
                }
                
                // Comparar primero por valor numérico
                if ($valorA !== $valorB) {
                    return $valorA - $valorB;
                }
                
                // Si los valores son iguales, comparar por letra
                return strcmp($letraA, $letraB);
            })
            ->values(); // Reindexar la colección
        
        $subgrados = $subgradosCollection->toArray();

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

        // ✅ AGREGAR FILTRO POR SUBGRADO
        if ($request->has('subgrado') && $request->subgrado) {
            $query->whereHas('lector.grado', function ($q) use ($request) {
                $q->where('grados.subGrado', $request->subgrado);
            });
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
            'subgrados' => $subgrados, // ✅ ENVIAR LOS SUBGRADOS AL FRONTEND
            'filters' => array_filter($request->only(['search', 'estado', 'subgrado', 'fechaInicio', 'fechaFin'])), // ✅ INCLUIR SUBGRADO EN FILTROS
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