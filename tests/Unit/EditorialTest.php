<?php

namespace Tests\Unit;

use App\Models\Editorial;
use App\Models\Libro;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EditorialTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function puede_crear_una_editorial_con_datos_validos()
    {
        $datos = [
            'nombre' => 'Editorial Planeta',
            'ciudad' => 'Barcelona',
            'pais' => 'España'
        ];

        $editorial = new Editorial($datos);

        $this->assertEquals('Editorial Planeta', $editorial->nombre);
        $this->assertEquals('Barcelona', $editorial->ciudad);
        $this->assertEquals('España', $editorial->pais);
    }

    /** @test */
    public function tiene_los_campos_fillable_correctos()
    {
        $editorial = new Editorial();
        $fillable = $editorial->getFillable();

        $this->assertContains('nombre', $fillable);
        $this->assertContains('ciudad', $fillable);
        $this->assertContains('pais', $fillable);
        $this->assertCount(3, $fillable);
    }

    /** @test */
    public function usa_la_tabla_editoriales()
    {
        $editorial = new Editorial();
        
        $this->assertEquals('editoriales', $editorial->getTable());
    }

    /** @test */
    public function no_tiene_timestamps_habilitados()
    {
        $editorial = new Editorial();

        $this->assertFalse($editorial->timestamps);
    }

    /** @test */
    public function puede_tener_relacion_con_libros()
    {
        $editorial = Editorial::factory()->create();

        $relacion = $editorial->libros();

        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class, $relacion);
        $this->assertEquals('editorial_id', $relacion->getForeignKeyName());
        $this->assertEquals('id', $relacion->getLocalKeyName());
    }

    /** @test */
    public function puede_obtener_libros_asociados()
    {
        $editorial = Editorial::factory()->create();
        $libro1 = Libro::factory()->create(['editorial_id' => $editorial->id]);
        $libro2 = Libro::factory()->create(['editorial_id' => $editorial->id]);

        $libros = $editorial->libros;

        $this->assertInstanceOf(Collection::class, $libros);
        $this->assertCount(2, $libros);
        $this->assertTrue($libros->contains($libro1));
        $this->assertTrue($libros->contains($libro2));
    }

    /** @test */
    public function devuelve_coleccion_vacia_si_no_tiene_libros()
    {
        $editorial = Editorial::factory()->create();

        $libros = $editorial->libros;

        $this->assertInstanceOf(Collection::class, $libros);
        $this->assertCount(0, $libros);
        $this->assertTrue($libros->isEmpty());
    }

    /** @test */
    public function puede_guardar_editorial_en_base_de_datos()
    {
        $editorial = Editorial::create([
            'nombre' => 'Editorial Test',
            'ciudad' => 'Ciudad Test',
            'pais' => 'País Test'
        ]);

        $this->assertDatabaseHas('editoriales', [
            'nombre' => 'Editorial Test',
            'ciudad' => 'Ciudad Test',
            'pais' => 'País Test'
        ]);

        $this->assertNotNull($editorial->id);
    }

    /** @test */
    public function puede_actualizar_datos_de_la_editorial()
    {
        $editorial = Editorial::factory()->create([
            'nombre' => 'Nombre Inicial',
            'ciudad' => 'Ciudad Inicial',
            'pais' => 'País Inicial'
        ]);

        $editorial->update([
            'nombre' => 'Nombre Actualizado',
            'ciudad' => 'Ciudad Actualizada',
            'pais' => 'País Actualizado'
        ]);

        $this->assertDatabaseHas('editoriales', [
            'id' => $editorial->id,
            'nombre' => 'Nombre Actualizado',
            'ciudad' => 'Ciudad Actualizada',
            'pais' => 'País Actualizado'
        ]);
    }

    /** @test */
    public function puede_eliminar_editorial_de_base_de_datos()
    {
        $editorial = Editorial::factory()->create();
        $editorialId = $editorial->id;

        $editorial->delete();

        $this->assertDatabaseMissing('editoriales', [
            'id' => $editorialId
        ]);
    }
}