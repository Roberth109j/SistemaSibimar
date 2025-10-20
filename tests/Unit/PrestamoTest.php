<?php

namespace Tests\Unit;

use App\Models\Prestamo;
use App\Models\Ejemplar;
use App\Models\Lector;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PrestamoTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function puede_crear_un_prestamo_con_datos_validos()
    {
        $datos = [
            'ejemplar_id' => 1,
            'lector_id' => 1,
            'fecha_prestamo' => '2023-01-01',
            'fecha_devolucion' => '2023-01-15',
            'fecha_devuelto' => null,
            'estado' => Prestamo::ESTADO_ACTIVO,
            'observaciones' => 'Préstamo inicial'
        ];

        $prestamo = new Prestamo($datos);

        $this->assertEquals(1, $prestamo->ejemplar_id);
        $this->assertEquals(1, $prestamo->lector_id);
        $this->assertEquals('2023-01-01', $prestamo->fecha_prestamo);
        $this->assertEquals('2023-01-15', $prestamo->fecha_devolucion);
        $this->assertNull($prestamo->fecha_devuelto);
        $this->assertEquals(Prestamo::ESTADO_ACTIVO, $prestamo->estado);
    }

    /** @test */
    public function tiene_los_campos_fillable_correctos()
    {
        $prestamo = new Prestamo();
        $fillable = $prestamo->getFillable();

        $this->assertContains('ejemplar_id', $fillable);
        $this->assertContains('lector_id', $fillable);
        $this->assertContains('fecha_prestamo', $fillable);
        $this->assertContains('fecha_devolucion', $fillable);
        $this->assertContains('fecha_devuelto', $fillable);
        $this->assertContains('estado', $fillable);
        $this->assertCount(6, $fillable);
    }

    /** @test */
    public function usa_la_tabla_prestamos()
    {
        $prestamo = new Prestamo();
        
        $this->assertEquals('prestamos', $prestamo->getTable());
    }

    /** @test */
    public function no_tiene_timestamps_habilitados()
    {
        $prestamo = new Prestamo();
        
        $this->assertFalse($prestamo->timestamps);
    }

    /** @test */
    public function tiene_las_constantes_de_estado_definidas()
    {
        $this->assertEquals('ACTIVO', Prestamo::ESTADO_ACTIVO);
        $this->assertEquals('DEVUELTO', Prestamo::ESTADO_DEVUELTO);
        $this->assertEquals('VENCIDO', Prestamo::ESTADO_VENCIDO);
    }

    /** @test */
    public function puede_tener_relacion_con_ejemplar()
    {
        $ejemplar = Ejemplar::factory()->create();
        $prestamo = Prestamo::factory()->create(['ejemplar_id' => $ejemplar->id]);

        $relacion = $prestamo->ejemplar();

        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\BelongsTo::class, $relacion);
        $this->assertEquals('ejemplar_id', $relacion->getForeignKeyName());
        $this->assertEquals('id', $relacion->getOwnerKeyName());
    }

    /** @test */
    public function puede_tener_relacion_con_lector()
    {
        $lector = Lector::factory()->create();
        $prestamo = Prestamo::factory()->create(['lector_id' => $lector->id]);

        $relacion = $prestamo->lector();

        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\BelongsTo::class, $relacion);
        $this->assertEquals('lector_id', $relacion->getForeignKeyName());
        $this->assertEquals('id', $relacion->getOwnerKeyName());
    }

    /** @test */
    public function identifica_correctamente_estado_activo()
    {
        $prestamo = Prestamo::factory()->create(['estado' => Prestamo::ESTADO_ACTIVO]);

        $this->assertTrue($prestamo->estaActivo());
        $this->assertFalse($prestamo->estaDevuelto());
        $this->assertFalse($prestamo->estaVencido());
    }

    /** @test */
    public function identifica_correctamente_estado_devuelto()
    {
        $prestamo = Prestamo::factory()->create(['estado' => Prestamo::ESTADO_DEVUELTO]);

        $this->assertTrue($prestamo->estaDevuelto());
        $this->assertFalse($prestamo->estaActivo());
        $this->assertFalse($prestamo->estaVencido());
    }

    /** @test */
    public function identifica_correctamente_estado_vencido()
    {
        $prestamo = Prestamo::factory()->create(['estado' => Prestamo::ESTADO_VENCIDO]);

        $this->assertTrue($prestamo->estaVencido());
        $this->assertFalse($prestamo->estaActivo());
        $this->assertFalse($prestamo->estaDevuelto());
    }

    /** @test */
    public function puede_marcar_como_devuelto()
    {
        $ejemplar = Ejemplar::factory()->create(['estado' => Ejemplar::ESTADO_PRESTADO]);
        $prestamo = Prestamo::factory()->create([
            'ejemplar_id' => $ejemplar->id,
            'estado' => Prestamo::ESTADO_ACTIVO
        ]);

        $prestamo->marcarComoDevuelto();

        $this->assertEquals(Prestamo::ESTADO_DEVUELTO, $prestamo->estado);
        $this->assertTrue($prestamo->estaDevuelto());
        $this->assertEquals(Ejemplar::ESTADO_DISPONIBLE, $ejemplar->fresh()->estado);
    }

    /** @test */
    public function puede_marcar_como_vencido()
    {
        $prestamo = Prestamo::factory()->create(['estado' => Prestamo::ESTADO_ACTIVO]);

        $prestamo->marcarComoVencido();

        $this->assertEquals(Prestamo::ESTADO_VENCIDO, $prestamo->estado);
        $this->assertTrue($prestamo->estaVencido());
    }

    /** @test */
    public function puede_guardar_prestamo_en_base_de_datos()
    {
        $ejemplar = Ejemplar::factory()->create();
        $lector = Lector::factory()->create();
        $prestamo = Prestamo::create([
            'ejemplar_id' => $ejemplar->id,
            'lector_id' => $lector->id,
            'fecha_prestamo' => '2023-01-01',
            'fecha_devolucion' => '2023-01-15',
            'estado' => Prestamo::ESTADO_ACTIVO
        ]);

        $this->assertDatabaseHas('prestamos', [
            'ejemplar_id' => $ejemplar->id,
            'lector_id' => $lector->id,
            'fecha_prestamo' => '2023-01-01',
            'fecha_devolucion' => '2023-01-15',
            'estado' => Prestamo::ESTADO_ACTIVO
        ]);

        $this->assertNotNull($prestamo->id);
    }

    /** @test */
    public function puede_actualizar_datos_del_prestamo()
    {
        $prestamo = Prestamo::factory()->create([
            'fecha_devolucion' => '2023-01-15',
            'estado' => Prestamo::ESTADO_ACTIVO
        ]);

        $prestamo->update([
            'fecha_devolucion' => '2023-01-30',
            'estado' => Prestamo::ESTADO_DEVUELTO
        ]);

        $this->assertDatabaseHas('prestamos', [
            'id' => $prestamo->id,
            'fecha_devolucion' => '2023-01-30',
            'estado' => Prestamo::ESTADO_DEVUELTO
        ]);
    }

    /** @test */
    public function puede_eliminar_prestamo_de_base_de_datos()
    {
        $prestamo = Prestamo::factory()->create();
        $prestamoId = $prestamo->id;

        $prestamo->delete();

        $this->assertDatabaseMissing('prestamos', [
            'id' => $prestamoId
        ]);
    }
}