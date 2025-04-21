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
        Schema::create('subcategorias_dewey', function (Blueprint $table) {
            $table->id();
            $table->foreignId('categoria_id')->constrained('categorias_dewey')->onDelete('cascade');
            $table->string('nombre');
            $table->string('codigo')->unique(); // ej: 220
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subcategorias_dewey');
    }
};

