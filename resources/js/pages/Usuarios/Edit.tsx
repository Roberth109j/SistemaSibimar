import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { User } from 'lucide-react';
import UsuarioModal from '@/components/UsuarioModal';
import Form, { FormField } from '@/components/Form';
import { type EditProps, type UsuarioFormData } from './types';

type EditModalProps = {
  auth: any;
  usuario: any;
  secciones?: any[];
  roles?: any[];
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  errors?: Record<string, string>;
  open?: boolean;
  onClose?: () => void;
};

export default function EditUsuario({
  auth,
  usuario,
  secciones = [],
  roles = [],
  onSuccess,
  onError,
  errors = {},
  open = false,
  onClose
}: EditModalProps) {
  const isOpen = open;
  const [updatePassword, setUpdatePassword] = useState(false);

  const { data, setData, put, processing, reset, errors: formErrors, setError, clearErrors } = useForm({
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

  // Función para limpiar y cerrar modal
  const handleCloseModal = () => {
    reset(); // Limpiar los datos del formulario
    clearErrors(); // Limpiar errores
    setUpdatePassword(false); // Reset password checkbox
    if (onClose) {
      onClose();
    }
  };

  // Función para manejar cambios en inputs básicos
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked = false } = e.target as HTMLInputElement;
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
    // Solo permitir un rol seleccionado
    const newRoles = [roleName];
    setData('roles', newRoles);
    
    // Sincronizar sección automáticamente según el rol
    let seccionId = '';
    if (roleName === 'BibliotecarioBachillerato') {
      seccionId = '2'; // bachillerato
    } else if (roleName === 'BibliotecarioPrimaria') {
      seccionId = '1'; // primaria
    } else if (roleName === 'Administrador') {
      seccionId = ''; // NULL para administrador
    }
    
    setData('seccion_id', seccionId);
    console.log('Role selected:', newRoles, 'Section assigned:', seccionId);
  };

  // Función para manejar el checkbox de actualizar contraseña
  const handleUpdatePasswordChange = (checked: boolean) => {
    setUpdatePassword(checked);
    if (!checked) {
      setData('password', '');
      setData('password_confirmation', '');
    }
  };

  // Definir los campos del formulario - solo campos básicos
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

  // Campos de contraseña por separado
  const passwordFields: FormField[] = [
    {
      name: 'password',
      label: 'Nueva Contraseña',
      type: 'password',
      placeholder: 'Mínimo 8 caracteres',
      required: updatePassword,
      value: data.password,
      onChange: handleChange
    },
    {
      name: 'password_confirmation',
      label: 'Confirmar Nueva Contraseña',
      type: 'password',
      placeholder: 'Repita la nueva contraseña',
      required: updatePassword,
      value: data.password_confirmation,
      onChange: handleChange
    }
  ];

  const handleSubmit = () => {
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

    console.log('Submitting form with data:', dataToSend);

    put(`/usuarios/${usuario.id}`, {
      preserveScroll: true,
      onSuccess: (page: any) => {
        console.log('Success response:', page);
        const successMessage = page.props.flash?.success || 'Usuario actualizado exitosamente';
        onSuccess(successMessage);
        reset();
        clearErrors();
        setUpdatePassword(false);
        handleCloseModal();
      },
      onError: (errors: Record<string, string>) => {
        console.log('Error response:', errors);

        // Verificar si hay errores específicos de duplicado
        if (errors.duplicate || errors.usuario_exists) {
          const duplicateMessage = errors.duplicate || errors.usuario_exists || 'Este usuario ya existe en el sistema';
          // Limpiar formulario y cerrar modal incluso con error de duplicado
          setTimeout(() => {
            reset();
            clearErrors();
            setUpdatePassword(false);
            handleCloseModal();
            onError(duplicateMessage);
          }, 100);
          return;
        }

        // Verificar si hay errores de validación de campos
        const hasFieldErrors = Object.keys(errors).some(key => ['name', 'email', 'password', 'password_confirmation', 'roles'].includes(key));
        if (hasFieldErrors) {
          Object.keys(errors).forEach((key) => {
            if (['name', 'email', 'password', 'password_confirmation'].includes(key)) {
              setError(key as keyof typeof data, errors[key]);
            }
          });
        } else {
          // Error genérico
          const errorMessage = errors.error || 'Ha ocurrido un error al actualizar el usuario';
          onError(errorMessage);
        }
      },
      onFinish: () => {
        console.log('Request finished');
      }
    });
  };

  const modalFooter = (
    <>
      <button
        type="button"
        onClick={handleCloseModal}
        className="px-5 py-2.5 text-sm font-medium rounded-lg shadow-sm
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
        className="px-5 py-2.5 text-sm font-medium rounded-lg shadow-sm
          bg-blue-500 hover:bg-blue-600 text-white
          focus:outline-none focus:ring-2 focus:ring-blue-500
          disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {processing ? 'Actualizando...' : 'Actualizar'}
      </button>
    </>
  );

  return (
    <>
      <UsuarioModal
        open={isOpen}
        onClose={handleCloseModal}
        title="Editar Usuario"
        description={`Modificar información de ${usuario.name}`}
        footer={modalFooter}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-h-[70vh] overflow-y-auto">
          {/* Columna izquierda - Formulario principal */}
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                  Información Personal
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Datos básicos del usuario
                </p>
              </div>

              <Form
                initialData={data}
                fields={usuarioFields}
                errors={formErrors}
                submitUrl={`/usuarios/${usuario.id}`}
                method="put"
                onCancel={handleCloseModal}
                onSuccess={handleSubmit}
                submitButtonText="Actualizar"
                isEditing={true}
                accentColor="blue"
                showButtons={false}
                id="edit-usuario-form"
                processing={processing}
              />
            </div>


          </div>

          {/* Columna derecha - Sección de roles */}
          <div className="space-y-4 sm:space-y-6">
            {roles.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                    Asignar Rol
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Seleccione un rol para el usuario
                  </p>
                </div>

                <div className="space-y-3 max-h-[350px] overflow-y-auto">
                  {roles.map((role) => (
                    <label
                      key={role.id}
                      className="relative flex items-center p-4 rounded-lg border border-gray-200 dark:border-gray-600 
                               hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-blue-300 dark:hover:border-blue-500
                               transition-all duration-200 cursor-pointer group"
                    >
                      <input
                        type="radio"
                        name="userRole"
                        value={role.name}
                        checked={(data.roles || []).includes(role.name)}
                        onChange={() => handleRoleChange(role.name)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600
                                 dark:bg-gray-700 transition-colors duration-200"
                      />
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                            {role.name}
                          </span>
                          {(data.roles || []).includes(role.name) && (
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                Seleccionado
                              </span>
                            </div>
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
                </div>

                {/* Mostrar error si existe */}
                {formErrors.roles && (
                  <div className="mt-4 flex items-center p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-red-600 dark:text-red-400">{formErrors.roles}</p>
                  </div>
                )}

                {/* Indicador de selección */}
                {(data.roles || []).length === 0 && (
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        Debe seleccionar un rol para el usuario
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Sección de contraseña */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <div className="mb-3">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                  Contraseña
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  Opcional: actualizar contraseña del usuario
                </p>
              </div>

              {/* Checkbox para actualizar contraseña */}
              <div className="mb-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="updatePassword"
                    checked={updatePassword}
                    onChange={(e) => handleUpdatePasswordChange(e.target.checked)}
                    className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 transition-all"
                  />
                  <label htmlFor="updatePassword" className="ml-2 sm:ml-3 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                    Actualizar contraseña
                  </label>
                </div>
              </div>

              {/* Campos de contraseña - Solo si se marca el checkbox */}
              {updatePassword ? (
                <div className="space-y-2 sm:space-y-3 max-h-[120px] sm:max-h-[150px] overflow-y-auto">
                  <Form
                    initialData={data}
                    fields={passwordFields}
                    errors={formErrors}
                    submitUrl={`/usuarios/${usuario.id}`}
                    method="put"
                    onCancel={handleCloseModal}
                    onSuccess={handleSubmit}
                    submitButtonText="Actualizar"
                    isEditing={true}
                    accentColor="blue"
                    showButtons={false}
                    id="edit-usuario-password-form"
                    processing={processing}
                  />
                </div>
              ) : (
                <div className="p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center">
                    <User className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 mr-2 flex-shrink-0" />
                    <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 leading-tight">
                      La contraseña actual se mantendrá sin cambios
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </UsuarioModal>
    </>
  );
}