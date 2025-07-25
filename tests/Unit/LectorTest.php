<?php

namespace Tests\Unit;

use App\Models\Lector;
use App\Models\Grado;
use App\Models\Prestamo;
use Database\Seeders\SeccionSeeder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LectorTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(SeccionSeeder::class);
    }

    /** @test */
    public function puede_crear_un_lector_con_datos_validos()
    {
        $datos = [
            'nombre' => 'Juan Pérez',
            'codigo' => 'EST001',
            'tipo' => Lector::TIPO_ESTUDIANTE,
            'grado_id' => 1,
            'estado' => Lector::ESTADO_ACTIVO
        ];

        $lector = new Lector($datos);

        $this->assertEquals('Juan Pérez', $lector->nombre);
        $this->assertEquals('EST001', $lector->codigo);
        $this->assertEquals(Lector::TIPO_ESTUDIANTE, $lector->tipo);
        $this->assertEquals(1, $lector->grado_id);
        $this->assertEquals(Lector::ESTADO_ACTIVO, $lector->estado);
    }

    /** @test */
    public function tiene_los_campos_fillable_correctos()
    {
        $lector = new Lector();
        $fillable = $lector->getFillable();

        $this->assertContains('nombre', $fillable);
        $this->assertContains('codigo', $fillable);
        $this->assertContains('tipo', $fillable);
        $this->assertContains('grado_id', $fillable);
        $this->assertContains('estado', $fillable);
        $this->assertCount(5, $fillable);
    }

    /** @test */
    public function usa_la_tabla_lectores()
    {
        $lector = new Lector();
        
        $this->assertEquals('lectores', $lector->getTable());
    }

    /** @test */
    public function no_tiene_timestamps_habilitados()
    {
        $lector = new Lector();
        
        $this->assertFalse($lector->timestamps);
    }

    /** @test */
    public function tiene_las_constantes_de_tipo_definidas()
    {
        $this->assertEquals('ESTUDIANTE', Lector::TIPO_ESTUDIANTE);
        $this->assertEquals('DOCENTE', Lector::TIPO_DOCENTE);
        $this->assertEquals('OTRO', Lector::TIPO_OTRO);
    }

    /** @test */
    public function tiene_las_constantes_de_estado_definidas()
    {
        $this->assertEquals('ACTIVO', Lector::ESTADO_ACTIVO);
        $this->assertEquals('INACTIVO', Lector::ESTADO_INACTIVO);
    }

    /** @test */
    public function puede_tener_relacion_con_grado()
    {
        $grado = Grado::factory()->create();
        $lector = Lector::factory()->create(['grado_id' => $grado->id]);

        $relacion = $lector->grado();

        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\BelongsTo::class, $relacion);
        $this->assertEquals('grado_id', $relacion->getForeignKeyName());
        $this->assertEquals('id', $relacion->getOwnerKeyName());
    }

    /** @test */
    public function puede_tener_relacion_con_prestamos()
    {
        $lector = Lector::factory()->create();

        $relacion = $lector->prestamos();

        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class, $relacion);
        $this->assertEquals('lector_id', $relacion->getForeignKeyName());
        $this->assertEquals('id', $relacion->getLocalKeyName());
    }

    /** @test */
    public function identifica_correctamente_estado_activo()
    {
        $lectorActivo = Lector::factory()->create(['estado' => Lector::ESTADO_ACTIVO]);
        $lectorInactivo = Lector::factory()->create(['estado' => Lector::ESTADO_INACTIVO]);

        $this->assertTrue($lectorActivo->estaActivo());
        $this->assertFalse($lectorInactivo->estaActivo());
    }

    /** @test */
    public function identifica_correctamente_tipo_estudiante()
    {
        $estudiante = Lector::factory()->create(['tipo' => Lector::TIPO_ESTUDIANTE]);
        $docente = Lector::factory()->create(['tipo' => Lector::TIPO_DOCENTE]);

        $this->assertTrue($estudiante->esEstudiante());
        $this->assertFalse($docente->esEstudiante());
    }

    /** @test */
    public function identifica_correctamente_tipo_docente()
    {
        $docente = Lector::factory()->create(['tipo' => Lector::TIPO_DOCENTE]);
        $estudiante = Lector::factory()->create(['tipo' => Lector::TIPO_ESTUDIANTE]);

        $this->assertTrue($docente->esDocente());
        $this->assertFalse($estudiante->esDocente());
    }

    /** @test */
    public function puede_obtener_prestamos_activos()
    {
        $lector = Lector::factory()->create();
        $prestamoActivo1 = Prestamo::factory()->create([
            'lector_id' => $lector->id,
            'estado' => Prestamo::ESTADO_ACTIVO
        ]);
        $prestamoActivo2 = Prestamo::factory()->create([
            'lector_id' => $lector->id,
            'estado' => Prestamo::ESTADO_ACTIVO
        ]);
        Prestamo::factory()->create([
            'lector_id' => $lector->id,
            'estado' => Prestamo::ESTADO_DEVUELTO
        ]);

        $prestamosActivos = $lector->prestamosActivos()->get();

        $this->assertInstanceOf(Collection::class, $prestamosActivos);
        $this->assertCount(2, $prestamosActivos);
        $this->assertTrue($prestamosActivos->contains($prestamoActivo1));
        $this->assertTrue($prestamosActivos->contains($prestamoActivo2));
    }

    /** @test */
    public function puede_obtener_prestamos_vencidos()
    {
        $lector = Lector::factory()->create();
        $prestamoVencido1 = Prestamo::factory()->create([
            'lector_id' => $lector->id,
            'estado' => Prestamo::ESTADO_VENCIDO
        ]);
        $prestamoVencido2 = Prestamo::factory()->create([
            'lector_id' => $lector->id,
            'estado' => Prestamo::ESTADO_VENCIDO
        ]);
        Prestamo::factory()->create([
            'lector_id' => $lector->id,
            'estado' => Prestamo::ESTADO_ACTIVO
        ]);

        $prestamosVencidos = $lector->prestamosVencidos()->get();

        $this->assertInstanceOf(Collection::class, $prestamosVencidos);
        $this->assertCount(2, $prestamosVencidos);
        $this->assertTrue($prestamosVencidos->contains($prestamoVencido1));
        $this->assertTrue($prestamosVencidos->contains($prestamoVencido2));
    }

    /** @test */
    public function verifica_si_tiene_prestamos_activos()
    {
        $lector = Lector::factory()->create();
        
        $this->assertFalse($lector->tienePrestamosActivos());

        Prestamo::factory()->create([
            'lector_id' => $lector->id,
            'estado' => Prestamo::ESTADO_ACTIVO
        ]);

        $this->assertTrue($lector->tienePrestamosActivos());
    }

    /** @test */
    public function verifica_si_tiene_prestamos_vencidos()
    {
        $lector = Lector::factory()->create();
        
        $this->assertFalse($lector->tienePrestamosVencidos());

        Prestamo::factory()->create([
            'lector_id' => $lector->id,
            'estado' => Prestamo::ESTADO_VENCIDO
        ]);

        $this->assertTrue($lector->tienePrestamosVencidos());
    }

    /** @test */
    public function puede_guardar_lector_en_base_de_datos()
    {
        $grado = Grado::factory()->create();
        $lector = Lector::create([
            'nombre' => 'María López',
            'codigo' => 'EST002',
            'tipo' => Lector::TIPO_ESTUDIANTE,
            'grado_id' => $grado->id,
            'estado' => Lector::ESTADO_ACTIVO
        ]);

        $this->assertDatabaseHas('lectores', [
            'nombre' => 'María López',
            'codigo' => 'EST002',
            'tipo' => Lector::TIPO_ESTUDIANTE,
            'grado_id' => $grado->id,
            'estado' => Lector::ESTADO_ACTIVO
        ]);

        $this->assertNotNull($lector->id);
    }

    /** @test */
    public function puede_actualizar_datos_del_lector()
    {
        $lector = Lector::factory()->create([
            'nombre' => 'Nombre Original',
            'estado' => Lector::ESTADO_ACTIVO
        ]);

        $lector->update([
            'nombre' => 'Nombre Actualizado',
            'estado' => Lector::ESTADO_INACTIVO
        ]);

        $this->assertDatabaseHas('lectores', [
            'id' => $lector->id,
            'nombre' => 'Nombre Actualizado',
            'estado' => Lector::ESTADO_INACTIVO
        ]);
    }

    /** @test */
    public function puede_eliminar_lector_de_base_de_datos()
    {
        $lector = Lector::factory()->create();
        $lectorId = $lector->id;

        $lector->delete();

        $this->assertDatabaseMissing('lectores', [
            'id' => $lectorId
        ]);
    }
}