<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RolesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Verificar si los roles ya existen para no duplicarlos
        if (!Role::where('name', 'Administrador')->exists()) {
            Role::create(['name' => 'Administrador']);
        }

        if (!Role::where('name', 'BibliotecarioPrimaria')->exists()) {
            Role::create(['name' => 'BibliotecarioPrimaria']);
        }

        if (!Role::where('name', 'BibliotecarioBachillerato')->exists()) {
            Role::create(['name' => 'BibliotecarioBachillerato']);
        }
    }
}
