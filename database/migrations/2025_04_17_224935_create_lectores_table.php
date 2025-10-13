<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void {
        Schema::create('lectores', function (Blueprint $table) {
            $table->id();
            
            // Datos personales
            $table->string('nombre')->index(); // Índice para búsquedas por nombre

            // Código único puede ser código de estudiante o cédula de profesor
            $table->string('codigo')
                ->unique()
                ->index(); // Índice para búsquedas por código
            
            // Tipo de lector
            $table->enum('tipo', ['ESTUDIANTE', 'DOCENTE', 'OTRO'])
                ->default('ESTUDIANTE')
                ->index(); // Índice para filtrar por tipo
                
            
            // Relación con grados (solo para estudiantes)
            $table->foreignId('grado_id')
                ->nullable()
                ->constrained('grados')
                ->onDelete('restrict');
            
            // Estado del lector
            $table->enum('estado', ['ACTIVO', 'INACTIVO'])
                ->default('ACTIVO')
                ->index(); // Índice para filtrar por estado
        
        });
    }
    
    /**
     * Reverse the migrations.
     */
    public function down(): void {
        Schema::dropIfExists('lectores');
    }
};