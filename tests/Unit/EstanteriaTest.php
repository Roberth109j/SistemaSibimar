<?php

namespace Tests\Unit;

use App\Models\Estanteria;
use App\Models\Libro;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EstanteriaTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function puede_crear_una_estanteria_con_datos_validos()
    {
        $datos = [
            'cod_estante' => 'EST-001',
            'descripcion' => 'Estantería de Literatura'
        ];

        $estanteria = new Estanteria($datos);

        $this->assertEquals('EST-001', $estanteria->cod_estante);
        $this->assertEquals('Estantería de Literatura', $estanteria->descripcion);
    }

    /** @test */
    public function tiene_los_campos_fillable_correctos()
    {
        $estanteria = new Estanteria();
        $fillable = $estanteria->getFillable();

        $this->assertContains('cod_estante', $fillable);
        $this->assertContains('descripcion', $fillable);
        $this->assertCount(2, $fillable);
    }

    /** @test */
    public function usa_la_tabla_estanterias()
    {
        $estanteria = new Estanteria();
        
        $this->assertEquals('estanterias', $estanteria->getTable());
    }

    /** @test */
    public function puede_tener_relacion_con_libros()
    {
        $estanteria = Estanteria::factory()->create();

        $relacion = $estanteria->libros();

        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class, $relacion);
        $this->assertEquals('estanteria_id', $relacion->getForeignKeyName());
        $this->assertEquals('id', $relacion->getLocalKeyName());
    }

    /** @test */
    public function puede_obtener_libros_asociados()
    {
        $estanteria = Estanteria::factory()->create();
        $libro1 = Libro::factory()->create(['estanteria_id' => $estanteria->id]);
        $libro2 = Libro::factory()->create(['estanteria_id' => $estanteria->id]);

        $libros = $estanteria->libros;

        $this->assertInstanceOf(Collection::class, $libros);
        $this->assertCount(2, $libros);
        $this->assertTrue($libros->contains($libro1));
        $this->assertTrue($libros->contains($libro2));
    }

    /** @test */
    public function devuelve_coleccion_vacia_si_no_tiene_libros()
    {
        $estanteria = Estanteria::factory()->create();

        $libros = $estanteria->libros;

        $this->assertInstanceOf(Collection::class, $libros);
        $this->assertCount(0, $libros);
        $this->assertTrue($libros->isEmpty());
    }

    /** @test */
    public function puede_guardar_estanteria_en_base_de_datos()
    {
        $estanteria = Estanteria::create([
            'cod_estante' => 'EST-002',
            'descripcion' => 'Estantería de Historia'
        ]);

        $this->assertDatabaseHas('estanterias', [
            'cod_estante' => 'EST-002',
            'descripcion' => 'Estantería de Historia'
        ]);

        $this->assertNotNull($estanteria->id);
    }

    /** @test */
    public function puede_actualizar_datos_de_la_estanteria()
    {
        $estanteria = Estanteria::factory()->create([
            'cod_estante' => 'EST-001',
            'descripcion' => 'Descripción Original'
        ]);

        $estanteria->update([
            'cod_estante' => 'EST-003',
            'descripcion' => 'Descripción Actualizada'
        ]);

        $this->assertDatabaseHas('estanterias', [
            'id' => $estanteria->id,
            'cod_estante' => 'EST-003',
            'descripcion' => 'Descripción Actualizada'
        ]);
    }

    /** @test */
    public function puede_eliminar_estanteria_de_base_de_datos()
    {
        $estanteria = Estanteria::factory()->create();
        $estanteriaId = $estanteria->id;

        $estanteria->delete();

        $this->assertDatabaseMissing('estanterias', [
            'id' => $estanteriaId
        ]);
    }
}