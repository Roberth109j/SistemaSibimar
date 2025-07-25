<?php

namespace Tests\Unit;

use App\Models\Libro;
use App\Models\Autor;
use App\Models\Editorial;
use App\Models\Seccion;
use App\Models\TemaDewey;
use App\Models\Grado;
use App\Models\Estanteria;
use App\Models\Ejemplar;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LibroTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function puede_crear_un_libro_con_datos_validos()
    {
        $datos = [
            'isbn' => '978-84-376-0494-7',
            'titulo' => 'Cien años de soledad',
            'contenido' => 'Descripción del libro',
            'clase' => Libro::CLASE_NOVELA,
            'tomo' => 1,
            'edicion' => '1ra',
            'anio' => 1967,
            'fecha_ingreso' => '2023-01-01',
            'precio' => 29.99,
            'idioma' => Libro::IDIOMA_ESPANOL,
            'edad_recomendada' => '12+',
            'paginas' => 471,
            'sign_top' => 'GAR'
        ];

        $libro = new Libro($datos);

        $this->assertEquals('978-84-376-0494-7', $libro->isbn);
        $this->assertEquals('Cien años de soledad', $libro->titulo);
        $this->assertEquals(Libro::CLASE_NOVELA, $libro->clase);
        $this->assertEquals(1, $libro->tomo);
        $this->assertEquals('1ra', $libro->edicion);
        $this->assertEquals(1967, $libro->anio);
        $this->assertEquals('2023-01-01', $libro->fecha_ingreso->format('Y-m-d'));
        $this->assertEquals(29.99, $libro->precio);
        $this->assertEquals(Libro::IDIOMA_ESPANOL, $libro->idioma);
        $this->assertEquals('12+', $libro->edad_recomendada);
        $this->assertEquals(471, $libro->paginas);
        $this->assertEquals('GAR', $libro->sign_top);
    }

    /** @test */
    public function tiene_los_campos_fillable_correctos()
    {
        $libro = new Libro();
        $fillable = $libro->getFillable();

        $camposEsperados = [
            'isbn', 'titulo', 'contenido', 'seccion_id', 'autor_id',
            'editorial_id', 'clase', 'tomo', 'edicion', 'anio',
            'fecha_ingreso', 'precio', 'idioma', 'edad_recomendada',
            'paginas', 'tema_id', 'sign_top', 'estanteria_id'
        ];

        foreach ($camposEsperados as $campo) {
            $this->assertContains($campo, $fillable);
        }
        $this->assertCount(18, $fillable);
    }

    /** @test */
    public function usa_la_tabla_libros()
    {
        $libro = new Libro();
        
        $this->assertEquals('libros', $libro->getTable());
    }

    /** @test */
    public function tiene_los_casts_correctos()
    {
        $libro = new Libro();
        $casts = $libro->getCasts();

        $this->assertEquals('date', $casts['fecha_ingreso']);
        $this->assertEquals('integer', $casts['anio']);
        $this->assertEquals('decimal:2', $casts['precio']);
        $this->assertEquals('integer', $casts['paginas']);
        $this->assertEquals('integer', $casts['tomo']);
    }

    /** @test */
    public function tiene_las_constantes_de_clase_definidas()
    {
        $this->assertEquals('LIBRO', Libro::CLASE_LIBRO);
        $this->assertEquals('CARTILLA', Libro::CLASE_CARTILLA);
        $this->assertEquals('CUENTO', Libro::CLASE_CUENTO);
        $this->assertEquals('DICCIONARIO', Libro::CLASE_DICCIONARIO);
        $this->assertEquals('ENCICLOPEDIA', Libro::CLASE_ENCICLOPEDIA);
        $this->assertEquals('NOVELA', Libro::CLASE_NOVELA);
        $this->assertEquals('REVISTA', Libro::CLASE_REVISTA);
    }

    /** @test */
    public function tiene_las_constantes_de_idioma_definidas()
    {
        $this->assertEquals('ESPANOL', Libro::IDIOMA_ESPANOL);
        $this->assertEquals('INGLES', Libro::IDIOMA_INGLES);
        $this->assertEquals('FRANCES', Libro::IDIOMA_FRANCES);
        $this->assertEquals('OTRO', Libro::IDIOMA_OTRO);
    }

    /** @test */
    public function puede_tener_relacion_con_seccion()
    {
        $libro = Libro::factory()->create();

        $relacion = $libro->seccion();

        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\BelongsTo::class, $relacion);
        $this->assertEquals('seccion_id', $relacion->getForeignKeyName());
    }

    /** @test */
    public function puede_tener_relacion_con_autor()
    {
        $libro = Libro::factory()->create();

        $relacion = $libro->autor();

        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\BelongsTo::class, $relacion);
        $this->assertEquals('autor_id', $relacion->getForeignKeyName());
    }

    /** @test */
    public function puede_tener_relacion_con_editorial()
    {
        $libro = Libro::factory()->create();

        $relacion = $libro->editorial();

        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\BelongsTo::class, $relacion);
        $this->assertEquals('editorial_id', $relacion->getForeignKeyName());
    }

    /** @test */
    public function puede_tener_relacion_con_tema_dewey()
    {
        $libro = Libro::factory()->create();

        $relacion = $libro->temaDewey();

        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\BelongsTo::class, $relacion);
        $this->assertEquals('tema_id', $relacion->getForeignKeyName());
    }

    /** @test */
    public function puede_tener_relacion_con_estanteria()
    {
        $libro = Libro::factory()->create();

        $relacion = $libro->estanteria();

        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\BelongsTo::class, $relacion);
        $this->assertEquals('estanteria_id', $relacion->getForeignKeyName());
    }

    /** @test */
    public function puede_tener_relacion_con_ejemplares()
    {
        $libro = Libro::factory()->create();

        $relacion = $libro->ejemplares();

        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class, $relacion);
        $this->assertEquals('libro_id', $relacion->getForeignKeyName());
    }

    /** @test */
    public function puede_obtener_ejemplares_asociados()
    {
        $libro = Libro::factory()->create();
        $ejemplar1 = Ejemplar::factory()->create(['libro_id' => $libro->id]);
        $ejemplar2 = Ejemplar::factory()->create(['libro_id' => $libro->id]);

        $ejemplares = $libro->ejemplares;

        $this->assertInstanceOf(Collection::class, $ejemplares);
        $this->assertCount(2, $ejemplares);
        $this->assertTrue($ejemplares->contains($ejemplar1));
        $this->assertTrue($ejemplares->contains($ejemplar2));
    }

    /** @test */
    public function puede_filtrar_por_seccion()
    {
        $seccion = Seccion::factory()->create();
        $libro1 = Libro::factory()->create(['seccion_id' => $seccion->id]);
        $libro2 = Libro::factory()->create(['seccion_id' => $seccion->id]);
        Libro::factory()->create(); // Libro de otra sección

        $libros = Libro::porSeccion($seccion->id)->get();

        $this->assertCount(2, $libros);
        $this->assertTrue($libros->contains($libro1));
        $this->assertTrue($libros->contains($libro2));
    }

    /** @test */
    public function puede_filtrar_por_clase()
    {
        $seccion = Seccion::create(['nombre' => 'PRIMARIA']);
        $libro1 = Libro::factory()->create([
            'clase' => Libro::CLASE_NOVELA,
            'seccion_id' => $seccion->id
        ]);
        $libro2 = Libro::factory()->create([
            'clase' => Libro::CLASE_NOVELA,
            'seccion_id' => $seccion->id
        ]);
        Libro::factory()->create([
            'clase' => Libro::CLASE_CUENTO,
            'seccion_id' => $seccion->id
        ]);

        $libros = Libro::porClase(Libro::CLASE_NOVELA)->get();

        $this->assertCount(2, $libros);
        $this->assertTrue($libros->contains($libro1));
        $this->assertTrue($libros->contains($libro2));
    }

    /** @test */
    public function puede_guardar_libro_en_base_de_datos()
    {
        $seccion = Seccion::create(['nombre' => 'BACHILLERATO']);
        $autor = Autor::factory()->create();
        $editorial = Editorial::factory()->create();
        $tema = TemaDewey::factory()->create();
        
        $libro = Libro::create([
            'isbn' => '978-1234567890',
            'titulo' => 'Libro de Prueba',
            'clase' => Libro::CLASE_LIBRO,
            'idioma' => Libro::IDIOMA_ESPANOL,
            'seccion_id' => $seccion->id,
            'autor_id' => $autor->id,
            'editorial_id' => $editorial->id,
            'tema_id' => $tema->id,
            'fecha_ingreso' => now(),
            'paginas' => 100
        ]);

        $this->assertDatabaseHas('libros', [
            'isbn' => '978-1234567890',
            'titulo' => 'Libro de Prueba',
            'clase' => Libro::CLASE_LIBRO,
            'idioma' => Libro::IDIOMA_ESPANOL,
            'seccion_id' => $seccion->id,
            'autor_id' => $autor->id,
            'editorial_id' => $editorial->id,
            'tema_id' => $tema->id,
            'paginas' => 100
        ]);

        $this->assertNotNull($libro->id);
    }

    /** @test */
    public function puede_actualizar_datos_del_libro()
    {
        $libro = Libro::factory()->create([
            'titulo' => 'Título Original',
            'clase' => Libro::CLASE_LIBRO
        ]);

        $libro->update([
            'titulo' => 'Título Actualizado',
            'clase' => Libro::CLASE_NOVELA
        ]);

        $this->assertDatabaseHas('libros', [
            'id' => $libro->id,
            'titulo' => 'Título Actualizado',
            'clase' => Libro::CLASE_NOVELA
        ]);
    }

    /** @test */
    public function puede_eliminar_libro_de_base_de_datos()
    {
        $libro = Libro::factory()->create();
        $libroId = $libro->id;

        $libro->delete();

        $this->assertDatabaseMissing('libros', [
            'id' => $libroId
        ]);
    }
}