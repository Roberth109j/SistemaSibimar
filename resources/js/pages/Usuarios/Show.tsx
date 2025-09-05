import React from 'react';
import { X, User, Mail, Calendar, Users, Shield } from 'lucide-react';
import { type ShowProps } from './types';

interface ShowUsuarioProps extends ShowProps {
  onClose: () => void;
}

const ShowUsuario: React.FC<ShowUsuarioProps> = ({ 
  auth, 
  usuario, 
  onClose 
}) => {
  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'primaria':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'bachillerato':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
        <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all dark:bg-gray-800 sm:my-8 sm:w-full sm:max-w-2xl sm:align-middle">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Detalles del Usuario
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            <div className="space-y-6">
              {/* Información Personal */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Información Personal
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      ID
                    </label>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      #{usuario.id}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nombre Completo
                    </label>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {usuario.name}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      Correo Electrónico
                    </label>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {usuario.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Roles y Permisos */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Roles y Permisos
                </h4>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Roles Asignados
                  </label>
                  {usuario.roles && usuario.roles.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {usuario.roles.map((role) => (
                        <span
                          key={role.id}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            getRoleBadgeColor(role.name)
                          }`}
                        >
                          <Users className="h-3 w-3 mr-1" />
                          {role.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No tiene roles asignados
                    </p>
                  )}
                </div>
              </div>



              {/* Información de Registro */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Información de Registro
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Fecha de Creación
                    </label>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {formatDate(usuario.created_at)}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Última Actualización
                    </label>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {formatDate(usuario.updated_at)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Estadísticas adicionales */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  Información Adicional
                </h4>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <h5 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        Estado de la Cuenta
                      </h5>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        La cuenta está activa y operativa. El usuario puede acceder al sistema según los permisos asignados a sus roles.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowUsuario;