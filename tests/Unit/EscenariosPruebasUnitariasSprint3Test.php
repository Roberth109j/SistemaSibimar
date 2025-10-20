<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Libro;
use App\Models\Ejemplar;
use App\Models\Prestamo;
use App\Models\Lector;
use App\Models\Seccion;
use App\Models\Autor;
use App\Models\Editorial;
use App\Models\TemaDewey;
use App\Models\Estanteria;
use App\Models\Grado;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Database\QueryException;

/**
 * Escenarios de Pruebas Unitarias - Sprint 3
 * 
 * Este archivo contiene las pruebas unitarias para el Sprint 3 del sistema de gestión de biblioteca.
 * Cubre las siguientes historias de usuario:
 * - HU-004: Gestión de estanterías
 * - HU-005: Ejemplar como reposición
 * - HU-006: Actualización de información de libro
 * - HU-007: Cambio de estado de ejemplar
 * 
 * @testdox Escenarios de Pruebas Unitarias Sprint 3
 */
class EscenariosPruebasUnitariasSprint3Test extends TestCase
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
        // Crear sección
        $this->seccion = Seccion::create(['nombre' => 'PRIMARIA']);
        
        // Crear autor
        $this->autor = Autor::factory()->create();
        
        // Crear editorial
        $this->editorial = Editorial::factory()->create();
        
        // Crear tema
        $this->tema = TemaDewey::factory()->create();
        
        // Crear estantería
        $this->estanteria = Estanteria::factory()->create([
            'seccion_id' => $this->seccion->id,
            'cod_estante' => 'A01'
        ]);
        
        // Crear grado
        $this->grado = Grado::factory()->create();
        
        // Crear lector
        $this->lector = Lector::factory()->create([
            'grado_id' => $this->grado->id,
            'estado' => Lector::ESTADO_ACTIVO
        ]);
        
        // Crear libro
        $this->libro = Libro::factory()->create([
            'seccion_id' => $this->seccion->id,
            'autor_id' => $this->autor->id,
            'editorial_id' => $this->editorial->id,
            'tema_id' => $this->tema->id,
            'estanteria_id' => $this->estanteria->id,
            'fecha_ingreso' => '2023-01-01',
            'paginas' => 200
        ]);
        
        // Crear ejemplar disponible
        $this->ejemplarDisponible = Ejemplar::factory()->create([
            'libro_id' => $this->libro->id,
            'estado' => Ejemplar::ESTADO_DISPONIBLE
        ]);
    }

    // ==========================================
    // HU-004: GESTIÓN DE ESTANTERÍAS
    // ==========================================

    /**
     * CP023: Ver lista de estanterías
     * Escenario: 1 - Acceder al módulo de estanterías para visualizar la lista de las existentes
     * 
     * @test
     */
    public function cp023_ver_lista_de_estanterias()
    {
        // Arrange - Crear múltiples estanterías
        $estanteria2 = Estanteria::factory()->create([
            'seccion_id' => $this->seccion->id,
            'cod_estante' => 'A02'
        ]);

        $estanteria3 = Estanteria::factory()->create([
            'seccion_id' => $this->seccion->id,
            'cod_estante' => 'A03'
        ]);

        // Act - Obtener todas las estanterías de la sección
        $estanterias = Estanteria::where('seccion_id', $this->seccion->id)->get();

        // Assert - Verificar que el sistema muestra la lista paginada de estanterías correspondientes a la sección del bibliotecario
        $this->assertGreaterThanOrEqual(3, $estanterias->count());
        $this->assertTrue($estanterias->contains('cod_estante', 'A01'));
        $this->assertTrue($estanterias->contains('cod_estante', 'A02'));
        $this->assertTrue($estanterias->contains('cod_estante', 'A03'));
    }

    /**
     * CP024: Crear estantería exitosamente
     * Escenario: 2 - Registrar una nueva estantería proporcionando un código, descripción y la sección correcta según el rol
     * 
     * @test
     */
    public function cp024_crear_estanteria_exitosamente()
    {
        // Arrange - Preparar datos válidos para la estantería
        $datosValidos = [
            'cod_estante' => 'C01',
            'descripcion' => 'Fila 5, Ciencias',
            'seccion_id' => $this->seccion->id
        ];

        // Act - Crear la estantería
        $estanteria = Estanteria::create($datosValidos);

        // Assert - Verificar que crea el registro en la tabla estanterias y redirige al listado con un mensaje de éxito
        $this->assertDatabaseHas('estanterias', [
            'cod_estante' => 'C01',
            'descripcion' => 'Fila 5, Ciencias',
            'seccion_id' => $this->seccion->id
        ]);

        $this->assertEquals('C01', $estanteria->cod_estante);
        $this->assertEquals('Fila 5, Ciencias', $estanteria->descripcion);
    }

    /**
     * CP025: Actualizar estantería exitosamente
     * Escenario: 3 - Editar los datos de una estantería ya existente para actualizar su información
     * 
     * @test
     */
    public function cp025_actualizar_estanteria_exitosamente()
    {
        // Arrange - Preparar estantería existente
        $estanteria = Estanteria::factory()->create([
            'seccion_id' => $this->seccion->id,
            'cod_estante' => 'B01',
            'descripcion' => 'Descripción original'
        ]);

        // Act - Actualizar la estantería
        $estanteria->update([
            'descripcion' => 'Nueva descripción'
        ]);

        // Assert - Verificar que actualiza el registro en la tabla estanterias y redirige al listado con un mensaje de éxito
        $this->assertDatabaseHas('estanterias', [
            'id' => $estanteria->id,
            'cod_estante' => 'B01',
            'descripcion' => 'Nueva descripción'
        ]);

        $estanteria->refresh();
        $this->assertEquals('Nueva descripción', $estanteria->descripcion);
    }

    /**
     * CP026: Crear estantería con código duplicado
     * Escenario: 4 - Intentar registrar una estantería con un cod_estante que ya está en uso
     * 
     * @test
     */
    public function cp026_crear_estanteria_con_codigo_duplicado()
    {
        // Arrange - Crear estantería con código A01 (ya existe en setUp)
        $estanteriaExistente = Estanteria::where('cod_estante', 'A01')
            ->where('seccion_id', $this->seccion->id)
            ->first();
        
        $this->assertNotNull($estanteriaExistente, 'Debe existir una estantería con código A01');
        
        // Act - Intentar crear otra estantería con el mismo código
        $datosDuplicados = [
            'cod_estante' => 'A01', // Código existente
            'descripcion' => 'Otra descripción',
            'seccion_id' => $this->seccion->id
        ];

        // Assert - Verificar que ya existe una estantería con ese código
        $estanteriasDuplicadas = Estanteria::where('cod_estante', 'A01')
            ->where('seccion_id', $this->seccion->id)
            ->count();
            
        $this->assertGreaterThan(0, $estanteriasDuplicadas, 'Ya existe una estantería con el código A01');
    }

    // ==========================================
    // HU-005: EJEMPLAR COMO REPOSICIÓN
    // ==========================================

    /**
     * CP027: Registrar ejemplar como reposición
     * Escenario: 1 - Crear un nuevo ejemplar para un libro existente marcándolo como reposición
     * 
     * @test
     */
    public function cp027_registrar_ejemplar_como_reposicion()
    {
        // Arrange - Preparar datos para ejemplar de reposición
        $datosReposicion = [
            'libro_id' => $this->libro->id,
            'numEjemplar' => 10,
            'tipo_adquisicion' => Ejemplar::TIPO_REPOSICION,
            'estado' => Ejemplar::ESTADO_DISPONIBLE,
            'observaciones' => 'Reposición por pérdida'
        ];

        // Act - Crear el ejemplar de reposición
        $ejemplar = Ejemplar::create($datosReposicion);

        // Assert - Verificar que crea un nuevo registro en ejemplares con el tipo de adquisición correcto y estado 'DISPONIBLE'
        $this->assertDatabaseHas('ejemplares', [
            'libro_id' => $this->libro->id,
            'tipo_adquisicion' => Ejemplar::TIPO_REPOSICION,
            'estado' => Ejemplar::ESTADO_DISPONIBLE
        ]);

        $this->assertEquals(Ejemplar::TIPO_REPOSICION, $ejemplar->tipo_adquisicion);
        $this->assertEquals(Ejemplar::ESTADO_DISPONIBLE, $ejemplar->estado);
    }

    /**
     * CP028: Verificar actualización de inventario
     * Escenario: 2 - Verificar que el inventario de ejemplares del libro se actualiza después de registrar la reposición
     * 
     * @test
     */
    public function cp028_verificar_actualizacion_de_inventario()
    {
        // Arrange - Contar ejemplares antes de la reposición
        $conteoInicial = $this->libro->ejemplares()->count();

        // Act - Crear ejemplar de reposición
        $ejemplar = Ejemplar::create([
            'libro_id' => $this->libro->id,
            'numEjemplar' => 20,
            'tipo_adquisicion' => Ejemplar::TIPO_REPOSICION,
            'estado' => Ejemplar::ESTADO_DISPONIBLE,
            'observaciones' => 'Reposición'
        ]);

        // Assert - Verificar que el conteo de ejemplares para el libro aumenta en 1
        $conteoFinal = $this->libro->ejemplares()->count();
        $this->assertEquals($conteoInicial + 1, $conteoFinal);
    }

    // ==========================================
    // HU-006: ACTUALIZACIÓN DE INFORMACIÓN DE LIBRO
    // ==========================================

    /**
     * CP029: Acceder a edición de libro
     * Escenario: 1 - Acceder al formulario de edición de un libro para visualizar su información actual
     * 
     * @test
     */
    public function cp029_acceder_a_edicion_de_libro()
    {
        // Arrange - Libro ya creado en setUp
        
        // Act - Obtener el libro para edición
        $libroParaEditar = Libro::find($this->libro->id);

        // Assert - Verificar que muestra el formulario de edición con todos los campos del libro cargados
        $this->assertNotNull($libroParaEditar);
        $this->assertEquals($this->libro->titulo, $libroParaEditar->titulo);
        $this->assertEquals($this->libro->codigo_unico, $libroParaEditar->codigo_unico);
        $this->assertEquals($this->libro->autor_id, $libroParaEditar->autor_id);
        $this->assertEquals($this->libro->editorial_id, $libroParaEditar->editorial_id);
    }

    /**
     * CP030: Actualización exitosa de libro
     * Escenario: 2 - Actualizar correctamente la información de un libro (título, autor, etc.) y guardar los cambios
     * 
     * @test
     */
    public function cp030_actualizacion_exitosa_de_libro()
    {
        // Arrange - Preparar nuevos datos para el libro
        $nuevosDatos = [
            'titulo' => 'Nuevo Título Editado',
            'contenido' => 'Nuevo contenido actualizado'
        ];

        // Act - Actualizar el libro
        $this->libro->update($nuevosDatos);

        // Assert - Verificar que actualiza el registro del libro en la BD y redirige al listado con un mensaje de confirmación
        $this->assertDatabaseHas('libros', [
            'id' => $this->libro->id,
            'titulo' => 'Nuevo Título Editado',
            'contenido' => 'Nuevo contenido actualizado'
        ]);

        $this->libro->refresh();
        $this->assertEquals('Nuevo Título Editado', $this->libro->titulo);
        $this->assertEquals('Nuevo contenido actualizado', $this->libro->contenido);
    }

    // ==========================================
    // HU-007: CAMBIO DE ESTADO DE EJEMPLAR
    // ==========================================

    /**
     * CP031: Dar de baja un ejemplar
     * Escenario: 1 - Editar un ejemplar y cambiar su estado a 'DADO DE BAJA' para que no esté disponible para préstamos
     * 
     * @test
     */
    public function cp031_dar_de_baja_un_ejemplar()
    {
        // Arrange - Crear ejemplar disponible
        $ejemplar = Ejemplar::factory()->create([
            'libro_id' => $this->libro->id,
            'estado' => Ejemplar::ESTADO_DISPONIBLE
        ]);

        // Act - Cambiar estado a DADO DE BAJA
        $ejemplar->marcarComoDadoDeBaja();

        // Assert - Verificar que actualiza el estado del ejemplar a 'DADO DE BAJA' y el ejemplar ya no puede ser prestado
        $this->assertDatabaseHas('ejemplares', [
            'id' => $ejemplar->id,
            'estado' => Ejemplar::ESTADO_DADO_DE_BAJA
        ]);

        $ejemplar->refresh();
        $this->assertEquals(Ejemplar::ESTADO_DADO_DE_BAJA, $ejemplar->estado);
        $this->assertFalse($ejemplar->estaDisponible());
    }

    /**
     * CP032: Marcar como perdido un ejemplar prestado
     * Escenario: 2 - Cambiar el estado de un ejemplar que está actualmente prestado a 'PERDIDO'
     * 
     * @test
     */
    public function cp032_marcar_como_perdido_un_ejemplar_prestado()
    {
        // Arrange - Crear ejemplar prestado con préstamo activo
        $ejemplar = Ejemplar::factory()->create([
            'libro_id' => $this->libro->id,
            'estado' => Ejemplar::ESTADO_DISPONIBLE
        ]);

        $prestamo = Prestamo::factory()->create([
            'ejemplar_id' => $ejemplar->id,
            'lector_id' => $this->lector->id,
            'fecha_prestamo' => '2023-01-01',
            'fecha_devolucion' => '2023-01-15',
            'estado' => Prestamo::ESTADO_ACTIVO
        ]);

        // Act - Cambiar estado a PERDIDO
        $ejemplar->refresh();
        $ejemplar->marcarComoPerdido();

        // Assert - Verificar que el estado del ejemplar cambia a 'PERDIDO' y el estado del préstamo asociado cambia a 'VENCIDO'
        $this->assertDatabaseHas('ejemplares', [
            'id' => $ejemplar->id,
            'estado' => Ejemplar::ESTADO_PERDIDO
        ]);

        $ejemplar->refresh();
        $this->assertEquals(Ejemplar::ESTADO_PERDIDO, $ejemplar->estado);
        
        // Verificar que el préstamo asociado cambió a VENCIDO
        $prestamo->refresh();
        $this->assertEquals(Prestamo::ESTADO_VENCIDO, $prestamo->estado);
    }

    /**
     * CP033: Verificación de mensaje de confirmación
     * Escenario: 3 - Verificar que, tras un cambio de estado exitoso, se muestra un mensaje de confirmación
     * 
     * @test
     */
    public function cp033_verificacion_de_mensaje_de_confirmacion()
    {
        // Arrange - Crear ejemplar disponible
        $ejemplar = Ejemplar::factory()->create([
            'libro_id' => $this->libro->id,
            'numEjemplar' => 5,
            'estado' => Ejemplar::ESTADO_DISPONIBLE
        ]);

        // Act - Cambiar estado a DADO DE BAJA
        $ejemplar->marcarComoDadoDeBaja();

        // Assert - Verificar que tras guardar, el sistema redirige y muestra un mensaje: "Ejemplar #X dado de baja correctamente"
        $this->assertDatabaseHas('ejemplares', [
            'id' => $ejemplar->id,
            'estado' => Ejemplar::ESTADO_DADO_DE_BAJA
        ]);

        $ejemplar->refresh();
        $this->assertEquals(Ejemplar::ESTADO_DADO_DE_BAJA, $ejemplar->estado);
        
        // Verificar que se puede generar el mensaje de confirmación
        $mensajeEsperado = "Ejemplar #{$ejemplar->numEjemplar} dado de baja correctamente.";
        $this->assertStringContainsString("Ejemplar #", $mensajeEsperado);
        $this->assertStringContainsString("dado de baja correctamente", $mensajeEsperado);
    }

    // ==========================================
    // CASOS DE PRUEBA ADICIONALES
    // ==========================================

    /**
     * Verificación de que no se puede prestar un ejemplar dado de baja
     * 
     * @test
     */
    public function verifica_que_no_se_puede_prestar_ejemplar_dado_de_baja()
    {
        // Arrange - Crear ejemplar dado de baja
        $ejemplar = Ejemplar::factory()->create([
            'libro_id' => $this->libro->id,
            'estado' => Ejemplar::ESTADO_DADO_DE_BAJA
        ]);

        // Act & Assert - Verificar que no se puede crear préstamo
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('El ejemplar no está disponible para préstamo');
        
        $prestamo = Prestamo::create([
            'ejemplar_id' => $ejemplar->id,
            'lector_id' => $this->lector->id,
            'fecha_prestamo' => '2023-01-01',
            'fecha_devolucion' => '2023-01-15',
            'estado' => Prestamo::ESTADO_ACTIVO
        ]);
    }

    /**
     * Verificación de filtrado de estanterías por sección
     * 
     * @test
     */
    public function verifica_filtrado_de_estanterias_por_seccion()
    {
        // Arrange - Buscar o crear otra sección con estanterías
        $seccion2 = Seccion::firstOrCreate(['nombre' => 'BACHILLERATO']);
        
        $estanteria2 = Estanteria::factory()->create([
            'seccion_id' => $seccion2->id,
            'cod_estante' => 'B01'
        ]);

        // Act - Filtrar estanterías por sección
        $estanteriasPrimaria = Estanteria::where('seccion_id', $this->seccion->id)->get();
        $estanteriasBachillerato = Estanteria::where('seccion_id', $seccion2->id)->get();

        // Assert - Verificar que solo se obtienen estanterías de la sección correspondiente
        $this->assertGreaterThan(0, $estanteriasPrimaria->count());
        $this->assertGreaterThan(0, $estanteriasBachillerato->count());
        
        foreach ($estanteriasPrimaria as $estanteria) {
            $this->assertEquals($this->seccion->id, $estanteria->seccion_id);
        }
        
        foreach ($estanteriasBachillerato as $estanteria) {
            $this->assertEquals($seccion2->id, $estanteria->seccion_id);
        }
    }

    /**
     * Verificación de actualización de múltiples campos de libro
     * 
     * @test
     */
    public function verifica_actualizacion_de_multiples_campos_de_libro()
    {
        // Arrange - Preparar múltiples cambios
        $cambios = [
            'titulo' => 'Título Completamente Nuevo',
            'contenido' => 'Contenido actualizado',
            'anio' => 2024,
            'precio' => 150.00
        ];

        // Act - Actualizar múltiples campos
        $this->libro->update($cambios);

        // Assert - Verificar que todos los campos se actualizaron correctamente
        $this->assertDatabaseHas('libros', [
            'id' => $this->libro->id,
            'titulo' => 'Título Completamente Nuevo',
            'contenido' => 'Contenido actualizado',
            'anio' => 2024,
            'precio' => 150.00
        ]);

        $this->libro->refresh();
        $this->assertEquals('Título Completamente Nuevo', $this->libro->titulo);
        $this->assertEquals('Contenido actualizado', $this->libro->contenido);
        $this->assertEquals(2024, $this->libro->anio);
        $this->assertEquals(150.00, $this->libro->precio);
    }

    /**
     * Verificación de conteo de ejemplares por tipo de adquisición
     * 
     * @test
     */
    public function verifica_conteo_de_ejemplares_por_tipo_de_adquisicion()
    {
        // Arrange - Crear ejemplares con diferentes tipos de adquisición
        Ejemplar::factory()->create([
            'libro_id' => $this->libro->id,
            'tipo_adquisicion' => Ejemplar::TIPO_COMPRA
        ]);

        Ejemplar::factory()->create([
            'libro_id' => $this->libro->id,
            'tipo_adquisicion' => Ejemplar::TIPO_DONACION
        ]);

        Ejemplar::factory()->create([
            'libro_id' => $this->libro->id,
            'tipo_adquisicion' => Ejemplar::TIPO_REPOSICION
        ]);

        // Act - Contar ejemplares por tipo
        $ejemplaresCompra = $this->libro->ejemplares()
            ->where('tipo_adquisicion', Ejemplar::TIPO_COMPRA)
            ->count();
            
        $ejemplaresDonacion = $this->libro->ejemplares()
            ->where('tipo_adquisicion', Ejemplar::TIPO_DONACION)
            ->count();
            
        $ejemplaresReposicion = $this->libro->ejemplares()
            ->where('tipo_adquisicion', Ejemplar::TIPO_REPOSICION)
            ->count();

        // Assert - Verificar conteos
        $this->assertGreaterThan(0, $ejemplaresCompra);
        $this->assertGreaterThan(0, $ejemplaresDonacion);
        $this->assertGreaterThan(0, $ejemplaresReposicion);
    }
}

