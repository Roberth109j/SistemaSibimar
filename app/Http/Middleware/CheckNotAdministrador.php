<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckNotAdministrador
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!Auth::check()) {
            return redirect('login');
        }

        $user = Auth::user();

        // Si el usuario es administrador, denegar acceso
        if ($user->hasRole('Administrador')) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Los administradores no tienen acceso a esta sección.'
                ], 403);
            }
            
            abort(403, 'Los administradores no tienen acceso a esta sección.');
        }

        return $next($request);
    }
}