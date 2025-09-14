import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Plus, User, Mail, Lock, Calendar, Shield, Users } from 'lucide-react';
import UsuarioModal from '@/components/UsuarioModal';
import Form, { FormField } from '@/components/Form';
import { type CreateProps, type UsuarioFormData } from './types';

type CreateModalProps = {
  auth: any;
  secciones?: any[];
  roles?: any[];
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  errors?: Record<string, string>;
  open?: boolean;
  onClose?: () => void;
};

export default function CreateUsuario({
  auth,
  secciones = [],
  roles = [],
  onSuccess,
  onError,
  errors = {},
  open = false,
  onClose
}: CreateModalProps) {
  const isOpen = open;

  const { data, setData, post, processing, reset, errors: formErrors, setError, clearErrors } = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    roles: [] as string[],
    seccion_id: '',
    fecha_inicio_labores: '',
    fecha_fin_labores: '',
    estado_activo: true
  });

  // Función para limpiar y cerrar modal
  const handleCloseModal = () => {
    reset();
    clearErrors();
    if (onClose) {
      onClose();
    }
  };

  // Función para manejar cambios en inputs básicos
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    const validFields: Array<keyof typeof data> = ['name', 'email', 'password', 'password_confirmation', 'seccion_id', 'fecha_inicio_labores', 'fecha_fin_labores'];

    if (validFields.includes(name as keyof typeof data)) {
      setData(name as keyof typeof data, value);
      console.log('Form data updated - Current state:', { ...data, [name]: value });
    } else {
      console.error('Invalid field name:', name);
    }
  };

  // Función mejorada para manejar cambios en roles (radio buttons - selección única)
  const handleRoleChange = (roleName: string) => {
    const newRoles = [roleName];
    setData('roles', newRoles);

    // Sincronizar sección automáticamente según el rol
    let seccionId = '';
    if (roleName === 'BibliotecarioBachillerato') {
      seccionId = '2';
    } else if (roleName === 'BibliotecarioPrimaria') {
      seccionId = '1';
    } else if (roleName === 'Administrador') {
      seccionId = '';
    }

    setData('seccion_id', seccionId);
    console.log('Role selected:', newRoles, 'Section assigned:', seccionId);
  };

  // Definir los campos del formulario (información personal)
  const usuarioFields: FormField[] = [
    {
      name: 'name',
      label: 'Nombre Completo',
      type: 'text',
      placeholder: 'Ingrese el nombre completo',
      required: true,
      value: data.name,
      onChange: handleChange
    },
    {
      name: 'email',
      label: 'Correo Electrónico',
      type: 'email',
      placeholder: 'usuario@ejemplo.com',
      required: true,
      value: data.email,
      onChange: handleChange
    },
    {
      name: 'fecha_inicio_labores',
      label: 'Fecha de Inicio de Labores',
      type: 'date',
      required: true,
      value: data.fecha_inicio_labores,
      onChange: handleChange
    },
    {
      name: 'fecha_fin_labores',
      label: 'Fecha de Fin de Labores',
      type: 'date',
      required: false,
      value: data.fecha_fin_labores,
      onChange: handleChange
    }
  ];

  // Campos de contraseña para la columna derecha
  const passwordFields: FormField[] = [
    {
      name: 'password',
      label: 'Contraseña',
      type: 'password',
      placeholder: 'Mínimo 8 caracteres',
      required: true,
      value: data.password,
      onChange: handleChange
    },
    {
      name: 'password_confirmation',
      label: 'Confirmar Contraseña',
      type: 'password',
      placeholder: 'Repita la contraseña',
      required: true,
      value: data.password_confirmation,
      onChange: handleChange
    }
  ];

  const handleSubmit = () => {
    clearErrors();
    console.log('Submitting form with data:', data);
    post('/usuarios', {
      preserveScroll: true,
      onSuccess: (page: any) => {
        console.log('Success response:', page);
        const successMessage = page.props.flash?.success || 'Usuario creado exitosamente';
        onSuccess(successMessage);
        reset();
        clearErrors();
        handleCloseModal();
      },
      onError: (errors: Record<string, string>) => {
        console.log('Error response:', errors);

        if (errors.duplicate || errors.usuario_exists) {
          const duplicateMessage = errors.duplicate || errors.usuario_exists || 'Este usuario ya existe en el sistema';
          setTimeout(() => {
            reset();
            clearErrors();
            handleCloseModal();
            onError(duplicateMessage);
          }, 100);
          return;
        }

        const hasFieldErrors = Object.keys(errors).some(key => ['name', 'email', 'password', 'password_confirmation', 'roles'].includes(key));
        if (hasFieldErrors) {
          Object.keys(errors).forEach((key) => {
            if (['name', 'email', 'password', 'password_confirmation'].includes(key)) {
              setError(key as keyof typeof data, errors[key]);
            }
          });
        } else {
          const errorMessage = errors.error || 'Ha ocurrido un error al crear el usuario';
          onError(errorMessage);
        }
      },
      onFinish: () => {
        console.log('Request finished');
      }
    });
  };

  const modalFooter = (
    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
      <button
        type="button"
        onClick={handleCloseModal}
        className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-medium rounded-lg
          bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 
          border border-gray-300 dark:border-gray-600
          hover:bg-gray-50 dark:hover:bg-gray-600
          focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
      >
        Cancelar
      </button>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={processing}
        className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-medium rounded-lg
          bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white
          focus:outline-none focus:ring-2 focus:ring-blue-500
          disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200
          transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
      >
        {processing ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Guardando...
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <Plus className="w-4 h-4 mr-2" />
            Crear Usuario
          </div>
        )}
      </button>
    </div>
  );

  return (
    <>
      <UsuarioModal
        open={isOpen}
        onClose={handleCloseModal}
        title="Crear Nuevo Usuario"
        description="Complete la información para crear un nuevo usuario en el sistema"
        footer={modalFooter}
      >
        {/* Header con título mejorado */}
        <div className="mb-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <User className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Nuevo Usuario
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Configure la información del usuario y asigne los permisos correspondientes
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna 1 - Información Personal */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-5">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-3">
                  <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    Información Personal
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Datos básicos del usuario
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre Completo *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      name="name"
                      value={data.name}
                      onChange={handleChange}
                      placeholder="Ingrese el nombre completo"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                               transition-colors duration-200"
                    />
                  </div>
                  {formErrors.name && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Correo Electrónico *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      name="email"
                      value={data.email}
                      onChange={handleChange}
                      placeholder="usuario@ejemplo.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                               transition-colors duration-200"
                    />
                  </div>
                  {formErrors.email && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.email}</p>
                  )}
                </div>

                {/* Fechas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fecha de Inicio *
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="date"
                      name="fecha_inicio_labores"
                      value={data.fecha_inicio_labores}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                               transition-colors duration-200"
                    />
                  </div>
                  {formErrors.fecha_inicio_labores && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.fecha_inicio_labores}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fecha de Fin (Opcional)
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="date"
                      name="fecha_fin_labores"
                      value={data.fecha_fin_labores}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                               transition-colors duration-200"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Columna 2 - Credenciales */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-600 p-5">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mr-3">
                  <Lock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    Credenciales de Acceso
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Configure la contraseña
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contraseña *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      name="password"
                      value={data.password}
                      onChange={handleChange}
                      placeholder="Mínimo 8 caracteres"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm
                               focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                               transition-colors duration-200"
                    />
                  </div>
                  {formErrors.password && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirmar Contraseña *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      name="password_confirmation"
                      value={data.password_confirmation}
                      onChange={handleChange}
                      placeholder="Repita la contraseña"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm
                               focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                               transition-colors duration-200"
                    />
                  </div>
                  {formErrors.password_confirmation && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.password_confirmation}</p>
                  )}
                </div>

                {/* Indicador de seguridad */}
                <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                  <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Requisitos de seguridad:
                  </h4>
                  <div className="space-y-1">
                    <div className={`flex items-center text-xs ${data.password.length >= 8 ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full mr-2 ${data.password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      Mínimo 8 caracteres
                    </div>
                    <div className={`flex items-center text-xs ${data.password === data.password_confirmation && data.password ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full mr-2 ${data.password === data.password_confirmation && data.password ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      Las contraseñas coinciden
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Columna 3 - Roles */}
          <div className="lg:col-span-1">
            {roles.length > 0 && (
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-600 p-5 h-full">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mr-3">
                    <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                      Asignar Rol
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Seleccione un rol
                    </p>
                  </div>
                </div>

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {roles.map((role) => (
                    <label
                      key={role.id}
                      className={`relative flex items-center p-3 rounded-lg border cursor-pointer transition-all duration-200 group
                               ${(data.roles || []).includes(role.name)
                          ? 'border-green-300 dark:border-green-500 bg-green-50 dark:bg-green-900/30'
                          : 'border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
                        }`}
                    >
                      <input
                        type="radio"
                        name="userRole"
                        value={role.name}
                        checked={(data.roles || []).includes(role.name)}
                        onChange={() => handleRoleChange(role.name)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 dark:border-gray-600"
                      />
                      <div className="ml-3 flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize truncate">
                            {role.name}
                          </span>
                          {(data.roles || []).includes(role.name) && (
                            <div className="flex items-center ml-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            </div>
                          )}
                        </div>
                        {role.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                            {role.description}
                          </p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>

                {/* Indicadores de estado */}
                {formErrors.roles && (
                  <div className="mt-3 flex items-start p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="w-4 h-4 text-red-500 mr-2 flex-shrink-0 mt-0.5">⚠️</div>
                    <p className="text-xs text-red-600 dark:text-red-400">{formErrors.roles}</p>
                  </div>
                )}

                {(data.roles || []).length === 0 && (
                  <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-start">
                      <div className="w-4 h-4 text-yellow-500 mr-2 flex-shrink-0 mt-0.5">⚡</div>
                      <p className="text-xs text-yellow-700 dark:text-yellow-300">
                        Debe seleccionar un rol para el usuario
                      </p>
                    </div>
                  </div>
                )}

                {(data.roles || []).length > 0 && (
                  <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-start">
                      <div className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5">✅</div>
                      <p className="text-xs text-green-700 dark:text-green-300">
                        Rol "{data.roles[0]}" seleccionado correctamente
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </UsuarioModal>
    </>
  );
}