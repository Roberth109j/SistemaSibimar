<?php

namespace App\Http\Controllers;

use App\Models\Autor;
use App\Models\Editorial;
use App\Models\Estanteria;
use App\Models\Seccion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;

class InlineCreateController extends Controller
{
    /**
     * Crear autor desde formulario de libro
     */
    public function storeAutor(Request $request): JsonResponse
    {
        Log::info('Creando autor inline:', $request->all());
        
        try {
            $validator = Validator::make($request->all(), [
                'nombres' => 'required|string|max:255',
                'apellidos' => 'required|string|max:255',
            ], [
                'nombres.required' => 'Los nombres son obligatorios',
                'apellidos.required' => 'Los apellidos son obligatorios',
                'nombres.max' => 'Los nombres no pueden exceder 255 caracteres',
                'apellidos.max' => 'Los apellidos no pueden exceder 255 caracteres',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors(),
                    'message' => 'Datos de validación incorrectos'
                ], 422);
            }

            // Convertir a mayúsculas antes de verificar duplicados y guardar
            $nombresUpper = strtoupper($request->nombres);
            $apellidosUpper = strtoupper($request->apellidos);

            // Verificar si ya existe un autor con el mismo nombre y apellido
            $existingAutor = Autor::where('nombres', $nombresUpper)
                                  ->where('apellidos', $apellidosUpper)
                                  ->first();

            if ($existingAutor) {
                Log::warning('Intento de crear autor duplicado:', [
                    'nombres' => $nombresUpper,
                    'apellidos' => $apellidosUpper,
                    'existing_id' => $existingAutor->id
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Ya existe un autor con el mismo nombre y apellidos',
                    'existing_autor' => $existingAutor
                ], 409);
            }

            DB::beginTransaction();

            $autor = Autor::create([
                'nombres' => $nombresUpper,
                'apellidos' => $apellidosUpper
            ]);
            
            DB::commit();

            Log::info('Autor creado exitosamente:', ['id' => $autor->id, 'data' => $autor->toArray()]);

            return response()->json([
                'success' => true,
                'message' => 'Autor creado correctamente',
                'autor' => $autor
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al crear autor inline:', ['error' => $e->getMessage()]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error interno del servidor al crear el autor'
            ], 500);
        }
    }

    /**
     * Crear editorial desde formulario de libro
     */
    public function storeEditorial(Request $request): JsonResponse
    {
        Log::info('Creando editorial inline:', $request->all());
        
        try {
            $validator = Validator::make($request->all(), [
                'nombre' => 'required|string|max:255',
                'ciudad' => 'nullable|string|max:255',
                'pais' => 'nullable|string|max:255',
            ], [
                'nombre.required' => 'El nombre es obligatorio',
                'nombre.max' => 'El nombre no puede exceder 255 caracteres',
                'ciudad.max' => 'La ciudad no puede exceder 255 caracteres',
                'pais.max' => 'El país no puede exceder 255 caracteres',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors(),
                    'message' => 'Datos de validación incorrectos'
                ], 422);
            }

            // Convertir nombre a mayúsculas antes de verificar duplicados y guardar
            $nombreUpper = strtoupper($request->nombre);

            // Verificar si ya existe una editorial con el mismo nombre
            $existingEditorial = Editorial::where('nombre', $nombreUpper)->first();

            if ($existingEditorial) {
                Log::warning('Intento de crear editorial duplicada:', [
                    'nombre' => $nombreUpper,
                    'existing_id' => $existingEditorial->id
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Ya existe una editorial con el mismo nombre',
                    'existing_editorial' => $existingEditorial
                ], 409);
            }

            DB::beginTransaction();

            $editorial = Editorial::create([
                'nombre' => $nombreUpper,
                'ciudad' => $request->ciudad,
                'pais' => $request->pais
            ]);
            
            DB::commit();

            Log::info('Editorial creada exitosamente:', ['id' => $editorial->id, 'data' => $editorial->toArray()]);

            return response()->json([
                'success' => true,
                'message' => 'Editorial creada correctamente',
                'editorial' => $editorial
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al crear editorial inline:', ['error' => $e->getMessage()]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error interno del servidor al crear la editorial'
            ], 500);
        }
    }

    /**
     * Crear estantería desde formulario de libro
     */
    public function storeEstanteria(Request $request): JsonResponse
    {
        Log::info('Creando estantería inline:', $request->all());
        
        try {
            $validator = Validator::make($request->all(), [
                'cod_estante' => 'required|string|max:10|unique:estanterias',
                'descripcion' => 'nullable|string|max:255',
                'seccion_id' => 'required|exists:secciones,id',
            ], [
                'cod_estante.required' => 'El código de estante es obligatorio',
                'cod_estante.max' => 'El código de estante no puede exceder 10 caracteres',
                'cod_estante.unique' => 'Ya existe una estantería con este código',
                'descripcion.max' => 'La descripción no puede exceder 255 caracteres',
                'seccion_id.required' => 'La sección es obligatoria',
                'seccion_id.exists' => 'La sección seleccionada no es válida',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors(),
                    'message' => 'Datos de validación incorrectos'
                ], 422);
            }

            // Verificar permisos del usuario según su rol
            $user = $request->user();
            $seccionNombre = Seccion::find($request->seccion_id)->nombre;
            
            if ($user->hasRole('BibliotecarioPrimaria') && $seccionNombre !== 'PRIMARIA') {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes permisos para crear estanterías en esta sección'
                ], 403);
            }
            
            if ($user->hasRole('BibliotecarioBachillerato') && $seccionNombre !== 'BACHILLERATO') {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes permisos para crear estanterías en esta sección'
                ], 403);
            }

            DB::beginTransaction();

            // Convertir a mayúsculas antes de guardar
            $estanteria = Estanteria::create([
                'cod_estante' => strtoupper($request->cod_estante),
                'descripcion' => $request->descripcion ? strtoupper($request->descripcion) : null,
                'seccion_id' => $request->seccion_id
            ]);
            
            // Cargar la relación con sección
            $estanteria->load('seccion');
            
            DB::commit();

            Log::info('Estantería creada exitosamente:', ['id' => $estanteria->id, 'data' => $estanteria->toArray()]);

            return response()->json([
                'success' => true,
                'message' => 'Estantería creada correctamente',
                'estanteria' => $estanteria
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al crear estantería inline:', ['error' => $e->getMessage()]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error interno del servidor al crear la estantería'
            ], 500);
        }
    }
}