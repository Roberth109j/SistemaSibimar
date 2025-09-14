<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Seccion;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UsuarioController extends Controller
{
    /**
     * Muestra un listado de todos los usuarios con paginación, ordenamiento y búsqueda.
     */
    public function index(Request $request): Response|RedirectResponse
    {

        // Validación de parámetros de paginación
        $page = max(1, (int) $request->input('page', 1));
        $perPage = 20; // Valor fijo de 20 elementos por página

        // Parámetros de ordenamiento
        $sortField = $request->get('sort_field', 'name');
        $sortOrder = $request->get('sort_order', 'asc');
        
        // Solo permitir campos específicos para ordenamiento
        $allowedSortFields = ['name', 'email', 'fecha_inicio_labores', 'estado_activo'];
        if (!in_array($sortField, $allowedSortFields)) {
            $sortField = 'name';
        }
        
        // Solo permitir ordenamiento ascendente o descendente
        $allowedSortOrders = ['asc', 'desc'];
        if (!in_array($sortOrder, $allowedSortOrders)) {
            $sortOrder = 'asc';
        }

        // Parámetro de búsqueda
        $search = $request->get('search', '');

        // Query base con relaciones
        $query = User::with(['roles', 'seccion']);

        // Filtro por estado
        $estadoFilter = $request->get('estado_filter', '');
        if ($estadoFilter !== '') {
            $query->where('estado_activo', $estadoFilter === 'activo');
        }

        // Aplicar filtro de búsqueda si existe
        if (!empty($search)) {
            $searchTerm = trim($search);
            $query->where(function($q) use ($searchTerm) {
                $q->where('name', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('email', 'LIKE', "%{$searchTerm}%");
            });
        }

        // Aplicar ordenamiento
        $query->orderBy($sortField, $sortOrder);

        // Obtener resultados paginados
        try {
            $usuarios = $query->paginate($perPage, ['*'], 'page', $page);
        } catch (\Exception $e) {
            Log::error('Error al paginar usuarios: ' . $e->getMessage());
            return redirect()->route('usuarios.index')
                ->with('error', 'Error al cargar la lista de usuarios.');
        }

        // Obtener datos adicionales para formularios
        $secciones = Seccion::orderBy('nombre')->get();
        $roles = Role::orderBy('name')->get();

        return Inertia::render('Usuarios/Index', [
            'usuarios' => $usuarios,
            'secciones' => $secciones,
            'roles' => $roles,
            'filters' => [
                'search' => $search,
                'sort_field' => $sortField,
                'sort_order' => $sortOrder,
                'estado_filter' => $estadoFilter,
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
        ]);
    }

    /**
     * Almacena un nuevo usuario en la base de datos.
     */
    public function store(Request $request): RedirectResponse
    {
        // Verificar que el usuario sea administrador
        if (!$request->user()->hasRole('Administrador')) {
            return redirect()->route('dashboard')
                ->with('error', 'No tienes permisos para realizar esta acción.');
        }

        // Validación de datos
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Password::defaults()],
            'roles' => ['required', 'array', 'min:1'],
            'roles.*' => ['exists:roles,name'],
            'seccion_id' => ['nullable', 'exists:secciones,id'],
            'fecha_inicio_labores' => ['required', 'date'],
            'fecha_fin_labores' => ['nullable', 'date', 'after:fecha_inicio_labores'],
            'estado_activo' => ['required', 'boolean'],
        ], [
            'name.required' => 'El nombre es obligatorio.',
            'name.max' => 'El nombre no puede exceder 255 caracteres.',
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email' => 'El correo electrónico debe tener un formato válido.',
            'email.unique' => 'Este correo electrónico ya está registrado.',
            'password.required' => 'La contraseña es obligatoria.',
            'password.confirmed' => 'La confirmación de contraseña no coincide.',
            'roles.required' => 'Debe asignar al menos un rol.',
            'roles.min' => 'Debe asignar al menos un rol.',
            'roles.*.exists' => 'Uno o más roles seleccionados no son válidos.',
            'seccion_id.exists' => 'La sección seleccionada no es válida.',
            'fecha_inicio_labores.required' => 'La fecha de inicio de labores es obligatoria.',
            'fecha_inicio_labores.date' => 'La fecha de inicio de labores debe ser una fecha válida.',
            'fecha_fin_labores.date' => 'La fecha de fin de labores debe ser una fecha válida.',
            'fecha_fin_labores.after' => 'La fecha de fin de labores debe ser posterior a la fecha de inicio.',
            'estado_activo.required' => 'El estado activo es obligatorio.',
            'estado_activo.boolean' => 'El estado activo debe ser verdadero o falso.',
        ]);

        try {
            DB::beginTransaction();

            // Determinar sección automáticamente según el rol
            $seccionId = null;
            $primerRol = $validated['roles'][0] ?? null;
            
            if ($primerRol === 'BibliotecarioBachillerato') {
                $seccionId = 2; // bachillerato
            } elseif ($primerRol === 'BibliotecarioPrimaria') {
                $seccionId = 1; // primaria
            }
            // Para Administrador, seccionId permanece null

            // Crear el usuario
            $usuario = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'seccion_id' => $seccionId,
                'fecha_inicio_labores' => $validated['fecha_inicio_labores'],
                'fecha_fin_labores' => $validated['fecha_fin_labores'],
                'estado_activo' => $validated['estado_activo'],
            ]);

            // Asignar roles
            $usuario->assignRole($validated['roles']);

            DB::commit();

            return redirect()->route('usuarios.index')
                ->with('success', 'Usuario creado exitosamente.');

        } catch (ValidationException $e) {
            DB::rollBack();
            throw $e;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al crear usuario: ' . $e->getMessage());
            return redirect()->back()
                ->withInput()
                ->with('error', 'Error al crear el usuario. Por favor, inténtelo de nuevo.');
        }
    }

    /**
     * Muestra los datos de un usuario específico.
     */
    public function show(User $usuario): Response|RedirectResponse
    {
        // Verificar que el usuario sea administrador
        if (!request()->user()->hasRole('Administrador')) {
            return redirect()->route('dashboard')
                ->with('error', 'No tienes permisos para acceder a esta página.');
        }

        return Inertia::render('Usuarios/Show', [
            'usuario' => $usuario->load(['roles', 'seccion'])
        ]);
    }

    /**
     * Actualiza un usuario existente en la base de datos.
     */
    public function update(Request $request, User $usuario): RedirectResponse
    {
        // Verificar que el usuario sea administrador
        if (!$request->user()->hasRole('Administrador')) {
            return redirect()->route('dashboard')
                ->with('error', 'No tienes permisos para realizar esta acción.');
        }

        // Validación de datos
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $usuario->id],
            'password' => ['nullable', 'confirmed', Password::defaults()],
            'roles' => ['required', 'array', 'min:1'],
            'roles.*' => ['exists:roles,name'],
            'seccion_id' => ['nullable', 'exists:secciones,id'],
            'fecha_inicio_labores' => ['required', 'date'],
            'fecha_fin_labores' => ['nullable', 'date', 'after:fecha_inicio_labores'],
            'estado_activo' => ['required', 'boolean'],
        ], [
            'name.required' => 'El nombre es obligatorio.',
            'name.max' => 'El nombre no puede exceder 255 caracteres.',
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email' => 'El correo electrónico debe tener un formato válido.',
            'email.unique' => 'Este correo electrónico ya está registrado.',
            'password.confirmed' => 'La confirmación de contraseña no coincide.',
            'roles.required' => 'Debe asignar al menos un rol.',
            'roles.min' => 'Debe asignar al menos un rol.',
            'roles.*.exists' => 'Uno o más roles seleccionados no son válidos.',
            'seccion_id.exists' => 'La sección seleccionada no es válida.',
            'fecha_inicio_labores.required' => 'La fecha de inicio de labores es obligatoria.',
            'fecha_inicio_labores.date' => 'La fecha de inicio de labores debe ser una fecha válida.',
            'fecha_fin_labores.date' => 'La fecha de fin de labores debe ser una fecha válida.',
            'fecha_fin_labores.after' => 'La fecha de fin de labores debe ser posterior a la fecha de inicio.',
            'estado_activo.required' => 'El estado activo es obligatorio.',
            'estado_activo.boolean' => 'El estado activo debe ser verdadero o falso.',
        ]);

        try {
            DB::beginTransaction();

            // Determinar sección automáticamente según el rol
            $seccionId = null;
            $primerRol = $validated['roles'][0] ?? null;
            
            if ($primerRol === 'BibliotecarioBachillerato') {
                $seccionId = 2; // bachillerato
            } elseif ($primerRol === 'BibliotecarioPrimaria') {
                $seccionId = 1; // primaria
            }
            // Para Administrador, seccionId permanece null

            // Preparar datos para actualizar
            $updateData = [
                'name' => $validated['name'],
                'email' => $validated['email'],
                'seccion_id' => $seccionId,
                'fecha_inicio_labores' => $validated['fecha_inicio_labores'],
                'fecha_fin_labores' => $validated['fecha_fin_labores'],
                'estado_activo' => $validated['estado_activo'],
            ];

            // Solo actualizar contraseña si se proporcionó una nueva
            if (!empty($validated['password'])) {
                $updateData['password'] = Hash::make($validated['password']);
            }

            // Actualizar el usuario
            $usuario->update($updateData);

            // Sincronizar roles (esto reemplaza todos los roles existentes)
            $usuario->syncRoles($validated['roles']);

            DB::commit();

            return redirect()->route('usuarios.index')
                ->with('success', 'Usuario actualizado exitosamente.');

        } catch (ValidationException $e) {
            DB::rollBack();
            throw $e;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al actualizar usuario: ' . $e->getMessage());
            return redirect()->back()
                ->withInput()
                ->with('error', 'Error al actualizar el usuario. Por favor, inténtelo de nuevo.');
        }
    }

    /**
     * Elimina un usuario de la base de datos.
     */
    public function destroy(User $usuario): RedirectResponse
    {
        // Verificar que el usuario sea administrador
        if (!request()->user()->hasRole('Administrador')) {
            return redirect()->route('dashboard')
                ->with('error', 'No tienes permisos para realizar esta acción.');
        }

        // Prevenir que el usuario se elimine a sí mismo
        if ($usuario->id === request()->user()->id) {
            return redirect()->route('usuarios.index')
                ->with('error', 'No puedes eliminar tu propia cuenta.');
        }

        try {
            DB::beginTransaction();

            // Verificar si el usuario tiene préstamos activos u otras relaciones
            // Aquí puedes agregar validaciones adicionales según tu modelo de datos
            
            // Eliminar roles del usuario
            $usuario->roles()->detach();
            
            // Eliminar el usuario
            $usuario->delete();

            DB::commit();

            return redirect()->route('usuarios.index')
                ->with('success', 'Usuario eliminado exitosamente.');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al eliminar usuario: ' . $e->getMessage());
            return redirect()->route('usuarios.index')
                ->with('error', 'Error al eliminar el usuario. Puede que tenga datos relacionados.');
        }
    }

    /**
     * Cambia el estado activo de un usuario.
     */
    public function toggleEstado(User $usuario): RedirectResponse
    {
        // Verificar que el usuario sea administrador
        if (!request()->user()->hasRole('Administrador')) {
            return redirect()->route('dashboard')
                ->with('error', 'No tienes permisos para realizar esta acción.');
        }

        // Prevenir que el usuario se desactive a sí mismo
        if ($usuario->id === request()->user()->id) {
            return redirect()->route('usuarios.index')
                ->with('error', 'No puedes cambiar tu propio estado.');
        }

        try {
            $nuevoEstado = !$usuario->estado_activo;
            $usuario->update(['estado_activo' => $nuevoEstado]);

            $mensaje = $nuevoEstado ? 'Usuario activado exitosamente.' : 'Usuario desactivado exitosamente.';
            
            return redirect()->route('usuarios.index')
                ->with('success', $mensaje);

        } catch (\Exception $e) {
            Log::error('Error al cambiar estado del usuario: ' . $e->getMessage());
            return redirect()->route('usuarios.index')
                ->with('error', 'Error al cambiar el estado del usuario.');
        }
    }

    /**
     * Obtiene estadísticas de usuarios por estado.
     */
    public function estadisticas(): \Illuminate\Http\JsonResponse
    {
        try {
            $estadisticas = [
                'total' => User::count(),
                'activos' => User::where('estado_activo', true)->count(),
                'inactivos' => User::where('estado_activo', false)->count(),
                'por_rol' => User::with('roles')
                    ->get()
                    ->groupBy(function($user) {
                        return $user->roles->first()->name ?? 'Sin rol';
                    })
                    ->map(function($group) {
                        return $group->count();
                    }),
            ];

            return response()->json($estadisticas);
        } catch (\Exception $e) {
            Log::error('Error al obtener estadísticas de usuarios: ' . $e->getMessage());
            return response()->json(['error' => 'Error al obtener estadísticas'], 500);
        }
    }
}