<?php

namespace App\Http\Middleware;

use App\Http\Controllers\PrestamoVencidoController;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class ActualizarPrestamosVencidos
{
    /**
     * Middleware que actualiza automáticamente el estado de préstamos vencidos
     * cuando un usuario autenticado accede al sistema.
     *
     * Se ejecuta SOLO para usuarios autenticados (Admin o Bibliotecarios)
     * Optimizado con caché para evitar actualizaciones innecesarias frecuentes.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Solo ejecutar si el usuario está autenticado
        if (Auth::check()) {
            $user = Auth::user();

            // Solo ejecutar para usuarios con roles específicos
            if ($user->hasAnyRole(['Administrador', 'BibliotecarioPrimaria', 'BibliotecarioBachillerato'])) {

                try {
                    // Actualizar estados de préstamos vencidos
                    $resultado = PrestamoVencidoController::actualizarEstados();

                } catch (\Exception $e) {

                }
            } else {
                Log::info('⚠️ Usuario NO tiene rol autorizado para actualizar préstamos:', [
                    'roles' => $user->roles->pluck('name')->toArray()
                ]);
            }
        } else {
            Log::info('⚠️ Middleware: Usuario no autenticado');
        }

        return $next($request);
    }
}
