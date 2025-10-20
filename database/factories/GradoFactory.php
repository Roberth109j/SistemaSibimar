<?php

namespace Database\Factories;

use App\Models\Grado;
use App\Models\Seccion;
use Illuminate\Database\Eloquent\Factories\Factory;

class GradoFactory extends Factory
{
    protected $model = Grado::class;

    public function definition(): array
    {
        return [
            'grado' => $this->faker->randomElement([
                'Primero', 'Segundo', 'Tercero',
                'Cuarto', 'Quinto', 'Sexto', 'Séptimo',
                'Octavo', 'Noveno', 'Décimo', 'Once'
            ]),
            'subGrado' => $this->faker->randomElement(['A', 'B', 'C']),
            'estado' => $this->faker->randomElement(['ACTIVO', 'INACTIVO']),
            'seccion_id' => function () {
                return Seccion::firstOrCreate(['nombre' => 'PRIMARIA'])->id;
            }
        ];
    }
}