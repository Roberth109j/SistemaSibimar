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
        Schema::create('subgrados', function (Blueprint $table) {
            $table->id();
            $table->foreignId('grado_id')->constrained()->onDelete('cascade');
            $table->string('nombre'); // Ejemplo: "1-1"
            $table->enum('estado', ['ACTIVO', 'INACTIVO'])->default('ACTIVO');
        });    
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subgrados');
    }
};
