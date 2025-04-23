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
        Schema::create('prestamos', function (Blueprint $table) {
            $table->id();

            // Relación con el ejemplar prestado
            $table->foreignId('ejemplar_id')->constrained('ejemplares')->onDelete('restrict');

            // Relación con el lector (estudiante o usuario)
            $table->foreignId('lector_id')->constrained('lectores')->onDelete('cascade');

            // Fecha del préstamo
            $table->date('fecha_prestamo');

            // Fecha esperada de devolución
            $table->date('fecha_devolucion');

            // Fecha real de devolución (si ya fue devuelto)
            $table->date('fecha_devuelto');

            // Estado del préstamo
            $table->enum('estado', ['ACTIVO', 'DEVUELTO', 'VENCIDO'])->default('ACTIVO');

            // Observaciones adicionales
            $table->text('observaciones')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prestamos');
    }
};
