<?php

namespace Database\Factories;

use App\Models\Estanteria;
use Illuminate\Database\Eloquent\Factories\Factory;

class EstanteriaFactory extends Factory
{
    protected $model = Estanteria::class;

    public function definition(): array
    {
        return [
            'cod_estante' => $this->faker->unique()->regexify('[A-Z][1-9]'),
            'descripcion' => $this->faker->sentence(),
        ];
    }
}