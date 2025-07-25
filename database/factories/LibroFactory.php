<?php

namespace Database\Factories;

use App\Models\Libro;
use App\Models\Autor;
use App\Models\Editorial;
use App\Models\Seccion;
use App\Models\TemaDewey;
use App\Models\Estanteria;
use Illuminate\Database\Eloquent\Factories\Factory;

class LibroFactory extends Factory
{
    protected $model = Libro::class;

    public function definition(): array
    {
        return [
            'isbn' => $this->faker->unique()->isbn13(),
            'titulo' => $this->faker->sentence(3),
            'contenido' => $this->faker->paragraph(),
            'seccion_id' => Seccion::factory(),
            'autor_id' => Autor::factory(),
            'editorial_id' => Editorial::factory(),
            'clase' => $this->faker->randomElement([
                Libro::CLASE_LIBRO,
                Libro::CLASE_CARTILLA,
                Libro::CLASE_CUENTO,
                Libro::CLASE_DICCIONARIO,
                Libro::CLASE_ENCICLOPEDIA,
                Libro::CLASE_NOVELA,
                Libro::CLASE_REVISTA,
            ]),
            'tomo' => $this->faker->optional()->numberBetween(1, 10),
            'edicion' => $this->faker->optional()->numberBetween(1, 5),
            'anio' => $this->faker->year(),
            'fecha_ingreso' => $this->faker->date(),
            'precio' => $this->faker->randomFloat(2, 10, 1000),
            'idioma' => $this->faker->randomElement([
                Libro::IDIOMA_ESPANOL,
                Libro::IDIOMA_INGLES,
                Libro::IDIOMA_FRANCES,
                Libro::IDIOMA_OTRO,
            ]),
            'edad_recomendada' => $this->faker->optional()->numberBetween(3, 18),
            'paginas' => $this->faker->numberBetween(20, 1000),
            'tema_id' => TemaDewey::factory(),
            'sign_top' => $this->faker->optional()->word(),
            'estanteria_id' => Estanteria::factory(),
        ];
    }
}