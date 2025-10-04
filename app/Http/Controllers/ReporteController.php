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
        $perPage = 15; // Valor fijo de 15 elementos por página

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

        // ✅ OBTENER SOLO LOS 4 AÑOS MÁS RECIENTES PARA EL FILTRO
        $fechaLimite = Carbon::now()->subYears(4)->startOfYear();
        $anosDisponibles = Prestamo::selectRaw('YEAR(fecha_prestamo) as ano')
            ->where('fecha_prestamo', '>=', $fechaLimite)
            ->distinct()
            ->orderBy('ano', 'desc')
            ->pluck('ano')
            ->toArray();

        // ✅ DETERMINAR EL AÑO A FILTRAR
        $anoActual = Carbon::now()->year;
        $anoFiltro = $request->input('ano', $anoActual); // Por defecto año actual
        
        // Validar que el año solicitado exista en los datos disponibles (últimos 4 años)
        if (!in_array($anoFiltro, $anosDisponibles) && !empty($anosDisponibles)) {
            $anoFiltro = $anoActual;
        }

        // ✅ CARGAR LA RELACIÓN CON GRADO para obtener el subGrado
        $query = Prestamo::with(['ejemplar.libro', 'lector.grado'])
            // ✅ FILTRAR POR AÑO (POR DEFECTO AÑO ACTUAL) Y LIMITAR A LOS ÚLTIMOS 4 AÑOS
            ->whereYear('fecha_prestamo', $anoFiltro)
            ->where('fecha_prestamo', '>=', $fechaLimite)
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
                        $q->where('libros.titulo', 'like', "%{$search}%")
                          // 🆕 NUEVA BÚSQUEDA POR CÓDIGO_ÚNICO ADEMÁS DE TÍTULO
                          ->orWhere('libros.codigo_unico', 'like', "%{$search}%");
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

        // ✅ MODIFICAR FILTROS DE FECHA PARA QUE RESPETEN EL AÑO SELECCIONADO Y EL LÍMITE DE 4 AÑOS
        if ($request->has('fechaInicio') && $request->fechaInicio) {
            $fechaInicio = Carbon::parse($request->fechaInicio);
            // Si la fecha de inicio no pertenece al año filtrado, ajustarla
            if ($fechaInicio->year != $anoFiltro) {
                $fechaInicio = Carbon::create($anoFiltro, 1, 1); // Enero 1 del año filtrado
            }
            // Asegurar que no sea anterior al límite de 4 años
            if ($fechaInicio->lt($fechaLimite)) {
                $fechaInicio = $fechaLimite;
            }
            $query->where('fecha_prestamo', '>=', $fechaInicio->format('Y-m-d'));
        }

        if ($request->has('fechaFin') && $request->fechaFin) {
            $fechaFin = Carbon::parse($request->fechaFin);
            // Si la fecha de fin no pertenece al año filtrado, ajustarla
            if ($fechaFin->year != $anoFiltro) {
                $fechaFin = Carbon::create($anoFiltro, 12, 31); // Diciembre 31 del año filtrado
            }
            $query->where('fecha_prestamo', '<=', $fechaFin->format('Y-m-d'));
        }

        // Paginación mejorada
        $prestamos = $query->paginate($perPage, ['*'], 'page', $page)->withQueryString();

        // Redirigir si la página solicitada no existe pero hay resultados
        if ($page > $prestamos->lastPage() && $prestamos->lastPage() > 0) {
            return redirect()->route('reportes.historial-prestamos', 
                array_merge($request->query(), ['page' => $prestamos->lastPage()])
            );
        }

        // 🆕 TRANSFORMAR LOS DATOS CON SOPORTE PARA ISBN/ISSN
        $prestamos->through(function ($prestamo) {
            return [
                'id' => $prestamo->id,
                'ejemplar' => [
                    'id' => $prestamo->ejemplar->id,
                    'codigo' => $prestamo->ejemplar->codigo ?? null,
                    'numEjemplar' => $prestamo->ejemplar->numEjemplar,
                    'libro' => [
                        'titulo' => $prestamo->ejemplar->libro->titulo,
                        // 🆕 CAMBIO PRINCIPAL: Enviar codigo_unico y clase
                        'codigo_unico' => $prestamo->ejemplar->libro->codigo_unico,
                        'isbn' => $prestamo->ejemplar->libro->isbn ?? $prestamo->ejemplar->libro->codigo_unico, // Fallback para compatibilidad
                        'clase' => $prestamo->ejemplar->libro->clase, // Para determinar si es ISBN o ISSN
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
            'anosDisponibles' => $anosDisponibles, // ✅ ENVIAR SOLO LOS 4 AÑOS MÁS RECIENTES AL FRONTEND
            'anoActual' => $anoFiltro, // ✅ ENVIAR EL AÑO ACTUAL FILTRADO
            'filters' => array_filter($request->only(['search', 'estado', 'subgrado', 'fechaInicio', 'fechaFin', 'ano'])), // ✅ INCLUIR AÑO EN FILTROS
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