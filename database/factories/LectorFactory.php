<?php

namespace Database\Factories;

use App\Models\Lector;
use App\Models\Grado;
use App\Models\Seccion;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\QueryException;

class LectorFactory extends Factory
{
    protected $model = Lector::class;

    public function definition(): array
    {
        // Obtener o crear una sección existente sin generar nombres únicos largos
        $seccion = Seccion::firstOrCreate(['nombre' => 'PRIMARIA']);
        
        // Crear un grado asociado a la sección
        $grado = Grado::factory()->create([
            'seccion_id' => $seccion->id
        ]);

        return [
            'nombre' => $this->faker->name(),
            'codigo' => $this->faker->unique()->numerify('###########'),
            'tipo' => $this->faker->randomElement([Lector::TIPO_ESTUDIANTE, Lector::TIPO_DOCENTE, Lector::TIPO_OTRO]),
            'grado_id' => $grado->id,
            'estado' => $this->faker->randomElement([Lector::ESTADO_ACTIVO, Lector::ESTADO_INACTIVO])
        ];
    }

    /**
     * Indica que el lector es un estudiante
     */
    public function estudiante(): static
    {
        return $this->state(function (array $attributes) {
            $seccion = Seccion::firstOrCreate(['nombre' => 'BACHILLERATO']);
            
            // Crear un grado asociado a la sección
            $grado = Grado::factory()->create([
                'seccion_id' => $seccion->id
            ]);

            return [
                'tipo' => Lector::TIPO_ESTUDIANTE,
                'grado_id' => $grado->id
            ];
        });
    }

    /**
     * Indica que el lector es un docente
     */
    public function docente(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'tipo' => Lector::TIPO_DOCENTE,
                'grado_id' => null
            ];
        });
    }

    /**
     * Indica que el lector está activo
     */
    public function activo(): static
    {
        return $this->state(function (array $attributes) {
            return ['estado' => Lector::ESTADO_ACTIVO];
        });
    }

    /**
     * Indica que el lector está inactivo
     */
    public function inactivo(): static
    {
        return $this->state(function (array $attributes) {
            return ['estado' => Lector::ESTADO_INACTIVO];
        });
    }
}