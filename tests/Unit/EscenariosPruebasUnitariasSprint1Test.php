<?php

namespace Tests\Unit;

use App\Models\Libro;
use App\Models\Autor;
use App\Models\Editorial;
use App\Models\Seccion;
use App\Models\TemaDewey;
use App\Models\Grado;
use App\Models\Estanteria;
use App\Models\Ejemplar;
use App\Models\Lector;
use App\Models\Prestamo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Database\QueryException;
use Tests\TestCase;

/**
 * Escenarios de Pruebas Unitarias - Sprint 1
 * 
 * Este archivo contiene los casos de prueba para las historias de usuario del Sprint 1:
 * HU-001: Registro de nuevos libros
 * HU-002: Registro de préstamos
 * HU-003: Registro de devoluciones
 */
class EscenariosPruebasUnitariasSprint1Test extends TestCase
{
    use RefreshDatabase;

    // ==========================================
    // HU-001: REGISTRO DE NUEVOS LIBROS
    // ==========================================

    /**
     * CP001: Registro exitoso de libro
     * Escenario: 1 - Registro exitoso con todos los campos válidos
     * 
     * @test
     */
    public function cp001_registro_exitoso_de_libro_con_datos_validos()
    {
        // Arrange - Preparar datos válidos y completos
        $seccion = Seccion::create(['nombre' => 'PRIMARIA']);
        $autor = Autor::factory()->create();
        $editorial = Editorial::factory()->create();
        $tema = TemaDewey::factory()->create();
        $estanteria = Estanteria::factory()->create(['seccion_id' => $seccion->id]);

        $datosValidos = [
            'codigo_unico' => '978-84-376-0494-7',
            'titulo' => 'Cien años de soledad',
            'contenido' => 'Descripción del libro',
            'seccion_id' => $seccion->id,
            'autor_id' => $autor->id,
            'editorial_id' => $editorial->id,
            'area' => Libro::AREA_HUMANIDADES,
            'clase' => Libro::CLASE_LIBRO,
            'tomo' => 1,
            'edicion' => '1ra',
            'anio' => 1967,
            'fecha_ingreso' => '2023-01-01',
            'precio' => 29.99,
            'idioma' => Libro::IDIOMA_ESPANOL,
            'edad_recomendada' => '12',
            'paginas' => 471,
            'tema_id' => $tema->id,
            'sign_top' => 'GAR',
            'estanteria_id' => $estanteria->id
        ];

        // Act - Crear el libro
        $libro = Libro::create($datosValidos);

        // Assert - Verificar que el sistema crea el Libro correctamente
        $this->assertDatabaseHas('libros', [
            'codigo_unico' => '978-84-376-0494-7',
            'titulo' => 'Cien años de soledad',
            'seccion_id' => $seccion->id,
            'autor_id' => $autor->id,
            'editorial_id' => $editorial->id,
            'area' => Libro::AREA_HUMANIDADES,
            'clase' => Libro::CLASE_LIBRO,
            'tomo' => 1,
            'edicion' => '1ra',
            'anio' => 1967,
            'precio' => 29.99,
            'idioma' => Libro::IDIOMA_ESPANOL,
            'edad_recomendada' => '12',
            'paginas' => 471,
            'tema_id' => $tema->id,
            'sign_top' => 'GAR',
            'estanteria_id' => $estanteria->id
        ]);

        $this->assertNotNull($libro->id);
        $this->assertEquals('978-84-376-0494-7', $libro->codigo_unico);
        $this->assertEquals('Cien años de soledad', $libro->titulo);
    }

