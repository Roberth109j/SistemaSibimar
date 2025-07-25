<?php

namespace Database\Factories;

use App\Models\Seccion;
use Illuminate\Database\Eloquent\Factories\Factory;

class SeccionFactory extends Factory
{
    protected $model = Seccion::class;
    
    protected static $seccionIndex = 0;
    protected static $secciones = ['PRIMARIA', 'BACHILLERATO'];

    public function definition(): array
    {
        if (static::$seccionIndex >= count(static::$secciones)) {
            static::$seccionIndex = 0;
        }

        return [
            'nombre' => static::$secciones[static::$seccionIndex++],
        ];
    }
}