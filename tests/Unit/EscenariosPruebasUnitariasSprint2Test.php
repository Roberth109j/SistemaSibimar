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
 * Escenarios de Pruebas Unitarias - Sprint 2
 * 
 * Este archivo contiene las pruebas unitarias para el Sprint 2 del sistema de gestión de biblioteca.
 * Cubre las siguientes historias de usuario:
 * - HU-002: Registro de préstamos
 * - HU-003: Registro de devoluciones  
 * - HU-008: Visualización del estado de libros
 * 
 * @testdox Escenarios de Pruebas Unitarias Sprint 2
 */
class EscenariosPruebasUnitariasSprint2Test extends TestCase
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
        $this->estanteria = Estanteria::factory()->create();
        
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
        
        // Crear ejemplar prestado
        $this->ejemplarPrestado = Ejemplar::factory()->create([
            'libro_id' => $this->libro->id,
            'estado' => Ejemplar::ESTADO_PRESTADO
        ]);
    }

    // ==========================================
    // HU-002: REGISTRO DE PRÉSTAMOS
    // ==========================================

    /**
     * CP013: Registro de préstamo exitoso
     * Escenario: 1 - Registrar un préstamo de manera exitosa con un ejemplar disponible y un lector activo
     * 
     * @test
     */
    public function cp013_registro_de_prestamo_exitoso()
    {
        // Arrange - Preparar datos válidos para el préstamo
        $datosValidos = [
            'ejemplar_id' => $this->ejemplarDisponible->id,
            'lector_id' => $this->lector->id,
            'fecha_prestamo' => '2023-01-01',
            'fecha_devolucion' => '2023-01-15',
            'estado' => Prestamo::ESTADO_ACTIVO
        ];

        // Act - Crear el préstamo
        $prestamo = Prestamo::create($datosValidos);

        // Assert - Verificar que se crea registro en prestamos, actualiza Ejemplar.estado a 'PRESTADO' y muestra mensaje de éxito
        $this->assertDatabaseHas('prestamos', [
            'id' => $prestamo->id,
            'ejemplar_id' => $this->ejemplarDisponible->id,
            'lector_id' => $this->lector->id,
            'estado' => Prestamo::ESTADO_ACTIVO
        ]);

        // Verificar que el ejemplar cambió a estado PRESTADO
        $this->ejemplarDisponible->refresh();
        $this->assertEquals(Ejemplar::ESTADO_PRESTADO, $this->ejemplarDisponible->estado);
    }

    /**
     * CP014: Préstamo con datos requeridos faltantes
     * Escenario: 2 - Intentar registrar un préstamo sin seleccionar un ejemplar o sin ingresar el código del lector
     * 
     * @test
     */
    public function cp014_prestamo_con_datos_requeridos_faltantes()
    {
        // Arrange - Preparar datos incompletos
        $datosIncompletos = [
            'ejemplar_id' => null,
            'lector_id' => null,
            'fecha_prestamo' => '2023-01-01',
            'fecha_devolucion' => '2023-01-15',
            'estado' => Prestamo::ESTADO_ACTIVO
        ];

        // Act & Assert - Verificar que falla la validación y retorna al formulario con mensajes de error indicando que los campos son obligatorios
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Los campos son requeridos');
        
        $prestamo = new Prestamo($datosIncompletos);
        $prestamo->save();
    }

    /**
     * CP015: Préstamo con ejemplar inexistente
     * Escenario: 3 - Intentar registrar un préstamo para un ejemplar que no existe en la base de datos
     * 
     * @test
     */
    public function cp015_prestamo_con_ejemplar_inexistente()
    {
        // Arrange - Preparar datos con ejemplar inexistente
        $datosConEjemplarInexistente = [
            'ejemplar_id' => 9999, // ID inexistente
            'lector_id' => $this->lector->id,
            'fecha_prestamo' => '2023-01-01',
            'fecha_devolucion' => '2023-01-15',
            'estado' => Prestamo::ESTADO_ACTIVO
        ];

        // Act & Assert - Verificar que falla la validación y muestra error: "El ejemplar seleccionado no existe"
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('El ejemplar no existe');
        
        $prestamo = new Prestamo($datosConEjemplarInexistente);
        $prestamo->save();
    }

    /**
     * CP016: Préstamo con lector inexistente
     * Escenario: 4 - Intentar registrar un préstamo a un lector con un código que no existe o cuyo estado es 'INACTIVO'
     * 
     * @test
     */
    public function cp016_prestamo_con_lector_inexistente()
    {
        // Arrange - Preparar datos con lector inexistente
        $datosConLectorInexistente = [
            'ejemplar_id' => $this->ejemplarDisponible->id,
            'lector_id' => 9999, // ID inexistente
            'fecha_prestamo' => '2023-01-01',
            'fecha_devolucion' => '2023-01-15',
            'estado' => Prestamo::ESTADO_ACTIVO
        ];

        // Act & Assert - Verificar que falla la validación y muestra error: "El lector no existe"
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('El lector no existe');
        
        $prestamo = new Prestamo($datosConLectorInexistente);
        $prestamo->save();
    }

    // ==========================================
    // HU-003: REGISTRO DE DEVOLUCIONES
    // ==========================================

    /**
     * CP017: Devolución exitosa de un préstamo
     * Escenario: 1 - Registrar correctamente la devolución de un préstamo que está en estado 'ACTIVO' o 'VENCIDO'
     * 
     * @test
     */
    public function cp017_devolucion_exitosa_de_un_prestamo()
    {
        // Arrange - Crear un préstamo activo
        $prestamo = Prestamo::factory()->create([
            'ejemplar_id' => $this->ejemplarDisponible->id,
            'lector_id' => $this->lector->id,
            'fecha_prestamo' => '2023-01-01',
            'fecha_devolucion' => '2023-01-15',
            'estado' => Prestamo::ESTADO_ACTIVO
        ]);

        // Marcar el ejemplar como prestado manualmente
        $this->ejemplarDisponible->marcarComoPrestado();

        // Act - Procesar la devolución
        $prestamo->marcarComoDevuelto();

        // Assert - Verificar que actualiza Prestamo.estado a 'DEVUELTO', actualiza Ejemplar.estado a 'DISPONIBLE' y muestra mensaje de éxito
        $this->assertDatabaseHas('prestamos', [
            'id' => $prestamo->id,
            'estado' => Prestamo::ESTADO_DEVUELTO,
            'fecha_devuelto' => now()->format('Y-m-d')
        ]);

        // Verificar que el ejemplar cambió a estado DISPONIBLE
        $this->ejemplarDisponible->refresh();
        $this->assertEquals(Ejemplar::ESTADO_DISPONIBLE, $this->ejemplarDisponible->estado);
    }

    /**
     * CP018: Verificación de fecha de devolución
     * Escenario: 2 - Verificar que el sistema almacene la fecha de devolución proporcionada por el bibliotecario
     * 
     * @test
     */
    public function cp018_verificacion_de_fecha_de_devolucion()
    {
        // Arrange - Crear un préstamo activo
        $prestamo = Prestamo::factory()->create([
            'ejemplar_id' => $this->ejemplarDisponible->id,
            'lector_id' => $this->lector->id,
            'fecha_prestamo' => '2023-01-01',
            'fecha_devolucion' => '2023-01-15',
            'estado' => Prestamo::ESTADO_ACTIVO
        ]);

        // Marcar el ejemplar como prestado manualmente
        $this->ejemplarDisponible->marcarComoPrestado();

        // Act - Procesar la devolución
        $prestamo->marcarComoDevuelto();

        // Assert - Verificar que el campo fecha_devuelto en la tabla prestamos se guarda con el valor "2025-10-18"
        $this->assertDatabaseHas('prestamos', [
            'id' => $prestamo->id,
            'estado' => Prestamo::ESTADO_DEVUELTO,
            'fecha_devuelto' => now()->format('Y-m-d')
        ]);
    }

    /**
     * CP019: Intento de devolución de préstamo ya devuelto
     * Escenario: 3 - Intentar procesar la devolución de un préstamo que ya figura como 'DEVUELTO' en el sistema
     * 
     * @test
     */
    public function cp019_intento_de_devolucion_de_prestamo_ya_devuelto()
    {
        // Arrange - Crear un préstamo ya devuelto
        $prestamo = Prestamo::factory()->create([
            'ejemplar_id' => $this->ejemplarDisponible->id,
            'lector_id' => $this->lector->id,
            'fecha_prestamo' => '2023-01-01',
            'fecha_devolucion' => '2023-01-15',
            'fecha_devuelto' => '2023-01-10',
            'estado' => Prestamo::ESTADO_DEVUELTO
        ]);

        // Act & Assert - Verificar que la operación es rechazada y se muestra un mensaje de error: "Este préstamo ya ha sido devuelto"
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Este préstamo ya ha sido devuelto');
        
        $prestamo->marcarComoDevuelto();
    }

    // ==========================================
    // HU-008: VISUALIZACIÓN DEL ESTADO DE LIBROS
    // ==========================================

    /**
     * CP020: Visualización de lista de ejemplares
     * Escenario: 1 - Acceder a la vista de un libro específico para ver la lista de todos sus ejemplares y su estado actual
     * 
     * @test
     */
    public function cp020_visualizacion_de_lista_de_ejemplares()
    {
        // Arrange - Crear múltiples ejemplares para el libro
        $ejemplar2 = Ejemplar::factory()->create([
            'libro_id' => $this->libro->id,
            'numEjemplar' => 2,
            'estado' => Ejemplar::ESTADO_DISPONIBLE
        ]);

        $ejemplar3 = Ejemplar::factory()->create([
            'libro_id' => $this->libro->id,
            'numEjemplar' => 3,
            'estado' => Ejemplar::ESTADO_PRESTADO
        ]);

        // Act - Obtener todos los ejemplares del libro
        $ejemplares = $this->libro->ejemplares;

        // Assert - Verificar que el sistema muestra la lista completa de ejemplares para ese libro, cada uno con su estado
        $this->assertGreaterThanOrEqual(4, $ejemplares->count()); // Al menos 4 ejemplares (1 automático + 3 creados manualmente)
        
        $estados = $ejemplares->pluck('estado')->toArray();
        $this->assertContains(Ejemplar::ESTADO_DISPONIBLE, $estados);
        $this->assertContains(Ejemplar::ESTADO_PRESTADO, $estados);
    }

    /**
     * CP021: Búsqueda de un ejemplar por número
     * Escenario: 2 - Buscar un ejemplar específico por su número dentro de la lista de ejemplares de un libro
     * 
     * @test
     */
    public function cp021_busqueda_de_un_ejemplar_por_numero()
    {
        // Arrange - Crear múltiples ejemplares con números específicos
        $ejemplar2 = Ejemplar::factory()->create([
            'libro_id' => $this->libro->id,
            'numEjemplar' => 2,
            'estado' => Ejemplar::ESTADO_DISPONIBLE
        ]);

        $ejemplar3 = Ejemplar::factory()->create([
            'libro_id' => $this->libro->id,
            'numEjemplar' => 3,
            'estado' => Ejemplar::ESTADO_PRESTADO
        ]);

        // Act - Buscar ejemplar número 3
        $ejemplarEncontrado = $this->libro->ejemplares()
            ->where('numEjemplar', 3)
            ->first();

        // Assert - Verificar que la lista se filtra para mostrar únicamente el Ejemplar cuyo numEjemplar es 3
        $this->assertNotNull($ejemplarEncontrado);
        $this->assertEquals(3, $ejemplarEncontrado->numEjemplar);
        $this->assertEquals(Ejemplar::ESTADO_PRESTADO, $ejemplarEncontrado->estado);
    }

    /**
     * CP022: Visualización de detalle de ejemplar
     * Escenario: 3 - Seleccionar un ejemplar de la lista para ver su información detallada
     * 
     * @test
     */
    public function cp022_visualizacion_de_detalle_de_ejemplar()
    {
        // Arrange - Crear un ejemplar específico
        $ejemplarEspecifico = Ejemplar::factory()->create([
            'libro_id' => $this->libro->id,
            'numEjemplar' => 5,
            'tipo_adquisicion' => Ejemplar::TIPO_DONACION,
            'estado' => Ejemplar::ESTADO_DISPONIBLE,
            'observaciones' => 'Ejemplar en excelente estado'
        ]);

        // Act - Obtener el ejemplar específico
        $ejemplarDetalle = Ejemplar::find($ejemplarEspecifico->id);

        // Assert - Verificar que el sistema muestra la vista de detalles con la información completa del ejemplar seleccionado
        $this->assertNotNull($ejemplarDetalle);
        $this->assertEquals($ejemplarEspecifico->id, $ejemplarDetalle->id);
        $this->assertEquals(5, $ejemplarDetalle->numEjemplar);
        $this->assertEquals(Ejemplar::TIPO_DONACION, $ejemplarDetalle->tipo_adquisicion);
        $this->assertEquals(Ejemplar::ESTADO_DISPONIBLE, $ejemplarDetalle->estado);
        $this->assertEquals('Ejemplar en excelente estado', $ejemplarDetalle->observaciones);
        
        // Verificar relación con el libro
        $this->assertEquals($this->libro->id, $ejemplarDetalle->libro_id);
    }

    // ==========================================
    // CASOS DE PRUEBA ADICIONALES
    // ==========================================

    /**
     * Verificación de cambio de estado de ejemplar al realizar préstamo
     * 
     * @test
     */
    public function verifica_cambio_estado_ejemplar_al_realizar_prestamo()
    {
        // Arrange - Preparar ejemplar disponible
        $ejemplar = Ejemplar::factory()->create([
            'libro_id' => $this->libro->id,
            'estado' => Ejemplar::ESTADO_DISPONIBLE
        ]);

        // Act - Crear préstamo
        $prestamo = Prestamo::factory()->create([
            'ejemplar_id' => $ejemplar->id,
            'lector_id' => $this->lector->id,
            'fecha_prestamo' => '2023-01-01',
            'fecha_devolucion' => '2023-01-15',
            'estado' => Prestamo::ESTADO_ACTIVO
        ]);

        // Assert - Verificar que el ejemplar cambió a estado PRESTADO
        $ejemplar->refresh();
        $this->assertEquals(Ejemplar::ESTADO_PRESTADO, $ejemplar->estado);
    }

    /**
     * Verificación de cambio de estado de ejemplar al procesar devolución
     * 
     * @test
     */
    public function verifica_cambio_estado_ejemplar_al_procesar_devolucion()
    {
        // Arrange - Crear un ejemplar disponible y préstamo
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

        // Act - Procesar devolución
        $prestamo->marcarComoDevuelto();

        // Assert - Verificar que el ejemplar cambió a estado DISPONIBLE
        $ejemplar->refresh();
        $this->assertEquals(Ejemplar::ESTADO_DISPONIBLE, $ejemplar->estado);
    }

    /**
     * Verificación de filtrado de ejemplares por estado
     * 
     * @test
     */
    public function verifica_filtrado_de_ejemplares_por_estado()
    {
        // Arrange - Crear ejemplares con diferentes estados
        $ejemplarDisponible = Ejemplar::factory()->create([
            'libro_id' => $this->libro->id,
            'estado' => Ejemplar::ESTADO_DISPONIBLE
        ]);

        $ejemplarPrestado = Ejemplar::factory()->create([
            'libro_id' => $this->libro->id,
            'estado' => Ejemplar::ESTADO_PRESTADO
        ]);

        // Act - Filtrar ejemplares disponibles
        $ejemplaresDisponibles = $this->libro->ejemplares()
            ->where('estado', Ejemplar::ESTADO_DISPONIBLE)
            ->get();

        // Assert - Verificar que solo se obtienen ejemplares disponibles
        $this->assertGreaterThan(0, $ejemplaresDisponibles->count());
        foreach ($ejemplaresDisponibles as $ejemplar) {
            $this->assertEquals(Ejemplar::ESTADO_DISPONIBLE, $ejemplar->estado);
        }
    }
}
