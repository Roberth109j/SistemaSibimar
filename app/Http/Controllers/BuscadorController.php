<?php

namespace App\Http\Controllers;

use App\Models\Libro;
use App\Models\Seccion;
use App\Models\Ejemplar;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BuscadorController extends Controller
{
    public function index(Request $request)
    {
        // Validación de parámetros
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
                'libros.codigo_unico',
                'libros.autor_id',
                'libros.estanteria_id',
                'libros.seccion_id',
                'libros.sign_top',
                'libros.contenido', // ← AGREGAMOS EL CONTENIDO
                // Subconsulta para contar SOLO ejemplares disponibles
                DB::raw("(SELECT COUNT(*) FROM ejemplares WHERE ejemplares.libro_id = libros.id AND ejemplares.estado = 'DISPONIBLE') as ejemplares_count")
            ])
            ->with([
                'autor:id,nombres,apellidos',
                'estanteria:id,cod_estante,descripcion',
                'seccion:id,nombre'
            ])
            ->where('seccion_id', $seccionId) // Filtrar por sección SIEMPRE
            ->orderBy('titulo');

        // 🚀 BÚSQUEDA PROFESIONAL OPTIMIZADA para 60k+ libros
        if (strlen($search) >= 3) {
            $searchLength = mb_strlen($search);

            // JOIN optimizado con tabla autores para evitar subconsultas N+1
            $query->leftJoin('autores', 'libros.autor_id', '=', 'autores.id')
                ->select([
                    'libros.id',
                    'libros.titulo',
                    'libros.codigo_unico',
                    'libros.autor_id',
                    'libros.estanteria_id',
                    'libros.seccion_id',
                    'libros.sign_top',
                    'libros.contenido',
                    // Mantener el conteo de ejemplares disponibles
                    DB::raw("(SELECT COUNT(*) FROM ejemplares WHERE ejemplares.libro_id = libros.id AND ejemplares.estado = 'DISPONIBLE') as ejemplares_count")
                ]);

            $query->where(function ($q) use ($search, $searchLength) {

                // ESTRATEGIA HÍBRIDA: FULLTEXT para búsquedas largas, LIKE optimizado para cortas

                if ($searchLength >= 3) {
                    // ✅ BÚSQUEDAS LARGAS (3+ caracteres): Usa FULLTEXT + índices optimizados

                    // 1. FULLTEXT BOOLEAN MODE en título y contenido
                    $q->whereRaw(
                        "MATCH(libros.titulo, libros.contenido) AGAINST(? IN BOOLEAN MODE)",
                        [$search . '*']  // * permite coincidencias parciales en FULLTEXT
                    )

                    // 2. Código único con índice (sin wildcard inicial)
                    ->orWhere('libros.codigo_unico', 'LIKE', $search . '%')

                    // 3. Autor con índices en JOIN (sin wildcard inicial)
                    ->orWhere('autores.nombres', 'LIKE', $search . '%')
                    ->orWhere('autores.apellidos', 'LIKE', $search . '%')
                    ->orWhereRaw("CONCAT(autores.nombres, ' ', autores.apellidos) LIKE ?", [$search . '%'])
                    ->orWhereRaw("CONCAT(autores.apellidos, ' ', autores.nombres) LIKE ?", [$search . '%']);
                }
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
                               'isbn' => $libro->codigo_unico, // Mantenemos 'isbn' en la respuesta por compatibilidad
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
                               'contenido' => $libro->contenido, // ← INCLUIMOS EL CONTENIDO EN LA RESPUESTA
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

    /**
     * Mostrar información básica de un libro desde el buscador (PÚBLICO)
     */
    public function show($id)
    {
        try {
            $libro = Libro::with([
                'autor:id,nombres,apellidos',
                'editorial:id,nombre',
                'seccion:id,nombre'
            ])->select([
                'id',
                'titulo', 
                'codigo_unico',
                'autor_id',
                'editorial_id', 
                'seccion_id',
                'clase',
                'area',
                'idioma', 
                'paginas',
                'anio',
                'contenido'
            ])->findOrFail($id);

            return Inertia::render('Buscador/Show', [
                'libro' => [
                    'id' => $libro->id,
                    'titulo' => $libro->titulo,
                    'codigo_unico' => $libro->codigo_unico,
                    'autor' => $libro->autor ? [
                        'nombre_completo' => trim($libro->autor->nombres . ' ' . $libro->autor->apellidos)
                    ] : null,
                    'editorial' => $libro->editorial ? [
                        'nombre' => $libro->editorial->nombre
                    ] : null,
                    'clase' => $libro->clase,
                    'area' => $libro->area,
                    'idioma' => $libro->idioma,
                    'paginas' => $libro->paginas,
                    'anio' => $libro->anio,
                    'contenido' => $libro->contenido,
                    'seccion' => $libro->seccion ? [
                        'nombre' => $libro->seccion->nombre
                    ] : null,
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error al mostrar libro desde buscador:', [
                'libro_id' => $id,
                'error' => $e->getMessage()
            ]);

            return redirect()->route('buscador.index')
                ->with('error', 'No se pudo cargar la información del libro.');
        }
    }
}