    /**
     * CP002: Registro con campos obligatorios vacíos
     * Escenario: 2 - Intentar registrar libro sin campos obligatorios
     * 
     * @test
     */
    public function cp002_registro_con_campos_obligatorios_vacios()
    {
        // Arrange - Preparar datos con campos obligatorios vacíos
        $datosInvalidos = [
            'titulo' => '', // Campo obligatorio vacío
            'autor_id' => null, // Campo obligatorio nulo
            'codigo_unico' => '978-84-376-0494-7',
            'clase' => Libro::CLASE_LIBRO,
            'idioma' => Libro::IDIOMA_ESPANOL,
            'fecha_ingreso' => '2023-01-01' // Campo requerido por la BD
        ];

        // Act & Assert - Verificar que el sistema rechaza la petición y retorna al formulario mostrando errores de validación para los campos faltantes
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Registro no realizado por la falta de campos');
        
        $libro = new Libro($datosInvalidos);
        $libro->save();
    }

    /**
     * CP003: Registro con ISBN duplicado
     * Escenario: 3 - Intentar registrar libro con ISBN existente
     * 
     * @test
     */
    public function cp003_registro_con_isbn_duplicado()
    {
        // Arrange - Crear un libro existente
        $seccion = Seccion::create(['nombre' => 'PRIMARIA']);
        $autor = Autor::factory()->create();
        $editorial = Editorial::factory()->create();
        
        $libroExistente = Libro::factory()->create([
            'codigo_unico' => '978-84-376-0494-7',
            'titulo' => 'Libro Existente',
            'seccion_id' => $seccion->id,
            'autor_id' => $autor->id,
            'editorial_id' => $editorial->id,
            'fecha_ingreso' => '2023-01-01'
        ]);

        // Preparar datos con ISBN duplicado
        $datosDuplicados = [
            'codigo_unico' => '978-84-376-0494-7', // ISBN existente
            'titulo' => 'Nuevo Libro',
            'seccion_id' => $seccion->id,
            'autor_id' => $autor->id,
            'editorial_id' => $editorial->id,
            'clase' => Libro::CLASE_LIBRO,
            'idioma' => Libro::IDIOMA_ESPANOL,
            'fecha_ingreso' => '2023-01-01'
        ];

        // Act & Assert - Verificar que el sistema rechaza la petición y muestra un error de validación indicando que el código único ya está registrado
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('El código único ya está registrado');
        
        $libroNuevo = new Libro($datosDuplicados);
        $libroNuevo->save();
    }

    /**
     * CP004: Registro con formato de ISBN incorrecto
     * Escenario: 4 - Intentar registrar libro con formato ISBN incorrecto
     * 
     * @test
     */
    public function cp004_registro_con_formato_isbn_incorrecto()
    {
        // Arrange - Preparar datos con formato ISBN incorrecto
        $seccion = Seccion::create(['nombre' => 'PRIMARIA']);
        $autor = Autor::factory()->create();
        $editorial = Editorial::factory()->create();

        $datosConIsbnIncorrecto = [
            'codigo_unico' => '978-ABC-123', // Formato incorrecto con letras
            'titulo' => 'Libro con ISBN Incorrecto',
            'seccion_id' => $seccion->id,
            'autor_id' => $autor->id,
            'editorial_id' => $editorial->id,
            'clase' => Libro::CLASE_LIBRO,
            'idioma' => Libro::IDIOMA_ESPANOL,
            'fecha_ingreso' => '2023-01-01'
        ];

        // Act & Assert - Verificar que el sistema rechaza la petición y muestra un error de validación sobre el formato del ISBN
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('El formato del ISBN es incorrecto');
        
        $libro = new Libro($datosConIsbnIncorrecto);
        $libro->save();
    }

    // ==========================================
    // HU-002: REGISTRO DE PRÉSTAMOS
    // ==========================================

