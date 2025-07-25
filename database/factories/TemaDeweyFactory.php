<?php

namespace Database\Factories;

use App\Models\TemaDewey;
use App\Models\SubcategoriaDewey;
use Illuminate\Database\Eloquent\Factories\Factory;

class TemaDeweyFactory extends Factory
{
    protected $model = TemaDewey::class;

    public function definition(): array
    {
        return [
            'subcategoria_id' => SubcategoriaDewey::factory(),
            'nombre' => $this->faker->words(3, true),
            'codigo' => $this->faker->unique()->numerify('###'),
        ];
    }
}