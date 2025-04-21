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
        Schema::create('coautores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('libro_id')->nullable()->constrained('libros')->onDelete('cascade');
            $table->string('nombre_completo');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('coautores');
    }
};