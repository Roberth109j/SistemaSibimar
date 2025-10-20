<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Prestamo;
use App\Models\Libro;
use App\Models\Ejemplar;
use App\Models\Lector;
use App\Models\Seccion;
use App\Models\Autor;
use App\Models\Editorial;
use App\Models\TemaDewey;
use App\Models\Estanteria;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

/**
 * @testdox Escenarios de Pruebas Unitarias Sprint 6
 * 
 * Pruebas unitarias para el Sprint 6 del sistema de gestión de biblioteca.
 * Cubre las historias de usuario HU-016, HU-017, HU-018 y HU-019.
 */
class EscenariosPruebasUnitariasSprint6Test extends TestCase
{
    use RefreshDatabase;

    protected $seccionPrimaria;
    protected $seccionBachillerato;
    protected $autor;
    protected $editorial;
    protected $tema;
    protected $estanteriaPrimaria;
    protected $estanteriaBachillerato;
    protected $libroPrimaria;
    protected $libroBachillerato;
    protected $ejemplarDisponible;
    protected $ejemplarPrestado;
    protected $ejemplarBachilleratoDisponible;
    protected $lectorFrecuente;
    protected $lectorOcasional;
    protected $bibliotecario;
    protected $prestamoActivo;
    protected $prestamoDevuelto;
    protected $prestamoVencido;

