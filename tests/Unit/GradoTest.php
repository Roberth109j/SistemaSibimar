<?php

namespace Tests\Unit;

use App\Models\Grado;
use App\Models\Seccion;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GradoTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // No ejecutamos el seeder aquí para evitar conflictos
    }

    /** @test */
    public function puede_crear_un_grado_con_datos_validos()
    {
        $datos = [
            'grado' => 'Primero',
            'subGrado' => 'A',
            'estado' => 'ACTIVO',
            'seccion_id' => 1
        ];

        $grado = new Grado($datos);

        $this->assertEquals('Primero', $grado->grado);
        $this->assertEquals('A', $grado->subGrado);
        $this->assertEquals('ACTIVO', $grado->estado);
        $this->assertEquals(1, $grado->seccion_id);
    }

    /** @test */
    public function tiene_los_campos_fillable_correctos()
    {
        $grado = new Grado();
        $fillable = $grado->getFillable();

        $this->assertContains('grado', $fillable);
        $this->assertContains('subGrado', $fillable);
        $this->assertContains('estado', $fillable);
        $this->assertContains('seccion_id', $fillable);
        $this->assertCount(4, $fillable);
    }

    /** @test */
    public function no_tiene_timestamps_habilitados()
    {
        $grado = new Grado();
        
        $this->assertFalse($grado->timestamps);
    }

    /** @test */
    public function tiene_los_casts_correctos()
    {
        $grado = new Grado();
        $casts = $grado->getCasts();

        $this->assertEquals('string', $casts['estado']);
        $this->assertEquals('string', $casts['grado']);
    }

    /** @test */
    public function puede_tener_relacion_con_seccion()
    {
        $seccion = new Seccion(['nombre' => 'PRIMARIA']);
        $seccion->save();
        
        $grado = new Grado([
            'grado' => 'Primero',
            'subGrado' => 'A',
            'estado' => 'ACTIVO',
            'seccion_id' => $seccion->id
        ]);
        $grado->save();

        $relacion = $grado->seccion();

        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\BelongsTo::class, $relacion);
        $this->assertEquals('seccion_id', $relacion->getForeignKeyName());
        $this->assertEquals('id', $relacion->getOwnerKeyName());
    }

    /** @test */
    public function puede_obtener_seccion_asociada()
    {
        $seccion = new Seccion(['nombre' => 'PRIMARIA']);
        $seccion->save();
        
        $grado = new Grado([
            'grado' => 'Primero',
            'subGrado' => 'A',
            'estado' => 'ACTIVO',
            'seccion_id' => $seccion->id
        ]);
        $grado->save();

        $seccionAsociada = $grado->seccion;

        $this->assertInstanceOf(Seccion::class, $seccionAsociada);
        $this->assertEquals($seccion->id, $seccionAsociada->id);
    }

    /** @test */
    public function identifica_correctamente_grado_activo()
    {
        $seccion = new Seccion(['nombre' => 'PRIMARIA']);
        $seccion->save();

        $gradoActivo = new Grado([
            'grado' => 'Primero',
            'subGrado' => 'A',
            'estado' => 'ACTIVO',
            'seccion_id' => $seccion->id
        ]);
        $gradoActivo->save();

        $gradoInactivo = new Grado([
            'grado' => 'Segundo',
            'subGrado' => 'B',
            'estado' => 'INACTIVO',
            'seccion_id' => $seccion->id
        ]);
        $gradoInactivo->save();

        $this->assertTrue($gradoActivo->estaActivo());
        $this->assertFalse($gradoInactivo->estaActivo());
    }

    /** @test */
    public function puede_guardar_grado_en_base_de_datos()
    {
        $seccion = new Seccion(['nombre' => 'PRIMARIA']);
        $seccion->save();

        $grado = new Grado([
            'grado' => 'Segundo',
            'subGrado' => 'B',
            'estado' => 'ACTIVO',
            'seccion_id' => $seccion->id
        ]);
        $grado->save();

        $this->assertDatabaseHas('grados', [
            'grado' => 'Segundo',
            'subGrado' => 'B',
            'estado' => 'ACTIVO',
            'seccion_id' => $seccion->id
        ]);

        $this->assertNotNull($grado->id);
    }

    /** @test */
    public function puede_actualizar_datos_del_grado()
    {
        $seccion = new Seccion(['nombre' => 'PRIMARIA']);
        $seccion->save();

        $grado = new Grado([
            'grado' => 'Primero',
            'subGrado' => 'A',
            'estado' => 'ACTIVO',
            'seccion_id' => $seccion->id
        ]);
        $grado->save();

        $grado->update([
            'grado' => 'Segundo',
            'subGrado' => 'B',
            'estado' => 'INACTIVO'
        ]);

        $this->assertDatabaseHas('grados', [
            'id' => $grado->id,
            'grado' => 'Segundo',
            'subGrado' => 'B',
            'estado' => 'INACTIVO'
        ]);
    }

    /** @test */
    public function puede_eliminar_grado_de_base_de_datos()
    {
        $seccion = new Seccion(['nombre' => 'PRIMARIA']);
        $seccion->save();

        $grado = new Grado([
            'grado' => 'Primero',
            'subGrado' => 'A',
            'estado' => 'ACTIVO',
            'seccion_id' => $seccion->id
        ]);
        $grado->save();
        
        $gradoId = $grado->id;

        $grado->delete();

        $this->assertDatabaseMissing('grados', [
            'id' => $gradoId
        ]);
    }
}