    /**
     * CP005: Registro exitoso de préstamo
     * Escenario: 1 - Registrar préstamo exitoso a lector activo con ejemplar disponible
     * 
     * @test
     */
    public function cp005_registro_exitoso_de_prestamo()
    {
        // Arrange - Preparar ejemplar disponible y lector activo
        $seccion = Seccion::create(['nombre' => 'PRIMARIA']);
        $libro = Libro::factory()->create(['seccion_id' => $seccion->id]);
        $ejemplar = Ejemplar::factory()->create([
            'libro_id' => $libro->id,
            'estado' => Ejemplar::ESTADO_DISPONIBLE
        ]);
        $lector = Lector::factory()->create(['estado' => Lector::ESTADO_ACTIVO]);

        $datosPrestamo = [
            'ejemplar_id' => $ejemplar->id,
            'lector_id' => $lector->id,
            'fecha_prestamo' => '2023-01-01',
            'fecha_devolucion' => '2023-01-15',
            'estado' => Prestamo::ESTADO_ACTIVO
        ];

        // Act - Crear el préstamo
        $prestamo = Prestamo::create($datosPrestamo);

        // Assert - Verificar que el sistema crea un registro en prestamos, actualiza el estado del ejemplar a 'PRESTADO' y muestra mensaje de éxito
        $this->assertDatabaseHas('prestamos', [
            'ejemplar_id' => $ejemplar->id,
            'lector_id' => $lector->id,
            'fecha_prestamo' => '2023-01-01',
            'fecha_devolucion' => '2023-01-15',
            'estado' => Prestamo::ESTADO_ACTIVO
        ]);

        // Verificar que el ejemplar cambió a estado PRESTADO
        $this->assertEquals(Ejemplar::ESTADO_PRESTADO, $ejemplar->fresh()->estado);
        
        $this->assertNotNull($prestamo->id);
    }

    /**
     * CP006: Registro con datos faltantes
     * Escenario: 2 - Intentar registrar préstamo sin ejemplar_id o lector_id
     * 
     * @test
     */
    public function cp006_registro_con_datos_faltantes()
    {
        // Arrange - Preparar datos con campos obligatorios faltantes
        $datosIncompletos = [
            'ejemplar_id' => null, // Campo obligatorio nulo
            'lector_id' => null,  // Campo obligatorio nulo
            'fecha_prestamo' => '2023-01-01',
            'fecha_devolucion' => '2023-01-15',
            'estado' => Prestamo::ESTADO_ACTIVO
        ];

        // Act & Assert - Verificar que el sistema muestra errores de validación indicando que los campos son requeridos
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Los campos son requeridos');
        
        $prestamo = new Prestamo($datosIncompletos);
        $prestamo->save();
    }

    /**
     * CP007: Registro con ejemplar inexistente
     * Escenario: 3 - Intentar registrar préstamo para ejemplar que no existe
     * 
     * @test
     */
    public function cp007_registro_con_ejemplar_inexistente()
    {
        // Arrange - Preparar datos con ejemplar_id inexistente
        $lector = Lector::factory()->create(['estado' => Lector::ESTADO_ACTIVO]);
        
        $datosConEjemplarInexistente = [
            'ejemplar_id' => 9999, // ID inexistente
            'lector_id' => $lector->id,
            'fecha_prestamo' => '2023-01-01',
            'fecha_devolucion' => '2023-01-15',
            'estado' => Prestamo::ESTADO_ACTIVO
        ];

        // Act & Assert - Verificar que el sistema muestra un error de validación indicando que el ejemplar no existe
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('El ejemplar no existe');
        
        $prestamo = new Prestamo($datosConEjemplarInexistente);
        $prestamo->save();
    }

