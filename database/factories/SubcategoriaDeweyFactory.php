<?php

namespace Database\Factories;

use App\Models\SubcategoriaDewey;
use App\Models\CategoriaDewey;
use Illuminate\Database\Eloquent\Factories\Factory;

class SubcategoriaDeweyFactory extends Factory
{
    protected $model = SubcategoriaDewey::class;

    public function definition(): array
    {
        return [
            'categoria_id' => CategoriaDewey::factory(),
            'nombre' => $this->faker->words(3, true),
            'codigo' => $this->faker->unique()->numerify('##'),
        ];
    }
}