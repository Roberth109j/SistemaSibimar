<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;
use App\Http\Controllers\AutorController;
use App\Http\Controllers\EditorialController;
use App\Http\Controllers\EstanteriaController;
use App\Http\Controllers\LibroController;
use App\Http\Controllers\EjemplarController;
use App\Http\Controllers\GradoController;
use App\Http\Controllers\LectorController;
use App\Http\Controllers\PrestamoController;
use App\Http\Controllers\DevolucionController; // ← NUEVO CONTROLLER
use App\Http\Controllers\ReporteController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InformeController;
use App\Http\Controllers\InventarioController;
use App\Http\Controllers\ExcelTestController;
use App\Http\Controllers\InlineCreateController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\BuscadorController;
use App\Http\Controllers\PrestamoMasivoController;


// Ruta para refrescar el token CSRF
Route::get('/csrf-refresh', function () {
    // Regenerar el token CSRF
    Session::regenerateToken();
    
    // Devolver el nuevo token como respuesta JSON
    return Response::json([
        'token' => csrf_token(),
        'status' => 'success'
    ]);
});

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/buscador', [BuscadorController::class, 'index'])->name('buscar');

Route::middleware(['auth', 'verified', 'active.user'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

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
    Route::get('estanterias/{estanteria}', [EstanteriaController::class, 'show'])->name('estanterias.show');
    
    // Rutas protegidas por middleware de roles para estanterías (solo administrador o bibliotecarios)
    Route::middleware('role:Administrador|BibliotecarioPrimaria|BibliotecarioBachillerato')->group(function () {
        Route::get('estanterias/create', [EstanteriaController::class, 'create'])->name('estanterias.create');
        Route::post('estanterias', [EstanteriaController::class, 'store'])->name('estanterias.store');
        Route::get('estanterias/{estanteria}/edit', [EstanteriaController::class, 'edit'])->name('estanterias.edit');
        Route::put('estanterias/{estanteria}', [EstanteriaController::class, 'update'])->name('estanterias.update');
        Route::patch('estanterias/{estanteria}', [EstanteriaController::class, 'update']);
        Route::delete('estanterias/{estanteria}', [EstanteriaController::class, 'destroy'])->name('estanterias.destroy');
    });

    // Rutas para LibroController
    Route::get('libros', [LibroController::class, 'index'])->name('libros.index');
    Route::get('libros/search', [LibroController::class, 'search'])->name('libros.search');
    
    // Rutas protegidas por middleware de roles (solo administrador o bibliotecarios)
    Route::middleware('role:Administrador|BibliotecarioPrimaria|BibliotecarioBachillerato')->group(function () {
        Route::get('libros/create', [LibroController::class, 'create'])->name('libros.create');
        Route::post('libros', [LibroController::class, 'store'])->name('libros.store');
        Route::get('libros/{libro}/edit', [LibroController::class, 'edit'])->name('libros.edit');
        Route::put('libros/{libro}', [LibroController::class, 'update'])->name('libros.update');
        Route::patch('libros/{libro}', [LibroController::class, 'update']);
        Route::delete('libros/{libro}', [LibroController::class, 'destroy'])->name('libros.destroy');
    });
    
    Route::get('libros/{libro}', [LibroController::class, 'show'])->name('libros.show');

    // Rutas de Ejemplares
    Route::get('libros/{libro}/ejemplares', [EjemplarController::class, 'index'])->name('ejemplares.index');
    
    // Rutas de Ejemplares protegidas por middleware de roles
    Route::middleware('role:Administrador|BibliotecarioPrimaria|BibliotecarioBachillerato')->group(function () {
        Route::get('libros/{libro}/ejemplares/create', [EjemplarController::class, 'create'])->name('ejemplares.create');
        Route::post('libros/{libro}/ejemplares', [EjemplarController::class, 'store'])->name('ejemplares.store');
        Route::get('libros/{libro}/ejemplares/{ejemplar}/edit', [EjemplarController::class, 'edit'])->name('ejemplares.edit');
        Route::put('libros/{libro}/ejemplares/{ejemplar}', [EjemplarController::class, 'update'])->name('ejemplares.update');
        Route::patch('libros/{libro}/ejemplares/{ejemplar}', [EjemplarController::class, 'update']);
        Route::delete('libros/{libro}/ejemplares/{ejemplar}', [EjemplarController::class, 'destroy'])->name('ejemplares.destroy');
    });
    
    // Esta ruta debe ir al final para evitar conflictos con rutas específicas como 'create'
     Route::get('libros/{libro}/ejemplares/{ejemplar}', [EjemplarController::class, 'show'])->name('ejemplares.show');

    // Rutas adicionales para las funciones AJAX de clasificación Dewey
    Route::get('api/categorias/{categoriaId}/subcategorias', [LibroController::class, 'getSubcategorias']);
    Route::get('api/subcategorias/{subcategoriaId}/temas', [LibroController::class, 'getTemas']);

    // ===== RUTAS PARA USUARIOS - SOLO ADMINISTRADORES =====
    Route::middleware('role:Administrador')->group(function () {
        // Ruta principal (index) - Listado de usuarios
        Route::get('usuarios', [UsuarioController::class, 'index'])->name('usuarios.index');
        
        // Ruta para mostrar formulario de creación
        Route::get('usuarios/create', [UsuarioController::class, 'create'])->name('usuarios.create');
        
        // Ruta para estadísticas (API) - DEBE IR ANTES DE LAS RUTAS CON PARÁMETROS
        Route::get('usuarios/estadisticas', [UsuarioController::class, 'estadisticas'])->name('usuarios.estadisticas');
        
        // Ruta para almacenar nuevo usuario
        Route::post('usuarios', [UsuarioController::class, 'store'])->name('usuarios.store');
        
        // Ruta para mostrar detalles de un usuario específico
        Route::get('usuarios/{usuario}', [UsuarioController::class, 'show'])->name('usuarios.show');
        
        // Ruta para mostrar formulario de edición
        Route::get('usuarios/{usuario}/edit', [UsuarioController::class, 'edit'])->name('usuarios.edit');
        
        // Rutas para actualizar usuario
        Route::put('usuarios/{usuario}', [UsuarioController::class, 'update'])->name('usuarios.update');
        Route::patch('usuarios/{usuario}', [UsuarioController::class, 'update']);
        
        // Ruta para eliminar usuario
        Route::delete('usuarios/{usuario}', [UsuarioController::class, 'destroy'])->name('usuarios.destroy');
        
        // Ruta para cambiar estado activo/inactivo
        Route::patch('usuarios/{usuario}/toggle-estado', [UsuarioController::class, 'toggleEstado'])->name('usuarios.toggle-estado');
    });

    // Rutas para grados - Solo administradores
    Route::middleware('role:Administrador')->group(function () {
        Route::get('grados', [GradoController::class, 'index'])->name('grados.index');
        Route::get('grados/create', [GradoController::class, 'create'])->name('grados.create');
        Route::post('grados', [GradoController::class, 'store'])->name('grados.store');
        Route::get('grados/{grado}', [GradoController::class, 'show'])->name('grados.show');
        Route::get('grados/{grado}/edit', [GradoController::class, 'edit'])->name('grados.edit');
        Route::put('grados/{grado}', [GradoController::class, 'update'])->name('grados.update');
        Route::patch('grados/{grado}', [GradoController::class, 'update'])->name('grados.patch');
        Route::delete('grados/{grado}', [GradoController::class, 'destroy'])->name('grados.destroy');
    });

    // Rutas para LectorController
    Route::get('lectores', [LectorController::class, 'index'])->name('lectores.index');
    Route::get('lectores/create', [LectorController::class, 'create'])->name('lectores.create');
    Route::get('/lectores/buscar', [LectorController::class, 'buscarPorCodigo'])->name('lectores.buscar');
    Route::get('/lectores/asignacion-masiva', [LectorController::class, 'showAsignacionMasiva'])
        ->name('lectores.asignacion-masiva');
    Route::post('/lectores/asignacion-masiva', [LectorController::class, 'asignacionMasiva'])
        ->name('lectores.asignacion-masiva.store');

    Route::post('lectores', [LectorController::class, 'store'])->name('lectores.store');
    Route::get('lectores/{lector}', [LectorController::class, 'show'])->name('lectores.show');
    Route::get('lectores/{lector}/edit', [LectorController::class, 'edit'])->name('lectores.edit');
    Route::put('lectores/{lector}', [LectorController::class, 'update'])->name('lectores.update');
    Route::patch('lectores/{lector}', [LectorController::class, 'update']);
    Route::delete('lectores/{lector}', [LectorController::class, 'destroy'])->name('lectores.destroy');

    Route::post('/lectores/cambio-estado-masivo', [LectorController::class, 'cambioEstadoMasivo'])
        ->name('lectores.cambio-estado-masivo');

    // ===== 🔍 RUTAS PARA PRÉSTAMOS (SOLO CREACIÓN Y GESTIÓN) =====
    Route::get('prestamos', [PrestamoController::class, 'index'])->name('prestamos.index');
    Route::get('prestamos/create', [PrestamoController::class, 'create'])->name('prestamos.create');
    Route::post('prestamos', [PrestamoController::class, 'store'])->name('prestamos.store');
    Route::get('prestamos/{prestamo}', [PrestamoController::class, 'show'])->name('prestamos.show');
    
    // Ruta para buscar lector por código (AJAX) - Para PRÉSTAMOS
    Route::get('/prestamos/buscar-lector', [PrestamoController::class, 'buscarLector'])->name('prestamos.buscar-lector');

    // ===== 🆕 NUEVA RUTA PARA PRÉSTAMOS MASIVOS =====
    Route::post('/prestamos/masivo', [PrestamoMasivoController::class, 'store'])->name('prestamos.masivo.store');


    // RUTAS PARA DEVOLUCIONES
    Route::prefix('devoluciones')->name('devoluciones.')->group(function () {
        Route::get('/', [DevolucionController::class, 'index'])->name('index');
        Route::post('/buscar-prestamos', [DevolucionController::class, 'buscarPrestamos'])->name('buscar-prestamos');
        Route::patch('/{id}/devolver', [DevolucionController::class, 'devolver'])->name('devolver');
        
        // NUEVA: Ruta para devolución múltiple
        Route::patch('/devolver-multiple', [DevolucionController::class, 'devolverMultiple'])->name('devolver-multiple');
    });

    // Rutas para Reportes
    Route::get('reportes/historial-prestamos', [ReporteController::class, 'historialPrestamos'])->name('reportes.historial-prestamos');

    // Rutas para InformeController
    Route::prefix('informes')->group(function () {
        Route::get('/', [InformeController::class, 'index'])->name('informes.index');
        Route::get('/rangos-fecha', [InformeController::class, 'getRangosFecha']);
        Route::get('/prestamos-realizados', function () {
            return redirect()->route('informes.index');
        })->name('informes.prestamos-realizados');
        Route::get('/libros-no-devueltos', function () {
            return redirect()->route('informes.index');
        })->name('informes.libros-no-devueltos');
        Route::get('/libros-perdidos', function () {
            return redirect()->route('informes.index');
        })->name('informes.libros-perdidos-view');
        Route::post('/prestamos-realizados', [InformeController::class, 'prestamosRealizados']);
        Route::post('/libros-no-devueltos', [InformeController::class, 'librosNoDevueltos']);
        Route::post('/libros-perdidos', [InformeController::class, 'librosPerdidos'])->name('informes.libros-perdidos');
        Route::get('/descargar-prestamos', [InformeController::class, 'descargarPDFPrestamos'])
            ->name('informes.descargar-prestamos');
        Route::get('/descargar-no-devueltos', [InformeController::class, 'descargarPDFNoDevueltos'])
            ->name('informes.descargar-no-devueltos');
        Route::get('/descargar-libros-perdidos', [InformeController::class, 'descargarPDFLibrosPerdidos'])
            ->name('informes.descargar-libros-perdidos');
    });

    // Rutas para InventarioController
    Route::get('inventario', [InventarioController::class, 'index'])->name('inventario.index');
    Route::get('/inventario/exportar', [InventarioController::class, 'exportarExcel'])
        ->name('inventario.exportar');


    Route::middleware('role:Administrador')->group(function () {
        Route::get('usuarios', [UsuarioController::class, 'index'])->name('usuarios.index');
        Route::post('usuarios', [UsuarioController::class, 'store'])->name('usuarios.store');
        Route::get('usuarios/{usuario}', [UsuarioController::class, 'show'])->name('usuarios.show');
        Route::put('usuarios/{usuario}', [UsuarioController::class, 'update'])->name('usuarios.update');
        Route::patch('usuarios/{usuario}', [UsuarioController::class, 'update']);
        Route::delete('usuarios/{usuario}', [UsuarioController::class, 'destroy'])->name('usuarios.destroy');
        Route::patch('usuarios/{usuario}/toggle-estado', [UsuarioController::class, 'toggleEstado'])->name('usuarios.toggle-estado');
        Route::get('usuarios/estadisticas', [UsuarioController::class, 'estadisticas'])->name('usuarios.estadisticas');
    });

    Route::prefix('api/inline-create')->middleware(['auth', 'verified'])->group(function () {
    Route::post('/autor', [InlineCreateController::class, 'storeAutor'])
        ->name('api.inline-create.autor');
    
    Route::post('/editorial', [InlineCreateController::class, 'storeEditorial'])
        ->name('api.inline-create.editorial');
    
    Route::post('/estanteria', [InlineCreateController::class, 'storeEstanteria'])
        ->middleware('role:Administrador|BibliotecarioPrimaria|BibliotecarioBachillerato')
        ->name('api.inline-create.estanteria');
});   
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';