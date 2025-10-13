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
        Schema::create('editoriales', function (Blueprint $table) {
            $table->id();
            $table->string('nombre')->unique() // Único para evitar duplicados
                ->index();
            $table->string('ciudad')->nullable(); // Ciudad donde se encuentra la editorial
            $table->string('pais')->nullable(); // País donde se encuentra la editorial
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('editoriales');
    }
};