    /**
     * CP008: Registro con lector inexistente o inactivo
     * Escenario: 4 - Intentar registrar préstamo a lector inexistente o inactivo
     * 
     * @test
     */
    public function cp008_registro_con_lector_inexistente_o_inactivo()
    {
        // Arrange - Preparar ejemplar disponible
        $seccion = Seccion::create(['nombre' => 'PRIMARIA']);
        $libro = Libro::factory()->create(['seccion_id' => $seccion->id]);
        $ejemplar = Ejemplar::factory()->create([
            'libro_id' => $libro->id,
            'estado' => Ejemplar::ESTADO_DISPONIBLE
        ]);

        $datosConLectorInexistente = [
            'ejemplar_id' => $ejemplar->id,
            'lector_id' => 9999, // ID inexistente
            'fecha_prestamo' => '2023-01-01',
            'fecha_devolucion' => '2023-01-15',
            'estado' => Prestamo::ESTADO_ACTIVO
        ];

        // Act & Assert - Verificar que el sistema muestra un error de validación indicando que el lector no existe
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('El lector no existe');
        
        $prestamo = new Prestamo($datosConLectorInexistente);
        $prestamo->save();
    }

    /**
     * CP009: Registro con ejemplar no disponible
     * Escenario: 5 - Intentar prestar ejemplar que no está disponible
     * 
     * @test
     */
    public function cp009_registro_con_ejemplar_no_disponible()
    {
        // Arrange - Preparar ejemplar no disponible
        $seccion = Seccion::create(['nombre' => 'PRIMARIA']);
        $libro = Libro::factory()->create(['seccion_id' => $seccion->id]);
        $ejemplar = Ejemplar::factory()->create([
            'libro_id' => $libro->id,
            'estado' => Ejemplar::ESTADO_PRESTADO // Estado no disponible
        ]);
        $lector = Lector::factory()->create(['estado' => Lector::ESTADO_ACTIVO]);

        $datosConEjemplarNoDisponible = [
            'ejemplar_id' => $ejemplar->id,
            'lector_id' => $lector->id,
            'fecha_prestamo' => '2023-01-01',
            'fecha_devolucion' => '2023-01-15',
            'estado' => Prestamo::ESTADO_ACTIVO
        ];

        // Act & Assert - Verificar que el sistema rechaza la operación y muestra un mensaje de error: "El ejemplar no está disponible para préstamo"
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('El ejemplar no está disponible para préstamo');
        
        $prestamo = new Prestamo($datosConEjemplarNoDisponible);
        $prestamo->save();
    }

    // ==========================================
    // HU-003: REGISTRO DE DEVOLUCIONES
    // ==========================================

    /**
     * CP010: Registro exitoso de devolución
     * Escenario: 1 - Registrar devolución exitosa de préstamo activo o vencido
     * 
     * @test
     */
    public function cp010_registro_exitoso_de_devolucion()
    {
        // Arrange - Preparar préstamo activo
        $seccion = Seccion::create(['nombre' => 'PRIMARIA']);
        $libro = Libro::factory()->create(['seccion_id' => $seccion->id]);
        $ejemplar = Ejemplar::factory()->create([
            'libro_id' => $libro->id,
            'estado' => Ejemplar::ESTADO_DISPONIBLE
        ]);
        $lector = Lector::factory()->create(['estado' => Lector::ESTADO_ACTIVO]);
        
        // Crear préstamo usando factory para evitar el observer
        $prestamo = Prestamo::factory()->create([
            'ejemplar_id' => $ejemplar->id,
            'lector_id' => $lector->id,
            'estado' => Prestamo::ESTADO_ACTIVO,
            'fecha_prestamo' => '2023-01-01',
            'fecha_devolucion' => '2023-01-15'
        ]);

        // Marcar manualmente el ejemplar como prestado
        $ejemplar->marcarComoPrestado();

        // Act - Marcar como devuelto
        $prestamo->marcarComoDevuelto();

        // Assert - Verificar que el sistema actualiza el estado del prestamo a 'DEVUELTO', actualiza el estado del ejemplar a 'DISPONIBLE' y muestra mensaje de éxito
        $this->assertDatabaseHas('prestamos', [
            'id' => $prestamo->id,
            'estado' => Prestamo::ESTADO_DEVUELTO,
            'fecha_devuelto' => now()->format('Y-m-d')
        ]);

        // Verificar que el ejemplar cambió a estado DISPONIBLE
        $this->assertEquals(Ejemplar::ESTADO_DISPONIBLE, $ejemplar->fresh()->estado);
        
        $this->assertTrue($prestamo->fresh()->estaDevuelto());
    }

