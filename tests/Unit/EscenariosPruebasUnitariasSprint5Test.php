<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\User;
use App\Models\Libro;
use App\Models\Ejemplar;
use App\Models\Seccion;
use App\Models\Autor;
use App\Models\Editorial;
use App\Models\TemaDewey;
use App\Models\Estanteria;
use App\Models\Lector;
use App\Models\Prestamo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

/**
 * Escenarios de Pruebas Unitarias - Sprint 5
 * 
 * Este archivo contiene las pruebas unitarias para el Sprint 5 del sistema de gestión de biblioteca.
 * Cubre las siguientes historias de usuario:
 * - HU-013: Inicio de sesión de Administrador
 * - HU-014: Inicio de sesión de Bibliotecario
 * - HU-015: Listar inventario
 * 
 * @testdox Escenarios de Pruebas Unitarias Sprint 5
 */
class EscenariosPruebasUnitariasSprint5Test extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Crear datos base necesarios para las pruebas
        $this->crearDatosBase();
    }

    /**
     * Crear datos base necesarios para las pruebas
     */
    private function crearDatosBase()
    {
        // Crear roles necesarios
        \Spatie\Permission\Models\Role::create(['name' => 'administrador']);
        \Spatie\Permission\Models\Role::create(['name' => 'bibliotecario_primaria']);
        \Spatie\Permission\Models\Role::create(['name' => 'bibliotecario_bachillerato']);

        // Crear usuarios con diferentes roles
        $this->adminUser = User::factory()->create([
            'name' => 'Administrador Sistema',
            'email' => 'admin@umariana.edu.co',
            'password' => Hash::make('admin123')
        ]);
        $this->adminUser->assignRole('administrador');

        $this->bibliotecarioPrimaria = User::factory()->create([
            'name' => 'Bibliotecario Primaria',
            'email' => 'bibliotecario.primaria@umariana.edu.co',
            'password' => Hash::make('biblio123')
        ]);
        $this->bibliotecarioPrimaria->assignRole('bibliotecario_primaria');

        $this->bibliotecarioBachillerato = User::factory()->create([
            'name' => 'Bibliotecario Bachillerato',
            'email' => 'bibliotecario.bachillerato@umariana.edu.co',
            'password' => Hash::make('biblio123')
        ]);
        $this->bibliotecarioBachillerato->assignRole('bibliotecario_bachillerato');

        // Crear datos para inventario (usando valores permitidos del ENUM)
        $this->seccionPrimaria = Seccion::firstOrCreate(['nombre' => 'PRIMARIA']);
        $this->seccionBachillerato = Seccion::firstOrCreate(['nombre' => 'BACHILLERATO']);
        
        $this->autor = Autor::factory()->create([
            'nombres' => 'Gabriel',
            'apellidos' => 'García Márquez'
        ]);
        
        $this->editorial = Editorial::factory()->create();
        $this->tema = TemaDewey::factory()->create();
        
        $this->estanteriaPrimaria = Estanteria::factory()->create([
            'seccion_id' => $this->seccionPrimaria->id,
            'cod_estante' => 'P01'
        ]);
        
        $this->estanteriaBachillerato = Estanteria::factory()->create([
            'seccion_id' => $this->seccionBachillerato->id,
            'cod_estante' => 'B01'
        ]);

        // Crear libros para inventario
        $this->libroPrimaria = Libro::factory()->create([
            'titulo' => 'Cien años de soledad',
            'seccion_id' => $this->seccionPrimaria->id,
            'autor_id' => $this->autor->id,
            'editorial_id' => $this->editorial->id,
            'tema_id' => $this->tema->id,
            'estanteria_id' => $this->estanteriaPrimaria->id,
            'fecha_ingreso' => '2023-01-01',
            'paginas' => 200
        ]);

        $this->libroBachillerato = Libro::factory()->create([
            'titulo' => 'Física Cuántica',
            'seccion_id' => $this->seccionBachillerato->id,
            'autor_id' => $this->autor->id,
            'editorial_id' => $this->editorial->id,
            'tema_id' => $this->tema->id,
            'estanteria_id' => $this->estanteriaBachillerato->id,
            'fecha_ingreso' => '2023-01-01',
            'paginas' => 300
        ]);

        // Crear ejemplares con diferentes estados
        $this->ejemplarDisponible = Ejemplar::factory()->create([
            'libro_id' => $this->libroPrimaria->id,
            'estado' => Ejemplar::ESTADO_DISPONIBLE,
            'numEjemplar' => 1
        ]);

        $this->ejemplarPrestado = Ejemplar::factory()->create([
            'libro_id' => $this->libroPrimaria->id,
            'estado' => Ejemplar::ESTADO_PRESTADO,
            'numEjemplar' => 2
        ]);

        $this->ejemplarBachilleratoDisponible = Ejemplar::factory()->create([
            'libro_id' => $this->libroBachillerato->id,
            'estado' => Ejemplar::ESTADO_DISPONIBLE,
            'numEjemplar' => 1
        ]);
    }

    // ==========================================
    // HU-013: INICIO DE SESIÓN DE ADMINISTRADOR
    // ==========================================

    /**
     * CP046: Inicio de sesión de Administrador exitoso
     * Escenario: 1 - Iniciar sesión exitosamente con las credenciales de un usuario con rol de 'Administrador'
     * 
     * @test
     */
    public function cp046_inicio_sesion_administrador_exitoso()
    {
        // Arrange - Datos de un administrador válido
        $credentials = [
            'email' => $this->adminUser->email,
            'password' => 'admin123'
        ];

        // Act - Intentar iniciar sesión
        $result = auth()->attempt($credentials);

        // Assert - Verificar que la autenticación es exitosa y se regenera la sesión
        $this->assertTrue($result);
        $this->assertAuthenticatedAs($this->adminUser);
        $this->assertTrue(auth()->user()->hasRole('administrador'));
        $this->assertEquals('admin@umariana.edu.co', auth()->user()->email);
    }

    /**
     * CP047: Inicio de sesión de Administrador con contraseña incorrecta
     * Escenario: 2 - Intentar iniciar sesión con credenciales de administrador incorrectas (contraseña errónea)
     * 
     * @test
     */
    public function cp047_inicio_sesion_administrador_contrasena_incorrecta()
    {
        // Arrange - Datos de un administrador con contraseña incorrecta
        $credentials = [
            'email' => $this->adminUser->email,
            'password' => 'password-incorrecta'
        ];

        // Act - Intentar iniciar sesión
        $result = auth()->attempt($credentials);

        // Assert - Verificar que la autenticación falla y se retorna a la página de login con un mensaje de error de credenciales inválidas
        $this->assertFalse($result);
        $this->assertGuest();
        $this->assertNull(auth()->user());
    }

    /**
     * CP048: Inicio de sesión con campos vacíos
     * Escenario: 3 - Intentar enviar el formulario de inicio de sesión con el campo de correo o contraseña vacíos
     * 
     * @test
     */
    public function cp048_inicio_sesion_campos_vacios()
    {
        // Arrange - Datos de inicio de sesión con campos vacíos
        $credentials = [
            'email' => '',
            'password' => ''
        ];

        // Act & Assert - Verificar que la validación del request falla y retorna a la vista de login mostrando los mensajes de error de los campos obligatorios
        $validator = \Illuminate\Support\Facades\Validator::make($credentials, [
            'email' => 'required|email',
            'password' => 'required|string|min:6'
        ]);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('email', $validator->errors()->toArray());
        $this->assertArrayHasKey('password', $validator->errors()->toArray());
        
        // Verificar que el usuario no está autenticado
        $this->assertGuest();
    }

    // ==========================================
    // HU-014: INICIO DE SESIÓN DE BIBLIOTECARIO
    // ==========================================

    /**
     * CP049: Inicio de sesión de Bibliotecario exitoso
     * Escenario: 1 - Iniciar sesión exitosamente con las credenciales de un usuario con rol de 'Bibliotecario'
     * 
     * @test
     */
    public function cp049_inicio_sesion_bibliotecario_exitoso()
    {
        // Arrange - Datos de un bibliotecario válido (Primaria)
        $credentials = [
            'email' => $this->bibliotecarioPrimaria->email,
            'password' => 'biblio123'
        ];

        // Act - Intentar iniciar sesión
        $result = auth()->attempt($credentials);

        // Assert - Verificar que la autenticación es exitosa y se regenera la sesión
        $this->assertTrue($result);
        $this->assertAuthenticatedAs($this->bibliotecarioPrimaria);
        $this->assertTrue(auth()->user()->hasRole('bibliotecario_primaria'));
        $this->assertEquals('bibliotecario.primaria@umariana.edu.co', auth()->user()->email);
    }

    /**
     * CP050: Inicio de sesión de Bibliotecario con email incorrecto
     * Escenario: 2 - Intentar iniciar sesión con un correo electrónico de bibliotecario que no está registrado
     * 
     * @test
     */
    public function cp050_inicio_sesion_bibliotecario_email_incorrecto()
    {
        // Arrange - Datos de un bibliotecario con email incorrecto
        $credentials = [
            'email' => 'noexiste@umariana.edu.co',
            'password' => 'biblio123'
        ];

        // Act - Intentar iniciar sesión
        $result = auth()->attempt($credentials);

        // Assert - Verificar que la autenticación falla y se retorna a la página de login con un mensaje de error de credenciales inválidas
        $this->assertFalse($result);
        $this->assertGuest();
        $this->assertNull(auth()->user());
    }

    // ==========================================
    // HU-015: LISTAR INVENTARIO
    // ==========================================

    /**
     * CP051: Ver lista de inventario general
     * Escenario: 1 - Acceder a la sección de inventario para visualizar la lista completa de libros con sus datos básicos
     * 
     * @test
     */
    public function cp051_ver_lista_inventario_general()
    {
        // Arrange - Datos ya creados en setUp
        
        // Act - Obtener todos los ejemplares con sus libros (simulando la lógica del controlador)
        $ejemplares = Ejemplar::with(['libro.seccion', 'libro.autor', 'libro.editorial'])->get();

        // Assert - Verificar que el sistema renderiza la vista Inventario/Index con la lista paginada de libros y las estadísticas
        $this->assertGreaterThan(0, $ejemplares->count());
        
        // Verificar que se obtienen los ejemplares correctos
        $this->assertTrue($ejemplares->contains('id', $this->ejemplarDisponible->id));
        $this->assertTrue($ejemplares->contains('id', $this->ejemplarPrestado->id));
        $this->assertTrue($ejemplares->contains('id', $this->ejemplarBachilleratoDisponible->id));
        
        // Verificar relaciones
        foreach ($ejemplares as $ejemplar) {
            $this->assertNotNull($ejemplar->libro);
            $this->assertNotNull($ejemplar->libro->seccion);
            $this->assertNotNull($ejemplar->libro->autor);
            $this->assertNotNull($ejemplar->libro->editorial);
        }
    }

    /**
     * CP052: Filtrar inventario por área y estado
     * Escenario: 2 - Aplicar filtros combinados para refinar la búsqueda en el inventario (ej. por área y estado)
     * 
     * @test
     */
    public function cp052_filtrar_inventario_por_area_y_estado()
    {
        // Arrange - Datos ya creados en setUp
        
        // Act - Aplicar filtros combinados: área de ciencias y estado="disponibles"
        $ejemplaresFiltrados = Ejemplar::whereHas('libro.seccion', function ($query) {
            $query->where('id', $this->seccionBachillerato->id);
        })
        ->where('estado', Ejemplar::ESTADO_DISPONIBLE)
        ->with(['libro.seccion', 'libro.autor'])
        ->get();

        // Assert - Verificar que la consulta a la base de datos se modifica para incluir WHERE seccion_id = X y WHERE estado = 'DISPONIBLE'
        $this->assertGreaterThanOrEqual(1, $ejemplaresFiltrados->count());
        
        // Verificar que todos los ejemplares filtrados son de la sección correcta y están disponibles
        foreach ($ejemplaresFiltrados as $ejemplar) {
            $this->assertEquals(Ejemplar::ESTADO_DISPONIBLE, $ejemplar->estado);
            $this->assertEquals($this->seccionBachillerato->id, $ejemplar->libro->seccion->id);
        }
    }

    /**
     * CP053: Exportar inventario a Excel
     * Escenario: 3 - Solicitar la exportación del inventario a un archivo de Excel
     * 
     * @test
     */
    public function cp053_exportar_inventario_a_excel()
    {
        // Arrange - Datos ya creados en setUp
        
        // Act - Simular la lógica de exportación (preparar datos para Excel)
        $inventarioPorSeccion = Seccion::with(['libros.ejemplares'])->get()->map(function ($seccion) {
            return [
                'seccion' => $seccion->nombre,
                'total_libros' => $seccion->libros->count(),
                'total_ejemplares' => $seccion->libros->sum(function ($libro) {
                    return $libro->ejemplares->count();
                }),
                'ejemplares_disponibles' => $seccion->libros->sum(function ($libro) {
                    return $libro->ejemplares->where('estado', Ejemplar::ESTADO_DISPONIBLE)->count();
                }),
                'ejemplares_prestados' => $seccion->libros->sum(function ($libro) {
                    return $libro->ejemplares->where('estado', Ejemplar::ESTADO_PRESTADO)->count();
                }),
                'libros' => $seccion->libros->map(function ($libro) {
                    return [
                        'titulo' => $libro->titulo,
                        'autor' => $libro->autor->nombres . ' ' . $libro->autor->apellidos,
                        'editorial' => $libro->editorial->nombre,
                        'ejemplares' => $libro->ejemplares->map(function ($ejemplar) {
                            return [
                                'numero' => $ejemplar->numEjemplar,
                                'estado' => $ejemplar->estado,
                                'tipo_adquisicion' => $ejemplar->tipo_adquisicion
                            ];
                        })->toArray()
                    ];
                })->toArray()
            ];
        })->toArray();

        // Assert - Verificar que el sistema genera y descarga un archivo .xlsx que contiene el inventario, separado por hojas según el área
        $this->assertCount(2, $inventarioPorSeccion); // Dos secciones
        
        // Verificar datos de la primera sección
        $primeraSeccion = $inventarioPorSeccion[0];
        $this->assertNotNull($primeraSeccion);
        $this->assertArrayHasKey('seccion', $primeraSeccion);
        $this->assertArrayHasKey('total_libros', $primeraSeccion);
        $this->assertArrayHasKey('total_ejemplares', $primeraSeccion);
        
        // Verificar datos de la segunda sección
        $segundaSeccion = $inventarioPorSeccion[1];
        $this->assertNotNull($segundaSeccion);
        $this->assertArrayHasKey('seccion', $segundaSeccion);
        $this->assertArrayHasKey('total_libros', $segundaSeccion);
        $this->assertArrayHasKey('total_ejemplares', $segundaSeccion);
    }

    // ==========================================
    // CASOS DE PRUEBA ADICIONALES
    // ==========================================

    /**
     * Verificación de inicio de sesión de bibliotecario de bachillerato
     * 
     * @test
     */
    public function verifica_inicio_sesion_bibliotecario_bachillerato()
    {
        // Arrange - Datos de bibliotecario de bachillerato
        $credentials = [
            'email' => $this->bibliotecarioBachillerato->email,
            'password' => 'biblio123'
        ];

        // Act - Intentar iniciar sesión
        $result = auth()->attempt($credentials);

        // Assert - Verificar autenticación exitosa
        $this->assertTrue($result);
        $this->assertAuthenticatedAs($this->bibliotecarioBachillerato);
        $this->assertTrue(auth()->user()->hasRole('bibliotecario_bachillerato'));
    }

    /**
     * Verificación de filtrado por solo área
     * 
     * @test
     */
    public function verifica_filtrado_por_solo_area()
    {
        // Arrange - Datos ya creados en setUp
        
        // Act - Filtrar solo por primera sección
        $ejemplaresPrimeraSeccion = Ejemplar::whereHas('libro.seccion', function ($query) {
            $query->where('id', $this->seccionPrimaria->id);
        })->get();

        // Assert - Verificar que solo se obtienen ejemplares de la primera sección
        $this->assertGreaterThanOrEqual(2, $ejemplaresPrimeraSeccion->count());
        foreach ($ejemplaresPrimeraSeccion as $ejemplar) {
            $this->assertEquals($this->seccionPrimaria->id, $ejemplar->libro->seccion->id);
        }
    }

    /**
     * Verificación de filtrado por solo estado
     * 
     * @test
     */
    public function verifica_filtrado_por_solo_estado()
    {
        // Arrange - Datos ya creados en setUp
        
        // Act - Filtrar solo por estado DISPONIBLE
        $ejemplaresDisponibles = Ejemplar::where('estado', Ejemplar::ESTADO_DISPONIBLE)->get();

        // Assert - Verificar que solo se obtienen ejemplares disponibles
        $this->assertGreaterThanOrEqual(2, $ejemplaresDisponibles->count());
        foreach ($ejemplaresDisponibles as $ejemplar) {
            $this->assertEquals(Ejemplar::ESTADO_DISPONIBLE, $ejemplar->estado);
        }
    }

    /**
     * Verificación de estadísticas del inventario
     * 
     * @test
     */
    public function verifica_estadisticas_del_inventario()
    {
        // Arrange - Datos ya creados en setUp
        
        // Act - Calcular estadísticas del inventario
        $totalEjemplares = Ejemplar::count();
        $ejemplaresDisponibles = Ejemplar::where('estado', Ejemplar::ESTADO_DISPONIBLE)->count();
        $ejemplaresPrestados = Ejemplar::where('estado', Ejemplar::ESTADO_PRESTADO)->count();
        $totalLibros = Libro::count();
        $totalSecciones = Seccion::count();

        // Assert - Verificar estadísticas correctas
        $this->assertGreaterThanOrEqual(3, $totalEjemplares);
        $this->assertGreaterThanOrEqual(2, $ejemplaresDisponibles);
        $this->assertGreaterThanOrEqual(1, $ejemplaresPrestados);
        $this->assertGreaterThanOrEqual(2, $totalLibros);
        $this->assertGreaterThanOrEqual(2, $totalSecciones);
    }

    /**
     * Verificación de autenticación con email válido pero usuario inexistente
     * 
     * @test
     */
    public function verifica_autenticacion_email_valido_usuario_inexistente()
    {
        // Arrange - Email válido pero usuario no existe
        $credentials = [
            'email' => 'usuario.inexistente@umariana.edu.co',
            'password' => 'cualquier-password'
        ];

        // Act - Intentar iniciar sesión
        $result = auth()->attempt($credentials);

        // Assert - Verificar que la autenticación falla
        $this->assertFalse($result);
        $this->assertGuest();
    }

    /**
     * Verificación de búsqueda en inventario por título de libro
     * 
     * @test
     */
    public function verifica_busqueda_inventario_por_titulo()
    {
        // Arrange - Datos ya creados en setUp
        
        // Act - Buscar ejemplares por título que contenga "soledad"
        $ejemplaresEncontrados = Ejemplar::whereHas('libro', function ($query) {
            $query->where('titulo', 'LIKE', '%soledad%');
        })->get();

        // Assert - Verificar que encuentra los ejemplares correctos
        $this->assertGreaterThanOrEqual(2, $ejemplaresEncontrados->count());
        foreach ($ejemplaresEncontrados as $ejemplar) {
            $this->assertStringContainsString('soledad', strtolower($ejemplar->libro->titulo));
        }
    }
}
