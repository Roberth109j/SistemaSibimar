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
        Schema::create('temas_dewey', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subcategoria_id')->constrained('subcategorias_dewey')->onDelete('cascade');
            $table->string('nombre');
            $table->string('codigo')->unique(); // ej: 227
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('temas_dewey');
    }
};
