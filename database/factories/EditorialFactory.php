<?php

namespace Database\Factories;

use App\Models\Editorial;
use Illuminate\Database\Eloquent\Factories\Factory;

class EditorialFactory extends Factory
{
    protected $model = Editorial::class;

    public function definition(): array
    {
        return [
            'nombre' => $this->faker->unique()->company(),
            'ciudad' => $this->faker->city(),
            'pais' => $this->faker->country(),
        ];
    }
}