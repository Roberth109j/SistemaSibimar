<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\AutorController;
use App\Http\Controllers\CoautorController;
use App\Http\Controllers\EditorialController;
use App\Http\Controllers\EstanteriaController;
use App\Http\Controllers\LibroController;
use App\Http\Controllers\EjemplarController;
use App\Http\Controllers\GradoController;
use App\Http\Controllers\LectorController;
use App\Http\Controllers\PrestamoController;
use App\Http\Controllers\ReporteController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InformeController;
use App\Http\Controllers\InventarioController;
use App\Http\Controllers\ExcelTestController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
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
    Route::get('estanterias/create', [EstanteriaController::class, 'create'])->name('estanterias.create');
    Route::post('estanterias', [EstanteriaController::class, 'store'])->name('estanterias.store');
    Route::get('estanterias/{estanteria}', [EstanteriaController::class, 'show'])->name('estanterias.show');
    Route::get('estanterias/{estanteria}/edit', [EstanteriaController::class, 'edit'])->name('estanterias.edit');
    Route::put('estanterias/{estanteria}', [EstanteriaController::class, 'update'])->name('estanterias.update');
    Route::patch('estanterias/{estanteria}', [EstanteriaController::class, 'update']);
    Route::delete('estanterias/{estanteria}', [EstanteriaController::class, 'destroy'])->name('estanterias.destroy');

    // Rutas para LibroController
    Route::get('libros', [LibroController::class, 'index'])->name('libros.index');
    Route::get('libros/search', [LibroController::class, 'search'])->name('libros.search');
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

    // Rutas para grados
    Route::get('grados', [GradoController::class, 'index'])->name('grados.index');
    Route::get('grados/create', [GradoController::class, 'create'])->name('grados.create');
    Route::post('grados', [GradoController::class, 'store'])->name('grados.store');
    Route::get('grados/{grado}', [GradoController::class, 'show'])->name('grados.show');
    Route::get('grados/{grado}/edit', [GradoController::class, 'edit'])->name('grados.edit');
    Route::put('grados/{grado}', [GradoController::class, 'update'])->name('grados.update');
    Route::patch('grados/{grado}', [GradoController::class, 'update']);
    Route::delete('grados/{grado}', [GradoController::class, 'destroy'])->name('grados.destroy');

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

    // ===== 🔍 RUTAS PARA PRÉSTAMOS CON BÚSQUEDA GLOBAL MEJORADA =====
    Route::get('prestamos', [PrestamoController::class, 'index'])->name('prestamos.index');
    Route::get('prestamos/create', [PrestamoController::class, 'create'])->name('prestamos.create');

    // Ruta para buscar lector por código (AJAX)
    Route::get('/prestamos/buscar-lector', [PrestamoController::class, 'buscarLector'])->name('prestamos.buscar-lector');

    // Rutas para Reportes
    Route::get('reportes/historial-prestamos', [ReporteController::class, 'historialPrestamos'])->name('reportes.historial-prestamos');
    Route::get('prestamos/listado', [PrestamoController::class, 'listado'])->name('prestamos.listado');
    Route::get('prestamos/devoluciones', [PrestamoController::class, 'listado'])->name('prestamos.devoluciones');

    // ✅ RUTA PRINCIPAL PARA PRÉSTAMOS VENCIDOS CON BÚSQUEDA GLOBAL
    Route::get('prestamos/vencidos', [PrestamoController::class, 'vencidos'])->name('prestamos.vencidos');

    // Rutas CRUD básicas de préstamos
    Route::post('prestamos', [PrestamoController::class, 'store'])->name('prestamos.store');
    Route::get('prestamos/{prestamo}', [PrestamoController::class, 'show'])->name('prestamos.show');
    Route::get('prestamos/{prestamo}/edit', [PrestamoController::class, 'edit'])->name('prestamos.edit');
    Route::put('prestamos/{prestamo}', [PrestamoController::class, 'update'])->name('prestamos.update');

    // ===== 📤 RUTAS DE DEVOLUCIÓN OPTIMIZADAS =====
    // Devolución de préstamos activos
    Route::post('prestamos/{prestamo}/devolver', [PrestamoController::class, 'devolver'])->name('prestamos.devolver');

    // ✅ Devolución de préstamos vencidos con preservación de filtros de búsqueda
    Route::post('prestamos/{prestamo}/devolver-vencido', [PrestamoController::class, 'devolverVencido'])
        ->name('prestamos.devolver-vencido');

    Route::delete('prestamos/{prestamo}', [PrestamoController::class, 'destroy'])->name('prestamos.destroy');

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
        Route::post('/prestamos-realizados', [InformeController::class, 'prestamosRealizados']);
        Route::post('/libros-no-devueltos', [InformeController::class, 'librosNoDevueltos']);
        Route::get('/descargar-prestamos', [InformeController::class, 'descargarPDFPrestamos'])
            ->name('informes.descargar-prestamos');
        Route::get('/descargar-no-devueltos', [InformeController::class, 'descargarPDFNoDevueltos'])
            ->name('informes.descargar-no-devueltos');
    });

    Route::get('prestamos/debug-vencidos', [PrestamoController::class, 'debugVencidos'])
     ->name('prestamos.debug-vencidos');

    // ✅ También añadir esta ruta temporal para debugging:
    Route::get('debug/search-params', function (Illuminate\Http\Request $request) {
        \Illuminate\Support\Facades\Log::info('🐛 DEBUG Route - Parámetros recibidos:', [
            'all' => $request->all(),
            'search' => $request->get('search'),
            'query_string' => $request->getQueryString(),
            'url' => $request->fullUrl()
        ]);

        return response()->json([
            'message' => 'Debug route working',
            'received_params' => $request->all(),
            'search_param' => $request->get('search'),
            'query_string' => $request->getQueryString()
        ]);
    })->middleware(['auth', 'verified']);

    // Rutas para InventarioController
    Route::get('inventario', [InventarioController::class, 'index'])->name('inventario.index');
    Route::get('/inventario/exportar', [InventarioController::class, 'exportarExcel'])
        ->name('inventario.exportar');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
