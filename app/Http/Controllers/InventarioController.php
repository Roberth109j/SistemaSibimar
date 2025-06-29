<?php

namespace App\Http\Controllers;

use App\Models\Libro;
use App\Models\Ejemplar;
use App\Models\Estanteria;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\InventarioExport;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class InventarioController extends Controller
{
    /**
     * Muestra la página de inventario de libros.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        // Obtener los filtros de la solicitud
        $filters = $request->only(['search', 'clase', 'idioma', 'estado']);
        
        // Consulta base con ejemplares y sus estados
        $query = Libro::with(['ejemplares', 'estanteria', 'autor', 'editorial', 'seccion'])
            ->withCount([
                'ejemplares',
                'ejemplares as ejemplares_disponibles_count' => function ($query) {
                    $query->where('estado', Ejemplar::ESTADO_DISPONIBLE);
                },
                'ejemplares as ejemplares_prestados_count' => function ($query) {
                    $query->where('estado', Ejemplar::ESTADO_PRESTADO);
                },
                'ejemplares as ejemplares_inactivos_count' => function ($query) {
                    $query->where('estado', Ejemplar::ESTADO_INACTIVO);
                }
            ]);
            
        // Aplicar filtro de búsqueda
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('titulo', 'like', "%{$search}%")
                  ->orWhere('isbn', 'like', "%{$search}%")
                  ->orWhereHas('autor', function ($q) use ($search) {
                      $q->where(DB::raw("CONCAT(nombres, ' ', apellidos)"), 'like', "%{$search}%");
                  });
            });
        }
        
        // Filtrar por clase
        if (!empty($filters['clase'])) {
            $query->where('clase', $filters['clase']);
        }
        
        // Filtrar por idioma
        if (!empty($filters['idioma'])) {
            $query->where('idioma', $filters['idioma']);
        }
        
        // Filtrar por estado de ejemplares
        if (!empty($filters['estado'])) {
            if ($filters['estado'] === 'disponibles') {
                $query->whereHas('ejemplares', function ($q) {
                    $q->where('estado', Ejemplar::ESTADO_DISPONIBLE);
                });
            } elseif ($filters['estado'] === 'prestados') {
                $query->whereHas('ejemplares', function ($q) {
                    $q->where('estado', Ejemplar::ESTADO_PRESTADO);
                });
            } elseif ($filters['estado'] === 'inactivos') {
                $query->whereHas('ejemplares', function ($q) {
                    $q->where('estado', Ejemplar::ESTADO_INACTIVO);
                });
            }
        }
        
        // CALCULAR ESTADÍSTICAS GLOBALES ANTES DE PAGINAR
        $estadisticasGlobales = $this->calcularEstadisticasGlobales(clone $query);
        
        // Ejecutar la consulta con paginación
        $libros = $query->orderBy('titulo')->paginate(15)->withQueryString();
        
        // Obtener datos para filtros
        $clases = [
            Libro::CLASE_LIBRO,
            Libro::CLASE_CARTILLA,
            Libro::CLASE_CUENTO,
            Libro::CLASE_DICCIONARIO,
            Libro::CLASE_ENCICLOPEDIA,
            Libro::CLASE_NOVELA,
            Libro::CLASE_REVISTA,
        ];
        
        $idiomas = [
            Libro::IDIOMA_ESPANOL,
            Libro::IDIOMA_INGLES,
            Libro::IDIOMA_FRANCES,
            Libro::IDIOMA_OTRO,
        ];
        
        $estados = [
            'todos' => 'Todos los estados',
            'disponibles' => 'Disponibles',
            'prestados' => 'Prestados',
            'inactivos' => 'Inactivos',
        ];
        
        $estanterias = Estanteria::select('id', 'cod_estante')->orderBy('cod_estante')->get();
        
        // Renderizar la vista de Inertia con los datos
        return Inertia::render('Inventario/Index', [
            'libros' => $libros,
            'estadisticas' => $estadisticasGlobales, // <- NUEVO
            'clases' => $clases,
            'idiomas' => $idiomas,
            'estados' => $estados,
            'estanterias' => $estanterias,
            'filters' => $filters,
        ]);
    }
    
    /**
     * Calcula las estadísticas globales del inventario
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return array
     */
    private function calcularEstadisticasGlobales($query)
    {
        // Obtener todos los libros que coinciden con los filtros
        $libros = $query->get();
        
        // Calcular estadísticas
        $totalLibros = $libros->count();
        $totalEjemplares = $libros->sum('ejemplares_count');
        $totalDisponibles = $libros->sum('ejemplares_disponibles_count');
        $totalPrestados = $libros->sum('ejemplares_prestados_count');
        $totalInactivos = $libros->sum('ejemplares_inactivos_count');
        
        return [
            'total_libros' => $totalLibros,
            'total_ejemplares' => $totalEjemplares,
            'total_disponibles' => $totalDisponibles,
            'total_prestados' => $totalPrestados,
            'total_inactivos' => $totalInactivos,
        ];
    }
    
    /**
     * Genera un Excel con el inventario de libros según los filtros aplicados.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function exportarExcel(Request $request)
    {
        try {
            // Obtener los filtros de la solicitud (los mismos que el index)
            $filters = $request->only(['search', 'clase', 'idioma', 'estado']);
            
            // Generar nombre de archivo dinámico
            $filename = 'inventario-biblioteca';
            if (!empty($filters['clase'])) {
                $filename .= '-' . strtolower(str_replace(' ', '-', $filters['clase']));
            }
            if (!empty($filters['estado'])) {
                $filename .= '-' . $filters['estado'];
            }
            $filename .= '-' . Carbon::now()->format('Y-m-d') . '.xlsx';
            
            return Excel::download(new InventarioExport($filters), $filename);
            
        } catch (\Exception $e) {
            return back()->with('error', 'Error al generar el Excel: ' . $e->getMessage());
        }
    }
}