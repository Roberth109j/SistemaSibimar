<?php

namespace Tests\Unit;

use App\Models\TemaDewey;
use App\Models\SubcategoriaDewey;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TemaDeweyTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function puede_crear_un_tema_dewey_con_datos_validos()
    {
        $datos = [
            'subcategoria_id' => 1,
            'nombre' => 'Bibliografías de Ciencias',
            'codigo' => '016.5'
        ];

        $tema = new TemaDewey($datos);

        $this->assertEquals(1, $tema->subcategoria_id);
        $this->assertEquals('Bibliografías de Ciencias', $tema->nombre);
        $this->assertEquals('016.5', $tema->codigo);
    }

    /** @test */
    public function tiene_los_campos_fillable_correctos()
    {
        $tema = new TemaDewey();
        $fillable = $tema->getFillable();

        $this->assertContains('subcategoria_id', $fillable);
        $this->assertContains('nombre', $fillable);
        $this->assertContains('codigo', $fillable);
        $this->assertCount(3, $fillable);
    }

    /** @test */
    public function usa_la_tabla_temas_dewey()
    {
        $tema = new TemaDewey();
        
        $this->assertEquals('temas_dewey', $tema->getTable());
    }

    /** @test */
    public function no_tiene_timestamps_habilitados()
    {
        $tema = new TemaDewey();
        
        $this->assertFalse($tema->timestamps);
    }

    /** @test */
    public function puede_tener_relacion_con_subcategoria_dewey()
    {
        $subcategoria = SubcategoriaDewey::factory()->create();
        $tema = TemaDewey::factory()->create(['subcategoria_id' => $subcategoria->id]);

        $relacion = $tema->subcategoria();

        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\BelongsTo::class, $relacion);
        $this->assertEquals('subcategoria_id', $relacion->getForeignKeyName());
        $this->assertEquals('id', $relacion->getOwnerKeyName());
    }

    /** @test */
    public function puede_obtener_subcategoria_dewey_asociada()
    {
        $subcategoria = SubcategoriaDewey::factory()->create();
        $tema = TemaDewey::factory()->create(['subcategoria_id' => $subcategoria->id]);

        $subcategoriaAsociada = $tema->subcategoria;

        $this->assertInstanceOf(SubcategoriaDewey::class, $subcategoriaAsociada);
        $this->assertEquals($subcategoria->id, $subcategoriaAsociada->id);
    }

    /** @test */
    public function puede_guardar_tema_dewey_en_base_de_datos()
    {
        $subcategoria = SubcategoriaDewey::factory()->create();
        $tema = TemaDewey::create([
            'subcategoria_id' => $subcategoria->id,
            'nombre' => 'Bibliografías de Matemáticas',
            'codigo' => '016.51'
        ]);

        $this->assertDatabaseHas('temas_dewey', [
            'subcategoria_id' => $subcategoria->id,
            'nombre' => 'Bibliografías de Matemáticas',
            'codigo' => '016.51'
        ]);

        $this->assertNotNull($tema->id);
    }

    /** @test */
    public function puede_actualizar_datos_del_tema_dewey()
    {
        $tema = TemaDewey::factory()->create([
            'nombre' => 'Nombre Original',
            'codigo' => '016.51'
        ]);

        $tema->update([
            'nombre' => 'Nombre Actualizado',
            'codigo' => '016.52'
        ]);

        $this->assertDatabaseHas('temas_dewey', [
            'id' => $tema->id,
            'nombre' => 'Nombre Actualizado',
            'codigo' => '016.52'
        ]);
    }

    /** @test */
    public function puede_eliminar_tema_dewey_de_base_de_datos()
    {
        $tema = TemaDewey::factory()->create();
        $temaId = $tema->id;

        $tema->delete();

        $this->assertDatabaseMissing('temas_dewey', [
            'id' => $temaId
        ]);
    }
}