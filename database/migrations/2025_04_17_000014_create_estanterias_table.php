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
        Schema::create('estanterias', function (Blueprint $table) {
            $table->id();
            $table->string('cod_estante')
                ->index(); // Ej: "A1", "B2", etc.
            $table->string('descripcion')->nullable(); // Opcional: por ejemplo "Estante del fondo"
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('estanterias');
    }
};
