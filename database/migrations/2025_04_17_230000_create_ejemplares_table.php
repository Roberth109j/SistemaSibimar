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
        Schema::create('ejemplares', function (Blueprint $table) {
            $table->id();
            $table->foreignId('libro_id')->constrained()->onDelete('cascade');
            $table->unsignedInteger('numEjemplar')->default(1);
            $table->enum('tipo_adquisicion', ['COMPRA','REPOSICION', 'DONACION'])->default('COMPRA');
           $table->enum('estado', ['DISPONIBLE','PRESTADO', 'DAR DE BAJA', 'PERDIDO'])->default('DISPONIBLE');
            $table->text('observaciones')->nullable();
            $table->timestamps();
        });              
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ejemplares');
    }
};