    /**
     * CP011: Verificación de fecha de devolución
     * Escenario: 2 - Verificar que el sistema almacena correctamente la fecha de devolución
     * 
     * @test
     */
    public function cp011_verificacion_de_fecha_de_devolucion()
    {
        // Arrange - Preparar préstamo activo
        $seccion = Seccion::create(['nombre' => 'PRIMARIA']);
        $libro = Libro::factory()->create(['seccion_id' => $seccion->id]);
        $ejemplar = Ejemplar::factory()->create([
            'libro_id' => $libro->id,
            'estado' => Ejemplar::ESTADO_DISPONIBLE
        ]);
        $lector = Lector::factory()->create(['estado' => Lector::ESTADO_ACTIVO]);
        
        // Crear préstamo usando factory para evitar el observer
        $prestamo = Prestamo::factory()->create([
            'ejemplar_id' => $ejemplar->id,
            'lector_id' => $lector->id,
            'estado' => Prestamo::ESTADO_ACTIVO,
            'fecha_prestamo' => '2023-01-01',
            'fecha_devolucion' => '2023-01-15'
        ]);

        // Marcar manualmente el ejemplar como prestado
        $ejemplar->marcarComoPrestado();

        $fechaActual = now()->format('Y-m-d');

        // Act - Marcar como devuelto
        $prestamo->marcarComoDevuelto();

        // Assert - Verificar que el campo fecha devuelto en la tabla prestamos se guarda con el valor actual
        $prestamoActualizado = $prestamo->fresh();
        $this->assertEquals($fechaActual, $prestamoActualizado->fecha_devuelto);
        $this->assertNotNull($prestamoActualizado->fecha_devuelto);
    }

    /**
     * CP012: Devolución de préstamo ya devuelto
     * Escenario: 3 - Intentar registrar devolución de préstamo ya devuelto
     * 
     * @test
     */
    public function cp012_devolucion_de_prestamo_ya_devuelto()
    {
        // Arrange - Preparar préstamo ya devuelto
        $seccion = Seccion::create(['nombre' => 'PRIMARIA']);
        $libro = Libro::factory()->create(['seccion_id' => $seccion->id]);
        $ejemplar = Ejemplar::factory()->create([
            'libro_id' => $libro->id,
            'estado' => Ejemplar::ESTADO_DISPONIBLE
        ]);
        $lector = Lector::factory()->create(['estado' => Lector::ESTADO_ACTIVO]);
        
        $prestamo = Prestamo::factory()->create([
            'ejemplar_id' => $ejemplar->id,
            'lector_id' => $lector->id,
            'estado' => Prestamo::ESTADO_DEVUELTO, // Ya devuelto
            'fecha_prestamo' => '2023-01-01',
            'fecha_devolucion' => '2023-01-15',
            'fecha_devuelto' => '2023-01-10'
        ]);

        // Act & Assert - Verificar que el sistema rechaza la operación y muestra un mensaje de error: "Este préstamo ya ha sido devuelto"
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Este préstamo ya ha sido devuelto');
        
        $prestamo->marcarComoDevuelto();
    }

    // ==========================================
    // CASOS DE PRUEBA ADICIONALES
    // ==========================================

