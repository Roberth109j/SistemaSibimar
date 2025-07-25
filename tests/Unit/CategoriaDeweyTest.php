<?php

namespace Tests\Unit;

use App\Models\CategoriaDewey;
use App\Models\SubcategoriaDewey;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CategoriaDeweyTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function puede_crear_una_categoria_dewey_con_datos_validos()
    {
        $datos = [
            'nombre' => 'Generalidades',
            'codigo' => '000'
        ];

        $categoria = new CategoriaDewey($datos);

        $this->assertEquals('Generalidades', $categoria->nombre);
        $this->assertEquals('000', $categoria->codigo);
    }

    /** @test */
    public function tiene_los_campos_fillable_correctos()
    {
        $categoria = new CategoriaDewey();
        $fillable = $categoria->getFillable();

        $this->assertContains('nombre', $fillable);
        $this->assertContains('codigo', $fillable);
        $this->assertCount(2, $fillable);
    }

    /** @test */
    public function usa_la_tabla_categorias_dewey()
    {
        $categoria = new CategoriaDewey();
        
        $this->assertEquals('categorias_dewey', $categoria->getTable());
    }

    /** @test */
    public function no_tiene_timestamps_habilitados()
    {
        $categoria = new CategoriaDewey();
        
        $this->assertFalse($categoria->timestamps);
    }

    /** @test */
    public function puede_tener_relacion_con_subcategorias_dewey()
    {
        $categoria = CategoriaDewey::factory()->create();

        $relacion = $categoria->subcategoriasDewey();

        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class, $relacion);
        $this->assertEquals('categoria_id', $relacion->getForeignKeyName());
        $this->assertEquals('id', $relacion->getLocalKeyName());
    }

    /** @test */
    public function puede_obtener_subcategorias_dewey_asociadas()
    {
        $categoria = CategoriaDewey::factory()->create();
        $subcategoria1 = SubcategoriaDewey::factory()->create(['categoria_id' => $categoria->id]);
        $subcategoria2 = SubcategoriaDewey::factory()->create(['categoria_id' => $categoria->id]);

        $subcategorias = $categoria->subcategoriasDewey;

        $this->assertInstanceOf(Collection::class, $subcategorias);
        $this->assertCount(2, $subcategorias);
        $this->assertTrue($subcategorias->contains($subcategoria1));
        $this->assertTrue($subcategorias->contains($subcategoria2));
    }

    /** @test */
    public function devuelve_coleccion_vacia_si_no_tiene_subcategorias()
    {
        $categoria = CategoriaDewey::factory()->create();

        $subcategorias = $categoria->subcategoriasDewey;

        $this->assertInstanceOf(Collection::class, $subcategorias);
        $this->assertCount(0, $subcategorias);
        $this->assertTrue($subcategorias->isEmpty());
    }

    /** @test */
    public function puede_guardar_categoria_dewey_en_base_de_datos()
    {
        $categoria = CategoriaDewey::create([
            'nombre' => 'Ciencias Sociales',
            'codigo' => '300'
        ]);

        $this->assertDatabaseHas('categorias_dewey', [
            'nombre' => 'Ciencias Sociales',
            'codigo' => '300'
        ]);

        $this->assertNotNull($categoria->id);
    }

    /** @test */
    public function puede_actualizar_datos_de_la_categoria_dewey()
    {
        $categoria = CategoriaDewey::factory()->create([
            'nombre' => 'Nombre Original',
            'codigo' => '000'
        ]);

        $categoria->update([
            'nombre' => 'Nombre Actualizado',
            'codigo' => '100'
        ]);

        $this->assertDatabaseHas('categorias_dewey', [
            'id' => $categoria->id,
            'nombre' => 'Nombre Actualizado',
            'codigo' => '100'
        ]);
    }

    /** @test */
    public function puede_eliminar_categoria_dewey_de_base_de_datos()
    {
        $categoria = CategoriaDewey::factory()->create();
        $categoriaId = $categoria->id;

        $categoria->delete();

        $this->assertDatabaseMissing('categorias_dewey', [
            'id' => $categoriaId
        ]);
    }
}