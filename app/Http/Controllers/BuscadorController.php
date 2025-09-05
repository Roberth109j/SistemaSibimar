<?php

namespace App\Http\Controllers;

use App\Models\Libro;
use App\Models\Seccion;
use App\Models\Ejemplar;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class BuscadorController extends Controller
{
    public function index(Request $request)
    {
        // Validar parámetros
        $request->validate([
            'search' => 'nullable|string|max:255',
            'seccion_id' => 'nullable|integer|exists:secciones,id',
        ]);

        $search = trim($request->get('search', ''));
        $seccionId = $request->get('seccion_id');

        // Obtener todas las secciones para el selector
        $secciones = Seccion::select(['id', 'nombre'])
            ->orderBy('nombre')
            ->get();

        // Crear una paginación vacía por defecto
        $librosVacios = new \Illuminate\Pagination\LengthAwarePaginator(
            collect([]), // datos vacíos
            0, // total
            15, // per_page
            1, // current_page
            [
                'path' => request()->url(),
                'pageName' => 'page',
            ]
        );

        // Si no hay sección seleccionada, devolver resultados vacíos inmediatamente
        if (!$seccionId) {
            return Inertia::render('Buscador/Index', [
                'libros' => $librosVacios->withQueryString()->through(function ($libro) {
                    return $libro; // No habrá libros que transformar
                }),
                'secciones' => $secciones,
                'filters' => [
                    'search' => $search,
                    'seccion_id' => null,
                ],
            ]);
        }

        // Inicializar query base solo cuando hay sección
        $query = Libro::query()
            ->select([
                'libros.id',
                'libros.titulo',
                'libros.isbn',
                'libros.autor_id',
                'libros.estanteria_id',
                'libros.seccion_id',
                'libros.sign_top',
                // MODIFICADO: Subconsulta para contar SOLO ejemplares disponibles
                DB::raw("(SELECT COUNT(*) FROM ejemplares WHERE ejemplares.libro_id = libros.id AND ejemplares.estado = 'DISPONIBLE') as ejemplares_count")
            ])
            ->with([
                'autor:id,nombres,apellidos',
                'estanteria:id,cod_estante,descripcion',
                'seccion:id,nombre'
            ])
            ->where('seccion_id', $seccionId) // Filtrar por sección SIEMPRE
            ->orderBy('titulo');

        // Aplicar lógica de búsqueda
        if (strlen($search) >= 3) {
            // Búsqueda con término válido
            $query->where(function ($q) use ($search) {
                // Búsqueda en título
                $q->where('titulo', 'like', "%{$search}%")
                  // Búsqueda en ISBN
                  ->orWhere('isbn', 'like', "%{$search}%")
                  // Búsqueda en autor usando EXISTS para mejor performance
                  ->orWhereExists(function ($subQuery) use ($search) {
                      $subQuery->select(DB::raw(1))
                              ->from('autores')
                              ->whereColumn('autores.id', 'libros.autor_id')
                              ->where(function ($authorQuery) use ($search) {
                                  $authorQuery->where('nombres', 'like', "%{$search}%")
                                             ->orWhere('apellidos', 'like', "%{$search}%")
                                             // Búsqueda en nombre completo concatenado
                                             ->orWhereRaw("CONCAT(nombres, ' ', apellidos) LIKE ?", ["%{$search}%"]);
                              });
                  });
            });
        } elseif (strlen($search) > 0 && strlen($search) < 3) {
            // Si hay búsqueda pero menos de 3 caracteres, devolver vacío
            return Inertia::render('Buscador/Index', [
                'libros' => $librosVacios->withQueryString()->through(function ($libro) {
                    return $libro;
                }),
                'secciones' => $secciones,
                'filters' => [
                    'search' => $search,
                    'seccion_id' => $seccionId,
                ],
            ]);
        } else {
            // Sin búsqueda: NO mostrar nada, esperar que el usuario busque
            return Inertia::render('Buscador/Index', [
                'libros' => $librosVacios->withQueryString()->through(function ($libro) {
                    return $libro;
                }),
                'secciones' => $secciones,
                'filters' => [
                    'search' => $search,
                    'seccion_id' => $seccionId,
                ],
            ]);
        }

        // Ejecutar la consulta y paginar
        $libros = $query->paginate(15)
                       ->withQueryString()
                       ->through(function ($libro) {
                           return [
                               'id' => $libro->id,
                               'titulo' => $libro->titulo,
                               'autor' => [
                                   'id' => $libro->autor->id,
                                   'nombre' => $libro->autor->nombre_completo,
                               ],
                               'isbn' => $libro->isbn,
                               'ejemplares_count' => (int) $libro->ejemplares_count,
                               'estanteria' => $libro->estanteria ? [
                                   'id' => $libro->estanteria->id,
                                   'codigo' => $libro->estanteria->cod_estante,
                                   'descripcion' => $libro->estanteria->descripcion,
                               ] : null,
                               'seccion' => [
                                   'id' => $libro->seccion->id,
                                   'nombre' => $libro->seccion->nombre,
                               ],
                               'sign_top' => $libro->sign_top,
                           ];
                       });

        return Inertia::render('Buscador/Index', [
            'libros' => $libros,
            'secciones' => $secciones,
            'filters' => [
                'search' => $search,
                'seccion_id' => $seccionId,
            ],
        ]);
    }
}