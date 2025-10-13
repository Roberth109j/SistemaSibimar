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
            $table->foreignId('ejemplar_id')
                ->constrained('ejemplares')
                ->onDelete('restrict'); 

            // Relación con el lector (estudiante o usuario)
            $table->foreignId('lector_id')
                ->constrained('lectores')
                ->onDelete('cascade');

            // Fecha del préstamo
            $table->date('fecha_prestamo')
                ->index(); 

            // Fecha esperada de devolución
            $table->date('fecha_devolucion')
                ->index();

            // Fecha real de devolución (si ya fue devuelto)
            $table->date('fecha_devuelto')->nullable();

            // Estado del préstamo
            $table->enum('estado', ['ACTIVO', 'DEVUELTO', 'VENCIDO'])
                ->default('ACTIVO')
                ->index();

            //  Índice compuesto para dashboard (préstamos por mes)
            $table->index(['estado', 'fecha_prestamo'], 'prestamos_estado_fecha_index');
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