<?php

namespace Database\Factories;

use App\Models\Ejemplar;
use App\Models\Libro;
use Illuminate\Database\Eloquent\Factories\Factory;

class EjemplarFactory extends Factory
{
    protected $model = Ejemplar::class;

    public function definition(): array
    {
        return [
            'libro_id' => Libro::factory(),
            'numEjemplar' => $this->faker->unique()->numberBetween(1, 1000),
            'tipo_adquisicion' => $this->faker->randomElement(Ejemplar::tiposAdquisicion()),
            'estado' => $this->faker->randomElement(Ejemplar::estados()),
            'observaciones' => $this->faker->optional()->sentence()
        ];
    }
}