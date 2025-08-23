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
use App\Models\Ejemplar;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class LibroController extends Controller
{
    /**
     * Buscar libro por término de búsqueda para préstamos
     */
    public function search(Request $request)
    {
        $search = $request->input('search');

        // Si no hay término de búsqueda, devolver el formulario con un mensaje flash
        if (!$search) {
            return Inertia::render('Prestamos/Index', [
                'flash' => [
                    'error' => 'Término de búsqueda requerido'
                ]
            ]);
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

        // Si no se encuentra el libro, devolver el formulario con un mensaje flash
        if (!$libro) {
            return Inertia::render('Prestamos/Index', [
                'flash' => [
                    'error' => 'Libro no encontrado'
                ]
            ]);
        }

        // Buscar los ejemplares disponibles de este libro
        $ejemplares = Ejemplar::where('libro_id', $libro->id)
            ->get();

        return Inertia::render('Prestamos/Index', [
            'libro' => $libro,
            'ejemplares' => $ejemplares,
        ]);
    }

    public function index(Request $request)
    {
        // Validación de parámetros de paginación (igual que AutorController)
        $page = max(1, (int) $request->input('page', 1));
        $perPage = 15; // Valor fijo de 20 elementos por página

        // Query base con relaciones necesarias
        $query = Libro::with(['autor', 'editorial', 'seccion', 'temaDewey', 'estanteria'])
            ->select(['libros.*', 
                     \DB::raw("(SELECT COUNT(*) FROM ejemplares WHERE ejemplares.libro_id = libros.id AND ejemplares.estado = 'DISPONIBLE') as ejemplares_count")]);    

        // Aplicar filtros en el backend (mucho más eficiente)
        if ($request->filled('search')) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('titulo', 'like', '%' . $searchTerm . '%')
                  ->orWhere('isbn', 'like', '%' . $searchTerm . '%')
                  ->orWhereHas('autor', function($authorQuery) use ($searchTerm) {
                      $authorQuery->where('nombres', 'like', '%' . $searchTerm . '%')
                                  ->orWhere('apellidos', 'like', '%' . $searchTerm . '%');
                  });
            });
        }

        if ($request->filled('clase')) {
            $query->where('clase', $request->clase);
        }

        if ($request->filled('idioma')) {
            $query->where('idioma', $request->idioma);
        }

        if ($request->filled('estanteria')) {
            $query->where('estanteria_id', $request->estanteria);
        }

        // Paginación optimizada con parámetros explícitos (igual que AutorController)
        $libros = $query->orderBy('id')
                       ->paginate($perPage, ['*'], 'page', $page)
                       ->withQueryString(); // Mantiene los filtros en la URL

        // Redirigir si la página solicitada no existe pero hay resultados (igual que AutorController)
        if ($page > $libros->lastPage() && $libros->lastPage() > 0) {
            return redirect()->route('libros.index', 
                array_merge($request->query(), ['page' => $libros->lastPage()])
            );
        }

        // Datos para filtros (solo los necesarios)
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

        // Solo cargar datos de filtros cuando son necesarios
        $autores = Autor::select(['id', 'nombres', 'apellidos'])
                        ->orderBy('apellidos')
                        ->get();
                        
        $estanterias = Estanteria::select(['id', 'cod_estante'])
                                ->orderBy('cod_estante')
                                ->get();
                                
        $secciones = Seccion::select(['id', 'nombre'])
                           ->orderBy('nombre')
                           ->get();
                           
        $categoriasDewey = CategoriaDewey::select(['id', 'nombre', 'codigo'])
                                       ->orderBy('codigo')
                                       ->get();

        return Inertia::render('Libro/index', [
            'libros' => $libros, // Objeto paginado de Laravel
            'clases' => $clases,
            'idiomas' => $idiomas,
            'autores' => $autores,
            'estanterias' => $estanterias,
            'secciones' => $secciones,
            'categoriasDewey' => $categoriasDewey,
            'filters' => $request->only(['search', 'clase', 'idioma', 'estanteria']),
            // Datos de paginación adicionales (igual que AutorController)
            'pagination' => [
                'current_page' => $libros->currentPage(),
                'last_page' => $libros->lastPage(),
                'per_page' => $libros->perPage(),
                'total' => $libros->total(),
                'from' => $libros->firstItem(),
                'to' => $libros->lastItem(),
                'has_pages' => $libros->hasPages(),
            ],
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
        // Log para debugging
        Log::info('Datos recibidos para crear libro:', $request->all());

        if ($request->has('estanteria_id') && $request->estanteria_id === '') {
            $request->merge(['estanteria_id' => null]);
        }
        
        // Debug adicional
        Log::info('Después de procesar estanteria_id:', [
            'estanteria_id' => $request->estanteria_id,
            'type' => gettype($request->estanteria_id)
        ]);

        $validator = Validator::make($request->all(), [
            'estanteria_id' => 'nullable|exists:estanterias,id',
            'isbn' => 'required|string|unique:libros,isbn',
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
            'paginas' => 'nullable|integer|min:1',
            'tema_id' => 'required|exists:temas_dewey,id',
            // CORREGIDO: nullable debe ir antes de exists
            'estanteria_id' => 'nullable|exists:estanterias,id',
            'tomo' => 'nullable|integer|min:1',
            'edicion' => 'nullable|string|max:50',
            'anio' => 'nullable|integer|min:1000|max:' . (date('Y') + 1),
            'fecha_ingreso' => 'required|date|before_or_equal:today',
            'precio' => 'nullable|numeric|min:0',
            'edad_recomendada' => 'nullable|integer|min:0|max:100',
            'contenido' => 'nullable|string',
        ], [
            // Mensajes personalizados de error
            'isbn.required' => 'El ISBN es obligatorio.',
            'isbn.unique' => 'Este ISBN ya está registrado en el sistema.',
            'titulo.required' => 'El título es obligatorio.',
            'seccion_id.required' => 'Debe seleccionar una sección.',
            'seccion_id.exists' => 'La sección seleccionada no es válida.',
            'autor_id.required' => 'Debe seleccionar un autor.',
            'autor_id.exists' => 'El autor seleccionado no es válido.',
            'editorial_id.required' => 'Debe seleccionar una editorial.',
            'editorial_id.exists' => 'La editorial seleccionada no es válida.',
            'clase.required' => 'Debe seleccionar una clase.',
            'clase.in' => 'La clase seleccionada no es válida.',
            'idioma.required' => 'Debe seleccionar un idioma.',
            'idioma.in' => 'El idioma seleccionado no es válido.',
            'paginas.integer' => 'El número de páginas debe ser un número entero.',
            'paginas.min' => 'El número de páginas debe ser mayor a 0.',
            'tema_id.required' => 'Debe seleccionar un tema Dewey.',
            'tema_id.exists' => 'El tema Dewey seleccionado no es válido.',
            'estanteria_id.exists' => 'La estantería seleccionada no es válida.',
            'fecha_ingreso.required' => 'La fecha de ingreso es obligatoria.',
            'fecha_ingreso.date' => 'La fecha de ingreso debe ser una fecha válida.',
            'fecha_ingreso.before_or_equal' => 'La fecha de ingreso no puede ser futura.',
            'precio.numeric' => 'El precio debe ser un número válido.',
            'precio.min' => 'El precio no puede ser negativo.',
            'edad_recomendada.integer' => 'La edad recomendada debe ser un número entero.',
            'edad_recomendada.min' => 'La edad recomendada no puede ser negativa.',
            'edad_recomendada.max' => 'La edad recomendada no puede ser mayor a 100 años.',
            'anio.integer' => 'El año debe ser un número entero.',
            'anio.min' => 'El año debe ser mayor a 1000.',
            'anio.max' => 'El año no puede ser mayor al año actual.',
        ]);

        if ($validator->fails()) {
            Log::warning('Errores de validación al crear libro:', $validator->errors()->toArray());
            return redirect()->back()
                ->withErrors($validator)
                ->withInput()
                ->with('error', 'Por favor, corrija los errores en el formulario.');
        }

        try {
            DB::beginTransaction();

            // Obtener datos del autor para crear la signatura topográfica
            $autor = Autor::find($request->autor_id);
            $temaDewey = TemaDewey::find($request->tema_id);

            if (!$autor || !$temaDewey) {
                throw new \Exception('No se encontraron los datos del autor o tema Dewey.');
            }

            // Generar signatura topográfica
            $signTop = $temaDewey->codigo . '.' .
                strtoupper(substr($autor->apellidos, 0, 1)) . '.' .
                strtoupper(substr($request->titulo, 0, 1));

            // Crear el libro
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
            $libro->paginas = $request->paginas ?: 1;
            $libro->tema_id = $request->tema_id;
            $libro->sign_top = $signTop;
            
            // NUEVA LÓGICA: Manejo mejorado de estantería
            $libro->estanteria_id = $request->estanteria_id; // Ya es null si no se proporcionó

            $libro->save();

            // **NUEVO: Crear ejemplar automáticamente después de crear el libro**
            $ejemplar = new Ejemplar();
            $ejemplar->libro_id = $libro->id;
            $ejemplar->numEjemplar = 1; // Primer ejemplar siempre es número 1
            $ejemplar->tipo_adquisicion = 'COMPRA'; // Valor por defecto
            $ejemplar->estado = 'DISPONIBLE'; // Valor por defecto
            $ejemplar->observaciones = 'Ejemplar creado automáticamente al registrar el libro';
            $ejemplar->save();

            DB::commit();

            Log::info('Libro y ejemplar creados exitosamente:', [
                'libro_id' => $libro->id, 
                'titulo' => $libro->titulo,
                'ejemplar_id' => $ejemplar->id
            ]);

            return redirect()->route('libros.index')
                ->with('success', 'El libro "' . $libro->titulo . '" ha sido registrado correctamente con su primer ejemplar.');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al crear libro:', [
                'error' => $e->getMessage(),
                'request_data' => $request->all()
            ]);
            
            return redirect()->back()
                ->with('error', 'Error al crear el libro: ' . $e->getMessage())
                ->withInput();
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
        ])->loadCount([
            'ejemplares as ejemplares_count' => function ($query) {
                $query->where('estado', Ejemplar::ESTADO_DISPONIBLE);
            }
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
        $libro = Libro::with([
            'temaDewey.subcategoria.categoria',
            'autor',
            'editorial',
            'seccion',
            'estanteria'
        ])->findOrFail($id);

        // Datos para el formulario - usando apellidos (plural)
        $autores = Autor::orderBy('apellidos')->get();
        $editoriales = Editorial::orderBy('nombre')->get();
        $estanterias = Estanteria::all();
        $secciones = Seccion::all();
        $categoriasDewey = CategoriaDewey::orderBy('codigo')->get();

        // Inicializar variables para la cascada Dewey
        $subcategoriasDewey = [];
        $temasDewey = [];

        // Si el libro tiene tema_dewey, cargar subcategorías y temas relacionados
        if ($libro->temaDewey && $libro->temaDewey->subcategoria) {
            // Cargar todas las subcategorías de la categoría actual
            $subcategoriasDewey = SubcategoriaDewey::where('categoria_id', $libro->temaDewey->subcategoria->categoria_id)
                ->orderBy('codigo')
                ->get();
            
            // Cargar todos los temas de la subcategoría actual
            $temasDewey = TemaDewey::where('subcategoria_id', $libro->temaDewey->subcategoria_id)
                ->orderBy('codigo')
                ->get();
        }

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
            'autores' => $autores,
            'editoriales' => $editoriales,
            'estanterias' => $estanterias,
            'secciones' => $secciones,
            'categoriasDewey' => $categoriasDewey,
            'subcategoriasDewey' => $subcategoriasDewey,
            'temasDewey' => $temasDewey,
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

        // Log para debugging
        Log::info('Datos recibidos para actualizar libro:', $request->all());

        // NUEVA LÓGICA: Procesar estanteria_id antes de la validación
        if ($request->has('estanteria_id') && $request->estanteria_id === '') {
            $request->merge(['estanteria_id' => null]);
        }

        $validator = Validator::make($request->all(), [
            'isbn' => 'required|string|unique:libros,isbn,' . $id,
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
            'paginas' => 'nullable|integer|min:1',
            'tema_id' => 'required|exists:temas_dewey,id',
            // CORREGIDO: nullable debe ir antes de exists
            'estanteria_id' => 'nullable|exists:estanterias,id',
            'tomo' => 'nullable|integer|min:1',
            'edicion' => 'nullable|string|max:50',
            'anio' => 'nullable|integer|min:1000|max:' . (date('Y') + 1),
            'fecha_ingreso' => 'required|date|before_or_equal:today',
            'precio' => 'nullable|numeric|min:0',
            'edad_recomendada' => 'nullable|integer|min:0|max:100',
            'contenido' => 'nullable|string',
        ], [
            // Mensajes personalizados de error (mismo que store)
            'isbn.required' => 'El ISBN es obligatorio.',
            'isbn.unique' => 'Este ISBN ya está registrado en el sistema.',
            'titulo.required' => 'El título es obligatorio.',
            'seccion_id.required' => 'Debe seleccionar una sección.',
            'seccion_id.exists' => 'La sección seleccionada no es válida.',
            'autor_id.required' => 'Debe seleccionar un autor.',
            'autor_id.exists' => 'El autor seleccionado no es válido.',
            'editorial_id.required' => 'Debe seleccionar una editorial.',
            'editorial_id.exists' => 'La editorial seleccionada no es válida.',
            'clase.required' => 'Debe seleccionar una clase.',
            'clase.in' => 'La clase seleccionada no es válida.',
            'idioma.required' => 'Debe seleccionar un idioma.',
            'idioma.in' => 'El idioma seleccionado no es válido.',
            'paginas.integer' => 'El número de páginas debe ser un número entero.',
            'paginas.min' => 'El número de páginas debe ser mayor a 0.',
            'tema_id.required' => 'Debe seleccionar un tema Dewey.',
            'tema_id.exists' => 'El tema Dewey seleccionado no es válido.',
            'estanteria_id.exists' => 'La estantería seleccionada no es válida.',
            'fecha_ingreso.required' => 'La fecha de ingreso es obligatoria.',
            'fecha_ingreso.date' => 'La fecha de ingreso debe ser una fecha válida.',
            'fecha_ingreso.before_or_equal' => 'La fecha de ingreso no puede ser futura.',
            'precio.numeric' => 'El precio debe ser un número válido.',
            'precio.min' => 'El precio no puede ser negativo.',
            'edad_recomendada.integer' => 'La edad recomendada debe ser un número entero.',
            'edad_recomendada.min' => 'La edad recomendada no puede ser negativa.',
            'edad_recomendada.max' => 'La edad recomendada no puede ser mayor a 100 años.',
        ]);

        if ($validator->fails()) {
            Log::warning('Errores de validación al actualizar libro:', $validator->errors()->toArray());
            return redirect()->back()
                ->withErrors($validator)
                ->withInput()
                ->with('error', 'Por favor, corrija los errores en el formulario.');
        }

        try {
            DB::beginTransaction();

            // Obtener datos del autor y tema para regenerar la signatura topográfica
            $autor = Autor::find($request->autor_id);
            $temaDewey = TemaDewey::find($request->tema_id);

            if (!$autor || !$temaDewey) {
                throw new \Exception('No se encontraron los datos del autor o tema Dewey.');
            }

            // Regenerar signatura topográfica con los nuevos datos
            $signTop = $temaDewey->codigo . '.' .
                strtoupper(substr($autor->apellidos, 0, 1)) . '.' .
                strtoupper(substr($request->titulo, 0, 1));

            // Preparar datos para actualización
            $updateData = [
                'isbn' => $request->isbn,
                'titulo' => $request->titulo,
                'contenido' => $request->contenido,
                'seccion_id' => $request->seccion_id,
                'autor_id' => $request->autor_id,
                'editorial_id' => $request->editorial_id,
                'clase' => $request->clase,
                'tomo' => $request->tomo,
                'edicion' => $request->edicion,
                'anio' => $request->anio,
                'fecha_ingreso' => $request->fecha_ingreso,
                'precio' => $request->precio,
                'idioma' => $request->idioma,
                'edad_recomendada' => $request->edad_recomendada,
                'paginas' => $request->paginas ?: 1,
                'tema_id' => $request->tema_id,
                'sign_top' => $signTop,
                // NUEVA LÓGICA: Manejo simplificado de estantería
                'estanteria_id' => $request->estanteria_id, // Ya es null si no se proporcionó
            ];

            // Actualizar todos los campos del libro
            $libro->update($updateData);

            DB::commit();

            Log::info('Libro actualizado exitosamente:', ['libro_id' => $libro->id, 'titulo' => $libro->titulo]);

            // Redirigir con mensaje de éxito
            return redirect()->route('libros.index')
                ->with('success', 'El libro "' . $libro->titulo . '" ha sido modificado correctamente.');

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Error al actualizar libro:', [
                'error' => $e->getMessage(),
                'libro_id' => $id,
                'request_data' => $request->all()
            ]);
            
            return redirect()->back()
                ->withInput()
                ->with('error', 'Error al actualizar el libro: ' . $e->getMessage());
        }
    }

    /**
     * Obtener subcategorías Dewey de una categoría mediante AJAX
     */
    public function getSubcategorias($categoriaId)
    {
        try {
            $subcategorias = SubcategoriaDewey::where('categoria_id', $categoriaId)
                ->orderBy('codigo')
                ->get();

            return response()->json($subcategorias);
        } catch (\Exception $e) {
            Log::error('Error al obtener subcategorías:', ['error' => $e->getMessage(), 'categoria_id' => $categoriaId]);
            return response()->json(['error' => 'Error al cargar subcategorías'], 500);
        }
    }

    /**
     * Obtener temas Dewey de una subcategoría mediante AJAX
     */
    public function getTemas($subcategoriaId)
    {
        try {
            $temas = TemaDewey::where('subcategoria_id', $subcategoriaId)
                ->orderBy('codigo')
                ->get();

            return response()->json($temas);
        } catch (\Exception $e) {
            Log::error('Error al obtener temas:', ['error' => $e->getMessage(), 'subcategoria_id' => $subcategoriaId]);
            return response()->json(['error' => 'Error al cargar temas'], 500);
        }
    }
}