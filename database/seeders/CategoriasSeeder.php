<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategoriasSeeder extends Seeder
{
    public function run(): void
    {

        // Insertar Categorías
        $categorias = [
            ['codigo' => '000', 'nombre' => 'Generalidades'],
            ['codigo' => '100', 'nombre' => 'Filosofía y psicología'],
            ['codigo' => '200', 'nombre' => 'Religión'],
            ['codigo' => '300', 'nombre' => 'Ciencias sociales'],
            ['codigo' => '400', 'nombre' => 'Lenguas'],
            ['codigo' => '500', 'nombre' => 'Ciencias naturales y matemáticas'],
            ['codigo' => '600', 'nombre' => 'Tecnología (Ciencias aplicadas)'],
            ['codigo' => '700', 'nombre' => 'Artes'],
            ['codigo' => '800', 'nombre' => 'Literatura y retórica'],
            ['codigo' => '900', 'nombre' => 'Geografía e Historia'],
        ];

        DB::table('categorias_dewey')->insert($categorias);  
    }
}
