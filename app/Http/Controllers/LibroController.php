<?php

namespace App\Http\Controllers;

use App\Models\Libro;
use App\Models\Autor;
use App\Models\Editorial;
use App\Models\Estanteria;
use App\Models\Seccion;
use App\Models\CategoriaDewey;
use App\Models\SubcategoriaDewey;
use App\Models\TemaDewey;
use App\Models\Ejemplar; // Agregamos la importación que faltaba
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class LibroController extends Controller
{
    /**
     * Buscar libro por término de búsqueda para préstamos
     */
    public function search(Request $request)
    {
        $search = $request->input('search');

        if (!$search) {
            return response()->json([
                'success' => false,
                'message' => 'Término de búsqueda requerido'
            ], 400);
        }

        $libro = Libro::with([
            'autor',
            'editorial',
            'seccion',
            'temaDewey',
            'estanteria'
        ])
            ->where(function ($query) use ($search) {
                $query->where('isbn', 'like', "%{$search}%")
                    ->orWhere('titulo', 'like', "%{$search}%");
            })
            ->first();

        if (!$libro) {
            return response()->json([
                'success' => false,
                'message' => 'Libro no encontrado'
            ], 404);
        }

        // Buscar los ejemplares disponibles de este libro
        $ejemplares = Ejemplar::where('libro_id', $libro->id)
            ->where('estado', Ejemplar::ESTADO_DISPONIBLE)
            ->get();

        return Inertia::render('Prestamos/Index', [
            'libro' => $libro,
            'ejemplares' => $ejemplares,
        ]);
    }

    public function index(Request $request)
    {
        $query = Libro::with(['autor', 'editorial', 'seccion', 'temaDewey', 'estanteria']);

        // Filtros
        if ($request->has('titulo')) {
            $query->where('titulo', 'like', '%' . $request->titulo . '%');
        }

        if ($request->has('isbn')) {
            $query->where('isbn', 'like', '%' . $request->isbn . '%');
        }

        if ($request->has('autor_id') && $request->autor_id) {
            $query->where('autor_id', $request->autor_id);
        }

        if ($request->has('clase') && $request->clase) {
            $query->where('clase', $request->clase);
        }

        if ($request->has('seccion_id') && $request->seccion_id) {
            $query->where('seccion_id', $request->seccion_id);
        }

        $libros = $query->paginate(10);

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

        // Cargar autores para los filtros - utilizando apellidos (plural)
        $autores = Autor::orderBy('apellidos')->get();
        $secciones = Seccion::all();

        return Inertia::render('Libro/index', [
            'libros' => $libros,
            'clases' => $clases,
            'idiomas' => $idiomas,
            'autores' => $autores,
            'secciones' => $secciones,
            'filters' => $request->all(['titulo', 'isbn', 'autor_id', 'clase', 'seccion_id'])
        ]);
    }

    /**
     * Mostrar formulario de creación
     */
    public function create()
    {
        // Utilizando apellidos (plural)
        $autores = Autor::orderBy('apellidos')->get();
        $editoriales = Editorial::orderBy('nombre')->get();
        $estanterias = Estanteria::all();
        $secciones = Seccion::all();
        $categoriasDewey = CategoriaDewey::all();

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

        return Inertia::render('Libro/Create', [
            'autores' => $autores,
            'editoriales' => $editoriales,
            'estanterias' => $estanterias,
            'secciones' => $secciones,
            'categoriasDewey' => $categoriasDewey,
            'clases' => $clases,
            'idiomas' => $idiomas
        ]);
    }

    /**
     * Almacenar nuevo libro
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'isbn' => 'required|unique:libros,isbn',
            'titulo' => 'required|string|max:255',
            'seccion_id' => 'required|exists:secciones,id',
            'autor_id' => 'required|exists:autores,id',
            'editorial_id' => 'required|exists:editoriales,id',
            'clase' => 'required|in:' . implode(',', [
                Libro::CLASE_LIBRO,
                Libro::CLASE_CARTILLA,
                Libro::CLASE_CUENTO,
                Libro::CLASE_DICCIONARIO,
                Libro::CLASE_ENCICLOPEDIA,
                Libro::CLASE_NOVELA,
                Libro::CLASE_REVISTA,
            ]),
            'idioma' => 'required|in:' . implode(',', [
                Libro::IDIOMA_ESPANOL,
                Libro::IDIOMA_INGLES,
                Libro::IDIOMA_FRANCES,
                Libro::IDIOMA_OTRO,
            ]),
            'paginas' => 'required|integer|min:1',
            'tema_id' => 'required|exists:temas_dewey,id',
            'estanteria_id' => 'required|exists:estanterias,id',
            'tomo' => 'nullable|integer|min:1',
            'edicion' => 'nullable|string|max:50',
            'anio' => 'nullable|integer|min:1000|max:' . (date('Y') + 1),
            'fecha_ingreso' => 'required|date',
            'precio' => 'nullable|numeric|min:0',
            'edad_recomendada' => 'nullable|integer|min:1|max:100',
            'contenido' => 'nullable|string',

        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        // Obtener datos del autor para crear la signatura topográfica - usando apellidos (plural)
        $autor = Autor::find($request->autor_id);
        $temaDewey = TemaDewey::find($request->tema_id);

        // Generar signatura topográfica - usando apellidos (plural)
        $signTop = $temaDewey->codigo . '.' .
            strtoupper(substr($autor->apellidos, 0, 1)) . '.' .
            strtoupper(substr($request->titulo, 0, 1));

        try {
            DB::beginTransaction();

            $libro = new Libro();
            $libro->isbn = $request->isbn;
            $libro->titulo = $request->titulo;
            $libro->contenido = $request->contenido;
            $libro->seccion_id = $request->seccion_id;
            $libro->autor_id = $request->autor_id;
            $libro->editorial_id = $request->editorial_id;
            $libro->clase = $request->clase;
            $libro->tomo = $request->tomo;
            $libro->edicion = $request->edicion;
            $libro->anio = $request->anio;
            $libro->fecha_ingreso = $request->fecha_ingreso;
            $libro->precio = $request->precio;
            $libro->idioma = $request->idioma;
            $libro->edad_recomendada = $request->edad_recomendada;
            $libro->paginas = $request->paginas;
            $libro->tema_id = $request->tema_id;
            $libro->sign_top = $signTop;
            $libro->estanteria_id = $request->estanteria_id;

            $libro->save();

            DB::commit();

            return redirect()->route('libros.index')->with('success', 'Libro creado exitosamente');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Error al crear el libro: ' . $e->getMessage())->withInput();
        }
    }

    /**
     * Mostrar detalle de un libro
     */
    public function show(Libro $libro)
    {
        $libro->load([
            'autor',
            'editorial',
            'seccion',
            'estanteria',
            'temaDewey.subcategoria.categoria'
        ]);

        return Inertia::render('Libro/Show', [
            'libro' => $libro,
            'temaDewey' => $libro->temaDewey
        ]);
    }


    /**
     * Mostrar formulario de edición
     */
    public function edit($id)
    {
        $libro = Libro::findOrFail($id);

        // Obtener el tema, subcategoría y categoría Dewey del libro
        $temaDewey = TemaDewey::find($libro->tema_id);
        $subcategoriaDewey = SubcategoriaDewey::find($temaDewey->subcategoria_id);
        $categoriaDewey = CategoriaDewey::find($subcategoriaDewey->categoria_id);

        // Obtener todas las subcategorías de esta categoría
        $subcategorias = SubcategoriaDewey::where('categoria_id', $categoriaDewey->id)->get();

        // Obtener todos los temas de esta subcategoría
        $temas = TemaDewey::where('subcategoria_id', $subcategoriaDewey->id)->get();

        // Datos para el formulario - usando apellidos (plural)
        $autores = Autor::orderBy('apellidos')->get();
        $editoriales = Editorial::orderBy('nombre')->get();
        $estanterias = Estanteria::all();
        $secciones = Seccion::all();
        $categoriasDewey = CategoriaDewey::all();

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

        return Inertia::render('Libro/Edit', [
            'libro' => $libro,
            'temaDewey' => $temaDewey,
            'subcategoriaDewey' => $subcategoriaDewey,
            'categoriaDewey' => $categoriaDewey,
            'subcategorias' => $subcategorias,
            'temas' => $temas,
            'autores' => $autores,
            'editoriales' => $editoriales,
            'estanterias' => $estanterias,
            'secciones' => $secciones,
            'categoriasDewey' => $categoriasDewey,
            'clases' => $clases,
            'idiomas' => $idiomas
        ]);
    }

    /**
     * Actualizar libro
     */
    public function update(Request $request, $id)
    {
        $libro = Libro::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'isbn' => 'required|unique:libros,isbn,' . $id,
            'titulo' => 'required|string|max:255',
            'seccion_id' => 'required|exists:secciones,id',
            'autor_id' => 'required|exists:autores,id',
            'editorial_id' => 'required|exists:editoriales,id',
            'clase' => 'required|in:' . implode(',', [
                Libro::CLASE_LIBRO,
                Libro::CLASE_CARTILLA,
                Libro::CLASE_CUENTO,
                Libro::CLASE_DICCIONARIO,
                Libro::CLASE_ENCICLOPEDIA,
                Libro::CLASE_NOVELA,
                Libro::CLASE_REVISTA,
            ]),
            'idioma' => 'required|in:' . implode(',', [
                Libro::IDIOMA_ESPANOL,
                Libro::IDIOMA_INGLES,
                Libro::IDIOMA_FRANCES,
                Libro::IDIOMA_OTRO,
            ]),
            'paginas' => 'required|integer|min:1',
            'tema_id' => 'required|exists:temas_dewey,id',
            'estanteria_id' => 'required|exists:estanterias,id',
            'tomo' => 'nullable|integer|min:1',
            'edicion' => 'nullable|string|max:50',
            'anio' => 'nullable|integer|min:1000|max:' . (date('Y') + 1),
            'fecha_ingreso' => 'required|date',
            'precio' => 'nullable|numeric|min:0',
            'edad_recomendada' => 'nullable|integer|min:1|max:100',
            'contenido' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        // Obtener datos del autor para crear la signatura topográfica - usando apellidos (plural)
        $autor = Autor::find($request->autor_id);
        $temaDewey = TemaDewey::find($request->tema_id);

        // Generar signatura topográfica - usando apellidos (plural)
        $signTop = $temaDewey->codigo . '.' .
            strtoupper(substr($autor->apellidos, 0, 1)) . '.' .
            strtoupper(substr($request->titulo, 0, 1));

        try {
            DB::beginTransaction();

            $libro->isbn = $request->isbn;
            $libro->titulo = $request->titulo;
            $libro->contenido = $request->contenido;
            $libro->seccion_id = $request->seccion_id;
            $libro->autor_id = $request->autor_id;
            $libro->editorial_id = $request->editorial_id;
            $libro->clase = $request->clase;
            $libro->tomo = $request->tomo;
            $libro->edicion = $request->edicion;
            $libro->anio = $request->anio;
            $libro->fecha_ingreso = $request->fecha_ingreso;
            $libro->precio = $request->precio;
            $libro->idioma = $request->idioma;
            $libro->edad_recomendada = $request->edad_recomendada;
            $libro->paginas = $request->paginas;
            $libro->tema_id = $request->tema_id;
            $libro->sign_top = $signTop;
            $libro->estanteria_id = $request->estanteria_id;

            $libro->save();

            DB::commit();

            return redirect()->route('libros.index')->with('success', 'Libro actualizado exitosamente');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Error al actualizar el libro: ' . $e->getMessage())->withInput();
        }
    }

    /**
     * Eliminar libro
     */
    public function destroy($id)
    {
        try {
            $libro = Libro::findOrFail($id);
            $libro->delete();

            return redirect()->route('libros.index')->with('success', 'Libro eliminado exitosamente');
        } catch (\Exception $e) {
            return redirect()->route('libros.index')->with('error', 'Error al eliminar el libro: ' . $e->getMessage());
        }
    }

    /**
     * Obtener subcategorías Dewey de una categoría mediante AJAX
     */
    public function getSubcategorias($categoriaId)
    {
        $subcategorias = SubcategoriaDewey::where('categoria_id', $categoriaId)
            ->orderBy('codigo')
            ->get();

        return response()->json($subcategorias);
    }

    /**
     * Obtener temas Dewey de una subcategoría mediante AJAX
     */
    public function getTemas($subcategoriaId)
    {
        $temas = TemaDewey::where('subcategoria_id', $subcategoriaId)
            ->orderBy('codigo')
            ->get();

        return response()->json($temas);
    }
}
