import React from 'react';
import { User, Mail, Calendar, Users, Shield } from 'lucide-react';
import UsuarioModal from '@/components/UsuarioModal';
import { type ShowProps } from './types';

interface ShowUsuarioProps extends ShowProps {
  onClose: () => void;
}

const ShowUsuario: React.FC<ShowUsuarioProps> = ({ 
  auth, 
  usuario, 
  onClose 
}) => {
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

  const modalFooter = (
    <button
      type="button"
      onClick={onClose}
      className="px-5 py-2.5 text-sm font-medium rounded-lg shadow-sm
        bg-blue-500 hover:bg-blue-600 text-white
        focus:outline-none focus:ring-2 focus:ring-blue-500
        transition-colors duration-200"
    >
      Cerrar
    </button>
  );

  return (
    <UsuarioModal
      open={true}
      onClose={onClose}
      title="Detalles del Usuario"
      description="Información completa del usuario"
      footer={modalFooter}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Columna izquierda */}
        <div className="space-y-4">
          {/* Información Personal */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
              Información Personal
            </h3>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    ID
                  </label>
                  <div className="p-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded text-sm font-semibold text-gray-900 dark:text-gray-100">
                    #{usuario.id}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Nombre
                  </label>
                  <div className="p-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {usuario.name}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 flex items-center">
                  <Mail className="h-3 w-3 mr-1" />
                  Correo Electrónico
                </label>
                <div className="p-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {usuario.email}
                </div>
              </div>
            </div>
          </div>

          {/* Roles y Permisos */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
              Roles y Permisos
            </h3>

            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Roles Asignados
              </label>
              <div className="p-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded">
                {usuario.roles && usuario.roles.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {usuario.roles.map((role) => (
                      <span
                        key={role.id}
                        className="inline-flex items-center px-2 py-1 rounded text-xs font-medium 
                                 bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300
                                 border border-blue-200 dark:border-blue-700"
                      >
                        <Users className="h-3 w-3 mr-1" />
                        {role.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <Users className="h-3 w-3 mr-2" />
                    <p className="text-xs">No tiene roles asignados</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha */}
        <div className="space-y-4">
          {/* Información de Registro */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
              Información de Registro
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Fecha de Creación
                </label>
                <div className="p-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {formatDate(usuario.created_at)}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Última Actualización
                </label>
                <div className="p-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {formatDate(usuario.updated_at)}
                </div>
              </div>
            </div>
          </div>

          {/* Estado de la Cuenta */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
              Estado de la Cuenta
            </h3>

            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
              <div className="flex items-start">
                <Shield className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-green-800 dark:text-green-200">
                    Cuenta Activa
                  </h4>
                  <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                    La cuenta está activa y operativa. El usuario puede acceder al sistema según los permisos asignados a sus roles.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UsuarioModal>
  );
};

export default ShowUsuario;