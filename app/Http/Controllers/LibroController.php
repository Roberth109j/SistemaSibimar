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
                $query->where('codigo_unico', 'like', "%{$search}%")
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
        // Validación de parámetros de paginación
        $page = max(1, (int) $request->input('page', 1));
        $perPage = 15; // Valor fijo de 15 elementos por página

        // Query base con relaciones necesarias
        $query = Libro::with(['autor', 'editorial', 'seccion', 'temaDewey', 'estanteria'])
            ->select([
                'libros.*',
                DB::raw("(SELECT COUNT(*) FROM ejemplares WHERE ejemplares.libro_id = libros.id AND ejemplares.estado = 'DISPONIBLE') as ejemplares_count")
            ]);

        // Filtrar por sección según el rol del usuario
        $user = $request->user();
        $seccionId = null;

        if ($user->hasRole('BibliotecarioPrimaria')) {
            $seccion = Seccion::where('nombre', 'PRIMARIA')->first();
            $seccionId = $seccion ? $seccion->id : null;
            if ($seccionId) {
                $query->where('seccion_id', $seccionId);
            }
        } elseif ($user->hasRole('BibliotecarioBachillerato')) {
            $seccion = Seccion::where('nombre', 'BACHILLERATO')->first();
            $seccionId = $seccion ? $seccion->id : null;
            if ($seccionId) {
                $query->where('seccion_id', $seccionId);
            }
        }

        // ✅ BÚSQUEDA MEJORADA - APLICAR FILTROS
        if ($request->filled('search')) {
            $searchTerm = trim($request->search);

            // Sanitizar el término de búsqueda
            $searchTerm = preg_replace('/\s+/', ' ', $searchTerm);

            $query->where(function ($q) use ($searchTerm) {
                // 1. Búsqueda en TÍTULO (completo, todas las palabras)
                $q->where('titulo', 'LIKE', '%' . $searchTerm . '%')

                    // 2. Búsqueda en CÓDIGO ÚNICO (ISBN/ISSN)
                    ->orWhere('codigo_unico', 'LIKE', '%' . $searchTerm . '%')

                    // 3. Búsqueda INTELIGENTE en AUTOR
                    ->orWhereHas('autor', function ($authorQuery) use ($searchTerm) {
                        $authorQuery->where(function ($aq) use ($searchTerm) {
                            $aq->where('nombres', 'LIKE', '%' . $searchTerm . '%')
                                ->orWhere('apellidos', 'LIKE', '%' . $searchTerm . '%')
                                ->orWhereRaw("CONCAT(nombres, ' ', apellidos) LIKE ?", ['%' . $searchTerm . '%'])
                                ->orWhereRaw("CONCAT(apellidos, ' ', nombres) LIKE ?", ['%' . $searchTerm . '%'])
                                ->orWhereRaw("CONCAT(apellidos, ', ', nombres) LIKE ?", ['%' . $searchTerm . '%']);
                        });
                    })

                    // 4. Búsqueda en EDITORIAL
                    ->orWhereHas('editorial', function ($editorialQuery) use ($searchTerm) {
                        $editorialQuery->where('nombre', 'LIKE', '%' . $searchTerm . '%');
                    })

                    // 5. Búsqueda en CONTENIDO
                    ->orWhere('contenido', 'LIKE', '%' . $searchTerm . '%')

                    // 6. Búsqueda en ÁREA
                    ->orWhere('area', 'LIKE', '%' . $searchTerm . '%')

                    // 7. Búsqueda en SIGNATURA TOPOGRÁFICA
                    ->orWhere('sign_top', 'LIKE', '%' . $searchTerm . '%');
            });
        }

        if ($request->filled('clase')) {
            $query->where('clase', $request->clase);
        }

        if ($request->filled('area')) {
            $query->where('area', $request->area);
        }

        if ($request->filled('idioma')) {
            $query->where('idioma', $request->idioma);
        }

        if ($request->filled('estanteria')) {
            $query->where('estanteria_id', $request->estanteria);
        }

        // Paginación optimizada con parámetros explícitos
        $libros = $query->orderBy('id')
            ->paginate($perPage, ['*'], 'page', $page)
            ->withQueryString();

        // Redirigir si la página solicitada no existe pero hay resultados
        if ($page > $libros->lastPage() && $libros->lastPage() > 0) {
            return redirect()->route(
                'libros.index',
                array_merge($request->query(), ['page' => $libros->lastPage()])
            );
        }

        // Datos para filtros
        $clases = [
            Libro::CLASE_LIBRO,
            Libro::CLASE_REVISTA,
        ];

        $areas = [
            Libro::AREA_CIENCIAS,
            Libro::AREA_MATEMATICAS,
            Libro::AREA_HUMANIDADES,
            Libro::AREA_IDIOMAS,
            Libro::AREA_TECNOLOGIA,
            Libro::AREA_OTRAS,
        ];

        $idiomas = [
            Libro::IDIOMA_ESPANOL,
            Libro::IDIOMA_INGLES,
            Libro::IDIOMA_FRANCES,
            Libro::IDIOMA_OTRO,
        ];

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
            'libros' => $libros,
            'clases' => $clases,
            'areas' => $areas,
            'idiomas' => $idiomas,
            'autores' => $autores,
            'estanterias' => $estanterias,
            'secciones' => $secciones,
            'categoriasDewey' => $categoriasDewey,
            'seccionId' => $seccionId,
            'filters' => $request->only(['search', 'clase', 'area', 'idioma', 'estanteria']),
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
        // Obtener el usuario autenticado
        $user = request()->user();
        $seccionId = null;

        // Asignar sección según el rol del usuario
        if ($user->hasRole('BibliotecarioPrimaria')) {
            $seccion = Seccion::where('nombre', 'PRIMARIA')->first();
            $seccionId = $seccion ? $seccion->id : null;
        } elseif ($user->hasRole('BibliotecarioBachillerato')) {
            $seccion = Seccion::where('nombre', 'BACHILLERATO')->first();
            $seccionId = $seccion ? $seccion->id : null;
        }

        $autores = Autor::orderBy('apellidos')->get();
        $editoriales = Editorial::orderBy('nombre')->get();

        // Filtrar estanterías según la sección del usuario
        $estanterias = $seccionId
            ? Estanteria::where('seccion_id', $seccionId)->get()
            : Estanteria::all();

        $secciones = Seccion::all();
        $categoriasDewey = CategoriaDewey::all();

        $clases = [
            Libro::CLASE_LIBRO,
            Libro::CLASE_REVISTA,
        ];

        $areas = [
            Libro::AREA_CIENCIAS,
            Libro::AREA_MATEMATICAS,
            Libro::AREA_HUMANIDADES,
            Libro::AREA_IDIOMAS,
            Libro::AREA_TECNOLOGIA,
            Libro::AREA_OTRAS,
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
            'areas' => $areas, // Nuevo campo
            'idiomas' => $idiomas,
            'seccionId' => $seccionId
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

        // Validar que la sección corresponda al rol del usuario
        $user = request()->user();
        $seccionId = null;

        if ($user->hasRole('BibliotecarioPrimaria')) {
            $seccion = Seccion::where('nombre', 'PRIMARIA')->first();
            $seccionId = $seccion ? $seccion->id : null;

            if ($seccionId && $request->seccion_id != $seccionId) {
                return redirect()->back()->withErrors(['seccion_id' => 'Como bibliotecario de primaria, solo puede crear libros para la sección PRIMARIA.']);
            }
        } elseif ($user->hasRole('BibliotecarioBachillerato')) {
            $seccion = Seccion::where('nombre', 'BACHILLERATO')->first();
            $seccionId = $seccion ? $seccion->id : null;

            if ($seccionId && $request->seccion_id != $seccionId) {
                return redirect()->back()->withErrors(['seccion_id' => 'Como bibliotecario de bachillerato, solo puede crear libros para la sección BACHILLERATO.']);
            }
        }

        // Determinar la regla de validación para código_unico según la clase
        $codigoRule = 'required|string|unique:libros,codigo_unico';
        if ($request->clase === Libro::CLASE_LIBRO) {
            $codigoRule .= '|regex:/^\d{13}$/'; // ISBN 13 dígitos
        } elseif ($request->clase === Libro::CLASE_REVISTA) {
            $codigoRule .= '|regex:/^\d{8}$/'; // ISSN 8 dígitos
        }

        $validator = Validator::make($request->all(), [
            'estanteria_id' => 'nullable|exists:estanterias,id',
            'codigo_unico' => $codigoRule,
            'titulo' => 'required|string|max:255',
            'seccion_id' => 'required|exists:secciones,id',
            'autor_id' => 'required|exists:autores,id',
            'editorial_id' => 'required|exists:editoriales,id',
            'area' => 'required|in:' . implode(',', [
                Libro::AREA_CIENCIAS,
                Libro::AREA_MATEMATICAS,
                Libro::AREA_HUMANIDADES,
                Libro::AREA_IDIOMAS,
                Libro::AREA_TECNOLOGIA,
                Libro::AREA_OTRAS,
            ]),
            'clase' => 'required|in:' . implode(',', [
                Libro::CLASE_LIBRO,
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
            'tomo' => 'nullable|integer|min:1',
            'edicion' => 'nullable|string|max:50',
            'anio' => 'nullable|integer|min:1000|max:' . (date('Y') + 1),
            'fecha_ingreso' => 'required|date|before_or_equal:today',
            'precio' => 'nullable|numeric|min:0',
            'edad_recomendada' => 'nullable|integer|min:0|max:100',
            'contenido' => 'nullable|string',
        ], [
            // Mensajes personalizados de error
            'codigo_unico.required' => 'El código único es obligatorio.',
            'codigo_unico.unique' => 'Este código único ya está registrado en el sistema.',
            'codigo_unico.regex' => $request->clase === Libro::CLASE_LIBRO ?
                'El ISBN debe tener exactamente 13 dígitos.' :
                'El ISSN debe tener exactamente 8 dígitos.',
            'titulo.required' => 'El título es obligatorio.',
            'seccion_id.required' => 'Debe seleccionar una sección.',
            'seccion_id.exists' => 'La sección seleccionada no es válida.',
            'autor_id.required' => 'Debe seleccionar un autor.',
            'autor_id.exists' => 'El autor seleccionado no es válido.',
            'editorial_id.required' => 'Debe seleccionar una editorial.',
            'editorial_id.exists' => 'La editorial seleccionada no es válida.',
            'area.required' => 'Debe seleccionar un área.',
            'area.in' => 'El área seleccionada no es válida.',
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

            // Crear el libro SIN signatura topográfica primero
            $libro = new Libro();
            $libro->codigo_unico = $request->codigo_unico;
            $libro->titulo = $request->titulo;
            $libro->contenido = $request->contenido;
            $libro->seccion_id = $request->seccion_id;
            $libro->autor_id = $request->autor_id;
            $libro->editorial_id = $request->editorial_id;
            $libro->area = $request->area;
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
            $libro->estanteria_id = $request->estanteria_id;

            // MANEJAR SIGNATURA SEGÚN EL MODO
            if ($request->signatura_automatica) {
                // Modo automático: generar signatura
                $libro->save(); // Guardar primero para tener el ID
                
                $signaturaController = new \App\Http\Controllers\SignaturaTopograficaController();
                $signaturaController->generarYGuardarSignatura(
                    $libro->id,
                    $request->autor_id,
                    $request->tema_id,
                    $request->titulo
                );
                
                Log::info('Signatura generada automáticamente al crear libro:', [
                    'libro_id' => $libro->id,
                    'signatura' => $libro->fresh()->sign_top
                ]);
            } else {
                // Modo manual: usar la signatura proporcionada por el usuario
                $libro->sign_top = $request->sign_top;
                $libro->save();
                
                Log::info('Signatura ingresada manualmente al crear libro:', [
                    'libro_id' => $libro->id,
                    'signatura' => $request->sign_top
                ]);
            }

            DB::commit();

            Log::info('Libro creado exitosamente:', [
                'libro_id' => $libro->id,
                'titulo' => $libro->titulo,
                'modo_signatura' => $request->signatura_automatica ? 'automático' : 'manual'
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

        // Validar que el usuario tenga permiso para editar este libro según su sección
        if (request()->user()->hasRole('BibliotecarioPrimaria') && $libro->seccion_id != 1) {
            return redirect()->route('libros.index')
                ->with('error', 'Como Bibliotecario de Primaria, solo puede editar libros de la sección de Primaria.');
        }

        if (request()->user()->hasRole('BibliotecarioBachillerato') && $libro->seccion_id != 2) {
            return redirect()->route('libros.index')
                ->with('error', 'Como Bibliotecario de Bachillerato, solo puede editar libros de la sección de Bachillerato.');
        }

        // Obtener el usuario autenticado para filtrar estanterías
        $user = request()->user();
        $userSeccionId = null;

        // Determinar la sección del usuario
        if ($user->hasRole('BibliotecarioPrimaria')) {
            $seccion = Seccion::where('nombre', 'PRIMARIA')->first();
            $userSeccionId = $seccion ? $seccion->id : null;
        } elseif ($user->hasRole('BibliotecarioBachillerato')) {
            $seccion = Seccion::where('nombre', 'BACHILLERATO')->first();
            $userSeccionId = $seccion ? $seccion->id : null;
        }

        // Datos para el formulario
        $autores = Autor::orderBy('apellidos')->get();
        $editoriales = Editorial::orderBy('nombre')->get();

        // Filtrar estanterías según la sección del usuario
        $estanterias = $userSeccionId
            ? Estanteria::where('seccion_id', $userSeccionId)->get()
            : Estanteria::all();

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
            Libro::CLASE_REVISTA,
        ];

        $areas = [
            Libro::AREA_CIENCIAS,
            Libro::AREA_MATEMATICAS,
            Libro::AREA_HUMANIDADES,
            Libro::AREA_IDIOMAS,
            Libro::AREA_TECNOLOGIA,
            Libro::AREA_OTRAS,
        ];

        $idiomas = [
            Libro::IDIOMA_ESPANOL,
            Libro::IDIOMA_INGLES,
            Libro::IDIOMA_FRANCES,
            Libro::IDIOMA_OTRO,
        ];

        // Determinar la sección según el rol del usuario para la interfaz
        $seccionId = null;
        if (request()->user()->hasRole('BibliotecarioPrimaria')) {
            $seccionId = 1; // ID de la sección Primaria
        } elseif (request()->user()->hasRole('BibliotecarioBachillerato')) {
            $seccionId = 2; // ID de la sección Bachillerato
        }

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
            'areas' => $areas, // Nuevo campo
            'idiomas' => $idiomas,
            'seccionId' => $seccionId
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

        // Procesar estanteria_id antes de la validación
        if ($request->has('estanteria_id') && $request->estanteria_id === '') {
            $request->merge(['estanteria_id' => null]);
        }

        // Validar que la sección coincida con el rol del usuario
        if (request()->user()->hasRole('BibliotecarioPrimaria') && $request->seccion_id != 1) {
            return redirect()->back()
                ->with('error', 'Como Bibliotecario de Primaria, solo puede editar libros de la sección de Primaria.')
                ->withInput();
        }

        if (request()->user()->hasRole('BibliotecarioBachillerato') && $request->seccion_id != 2) {
            return redirect()->back()
                ->with('error', 'Como Bibliotecario de Bachillerato, solo puede editar libros de la sección de Bachillerato.')
                ->withInput();
        }

        // Determinar la regla de validación para código_unico según la clase
        $codigoRule = 'required|string|unique:libros,codigo_unico,' . $id;
        if ($request->clase === Libro::CLASE_LIBRO) {
            $codigoRule .= '|regex:/^\d{13}$/';
        } elseif ($request->clase === Libro::CLASE_REVISTA) {
            $codigoRule .= '|regex:/^\d{8}$/';
        }

        // Regla de validación para signatura según el modo
        $signaturaRule = $request->signatura_automatica ? 'nullable|string|max:50' : 'required|string|max:50';

        $validator = Validator::make($request->all(), [
            'codigo_unico' => $codigoRule,
            'titulo' => 'required|string|max:255',
            'seccion_id' => 'required|exists:secciones,id',
            'autor_id' => 'required|exists:autores,id',
            'editorial_id' => 'required|exists:editoriales,id',
            'area' => 'required|in:' . implode(',', [
                Libro::AREA_CIENCIAS,
                Libro::AREA_MATEMATICAS,
                Libro::AREA_HUMANIDADES,
                Libro::AREA_IDIOMAS,
                Libro::AREA_TECNOLOGIA,
                Libro::AREA_OTRAS,
            ]),
            'clase' => 'required|in:' . implode(',', [
                Libro::CLASE_LIBRO,
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
            'estanteria_id' => 'nullable|exists:estanterias,id',
            'tomo' => 'nullable|integer|min:1',
            'edicion' => 'nullable|string|max:50',
            'anio' => 'nullable|integer|min:1000|max:' . (date('Y') + 1),
            'fecha_ingreso' => 'required|date|before_or_equal:today',
            'precio' => 'nullable|numeric|min:0',
            'edad_recomendada' => 'nullable|integer|min:0|max:100',
            'contenido' => 'nullable|string',
            'signatura_automatica' => 'required|boolean',
            'sign_top' => $request->signatura_automatica ? 'nullable|string|max:50' : 'required|string|max:50',
], [
        ], [
            'codigo_unico.required' => 'El código único es obligatorio.',
            'codigo_unico.unique' => 'Este código único ya está registrado en el sistema.',
            'codigo_unico.regex' => $request->clase === Libro::CLASE_LIBRO ?
                'El ISBN debe tener exactamente 13 dígitos.' :
                'El ISSN debe tener exactamente 8 dígitos.',
            'titulo.required' => 'El título es obligatorio.',
            'seccion_id.required' => 'Debe seleccionar una sección.',
            'seccion_id.exists' => 'La sección seleccionada no es válida.',
            'autor_id.required' => 'Debe seleccionar un autor.',
            'autor_id.exists' => 'El autor seleccionado no es válido.',
            'editorial_id.required' => 'Debe seleccionar una editorial.',
            'editorial_id.exists' => 'La editorial seleccionada no es válida.',
            'area.required' => 'Debe seleccionar un área.',
            'area.in' => 'El área seleccionada no es válida.',
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
            'sign_top.required' => 'La signatura topográfica es obligatoria en modo manual.',
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

            // Preparar datos para actualización
            $updateData = [
                'codigo_unico' => $request->codigo_unico,
                'titulo' => $request->titulo,
                'contenido' => $request->contenido,
                'seccion_id' => $request->seccion_id,
                'autor_id' => $request->autor_id,
                'editorial_id' => $request->editorial_id,
                'area' => $request->area,
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
                'estanteria_id' => $request->estanteria_id,
            ];

            // Manejar signatura topográfica según el modo ANTES de actualizar
            if ($request->signatura_automatica) {
                // Modo automático: regenerar signatura
                $signaturaController = new \App\Http\Controllers\SignaturaTopograficaController();
                $signaturaGenerada = $signaturaController->actualizarSignatura(
                    $libro->id,
                    $request->autor_id,
                    $request->tema_id,
                    $request->titulo
                );
                
                // Agregar la signatura generada a los datos de actualización
                $updateData['sign_top'] = $signaturaGenerada;
                
                Log::info('Signatura regenerada automáticamente:', [
                    'libro_id' => $libro->id,
                    'signatura' => $signaturaGenerada
                ]);
            } else {
                // Modo manual: usar la signatura proporcionada por el usuario
                $updateData['sign_top'] = $request->sign_top;
                
                Log::info('Signatura actualizada manualmente:', [
                    'libro_id' => $libro->id,
                    'signatura' => $request->sign_top
                ]);
            }

            // Actualizar todos los campos del libro incluyendo la signatura
            $libro->update($updateData);

            DB::commit();

            Log::info('Libro actualizado exitosamente:', [
                'libro_id' => $libro->id,
                'titulo' => $libro->titulo,
                'modo_signatura' => $request->signatura_automatica ? 'automático' : 'manual'
            ]);

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