    /**
     * Verificación de creación automática de ejemplar al registrar libro
     * 
     * @test
     */
    public function verifica_creacion_automatica_de_ejemplar_al_registrar_libro()
    {
        // Arrange - Preparar datos válidos para libro
        $seccion = Seccion::create(['nombre' => 'PRIMARIA']);
        $autor = Autor::factory()->create();
        $editorial = Editorial::factory()->create();
        $tema = TemaDewey::factory()->create();
        $estanteria = Estanteria::factory()->create(['seccion_id' => $seccion->id]);

        $datosLibro = [
            'codigo_unico' => '978-84-376-0494-8',
            'titulo' => 'Libro con Ejemplar Automático',
            'seccion_id' => $seccion->id,
            'autor_id' => $autor->id,
            'editorial_id' => $editorial->id,
            'clase' => Libro::CLASE_LIBRO,
            'idioma' => Libro::IDIOMA_ESPANOL,
            'tema_id' => $tema->id,
            'estanteria_id' => $estanteria->id,
            'fecha_ingreso' => '2023-01-01',
            'paginas' => 100
        ];

        // Act - Crear el libro
        $libro = Libro::create($datosLibro);

        // Assert - Verificar que se crea automáticamente un ejemplar
        $ejemplares = $libro->ejemplares;
        $this->assertCount(1, $ejemplares);
        
        $ejemplar = $ejemplares->first();
        $this->assertEquals($libro->id, $ejemplar->libro_id);
        $this->assertEquals(Ejemplar::ESTADO_DISPONIBLE, $ejemplar->estado);
    }

    /**
     * Verificación de validación de formato ISBN con longitud incorrecta
     * 
     * @test
     */
    public function verifica_validacion_isbn_con_longitud_incorrecta()
    {
        // Arrange - Preparar datos con ISBN de longitud incorrecta
        $seccion = Seccion::create(['nombre' => 'PRIMARIA']);
        $autor = Autor::factory()->create();
        $editorial = Editorial::factory()->create();
        $tema = TemaDewey::factory()->create();
        $estanteria = Estanteria::factory()->create();

        $datosConIsbnLongitudIncorrecta = [
            'codigo_unico' => '978-84', // Longitud incorrecta (menos de 10 caracteres)
            'titulo' => 'Libro con ISBN Corto',
            'seccion_id' => $seccion->id,
            'autor_id' => $autor->id,
            'editorial_id' => $editorial->id,
            'clase' => Libro::CLASE_LIBRO,
            'idioma' => Libro::IDIOMA_ESPANOL,
            'tema_id' => $tema->id, // Usar tema creado
            'estanteria_id' => $estanteria->id, // Usar estantería creada
            'fecha_ingreso' => '2023-01-01',
            'paginas' => 100 // Agregar páginas requerido
        ];

        // Act & Assert - Verificar que el sistema rechaza el ISBN de longitud incorrecta
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('El formato del ISBN es incorrecto');
        
        $libro = new Libro($datosConIsbnLongitudIncorrecta);
        $libro->save();
    }

    /**
     * Verificación de cambio de estado de ejemplar al realizar préstamo
     * 
     * @test
     */
    public function verifica_cambio_estado_ejemplar_al_realizar_prestamo()
    {
        // Arrange - Preparar ejemplar disponible
        $seccion = Seccion::create(['nombre' => 'PRIMARIA']);
        $libro = Libro::factory()->create(['seccion_id' => $seccion->id]);
        $ejemplar = Ejemplar::factory()->create([
            'libro_id' => $libro->id,
            'estado' => Ejemplar::ESTADO_DISPONIBLE
        ]);
        $lector = Lector::factory()->create(['estado' => Lector::ESTADO_ACTIVO]);

        // Verificar estado inicial
        $this->assertEquals(Ejemplar::ESTADO_DISPONIBLE, $ejemplar->estado);

        // Act - Crear préstamo
        $prestamo = Prestamo::create([
            'ejemplar_id' => $ejemplar->id,
            'lector_id' => $lector->id,
            'fecha_prestamo' => '2023-01-01',
            'fecha_devolucion' => '2023-01-15',
            'estado' => Prestamo::ESTADO_ACTIVO
        ]);

        // Assert - Verificar cambio de estado
        $ejemplarActualizado = $ejemplar->fresh();
        $this->assertEquals(Ejemplar::ESTADO_PRESTADO, $ejemplarActualizado->estado);
    }
}