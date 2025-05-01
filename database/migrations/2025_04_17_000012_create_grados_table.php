<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('grados', function (Blueprint $table) {
            $table->id();

            // 1. Definimos el enum con todos los grados:
            $table->enum('grado', [
                'Prescolar',
                'Primero',
                'Segundo',
                'Tercero',
                'Cuarto',
                'Quinto',
                'Sexto',
                'Séptimo',
                'Octavo',
                'Noveno',
                'Décimo',
                'Once',
            ])->comment('Lista completa de grados: primaria y bachillerato');

            // Nombre de subgrado (ej. 'Prejardín', 'Primero 1', etc.)
            $table->string('subGrado')->nullable();

            // Relación con secciones (Primaria / Bachillerato)
            $table->foreignId('seccion_id')
                ->constrained('secciones')
                ->onDelete('cascade');

            $table->enum('estado', ['ACTIVO', 'INACTIVO'])
                ->default('ACTIVO');

            // Índices para optimizar filtros y joins
            $table->index('grado');
            $table->index('estado');
            $table->index('subGrado');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('grados');
    }
};
