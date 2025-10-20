<?php

namespace Database\Factories;

use App\Models\Prestamo;
use App\Models\Ejemplar;
use App\Models\Lector;
use Illuminate\Database\Eloquent\Factories\Factory;

class PrestamoFactory extends Factory
{
    protected $model = Prestamo::class;

    public function definition(): array
    {
        $fechaPrestamo = $this->faker->dateTimeBetween('-1 month', 'now');
        $fechaDevolucion = clone $fechaPrestamo;
        $fechaDevolucion->modify('+15 days');

        return [
            'ejemplar_id' => Ejemplar::factory(),
            'lector_id' => Lector::factory(),
            'fecha_prestamo' => $fechaPrestamo,
            'fecha_devolucion' => $fechaDevolucion,
            'fecha_devuelto' => null,
            'estado' => Prestamo::ESTADO_ACTIVO
        ];
    }

    /**
     * Indica que el préstamo está activo
     */
    public function activo(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'estado' => Prestamo::ESTADO_ACTIVO,
                'fecha_devuelto' => null
            ];
        });
    }

    /**
     * Indica que el préstamo está devuelto
     */
    public function devuelto(): static
    {
        return $this->state(function (array $attributes) {
            $fechaDevuelto = clone $attributes['fecha_devolucion'];
            $fechaDevuelto->modify('-2 days');

            return [
                'estado' => Prestamo::ESTADO_DEVUELTO,
                'fecha_devuelto' => $fechaDevuelto
            ];
        });
    }

    /**
     * Indica que el préstamo está vencido
     */
    public function vencido(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'estado' => Prestamo::ESTADO_VENCIDO,
                'fecha_devuelto' => null
            ];
        });
    }
}