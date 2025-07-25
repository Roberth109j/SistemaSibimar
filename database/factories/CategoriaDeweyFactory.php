<?php

namespace Database\Factories;

use App\Models\CategoriaDewey;
use Illuminate\Database\Eloquent\Factories\Factory;

class CategoriaDeweyFactory extends Factory
{
    protected $model = CategoriaDewey::class;

    public function definition(): array
    {
        return [
            'nombre' => $this->faker->words(2, true),
            'codigo' => $this->faker->unique()->numerify('#'),
        ];
    }
}