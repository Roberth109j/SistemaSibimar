<?php

namespace Tests\Unit;

use App\Models\SubcategoriaDewey;
use App\Models\CategoriaDewey;
use App\Models\TemaDewey;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SubcategoriaDeweyTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function puede_crear_una_subcategoria_dewey_con_datos_validos()
    {
        $datos = [
            'categoria_id' => 1,
            'nombre' => 'Bibliografías',
            'codigo' => '010'
        ];

        $subcategoria = new SubcategoriaDewey($datos);

        $this->assertEquals(1, $subcategoria->categoria_id);
        $this->assertEquals('Bibliografías', $subcategoria->nombre);
        $this->assertEquals('010', $subcategoria->codigo);
    }

    /** @test */
    public function tiene_los_campos_fillable_correctos()
    {
        $subcategoria = new SubcategoriaDewey();
        $fillable = $subcategoria->getFillable();

        $this->assertContains('categoria_id', $fillable);
        $this->assertContains('nombre', $fillable);
        $this->assertContains('codigo', $fillable);
        $this->assertCount(3, $fillable);
    }

    /** @test */
    public function usa_la_tabla_subcategorias_dewey()
    {
        $subcategoria = new SubcategoriaDewey();
        
        $this->assertEquals('subcategorias_dewey', $subcategoria->getTable());
    }

    /** @test */
    public function no_tiene_timestamps_habilitados()
    {
        $subcategoria = new SubcategoriaDewey();
        
        $this->assertFalse($subcategoria->timestamps);
    }

    /** @test */
    public function puede_tener_relacion_con_categoria_dewey()
    {
        $categoria = CategoriaDewey::factory()->create();
        $subcategoria = SubcategoriaDewey::factory()->create(['categoria_id' => $categoria->id]);

        $relacion = $subcategoria->categoria();

        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\BelongsTo::class, $relacion);
        $this->assertEquals('categoria_id', $relacion->getForeignKeyName());
        $this->assertEquals('id', $relacion->getOwnerKeyName());
    }

    /** @test */
    public function puede_obtener_categoria_dewey_asociada()
    {
        $categoria = CategoriaDewey::factory()->create();
        $subcategoria = SubcategoriaDewey::factory()->create(['categoria_id' => $categoria->id]);

        $categoriaAsociada = $subcategoria->categoria;

        $this->assertInstanceOf(CategoriaDewey::class, $categoriaAsociada);
        $this->assertEquals($categoria->id, $categoriaAsociada->id);
    }

    /** @test */
    public function puede_tener_relacion_con_temas_dewey()
    {
        $subcategoria = SubcategoriaDewey::factory()->create();

        $relacion = $subcategoria->temasDewey();

        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class, $relacion);
        $this->assertEquals('subcategoria_id', $relacion->getForeignKeyName());
        $this->assertEquals('id', $relacion->getLocalKeyName());
    }

    /** @test */
    public function puede_obtener_temas_dewey_asociados()
    {
        $subcategoria = SubcategoriaDewey::factory()->create();
        $tema1 = TemaDewey::factory()->create(['subcategoria_id' => $subcategoria->id]);
        $tema2 = TemaDewey::factory()->create(['subcategoria_id' => $subcategoria->id]);

        $temas = $subcategoria->temasDewey;

        $this->assertInstanceOf(Collection::class, $temas);
        $this->assertCount(2, $temas);
        $this->assertTrue($temas->contains($tema1));
        $this->assertTrue($temas->contains($tema2));
    }

    /** @test */
    public function devuelve_coleccion_vacia_si_no_tiene_temas()
    {
        $subcategoria = SubcategoriaDewey::factory()->create();

        $temas = $subcategoria->temasDewey;

        $this->assertInstanceOf(Collection::class, $temas);
        $this->assertCount(0, $temas);
        $this->assertTrue($temas->isEmpty());
    }

    /** @test */
    public function puede_guardar_subcategoria_dewey_en_base_de_datos()
    {
        $categoria = CategoriaDewey::factory()->create();
        $subcategoria = SubcategoriaDewey::create([
            'categoria_id' => $categoria->id,
            'nombre' => 'Bibliografías Especializadas',
            'codigo' => '016'
        ]);

        $this->assertDatabaseHas('subcategorias_dewey', [
            'categoria_id' => $categoria->id,
            'nombre' => 'Bibliografías Especializadas',
            'codigo' => '016'
        ]);

        $this->assertNotNull($subcategoria->id);
    }

    /** @test */
    public function puede_actualizar_datos_de_la_subcategoria_dewey()
    {
        $subcategoria = SubcategoriaDewey::factory()->create([
            'nombre' => 'Nombre Original',
            'codigo' => '010'
        ]);

        $subcategoria->update([
            'nombre' => 'Nombre Actualizado',
            'codigo' => '011'
        ]);

        $this->assertDatabaseHas('subcategorias_dewey', [
            'id' => $subcategoria->id,
            'nombre' => 'Nombre Actualizado',
            'codigo' => '011'
        ]);
    }

    /** @test */
    public function puede_eliminar_subcategoria_dewey_de_base_de_datos()
    {
        $subcategoria = SubcategoriaDewey::factory()->create();
        $subcategoriaId = $subcategoria->id;

        $subcategoria->delete();

        $this->assertDatabaseMissing('subcategorias_dewey', [
            'id' => $subcategoriaId
        ]);
    }
}