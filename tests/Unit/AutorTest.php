<?php

namespace Tests\Unit;

use App\Models\Autor;
use App\Models\Libro;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AutorTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function puede_crear_un_autor_con_datos_validos()
    {
        $datos = [
            'apellidos' => 'García Márquez',
            'nombres' => 'Gabriel José'
        ];

        $autor = new Autor($datos);

        $this->assertEquals('García Márquez', $autor->apellidos);
        $this->assertEquals('Gabriel José', $autor->nombres);
    }

    /** @test */
    public function tiene_los_campos_fillable_correctos()
    {
        $autor = new Autor();
        $fillable = $autor->getFillable();

        $this->assertContains('apellidos', $fillable);
        $this->assertContains('nombres', $fillable);
        $this->assertCount(2, $fillable);
    }

    /** @test */
    public function usa_la_tabla_autores()
    {
        $autor = new Autor();
        
        $this->assertEquals('autores', $autor->getTable());
    }

    /** @test */
    public function no_tiene_timestamps_habilitados()
    {
        $autor = new Autor();
        
        $this->assertFalse($autor->timestamps);
    }

    /** @test */
    public function devuelve_nombre_completo_correctamente()
    {
        $autor = new Autor([
            'apellidos' => 'Vargas Llosa',
            'nombres' => 'Mario'
        ]);

        $nombreCompleto = $autor->nombre_completo;

        $this->assertEquals('Vargas Llosa, Mario', $nombreCompleto);
    }

    /** @test */
    public function devuelve_nombre_completo_con_apellidos_compuestos()
    {
        $autor = new Autor([
            'apellidos' => 'García Márquez',
            'nombres' => 'Gabriel José'
        ]);

        $nombreCompleto = $autor->nombre_completo;

        $this->assertEquals('García Márquez, Gabriel José', $nombreCompleto);
    }

    /** @test */
    public function devuelve_nombre_completo_con_nombres_simples()
    {
        $autor = new Autor([
            'apellidos' => 'Cortázar',
            'nombres' => 'Julio'
        ]);

        $nombreCompleto = $autor->nombre_completo;

        $this->assertEquals('Cortázar, Julio', $nombreCompleto);
    }

    /** @test */
    public function puede_tener_relacion_con_libros()
    {
        $autor = Autor::factory()->create();

        $relacion = $autor->libros();

        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class, $relacion);
        $this->assertEquals('autor_id', $relacion->getForeignKeyName());
        $this->assertEquals('id', $relacion->getLocalKeyName());
    }

    /** @test */
    public function puede_obtener_libros_asociados()
    {
        $autor = Autor::factory()->create();
        $libro1 = Libro::factory()->create(['autor_id' => $autor->id]);
        $libro2 = Libro::factory()->create(['autor_id' => $autor->id]);

        $libros = $autor->libros;

        $this->assertInstanceOf(Collection::class, $libros);
        $this->assertCount(2, $libros);
        $this->assertTrue($libros->contains($libro1));
        $this->assertTrue($libros->contains($libro2));
    }

    /** @test */
    public function devuelve_coleccion_vacia_si_no_tiene_libros()
    {
        $autor = Autor::factory()->create();

        $libros = $autor->libros;

        $this->assertInstanceOf(Collection::class, $libros);
        $this->assertCount(0, $libros);
        $this->assertTrue($libros->isEmpty());
    }

    /** @test */
    public function puede_guardar_autor_en_base_de_datos()
    {
        $autor = Autor::create([
            'apellidos' => 'Borges',
            'nombres' => 'Jorge Luis'
        ]);

        $this->assertDatabaseHas('autores', [
            'apellidos' => 'Borges',
            'nombres' => 'Jorge Luis'
        ]);

        $this->assertNotNull($autor->id);
    }

    /** @test */
    public function puede_actualizar_datos_del_autor()
    {
        $autor = Autor::factory()->create([
            'apellidos' => 'Inicial',
            'nombres' => 'Nombre'
        ]);

        $autor->update([
            'apellidos' => 'Actualizado',
            'nombres' => 'Nuevo Nombre'
        ]);

        $this->assertDatabaseHas('autores', [
            'id' => $autor->id,
            'apellidos' => 'Actualizado',
            'nombres' => 'Nuevo Nombre'
        ]);
    }

    /** @test */
    public function puede_eliminar_autor_de_base_de_datos()
    {
        $autor = Autor::factory()->create();
        $autorId = $autor->id;

        $autor->delete();

        $this->assertDatabaseMissing('autores', [
            'id' => $autorId
        ]);
    }

    /** @test */
    public function nombre_completo_maneja_campos_vacios()
    {
        $autor = new Autor([
            'apellidos' => '',
            'nombres' => 'Solo Nombre'
        ]);

        $nombreCompleto = $autor->nombre_completo;

        $this->assertEquals(', Solo Nombre', $nombreCompleto);
    }

    /** @test */
    public function nombre_completo_maneja_solo_apellidos()
    {
        $autor = new Autor([
            'apellidos' => 'Solo Apellido',
            'nombres' => ''
        ]);

        $nombreCompleto = $autor->nombre_completo;

        $this->assertEquals('Solo Apellido, ', $nombreCompleto);
    }
}