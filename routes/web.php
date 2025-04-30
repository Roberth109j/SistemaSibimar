<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\AutorController;
use App\Http\Controllers\CoautorController;
use App\Http\Controllers\EditorialController;
use App\Http\Controllers\EstanteriaController;
use App\Http\Controllers\LibroController;
use App\Http\Controllers\EjemplarController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    
    // Rutas específicas para el controlador de Autor
    Route::get('autores', [AutorController::class, 'index'])->name('autores.index');
    Route::get('autores/create', [AutorController::class, 'create'])->name('autores.create');
    Route::post('autores', [AutorController::class, 'store'])->name('autores.store');
    Route::get('autores/{autor}', [AutorController::class, 'show'])->name('autores.show');
    Route::get('autores/{autor}/edit', [AutorController::class, 'edit'])->name('autores.edit');
    Route::put('autores/{autor}', [AutorController::class, 'update'])->name('autores.update');
    Route::patch('autores/{autor}', [AutorController::class, 'update']);

    

    // Rutas para EditorialController
    Route::get('editoriales', [EditorialController::class, 'index'])->name('editoriales.index');
    Route::get('editoriales/create', [EditorialController::class, 'create'])->name('editoriales.create');
    Route::post('editoriales', [EditorialController::class, 'store'])->name('editoriales.store');
    Route::get('editoriales/{editorial}', [EditorialController::class, 'show'])->name('editoriales.show');
    Route::get('editoriales/{editorial}/edit', [EditorialController::class, 'edit'])->name('editoriales.edit');
    Route::put('editoriales/{editorial}', [EditorialController::class, 'update'])->name('editoriales.update');
    Route::patch('editoriales/{editorial}', [EditorialController::class, 'update']);

    // Rutas para EstanteriaController
    Route::get('estanterias', [EstanteriaController::class, 'index'])->name('estanterias.index');
    Route::get('estanterias/create', [EstanteriaController::class, 'create'])->name('estanterias.create');
    Route::post('estanterias', [EstanteriaController::class, 'store'])->name('estanterias.store');
    Route::get('estanterias/{estanteria}', [EstanteriaController::class, 'show'])->name('estanterias.show');
    Route::get('estanterias/{estanteria}/edit', [EstanteriaController::class, 'edit'])->name('estanterias.edit');
    Route::put('estanterias/{estanteria}', [EstanteriaController::class, 'update'])->name('estanterias.update');
    Route::patch('estanterias/{estanteria}', [EstanteriaController::class, 'update']);
    Route::delete('estanterias/{estanteria}', [EstanteriaController::class, 'destroy'])->name('estanterias.destroy');

    Route::get('libros', [LibroController::class, 'index'])->name('libros.index');
    Route::get('libros/create', [LibroController::class, 'create'])->name('libros.create');
    Route::post('libros', [LibroController::class, 'store'])->name('libros.store');
    Route::get('libros/{libro}', [LibroController::class, 'show'])->name('libros.show');
    Route::get('libros/{libro}/edit', [LibroController::class, 'edit'])->name('libros.edit');
    Route::put('libros/{libro}', [LibroController::class, 'update'])->name('libros.update');
    Route::patch('libros/{libro}', [LibroController::class, 'update']);
    Route::delete('libros/{libro}', [LibroController::class, 'destroy'])->name('libros.destroy');

    // Rutas de Ejemplares
    Route::get('libros/{libro}/ejemplares', [EjemplarController::class, 'index'])->name('ejemplares.index');
    Route::get('libros/{libro}/ejemplares/create', [EjemplarController::class, 'create'])->name('ejemplares.create');
    Route::post('libros/{libro}/ejemplares', [EjemplarController::class, 'store'])->name('ejemplares.store');
    Route::get('libros/{libro}/ejemplares/{ejemplar}', [EjemplarController::class, 'show'])->name('ejemplares.show');
    Route::get('libros/{libro}/ejemplares/{ejemplar}/edit', [EjemplarController::class, 'edit'])->name('ejemplares.edit');
    Route::put('libros/{libro}/ejemplares/{ejemplar}', [EjemplarController::class, 'update'])->name('ejemplares.update');
    Route::patch('libros/{libro}/ejemplares/{ejemplar}', [EjemplarController::class, 'update']);
    Route::delete('libros/{libro}/ejemplares/{ejemplar}', [EjemplarController::class, 'destroy'])->name('ejemplares.destroy');

    // Rutas adicionales para las funciones AJAX de clasificación Dewey
    Route::get('api/categorias/{categoriaId}/subcategorias', [LibroController::class, 'getSubcategorias']);
    Route::get('api/subcategorias/{subcategoriaId}/temas', [LibroController::class, 'getTemas']);

});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';