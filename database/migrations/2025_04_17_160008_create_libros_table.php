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

            // Código único - ISBN para libros (13 dígitos) o ISSN para revistas (8 dígitos)
            $table->string('codigo_unico')
                ->index();  // index para mejorar la búsqueda

            $table->string('titulo')
                ->index();

            // contenido del libro con índice de texto completo para búsqueda
            $table->text('contenido')->nullable();

            // seccion a la que pertenece el libro primaria o bachillerato
            $table->foreignId('seccion_id')
                ->constrained('secciones')
                ->onDelete('restrict');

            // relacion con tabla autores
            $table->foreignId('autor_id')
                ->constrained('autores')
                ->onDelete('restrict'); 

            // relacion con tabla editoriales
            $table->foreignId('editorial_id')
                ->constrained('editoriales')
                ->onDelete('restrict');
            
            // Nuevo campo Áreas
            $table->enum('area', ['CIENCIAS', 'MATEMATICAS', 'HUMANIDADES', 'IDIOMAS', 'TECNOLOGIA', 'OTRAS'])
                ->index(); 

            // Clase de material - Solo LIBRO y REVISTA
            $table->enum('clase', ['LIBRO', 'REVISTA'])->default('LIBRO');

            // Numero de tomo
            $table->integer('tomo')->nullable();

            // edicion del libro
            $table->string('edicion')->nullable();

            // año de publicacion
            $table->year('anio')->nullable();

            // fecha de ingreso
            $table->date('fecha_ingreso');

            // precio de adquisicion
            $table->decimal('precio', 8, 2)->nullable();

            // Idioma del libro
            $table->enum('idioma', ['ESPAÑOL', 'INGLES', 'FRANCES','OTRO'])
                ->index(); 

            // Edad recomendada para leer el libro
            $table->integer('edad_recomendada')->nullable();
            
            // numero de paginas
            $table->integer('paginas');
            
            // relacion con tabla temas dewey
            $table->foreignId('tema_id')
                ->constrained('temas_dewey')
                ->onDelete('restrict'); 
           
            // signatura topografica primera letra apellido numero consecutivo y primera letra del titulo del libro   
            $table->string('sign_top')->nullable();

            // estanteria donde se encuentra el libro (opcional)
            $table->foreignId('estanteria_id')
                ->nullable()
                ->constrained('estanterias')
                ->onDelete('set null');

            $table->timestamps();

            // Constraint único: mismo código no puede repetirse en la misma sección
            // pero SÍ puede existir el mismo ISBN en diferentes secciones
            $table->unique(['codigo_unico', 'seccion_id'], 'libros_codigo_seccion_unique');

            // Índice de texto completo para búsqueda eficiente por contenido
            $table->fullText(['titulo', 'contenido']);

            // Índices optimizados para rendimiento en inventario y exportación
            $table->index(['area', 'titulo'], 'libros_area_titulo_index');
            $table->index('clase', 'libros_clase_index');
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