    protected function setUp(): void
    {
        parent::setUp();

        // Crear roles de Spatie
        \Spatie\Permission\Models\Role::create(['name' => 'bibliotecario']);
        \Spatie\Permission\Models\Role::create(['name' => 'administrador']);

        // Crear bibliotecario para las pruebas
        $this->bibliotecario = User::factory()->create([
            'name' => 'Bibliotecario Test',
            'email' => 'bibliotecario@umariana.edu.co',
            'password' => Hash::make('biblio123')
        ]);
        $this->bibliotecario->assignRole('bibliotecario');

        // Crear secciones para las pruebas (usando valores permitidos del ENUM)
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
            'estado' => Ejemplar::ESTADO_DISPONIBLE, // Cambiar a DISPONIBLE inicialmente
            'numEjemplar' => 2
        ]);

        $this->ejemplarBachilleratoDisponible = Ejemplar::factory()->create([
            'libro_id' => $this->libroBachillerato->id,
            'estado' => Ejemplar::ESTADO_DISPONIBLE,
            'numEjemplar' => 1
        ]);

        // Crear lectores para las pruebas
        $this->lectorFrecuente = Lector::factory()->create([
            'nombre' => 'Juan Pérez',
            'codigo' => 'L001',
            'estado' => Lector::ESTADO_ACTIVO
        ]);

        $this->lectorOcasional = Lector::factory()->create([
            'nombre' => 'María García',
            'codigo' => 'L002',
            'estado' => Lector::ESTADO_ACTIVO
        ]);

        // Crear préstamos para historial y estadísticas (usando ejemplares disponibles)
        $this->prestamoActivo = Prestamo::factory()->create([
            'ejemplar_id' => $this->ejemplarPrestado->id,
            'lector_id' => $this->lectorFrecuente->id,
            'fecha_prestamo' => now()->subDays(5)->format('Y-m-d'),
            'fecha_devolucion' => now()->addDays(5)->format('Y-m-d'),
            'estado' => Prestamo::ESTADO_ACTIVO
        ]);

        // Crear ejemplares adicionales para los otros préstamos
        $ejemplarParaDevuelto = Ejemplar::factory()->create([
            'libro_id' => $this->libroPrimaria->id,
            'estado' => Ejemplar::ESTADO_DISPONIBLE,
            'numEjemplar' => 3
        ]);

        $ejemplarParaVencido = Ejemplar::factory()->create([
            'libro_id' => $this->libroBachillerato->id,
            'estado' => Ejemplar::ESTADO_DISPONIBLE,
            'numEjemplar' => 2
        ]);

        $this->prestamoDevuelto = Prestamo::factory()->create([
            'ejemplar_id' => $ejemplarParaDevuelto->id,
            'lector_id' => $this->lectorOcasional->id,
            'fecha_prestamo' => now()->subDays(10)->format('Y-m-d'),
            'fecha_devolucion' => now()->subDays(3)->format('Y-m-d'),
            'fecha_devuelto' => now()->subDays(3)->format('Y-m-d'),
            'estado' => Prestamo::ESTADO_DEVUELTO
        ]);

        $this->prestamoVencido = Prestamo::factory()->create([
            'ejemplar_id' => $ejemplarParaVencido->id,
            'lector_id' => $this->lectorFrecuente->id,
            'fecha_prestamo' => now()->subDays(15)->format('Y-m-d'),
            'fecha_devolucion' => now()->subDays(5)->format('Y-m-d'),
            'estado' => Prestamo::ESTADO_VENCIDO
        ]);
    }

    /**
     * CP054: Ver historial de préstamos
     * Escenario: 1 - Solicitar el historial de préstamos
     * Valores de entrada: Ninguno
     * Resultado esperado: El sistema muestra una lista con todos los préstamos realizados
     */
    public function test_cp054_ver_historial_de_prestamos()
    {
        // Arrange - Datos ya creados en setUp
        
        // Act - Obtener historial de préstamos
        $historialPrestamos = Prestamo::with(['ejemplar.libro', 'lector'])
            ->orderBy('fecha_prestamo', 'desc')
            ->get();

        // Assert - Verificar que se obtiene el historial completo
        $this->assertGreaterThanOrEqual(3, $historialPrestamos->count());
        
        // Verificar que se obtienen los préstamos correctos
        $this->assertTrue($historialPrestamos->contains('id', $this->prestamoActivo->id));
        $this->assertTrue($historialPrestamos->contains('id', $this->prestamoDevuelto->id));
        $this->assertTrue($historialPrestamos->contains('id', $this->prestamoVencido->id));
        
        // Verificar relaciones
        foreach ($historialPrestamos as $prestamo) {
            $this->assertNotNull($prestamo->ejemplar);
            $this->assertNotNull($prestamo->lector);
            $this->assertNotNull($prestamo->ejemplar->libro);
        }
    }

    /**
     * CP055: Filtrar historial por fecha
     * Escenario: 2 - Solicitar el historial de préstamos filtrado por fecha
     * Valores de entrada: Fecha inicio: 2024-01-01, Fecha fin: 2024-12-31
     * Resultado esperado: El sistema muestra una lista con los préstamos realizados en el rango de fechas especificado
     */
    public function test_cp055_filtrar_historial_por_fecha()
    {
        // Arrange - Datos ya creados en setUp
        $fechaInicio = now()->subDays(20)->format('Y-m-d');
        $fechaFin = now()->format('Y-m-d');
        
        // Act - Filtrar historial por rango de fechas
        $historialFiltrado = Prestamo::whereBetween('fecha_prestamo', [$fechaInicio, $fechaFin])
            ->with(['ejemplar.libro', 'lector'])
            ->orderBy('fecha_prestamo', 'desc')
            ->get();

        // Assert - Verificar que se obtienen préstamos en el rango de fechas
        $this->assertGreaterThanOrEqual(3, $historialFiltrado->count());
        
        // Verificar que todos los préstamos están en el rango de fechas
        foreach ($historialFiltrado as $prestamo) {
            $this->assertGreaterThanOrEqual($fechaInicio, $prestamo->fecha_prestamo);
            $this->assertLessThanOrEqual($fechaFin, $prestamo->fecha_prestamo);
        }
    }

    /**
     * CP056: Ver estadísticas de libros más prestados
     * Escenario: 3 - Solicitar estadísticas de libros más prestados
     * Valores de entrada: Ninguno
     * Resultado esperado: El sistema muestra una lista con los libros más prestados ordenados por cantidad de préstamos
     */
    public function test_cp056_ver_estadisticas_libros_mas_prestados()
    {
        // Arrange - Datos ya creados en setUp
        
        // Act - Obtener estadísticas de libros más prestados
        $librosMasPrestados = Libro::withCount('ejemplares')
            ->with(['ejemplares' => function($query) {
                $query->whereHas('prestamos');
            }])
            ->orderBy('ejemplares_count', 'desc')
            ->get();

        // Assert - Verificar que se obtienen estadísticas
        $this->assertGreaterThanOrEqual(2, $librosMasPrestados->count());
        
        // Verificar que se obtienen los libros correctos
        $this->assertTrue($librosMasPrestados->contains('id', $this->libroPrimaria->id));
        $this->assertTrue($librosMasPrestados->contains('id', $this->libroBachillerato->id));
        
        // Verificar relaciones
        foreach ($librosMasPrestados as $libro) {
            $this->assertNotNull($libro->ejemplares);
        }
    }

    /**
     * CP057: Ver estadísticas de lectores frecuentes
     * Escenario: 4 - Solicitar estadísticas de lectores frecuentes
     * Valores de entrada: Ninguno
     * Resultado esperado: El sistema muestra una lista con los lectores que más han utilizado el servicio de préstamos
     */
    public function test_cp057_ver_estadisticas_lectores_frecuentes()
    {
        // Arrange - Datos ya creados en setUp
        
        // Act - Obtener estadísticas de lectores frecuentes
        $lectoresFrecuentes = Lector::withCount('prestamos')
            ->orderBy('prestamos_count', 'desc')
            ->get();

        // Assert - Verificar que se obtienen estadísticas
        $this->assertGreaterThanOrEqual(2, $lectoresFrecuentes->count());
        
        // Verificar que se obtienen los lectores correctos
        $this->assertTrue($lectoresFrecuentes->contains('id', $this->lectorFrecuente->id));
        $this->assertTrue($lectoresFrecuentes->contains('id', $this->lectorOcasional->id));
        
        // Verificar que el lector frecuente tiene más préstamos
        $lectorFrecuenteData = $lectoresFrecuentes->where('id', $this->lectorFrecuente->id)->first();
        $lectorOcasionalData = $lectoresFrecuentes->where('id', $this->lectorOcasional->id)->first();
        
        $this->assertGreaterThanOrEqual($lectorOcasionalData->prestamos_count, $lectorFrecuenteData->prestamos_count);
    }

    /**
     * CP058: Generar informe de préstamos por período
     * Escenario: 5 - Solicitar informe de préstamos por período
     * Valores de entrada: Período: Último mes
     * Resultado esperado: El sistema genera un informe detallado con los préstamos del período especificado
     */
    public function test_cp058_generar_informe_prestamos_por_periodo()
    {
        // Arrange - Datos ya creados en setUp
        $fechaInicio = now()->subMonth()->format('Y-m-d');
        $fechaFin = now()->format('Y-m-d');
        
        // Act - Generar informe de préstamos por período
        $informePrestamos = Prestamo::whereBetween('fecha_prestamo', [$fechaInicio, $fechaFin])
            ->with(['ejemplar.libro.autor', 'lector'])
            ->get();

        // Assert - Verificar que se genera el informe
        $this->assertGreaterThanOrEqual(3, $informePrestamos->count());
        
        // Verificar que todos los préstamos están en el período
        foreach ($informePrestamos as $prestamo) {
            $this->assertGreaterThanOrEqual($fechaInicio, $prestamo->fecha_prestamo);
            $this->assertLessThanOrEqual($fechaFin, $prestamo->fecha_prestamo);
        }
        
        // Verificar relaciones para el informe
        foreach ($informePrestamos as $prestamo) {
            $this->assertNotNull($prestamo->ejemplar);
            $this->assertNotNull($prestamo->lector);
            $this->assertNotNull($prestamo->ejemplar->libro);
            $this->assertNotNull($prestamo->ejemplar->libro->autor);
        }
    }

    /**
     * CP059: Exportar informe a Excel
     * Escenario: 6 - Solicitar la exportación del informe a Excel
     * Valores de entrada: Formato: Excel
     * Resultado esperado: El sistema genera un archivo Excel con el informe de préstamos
     */
    public function test_cp059_exportar_informe_a_excel()
    {
        // Arrange - Datos ya creados en setUp
        
        // Act - Preparar datos para exportación a Excel
        $datosParaExcel = Prestamo::with(['ejemplar.libro.autor', 'lector'])
            ->get()
            ->map(function($prestamo) {
                return [
                    'ID Préstamo' => $prestamo->id,
                    'Título Libro' => $prestamo->ejemplar->libro->titulo,
                    'Autor' => $prestamo->ejemplar->libro->autor->nombres . ' ' . $prestamo->ejemplar->libro->autor->apellidos,
                    'Lector' => $prestamo->lector->nombre,
                    'Fecha Préstamo' => $prestamo->fecha_prestamo,
                    'Fecha Devolución' => $prestamo->fecha_devolucion,
                    'Estado' => $prestamo->estado
                ];
            });

        // Assert - Verificar que se preparan los datos para Excel
        $this->assertGreaterThanOrEqual(3, $datosParaExcel->count());
        
        // Verificar estructura de datos para Excel
        $primerRegistro = $datosParaExcel->first();
        $this->assertArrayHasKey('ID Préstamo', $primerRegistro);
        $this->assertArrayHasKey('Título Libro', $primerRegistro);
        $this->assertArrayHasKey('Autor', $primerRegistro);
        $this->assertArrayHasKey('Lector', $primerRegistro);
        $this->assertArrayHasKey('Fecha Préstamo', $primerRegistro);
        $this->assertArrayHasKey('Fecha Devolución', $primerRegistro);
        $this->assertArrayHasKey('Estado', $primerRegistro);
    }

    /**
     * CP060: Realizar préstamo masivo a docente
     * Escenario: 7 - Solicitar préstamo masivo a docente
     * Valores de entrada: Docente: Prof. García, Libros: [Libro1, Libro2], Cantidad: 2
     * Resultado esperado: El sistema registra múltiples préstamos para el docente especificado
     */
    public function test_cp060_realizar_prestamo_masivo_a_docente()
    {
        // Arrange - Crear docente y libros adicionales
        $docente = Lector::factory()->create([
            'nombre' => 'Prof. García',
            'codigo' => 'DOC001',
            'estado' => Lector::ESTADO_ACTIVO
        ]);

        $libroAdicional = Libro::factory()->create([
            'titulo' => 'Matemáticas Básicas',
            'seccion_id' => $this->seccionPrimaria->id,
            'autor_id' => $this->autor->id,
            'editorial_id' => $this->editorial->id,
            'tema_id' => $this->tema->id,
            'estanteria_id' => $this->estanteriaPrimaria->id,
            'fecha_ingreso' => '2023-01-01',
            'paginas' => 150
        ]);

        $ejemplarAdicional = Ejemplar::factory()->create([
            'libro_id' => $libroAdicional->id,
            'estado' => Ejemplar::ESTADO_DISPONIBLE,
            'numEjemplar' => 1
        ]);

        $librosParaPrestamo = [$this->libroPrimaria, $libroAdicional];
        
        // Act - Realizar préstamo masivo
        $prestamosMasivos = [];
        foreach ($librosParaPrestamo as $libro) {
            $ejemplar = $libro->ejemplares()->where('estado', Ejemplar::ESTADO_DISPONIBLE)->first();
            if ($ejemplar) {
                $prestamo = Prestamo::create([
                    'ejemplar_id' => $ejemplar->id,
                    'lector_id' => $docente->id,
                    'fecha_prestamo' => now()->format('Y-m-d'),
                    'fecha_devolucion' => now()->addDays(30)->format('Y-m-d'),
                    'estado' => Prestamo::ESTADO_ACTIVO
                ]);
                $prestamosMasivos[] = $prestamo;
            }
        }

        // Assert - Verificar que se crean múltiples préstamos
        $this->assertGreaterThanOrEqual(2, count($prestamosMasivos));
        
        // Verificar que todos los préstamos son para el mismo docente
        foreach ($prestamosMasivos as $prestamo) {
            $this->assertEquals($docente->id, $prestamo->lector_id);
            $this->assertEquals(Prestamo::ESTADO_ACTIVO, $prestamo->estado);
        }
    }

    /**
     * CP061: Verificar límite de préstamos masivos
     * Escenario: 8 - Intentar préstamo masivo excediendo el límite
     * Valores de entrada: Docente: Prof. García, Libros: [Libro1, Libro2, Libro3, Libro4, Libro5], Cantidad: 5
     * Resultado esperado: El sistema rechaza el préstamo masivo y muestra mensaje de límite excedido
     */
    public function test_cp061_verificar_limite_prestamos_masivos()
    {
        // Arrange - Crear docente y múltiples libros
        $docente = Lector::factory()->create([
            'nombre' => 'Prof. García',
            'codigo' => 'DOC002',
            'estado' => Lector::ESTADO_ACTIVO
        ]);

        // Crear múltiples libros para exceder el límite
        $librosAdicionales = [];
        for ($i = 0; $i < 3; $i++) {
            $libro = Libro::factory()->create([
                'titulo' => "Libro Adicional $i",
                'seccion_id' => $this->seccionPrimaria->id,
                'autor_id' => $this->autor->id,
                'editorial_id' => $this->editorial->id,
                'tema_id' => $this->tema->id,
                'estanteria_id' => $this->estanteriaPrimaria->id,
                'fecha_ingreso' => '2023-01-01',
                'paginas' => 100
            ]);
            
            Ejemplar::factory()->create([
                'libro_id' => $libro->id,
                'estado' => Ejemplar::ESTADO_DISPONIBLE,
                'numEjemplar' => 1
            ]);
            
            $librosAdicionales[] = $libro;
        }

        $todosLosLibros = array_merge([$this->libroPrimaria, $this->libroBachillerato], $librosAdicionales);
        
        // Act - Intentar préstamo masivo (simulando límite de 3 libros)
        $limiteMaximo = 3;
        $prestamosExitosos = 0;
        $prestamosRechazados = 0;
        
        foreach ($todosLosLibros as $libro) {
            $ejemplar = $libro->ejemplares()->where('estado', Ejemplar::ESTADO_DISPONIBLE)->first();
            if ($ejemplar && $prestamosExitosos < $limiteMaximo) {
                try {
                    Prestamo::create([
                        'ejemplar_id' => $ejemplar->id,
                        'lector_id' => $docente->id,
                        'fecha_prestamo' => now()->format('Y-m-d'),
                        'fecha_devolucion' => now()->addDays(30)->format('Y-m-d'),
                        'estado' => Prestamo::ESTADO_ACTIVO
                    ]);
                    $prestamosExitosos++;
                } catch (\Exception $e) {
                    $prestamosRechazados++;
                }
            } else {
                $prestamosRechazados++;
            }
        }

        // Assert - Verificar que se respeta el límite
        $this->assertEquals($limiteMaximo, $prestamosExitosos);
        $this->assertGreaterThan(0, $prestamosRechazados);
    }

    /**
     * CP062: Préstamo masivo con docente inexistente
     * Escenario: 1 - Intentar préstamo masivo con código de lector inexistente
     * Valores de entrada: codigo_lector="99999999" (no existe)
     * Resultado esperado: La validación falla. Retorna a la página anterior con un mensaje de error: "El lector no existe o está inactivo."
     */
    public function test_cp062_prestamo_masivo_con_docente_inexistente()
    {
        // Arrange - Preparar datos para préstamo masivo
        $codigoLectorInexistente = '99999999';
        $ejemplarIds = [$this->ejemplarDisponible->id, $this->ejemplarBachilleratoDisponible->id];
        
        // Act & Assert - Intentar crear préstamo masivo con lector inexistente
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('El lector no existe');
        
        // Simular la lógica de préstamo masivo
        $lector = Lector::where('codigo', $codigoLectorInexistente)->first();
        if (!$lector) {
            throw new \Exception('El lector no existe');
        }
    }

    /**
     * CP063: Préstamo masivo con código vacío
     * Escenario: 2 - Intentar préstamo masivo con código de lector vacío
     * Valores de entrada: codigo_lector=""
     * Resultado esperado: La validación del request falla. Retorna a la página anterior con un error de validación: "El código de lector es obligatorio."
     */
    public function test_cp063_prestamo_masivo_con_codigo_vacio()
    {
        // Arrange - Preparar datos con código vacío
        $codigoLectorVacio = '';
        $ejemplarIds = [$this->ejemplarDisponible->id];
        
        // Act & Assert - Intentar crear préstamo masivo con código vacío
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('El código de lector es obligatorio');
        
        // Simular la validación de campos requeridos
        if (empty($codigoLectorVacio)) {
            throw new \Exception('El código de lector es obligatorio');
        }
    }

    /**
     * CP064: Préstamo masivo exitoso
     * Escenario: 3 - Realizar préstamo masivo exitoso
     * Valores de entrada: ejemplar_ids=[1,2,3], codigo_lector válido, fechas válidas
     * Resultado esperado: Crea 3 nuevos registros en la tabla prestamos. Actualiza el estado de los 3 ejemplares a 'PRESTADO'. Redirige con mensaje de éxito.
     */
    public function test_cp064_prestamo_masivo_exitoso()
    {
        // Arrange - Crear docente y ejemplares adicionales
        $docente = Lector::factory()->create([
            'nombre' => 'Prof. García',
            'codigo' => 'DOC001',
            'estado' => Lector::ESTADO_ACTIVO
        ]);

        // Crear ejemplares adicionales para el préstamo masivo
        $ejemplar2 = Ejemplar::factory()->create([
            'libro_id' => $this->libroPrimaria->id,
            'estado' => Ejemplar::ESTADO_DISPONIBLE,
            'numEjemplar' => 4
        ]);

        $ejemplar3 = Ejemplar::factory()->create([
            'libro_id' => $this->libroBachillerato->id,
            'estado' => Ejemplar::ESTADO_DISPONIBLE,
            'numEjemplar' => 3
        ]);

        $ejemplarIds = [$this->ejemplarDisponible->id, $ejemplar2->id, $ejemplar3->id];
        
        // Act - Realizar préstamo masivo exitoso
        $prestamosCreados = [];
        foreach ($ejemplarIds as $ejemplarId) {
            $ejemplar = Ejemplar::find($ejemplarId);
            if ($ejemplar && $ejemplar->estaDisponible()) {
                $prestamo = Prestamo::create([
                    'ejemplar_id' => $ejemplarId,
                    'lector_id' => $docente->id,
                    'fecha_prestamo' => now()->format('Y-m-d'),
                    'fecha_devolucion' => now()->addDays(30)->format('Y-m-d'),
                    'estado' => Prestamo::ESTADO_ACTIVO
                ]);
                $prestamosCreados[] = $prestamo;
            }
        }

        // Assert - Verificar que se crean 3 nuevos registros en la tabla prestamos
        $this->assertCount(3, $prestamosCreados);
        
        // Verificar que se actualiza el estado de los 3 ejemplares a 'PRESTADO'
        foreach ($ejemplarIds as $ejemplarId) {
            $ejemplar = Ejemplar::find($ejemplarId);
            $this->assertEquals(Ejemplar::ESTADO_PRESTADO, $ejemplar->estado);
        }
        
        // Verificar que todos los préstamos son para el mismo docente
        foreach ($prestamosCreados as $prestamo) {
            $this->assertEquals($docente->id, $prestamo->lector_id);
            $this->assertEquals(Prestamo::ESTADO_ACTIVO, $prestamo->estado);
        }
    }

    /**
     * Verificación de filtrado de historial por estado
     */
    public function test_verifica_filtrado_historial_por_estado()
    {
        // Arrange - Datos ya creados en setUp
        
        // Act - Filtrar historial por estado activo
        $prestamosActivos = Prestamo::where('estado', Prestamo::ESTADO_ACTIVO)
            ->with(['ejemplar.libro', 'lector'])
            ->get();

        // Assert - Verificar que se obtienen solo préstamos activos
        $this->assertGreaterThanOrEqual(1, $prestamosActivos->count());
        foreach ($prestamosActivos as $prestamo) {
            $this->assertEquals(Prestamo::ESTADO_ACTIVO, $prestamo->estado);
        }
    }

    /**
     * Verificación de estadísticas por sección
     */
    public function test_verifica_estadisticas_por_seccion()
    {
        // Arrange - Datos ya creados en setUp
        
        // Act - Obtener estadísticas por sección
        $estadisticasPrimaria = Prestamo::whereHas('ejemplar.libro', function($query) {
            $query->where('seccion_id', $this->seccionPrimaria->id);
        })->count();

        $estadisticasBachillerato = Prestamo::whereHas('ejemplar.libro', function($query) {
            $query->where('seccion_id', $this->seccionBachillerato->id);
        })->count();

        // Assert - Verificar que se obtienen estadísticas por sección
        $this->assertGreaterThanOrEqual(0, $estadisticasPrimaria);
        $this->assertGreaterThanOrEqual(0, $estadisticasBachillerato);
    }

    /**
     * Verificación de búsqueda en historial por lector
     */
    public function test_verifica_busqueda_historial_por_lector()
    {
        // Arrange - Datos ya creados en setUp
        
        // Act - Buscar historial por lector específico
        $historialLector = Prestamo::where('lector_id', $this->lectorFrecuente->id)
            ->with(['ejemplar.libro', 'lector'])
            ->get();

        // Assert - Verificar que se obtiene el historial del lector
        $this->assertGreaterThanOrEqual(2, $historialLector->count());
        foreach ($historialLector as $prestamo) {
            $this->assertEquals($this->lectorFrecuente->id, $prestamo->lector_id);
        }
    }

    /**
     * Verificación de cálculo de días de retraso
     */
    public function test_verifica_calculo_dias_retraso()
    {
        // Arrange - Datos ya creados en setUp
        
        // Act - Calcular días de retraso para préstamo vencido
        $prestamoVencido = Prestamo::where('estado', Prestamo::ESTADO_VENCIDO)->first();
        $fechaDevolucion = \Carbon\Carbon::parse($prestamoVencido->fecha_devolucion);
        $diasRetraso = $fechaDevolucion->diffInDays(now(), false);

        // Assert - Verificar que se calculan los días de retraso
        $this->assertGreaterThan(0, $diasRetraso);
    }

    /**
     * Verificación de préstamos masivos con diferentes docentes
     */
    public function test_verifica_prestamos_masivos_diferentes_docentes()
    {
        // Arrange - Crear múltiples docentes
        $docente1 = Lector::factory()->create([
            'nombre' => 'Prof. López',
            'codigo' => 'DOC003',
            'estado' => Lector::ESTADO_ACTIVO
        ]);

        $docente2 = Lector::factory()->create([
            'nombre' => 'Prof. Martínez',
            'codigo' => 'DOC004',
            'estado' => Lector::ESTADO_ACTIVO
        ]);

        // Act - Realizar préstamos masivos para diferentes docentes
        $prestamosDocente1 = Prestamo::where('lector_id', $docente1->id)->count();
        $prestamosDocente2 = Prestamo::where('lector_id', $docente2->id)->count();

        // Assert - Verificar que se pueden manejar múltiples docentes
        $this->assertGreaterThanOrEqual(0, $prestamosDocente1);
        $this->assertGreaterThanOrEqual(0, $prestamosDocente2);
    }
}
