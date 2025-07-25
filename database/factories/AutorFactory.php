<?php

namespace Database\Factories;

use App\Models\Autor;
use Illuminate\Database\Eloquent\Factories\Factory;

class AutorFactory extends Factory
{
    protected $model = Autor::class;

    public function definition(): array
    {
        return [
            'apellidos' => $this->faker->lastName() . ' ' . $this->faker->lastName(),
            'nombres' => $this->faker->firstName() . ' ' . $this->faker->firstName(),
        ];
    }

    /**
     * Estado para crear autores con nombres específicos
     */
    public function withName(string $nombres, string $apellidos): static
    {
        return $this->state(fn (array $attributes) => [
            'nombres' => $nombres,
            'apellidos' => $apellidos,
        ]);
    }

    /**
     * Estado para crear autores famosos
     */
    public function famous(): static
    {
        $autoresFamosos = [
            ['nombres' => 'Gabriel José', 'apellidos' => 'García Márquez'],
            ['nombres' => 'Mario', 'apellidos' => 'Vargas Llosa'],
            ['nombres' => 'Jorge Luis', 'apellidos' => 'Borges'],
            ['nombres' => 'Julio', 'apellidos' => 'Cortázar'],
            ['nombres' => 'Isabel', 'apellidos' => 'Allende'],
            ['nombres' => 'Pablo', 'apellidos' => 'Neruda'],
            ['nombres' => 'Octavio', 'apellidos' => 'Paz'],
        ];

        $autor = $this->faker->randomElement($autoresFamosos);

        return $this->state(fn (array $attributes) => [
            'nombres' => $autor['nombres'],
            'apellidos' => $autor['apellidos'],
        ]);
    }
}