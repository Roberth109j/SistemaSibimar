<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Controllers\PrestamoVencidoController;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
            'error' => $request->session()->get('error'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        // Actualizar préstamos vencidos SOLO al iniciar sesión
        // Optimización: Solo se ejecuta una vez por sesión para usuarios autorizados
        $user = Auth::user();
        if ($user && $user->hasAnyRole(['Administrador', 'BibliotecarioPrimaria', 'BibliotecarioBachillerato'])) {
            try {
                $resultado = PrestamoVencidoController::actualizarEstados();

                Log::info('✅ Préstamos vencidos actualizados al iniciar sesión:', [
                    'user_id' => $user->id,
                    'user_email' => $user->email,
                    'actualizados' => $resultado['actualizados']
                ]);
            } catch (\Exception $e) {
                Log::error('❌ Error al actualizar préstamos vencidos en login:', [
                    'error' => $e->getMessage(),
                    'user_id' => $user->id
                ]);
            }
        }

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
