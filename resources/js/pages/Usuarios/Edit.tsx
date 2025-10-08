import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { Save, User, Mail, Lock, Calendar, Shield, ArrowLeft, CheckCircle, X, Eye, EyeOff } from 'lucide-react';
import AppLayout from '../../layouts/app-layout';
import { type BreadcrumbItem, type Usuario } from './types';

type EditUsuarioPageProps = {
  auth: any;
  usuario: Usuario;
  secciones?: any[];
  roles?: any[];
  errors?: Record<string, string>;
};

export default function Edit({
  auth,
  usuario,
  secciones = [],
  roles = [],
  errors = {}
}: EditUsuarioPageProps) {
  const [updatePassword, setUpdatePassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Usuarios', href: '/usuarios' },
    { title: 'Editar Usuario', href: `/usuarios/${usuario.id}/edit` },
  ];

  const { data, setData, put, processing, errors: formErrors, setError, clearErrors } = useForm({
    name: usuario.name || '',
    email: usuario.email || '',
    password: '',
    password_confirmation: '',
    roles: usuario.roles?.map((role: any) => role.name) || [] as string[],
    seccion_id: usuario.seccion_id?.toString() || '',
    fecha_inicio_labores: usuario.fecha_inicio_labores || '',
    fecha_fin_labores: usuario.fecha_fin_labores || '',
    estado_activo: usuario.estado_activo ?? true
  });

  // Función para manejar cambios en inputs básicos
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const validFields: Array<keyof typeof data> = ['name', 'email', 'password', 'password_confirmation', 'seccion_id', 'fecha_inicio_labores', 'fecha_fin_labores'];

    if (validFields.includes(name as keyof typeof data)) {
      setData(name as keyof typeof data, value);
    }
  };

  // Función para manejar cambios en roles
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
  };

  // Función para manejar el checkbox de actualizar contraseña
  const handleUpdatePasswordChange = (checked: boolean) => {
    setUpdatePassword(checked);
    if (!checked) {
      setData('password', '');
      setData('password_confirmation', '');
      setShowPassword(false);
      setShowPasswordConfirmation(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    // Preparar datos para enviar
    const dataToSend = {
      name: data.name,
      email: data.email,
      roles: data.roles,
      ...(updatePassword && {
        password: data.password,
        password_confirmation: data.password_confirmation
      })
    };

    put(`/usuarios/${usuario.id}`, {
      preserveScroll: true,
      onSuccess: () => {
        // Agregar delay para que el usuario pueda ver la notificación
        setTimeout(() => {
          router.visit('/usuarios');
        }, 2500); // 2.5 segundos de delay
      },
      onError: (errors: Record<string, string>) => {
        Object.keys(errors).forEach((key) => {
          if (['name', 'email', 'password', 'password_confirmation'].includes(key)) {
            setError(key as keyof typeof data, errors[key]);
          }
        });
      }
    });
  };

  const handleCancel = () => {
    router.visit('/usuarios');
  };

  // Clases CSS reutilizables para consistencia
  const inputClasses = "block w-full px-3 py-2 text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white";

  // Función helper para renderizar campos del formulario con consistencia
  const renderFormField = (id: string, label: string, required: boolean = false, children: React.ReactNode) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {formErrors[id as keyof typeof formErrors] && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors[id as keyof typeof formErrors]}</p>
      )}
    </div>
  );

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Editar Usuario - ${usuario.name}`} />
      
      <div className="py-6 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 
                          hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver a Usuarios
              </button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Editar Usuario
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Modificar información de {usuario.name}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Formulario con layout en columnas verticales */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Grid de 3 columnas para las secciones */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Información Personal */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg mb-6">
                  <h2 className="text-base font-semibold text-blue-800 dark:text-blue-300 mb-1 flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Información Personal
                  </h2>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    Datos básicos del usuario
                  </p>
                </div>

                <div className="space-y-6">
                  {renderFormField('name', 'Nombre Completo', true,
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={data.name}
                      onChange={handleChange}
                      placeholder="Ingrese el nombre completo"
                      className={inputClasses}
                    />
                  )}

                  {renderFormField('email', 'Correo Electrónico', true,
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={data.email}
                      onChange={handleChange}
                      placeholder="usuario@ejemplo.com"
                      className={inputClasses}
                    />
                  )}

                  {renderFormField('fecha_inicio_labores', 'Fecha de Inicio', true,
                    <input
                      type="date"
                      id="fecha_inicio_labores"
                      name="fecha_inicio_labores"
                      value={data.fecha_inicio_labores}
                      onChange={handleChange}
                      className={inputClasses}
                    />
                  )}

                  {renderFormField('fecha_fin_labores', 'Fecha de Fin (Opcional)', false,
                    <input
                      type="date"
                      id="fecha_fin_labores"
                      name="fecha_fin_labores"
                      value={data.fecha_fin_labores}
                      onChange={handleChange}
                      className={inputClasses}
                    />
                  )}
                </div>
              </div>

              {/* Contraseña */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg mb-6">
                  <h2 className="text-base font-semibold text-purple-800 dark:text-purple-300 mb-1 flex items-center">
                    <Lock className="w-4 h-4 mr-2" />
                    Contraseña
                  </h2>
                  <p className="text-xs text-purple-600 dark:text-purple-400">
                    Opcional: actualizar contraseña
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Checkbox para actualizar contraseña */}
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        id="updatePassword"
                        checked={updatePassword}
                        onChange={(e) => handleUpdatePasswordChange(e.target.checked)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Actualizar contraseña
                      </span>
                    </label>
                  </div>

                  {updatePassword ? (
                    <>
                      {renderFormField('password', 'Nueva Contraseña', true,
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            name="password"
                            value={data.password}
                            onChange={handleChange}
                            placeholder="Mínimo 8 caracteres"
                            className={inputClasses + " pr-10"}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      )}

                      {renderFormField('password_confirmation', 'Confirmar Nueva Contraseña', true,
                        <div className="relative">
                          <input
                            type={showPasswordConfirmation ? "text" : "password"}
                            id="password_confirmation"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            onChange={handleChange}
                            placeholder="Repita la nueva contraseña"
                            className={inputClasses + " pr-10"}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            {showPasswordConfirmation ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      )}

                      {/* Indicador de seguridad */}
                      <div className="bg-gradient-to-r from-gray-50 to-indigo-50 dark:from-gray-900/20 dark:to-indigo-900/20 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <div className="flex items-center justify-center w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-lg">
                              <Lock className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                            </div>
                          </div>
                          <div className="ml-3">
                            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
                              Requisitos de Seguridad
                            </h4>
                            <div className="text-gray-700 dark:text-gray-300 space-y-1">
                              <div className="space-y-2 text-xs">
                                <div className="flex items-center gap-2">
                                  <span className={`w-1.5 h-1.5 rounded-full ${data.password.length >= 8 ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                  <span className={data.password.length >= 8 ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}>
                                    Mínimo 8 caracteres
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`w-1.5 h-1.5 rounded-full ${data.password === data.password_confirmation && data.password ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                  <span className={data.password === data.password_confirmation && data.password ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}>
                                    Las contraseñas coinciden
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          La contraseña actual se mantendrá sin cambios
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Asignar Rol */}
              {roles.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg mb-6">
                    <h2 className="text-base font-semibold text-green-800 dark:text-green-300 mb-1 flex items-center">
                      <Shield className="w-4 h-4 mr-2" />
                      Asignar Rol
                    </h2>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      Seleccione un rol
                    </p>
                  </div>

                  <div className="space-y-4">
                    {roles.map((role) => (
                      <label
                        key={role.id}
                        className={`relative flex items-start p-4 rounded-lg border cursor-pointer transition-all duration-200
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
                          className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 dark:border-gray-600"
                        />
                        <div className="ml-3 flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                              {role.name}
                            </span>
                            {(data.roles || []).includes(role.name) && (
                              <CheckCircle className="w-4 h-4 text-green-500 ml-2" />
                            )}
                          </div>
                          {role.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {role.description}
                            </p>
                          )}
                        </div>
                      </label>
                    ))}

                    {/* Mensaje de validación si no se selecciona rol */}
                    {!data.roles || data.roles.length === 0 ? (
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                        <div className="flex items-start">
                          <div className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0 mt-0.5">⚡</div>
                          <p className="text-sm text-blue-600 dark:text-blue-400">
                            Debe seleccionar un rol para el usuario
                          </p>
                        </div>
                      </div>
                    ) : null}

                    {/* Validación de errores del servidor */}
                    {formErrors.roles && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                        <div className="flex items-start">
                          <div className="w-4 h-4 text-red-500 mr-2 flex-shrink-0 mt-0.5">⚠️</div>
                          <p className="text-sm text-red-600 dark:text-red-400">{formErrors.roles}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer con botones */}
            <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm"
              >
                <X className="w-4 h-4" />
                Cancelar
              </button>
              
              <button
                type="submit"
                disabled={processing}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Actualizando...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Save className="w-4 h-4 mr-2" />
                    Actualizar Usuario
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}