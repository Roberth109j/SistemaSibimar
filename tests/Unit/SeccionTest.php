<?php

namespace Tests\Unit;

use App\Models\Seccion;
use App\Models\Grado;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SeccionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // No ejecutamos el seeder aquí para evitar conflictos
    }

    /** @test */
    public function puede_crear_una_seccion_con_datos_validos()
    {
        $datos = [
            'nombre' => 'PRIMARIA'
        ];

        $seccion = new Seccion($datos);

        $this->assertEquals('PRIMARIA', $seccion->nombre);
    }

    /** @test */
    public function tiene_los_campos_fillable_correctos()
    {
        $seccion = new Seccion();
        $fillable = $seccion->getFillable();

        $this->assertContains('nombre', $fillable);
        $this->assertCount(1, $fillable);
    }

    /** @test */
    public function usa_la_tabla_secciones()
    {
        $seccion = new Seccion();
        
        $this->assertEquals('secciones', $seccion->getTable());
    }

    /** @test */
    public function tiene_los_casts_correctos()
    {
        $seccion = new Seccion();
        $casts = $seccion->getCasts();

        $this->assertEquals('string', $casts['nombre']);
    }

    /** @test */
    public function puede_tener_relacion_con_grados()
    {
        $seccion = new Seccion(['nombre' => 'PRIMARIA']);
        $seccion->save();

        $relacion = $seccion->grados();

        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class, $relacion);
        $this->assertEquals('seccion_id', $relacion->getForeignKeyName());
        $this->assertEquals('id', $relacion->getLocalKeyName());
    }

    /** @test */
    public function puede_obtener_grados_asociados()
    {
        $seccion = new Seccion(['nombre' => 'PRIMARIA']);
        $seccion->save();
        
        $grado1 = Grado::factory()->create(['seccion_id' => $seccion->id]);
        $grado2 = Grado::factory()->create(['seccion_id' => $seccion->id]);

        $grados = $seccion->grados;

        $this->assertInstanceOf(Collection::class, $grados);
        $this->assertCount(2, $grados);
        $this->assertTrue($grados->contains($grado1));
        $this->assertTrue($grados->contains($grado2));
    }

    /** @test */
    public function devuelve_coleccion_vacia_si_no_tiene_grados()
    {
        $seccion = new Seccion(['nombre' => 'PRIMARIA']);
        $seccion->save();

        $grados = $seccion->grados;

        $this->assertInstanceOf(Collection::class, $grados);
        $this->assertCount(0, $grados);
        $this->assertTrue($grados->isEmpty());
    }

    /** @test */
    public function identifica_correctamente_seccion_primaria()
    {
        $seccionPrimaria = new Seccion(['nombre' => 'PRIMARIA']);
        $seccionPrimaria->save();
        
        $seccionBachillerato = new Seccion(['nombre' => 'BACHILLERATO']);
        $seccionBachillerato->save();

        $this->assertTrue($seccionPrimaria->esPrimaria());
        $this->assertFalse($seccionBachillerato->esPrimaria());
    }

    /** @test */
    public function identifica_correctamente_seccion_bachillerato()
    {
        $seccionPrimaria = new Seccion(['nombre' => 'PRIMARIA']);
        $seccionPrimaria->save();
        
        $seccionBachillerato = new Seccion(['nombre' => 'BACHILLERATO']);
        $seccionBachillerato->save();

        $this->assertTrue($seccionBachillerato->esBachillerato());
        $this->assertFalse($seccionPrimaria->esBachillerato());
    }

    /** @test */
    public function puede_guardar_seccion_en_base_de_datos()
    {
        $seccion = new Seccion(['nombre' => 'PRIMARIA']);
        $seccion->save();

        $this->assertDatabaseHas('secciones', [
            'nombre' => 'PRIMARIA'
        ]);

        $this->assertNotNull($seccion->id);
    }

    /** @test */
    public function puede_actualizar_datos_de_la_seccion()
    {
        $seccion = new Seccion(['nombre' => 'PRIMARIA']);
        $seccion->save();

        $seccion->update([
            'nombre' => 'BACHILLERATO'
        ]);

        $this->assertDatabaseHas('secciones', [
            'id' => $seccion->id,
            'nombre' => 'BACHILLERATO'
        ]);
    }

    /** @test */
    public function puede_eliminar_seccion_de_base_de_datos()
    {
        $seccion = new Seccion(['nombre' => 'PRIMARIA']);
        $seccion->save();
        $seccionId = $seccion->id;

        $seccion->delete();

        $this->assertDatabaseMissing('secciones', [
            'id' => $seccionId
        ]);
    }
}