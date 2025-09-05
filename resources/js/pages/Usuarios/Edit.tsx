import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { X, User, Mail, Lock, Users, Building } from 'lucide-react';
import { type EditProps, type UsuarioFormData } from './types';

interface EditUsuarioProps extends EditProps {
  onClose: () => void;
}

const EditUsuario: React.FC<EditUsuarioProps> = ({ 
  auth, 
  usuario, 
  secciones = [], 
  roles = [], 
  errors = {}, 
  onClose 
}) => {
  const [formData, setFormData] = useState<UsuarioFormData>({
    name: usuario.name || '',
    email: usuario.email || '',
    password: '',
    password_confirmation: '',
    roles: usuario.roles?.map(role => role.name) || []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatePassword, setUpdatePassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (roleName: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      roles: checked 
        ? [...(prev.roles || []), roleName]
        : (prev.roles || []).filter(name => name !== roleName)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Preparar datos para enviar
    const dataToSend = {
      name: formData.name,
      email: formData.email,
      roles: formData.roles,
      ...(updatePassword && {
        password: formData.password,
        password_confirmation: formData.password_confirmation
      })
    };

    router.put(`/usuarios/${usuario.id}`, dataToSend, {
      onSuccess: () => {
        onClose();
      },
      onError: () => {
        setIsSubmitting(false);
      },
      onFinish: () => {
        setIsSubmitting(false);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all dark:bg-gray-800 sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Editar Usuario: {usuario.name}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-4">
            <div className="space-y-4">
              {/* Nombre */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nombre Completo *
                </label>
                <div className="mt-1 relative">
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ingrese el nombre completo"
                    required
                  />
                  <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Correo Electrónico *
                </label>
                <div className="mt-1 relative">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="usuario@ejemplo.com"
                    required
                  />
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                )}
              </div>

              {/* Checkbox para actualizar contraseña */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="updatePassword"
                  checked={updatePassword}
                  onChange={(e) => {
                    setUpdatePassword(e.target.checked);
                    if (!e.target.checked) {
                      setFormData(prev => ({
                        ...prev,
                        password: '',
                        password_confirmation: ''
                      }));
                    }
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                />
                <label htmlFor="updatePassword" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Actualizar contraseña
                </label>
              </div>

              {/* Contraseña - Solo si se marca el checkbox */}
              {updatePassword && (
                <>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Nueva Contraseña *
                    </label>
                    <div className="mt-1 relative">
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                          errors.password ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Mínimo 8 caracteres"
                        minLength={8}
                        required={updatePassword}
                      />
                      <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                    )}
                  </div>

                  {/* Confirmar Contraseña */}
                  <div>
                    <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Confirmar Nueva Contraseña *
                    </label>
                    <div className="mt-1 relative">
                      <input
                        type="password"
                        id="password_confirmation"
                        name="password_confirmation"
                        value={formData.password_confirmation}
                        onChange={handleInputChange}
                        className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                          errors.password_confirmation ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Repita la nueva contraseña"
                        required={updatePassword}
                      />
                      <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                    {errors.password_confirmation && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password_confirmation}</p>
                    )}
                  </div>
                </>
              )}



              {/* Roles */}
              {roles.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Roles *
                  </label>
                  <div className="space-y-2">
                    {roles.map((role) => (
                      <label key={role.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={(formData.roles || []).includes(role.name)}
                          onChange={(e) => handleRoleChange(role.name, e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">
                          {role.name}
                        </span>
                      </label>
                    ))}
                  </div>
                  {errors.roles && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.roles}</p>
                  )}
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Actualizando...' : 'Actualizar Usuario'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditUsuario;