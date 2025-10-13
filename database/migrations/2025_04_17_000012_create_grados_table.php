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
            
            // 1. Definimos el enum con todos los grados EN MAYÚSCULAS:
            $table->enum('grado', [
                'PREESCOLAR',
                'PRIMERO',
                'SEGUNDO',
                'TERCERO',
                'CUARTO',
                'QUINTO',
                'SEXTO',
                'SÉPTIMO',
                'OCTAVO',
                'NOVENO',
                'DÉCIMO',
                'ONCE',
            ])->comment('Lista completa de grados: primaria y bachillerato en MAYÚSCULAS');
            
            // Nombre de subgrado (ej. 'PREJARDIN UNO', 'PRIMERO UNO', etc.)
            $table->string('subGrado')->nullable();
            
            // Relación con secciones (Primaria / Bachillerato)
            $table->foreignId('seccion_id')
                ->constrained('secciones')
                ->onDelete('cascade')
                ->index();
            
            $table->enum('estado', ['ACTIVO', 'INACTIVO'])
                ->default('ACTIVO');
            
            // Índices para optimizar filtros y joins
            $table->index('grado');
            $table->index('estado');
            $table->index('subGrado');
            
            $table->timestamps();
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