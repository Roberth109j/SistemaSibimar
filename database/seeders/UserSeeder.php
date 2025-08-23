<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Seccion;
use Spatie\Permission\Models\Role;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Obtener las secciones
        $seccionPrimaria = Seccion::where('nombre', 'PRIMARIA')->first();
        $seccionBachillerato = Seccion::where('nombre', 'BACHILLERATO')->first();
        
        // Crear usuario administrador
        $admin = User::create([
            'name' => 'Administrador',
            'email' => 'admin@gmail.com',
            'email_verified_at' => now(),
            'password' => Hash::make('admin123'),
            'seccion_id' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        
        // Crear usuario de primaria
        $primaria = User::create([
            'name' => 'Primaria',
            'email' => 'primaria@gmail.com',
            'email_verified_at' => now(),
            'password' => Hash::make('primaria'),
            'seccion_id' => $seccionPrimaria ? $seccionPrimaria->id : null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        
        // Crear usuario de bachillerato
        $bachillerato = User::create([
            'name' => 'Bachillerato',
            'email' => 'bachillerato@gmail.com',
            'email_verified_at' => now(),
            'password' => Hash::make('bachillerato'),
            'seccion_id' => $seccionBachillerato ? $seccionBachillerato->id : null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        
        // Asignar roles a los usuarios
        $admin->assignRole('Administrador');
        $primaria->assignRole('BibliotecarioPrimaria');
        $bachillerato->assignRole('BibliotecarioBachillerato');
    }
}
