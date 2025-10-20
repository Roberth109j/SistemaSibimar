<?php

namespace Tests\Unit;

use App\Models\Ejemplar;
use App\Models\Libro;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EjemplarTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function puede_crear_un_ejemplar_con_datos_validos()
    {
        $datos = [
            'libro_id' => 1,
            'numEjemplar' => 1,
            'tipo_adquisicion' => Ejemplar::TIPO_COMPRA,
            'estado' => Ejemplar::ESTADO_DISPONIBLE,
            'observaciones' => 'Ejemplar en buen estado'
        ];

        $ejemplar = new Ejemplar($datos);

        $this->assertEquals(1, $ejemplar->libro_id);
        $this->assertEquals(1, $ejemplar->numEjemplar);
        $this->assertEquals(Ejemplar::TIPO_COMPRA, $ejemplar->tipo_adquisicion);
        $this->assertEquals(Ejemplar::ESTADO_DISPONIBLE, $ejemplar->estado);
        $this->assertEquals('Ejemplar en buen estado', $ejemplar->observaciones);
    }

    /** @test */
    public function tiene_los_campos_fillable_correctos()
    {
        $ejemplar = new Ejemplar();
        $fillable = $ejemplar->getFillable();

        $this->assertContains('libro_id', $fillable);
        $this->assertContains('numEjemplar', $fillable);
        $this->assertContains('tipo_adquisicion', $fillable);
        $this->assertContains('estado', $fillable);
        $this->assertContains('observaciones', $fillable);
        $this->assertCount(5, $fillable);
    }

    /** @test */
    public function usa_la_tabla_ejemplares()
    {
        $ejemplar = new Ejemplar();
        
        $this->assertEquals('ejemplares', $ejemplar->getTable());
    }

    /** @test */
    public function tiene_los_casts_correctos()
    {
        $ejemplar = new Ejemplar();
        $casts = $ejemplar->getCasts();

        $this->assertEquals('integer', $casts['numEjemplar']);
        $this->assertEquals('datetime', $casts['created_at']);
        $this->assertEquals('datetime', $casts['updated_at']);
    }

    /** @test */
    public function tiene_las_constantes_de_tipo_adquisicion_definidas()
    {
        $this->assertEquals('COMPRA', Ejemplar::TIPO_COMPRA);
        $this->assertEquals('REPOSICION', Ejemplar::TIPO_REPOSICION);
        $this->assertEquals('DONACION', Ejemplar::TIPO_DONACION);
    }

    /** @test */
    public function tiene_las_constantes_de_estado_definidas()
    {
        $this->assertEquals('DISPONIBLE', Ejemplar::ESTADO_DISPONIBLE);
        $this->assertEquals('PRESTADO', Ejemplar::ESTADO_PRESTADO);
        $this->assertEquals('DADO DE BAJA', Ejemplar::ESTADO_DADO_DE_BAJA);
        $this->assertEquals('PERDIDO', Ejemplar::ESTADO_PERDIDO);
    }

    /** @test */
    public function devuelve_tipos_de_adquisicion_correctos()
    {
        $tiposAdquisicion = Ejemplar::tiposAdquisicion();

        $this->assertIsArray($tiposAdquisicion);
        $this->assertCount(3, $tiposAdquisicion);
        $this->assertContains(Ejemplar::TIPO_COMPRA, $tiposAdquisicion);
        $this->assertContains(Ejemplar::TIPO_DONACION, $tiposAdquisicion);
        $this->assertContains(Ejemplar::TIPO_REPOSICION, $tiposAdquisicion);
    }

    /** @test */
    public function devuelve_estados_correctos()
    {
        $estados = Ejemplar::estados();

        $this->assertIsArray($estados);
        $this->assertCount(4, $estados);
        $this->assertContains(Ejemplar::ESTADO_DISPONIBLE, $estados);
        $this->assertContains(Ejemplar::ESTADO_PRESTADO, $estados);
        $this->assertContains(Ejemplar::ESTADO_DADO_DE_BAJA, $estados);
        $this->assertContains(Ejemplar::ESTADO_PERDIDO, $estados);
    }

    /** @test */
    public function puede_tener_relacion_con_libro()
    {
        $libro = Libro::factory()->create();
        $ejemplar = Ejemplar::factory()->create(['libro_id' => $libro->id]);

        $relacion = $ejemplar->libro();

        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\BelongsTo::class, $relacion);
        $this->assertEquals('libro_id', $relacion->getForeignKeyName());
        $this->assertEquals('id', $relacion->getOwnerKeyName());
    }

    /** @test */
    public function puede_obtener_libro_asociado()
    {
        $libro = Libro::factory()->create();
        $ejemplar = Ejemplar::factory()->create(['libro_id' => $libro->id]);

        $libroAsociado = $ejemplar->libro;

        $this->assertInstanceOf(Libro::class, $libroAsociado);
        $this->assertEquals($libro->id, $libroAsociado->id);
    }

    /** @test */
    public function identifica_correctamente_estado_disponible()
    {
        $ejemplar = Ejemplar::factory()->create(['estado' => Ejemplar::ESTADO_DISPONIBLE]);

        $this->assertTrue($ejemplar->estaDisponible());
        $this->assertFalse($ejemplar->estaPrestado());
        $this->assertFalse($ejemplar->estaInactivo());
    }

    /** @test */
    public function identifica_correctamente_estado_prestado()
    {
        $ejemplar = Ejemplar::factory()->create(['estado' => Ejemplar::ESTADO_PRESTADO]);

        $this->assertTrue($ejemplar->estaPrestado());
        $this->assertFalse($ejemplar->estaDisponible());
        $this->assertFalse($ejemplar->estaInactivo());
    }

    /** @test */
    public function identifica_correctamente_estado_dado_de_baja()
    {
        $ejemplar = Ejemplar::factory()->create(['estado' => Ejemplar::ESTADO_DADO_DE_BAJA]);

        $this->assertTrue($ejemplar->estaDadoDeBaja());
        $this->assertFalse($ejemplar->estaDisponible());
        $this->assertFalse($ejemplar->estaPrestado());
    }

    /** @test */
    public function puede_marcar_como_prestado()
    {
        $ejemplar = Ejemplar::factory()->create(['estado' => Ejemplar::ESTADO_DISPONIBLE]);

        $ejemplar->marcarComoPrestado();

        $this->assertEquals(Ejemplar::ESTADO_PRESTADO, $ejemplar->estado);
        $this->assertTrue($ejemplar->estaPrestado());
    }

    /** @test */
    public function puede_marcar_como_disponible()
    {
        $ejemplar = Ejemplar::factory()->create(['estado' => Ejemplar::ESTADO_PRESTADO]);

        $ejemplar->marcarComoDisponible();

        $this->assertEquals(Ejemplar::ESTADO_DISPONIBLE, $ejemplar->estado);
        $this->assertTrue($ejemplar->estaDisponible());
    }

    /** @test */
    public function puede_marcar_como_dado_de_baja()
    {
        $ejemplar = Ejemplar::factory()->create(['estado' => Ejemplar::ESTADO_DISPONIBLE]);

        $ejemplar->marcarComoDadoDeBaja();

        $this->assertEquals(Ejemplar::ESTADO_DADO_DE_BAJA, $ejemplar->estado);
        $this->assertTrue($ejemplar->estaDadoDeBaja());
    }

    /** @test */
    public function puede_guardar_ejemplar_en_base_de_datos()
    {
        $libro = Libro::factory()->create();
        $ejemplar = Ejemplar::create([
            'libro_id' => $libro->id,
            'numEjemplar' => 1,
            'tipo_adquisicion' => Ejemplar::TIPO_COMPRA,
            'estado' => Ejemplar::ESTADO_DISPONIBLE,
            'observaciones' => 'Nuevo ejemplar'
        ]);

        $this->assertDatabaseHas('ejemplares', [
            'libro_id' => $libro->id,
            'numEjemplar' => 1,
            'tipo_adquisicion' => Ejemplar::TIPO_COMPRA,
            'estado' => Ejemplar::ESTADO_DISPONIBLE,
            'observaciones' => 'Nuevo ejemplar'
        ]);

        $this->assertNotNull($ejemplar->id);
    }

    /** @test */
    public function puede_actualizar_datos_del_ejemplar()
    {
        $ejemplar = Ejemplar::factory()->create([
            'tipo_adquisicion' => Ejemplar::TIPO_COMPRA,
            'estado' => Ejemplar::ESTADO_DISPONIBLE,
            'observaciones' => 'Observación inicial'
        ]);

        $ejemplar->update([
            'tipo_adquisicion' => Ejemplar::TIPO_DONACION,
            'estado' => Ejemplar::ESTADO_PRESTADO,
            'observaciones' => 'Observación actualizada'
        ]);

        $this->assertDatabaseHas('ejemplares', [
            'id' => $ejemplar->id,
            'tipo_adquisicion' => Ejemplar::TIPO_DONACION,
            'estado' => Ejemplar::ESTADO_PRESTADO,
            'observaciones' => 'Observación actualizada'
        ]);
    }

    /** @test */
    public function puede_eliminar_ejemplar_de_base_de_datos()
    {
        $ejemplar = Ejemplar::factory()->create();
        $ejemplarId = $ejemplar->id;

        $ejemplar->delete();

        $this->assertDatabaseMissing('ejemplares', [
            'id' => $ejemplarId
        ]);
    }
}