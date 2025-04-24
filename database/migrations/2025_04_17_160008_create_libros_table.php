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
        Schema::create('libros', function (Blueprint $table) {
            $table->id();

            //codigo ISBN - codigo de barras
            $table->string('isbn')
                ->unique()
                ->index();  // index para mejorar la busqueda

            $table->string('titulo')
                -> index();

            //contenido del libro
            $table->text('contenido')->nullable();

            //seccion a la que pertenece el libro primaria o bachillerato
            $table->foreignId('seccion_id')->constrained('secciones')->onDelete('restrict');

            //relacion con tabla autores
            $table->foreignId('autor_id')->constrained('autores')->onDelete('restrict');

            //relacion de coautores en la migracion coautores por si el libro tiene mas de un autor

            //relacion con tabla editoriales
            $table->foreignId('editorial_id')->constrained('editoriales')->onDelete('restrict');
            
            
            //coautores relacion con libros definida en la otra migracion

            //opciones para Clase de libro
            $table->enum('clase', ['LIBRO','CARTILLA', 'CUENTO', 'DICCIONARIO', 'ENCICLOPEDIA', 'NOVELA','REVISTA'])->default('LIBRO');

            //Numero de tomo
            $table->integer('tomo')->nullable();

            //edicion del libro
            $table->string('edicion')->nullable();

            //numero de ejemplares en la tabla ejemplares 

            //año de publicacion
            $table->year('anio')->nullable();

            //fecha de ingreso
            $table->date('fecha_ingreso');


            //precio de adquisicion
            $table->decimal('precio', 8, 2)->nullable();

            //Idioma del libro
            $table->enum('idioma', ['ESPANOL', 'INGLES', 'FRANCES','OTRO']);

            //Edad recomendada para leer el libro
            $table->integer('edad_recomendada')->nullable();
            
            //numero de paginas
            $table->integer('paginas');
            
            //relacion con tabla temas dewey
            $table->foreignId('tema_id')->constrained('temas_dewey')->onDelete('restrict');
           
            //signatura topografica primera letra apellido numero consecutivo y primera letra del titulo del libro   
            $table->string('sign_top')->nullable();

            //estanteria donde se encuentra el libro
            $table->foreignId('estanteria_id')->constrained('estanterias')->onDelete('restrict');
            

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */


    public function down(): void
    {
        Schema::dropIfExists('libros');
    }
};
