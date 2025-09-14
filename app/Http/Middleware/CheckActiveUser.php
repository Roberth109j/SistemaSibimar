<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckActiveUser
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Verificar si el usuario está autenticado
        if (Auth::check()) {
            $user = Auth::user();
            
            // Si el usuario no está activo, cerrar sesión y redirigir
            if (!$user->estado_activo) {
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();
                
                // Si es una solicitud AJAX/API, devolver respuesta JSON
                if ($request->expectsJson()) {
                    return response()->json([
                        'message' => 'Su cuenta está desactivada. Contacte al administrador.',
                        'redirect' => route('login')
                    ], 401);
                }
                
                // Para solicitudes web, redirigir al login con mensaje
                return redirect()->route('login')
                    ->with('error', 'Su cuenta está desactivada. Contacte al administrador para más información.');
            }
        }
        
        return $next($request);
    }
}
