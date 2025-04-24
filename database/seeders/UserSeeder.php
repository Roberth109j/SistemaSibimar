<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('users')->insert([
            [
                'name' => 'Primaria',
                'email' => 'primara@gmail.com',
                'email_verified_at' => now(),
                'password' => Hash::make('Primaria123'), // puedes cambiarlo
                'seccion_id' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Bachillerato',
                'email' => 'bachillerato@gmail.com',
                'email_verified_at' => now(),
                'password' => Hash::make('Bachillerato123'),
                'seccion_id' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
