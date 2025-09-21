import React from 'react';
import { Head, router } from '@inertiajs/react';
import { User, Mail, Calendar, Users, Shield, Building, Clock, CheckCircle, XCircle, ArrowLeft, Edit } from 'lucide-react';
import AppLayout from '../../layouts/app-layout';
import { type BreadcrumbItem, type Usuario } from './types';

type ShowUsuarioPageProps = {
  auth: any;
  usuario: Usuario & {
    created_at?: string;
    updated_at?: string;
  };
};

export default function Show({ 
  auth, 
  usuario 
}: ShowUsuarioPageProps) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Usuarios', href: '/usuarios' },
    { title: 'Detalles del Usuario', href: `/usuarios/${usuario.id}` },
  ];

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleBack = () => {
    router.visit('/usuarios');
  };

  const handleEdit = () => {
    router.visit(`/usuarios/${usuario.id}/edit`);
  };

  // Función helper para renderizar campos de información
  const renderInfoField = (label: string, value: string, icon: React.ReactNode) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-md">
        {icon}
        <span className="text-sm text-gray-900 dark:text-gray-100 ml-2">
          {value}
        </span>
      </div>
    </div>
  );

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Usuario - ${usuario.name}`} />
      
      <div className="py-6 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 
                          hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver a Usuarios
              </button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {usuario.name}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      Información completa del usuario
                    </p>
                  </div>
                </div>
                
                {/* Botón Editar */}
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 
                            text-white rounded-lg transition-colors text-sm font-medium"
                >
                  <Edit className="w-4 h-4" />
                  Editar Usuario
                </button>
              </div>
            </div>
          </div>

          {/* Contenido en tres columnas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Columna 1 - Información Personal */}
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
                {renderInfoField(
                  'Nombre Completo', 
                  usuario.name,
                  <User className="w-4 h-4 text-gray-400" />
                )}

                {renderInfoField(
                  'Correo Electrónico', 
                  usuario.email,
                  <Mail className="w-4 h-4 text-gray-400" />
                )}

                {renderInfoField(
                  'Sección Asignada', 
                  usuario.seccion?.nombre || 'No asignada',
                  <Building className="w-4 h-4 text-gray-400" />
                )}

                {renderInfoField(
                  'Fecha de Inicio', 
                  formatDate(usuario.fecha_inicio_labores),
                  <Calendar className="w-4 h-4 text-gray-400" />
                )}

                {renderInfoField(
                  'Fecha de Fin', 
                  formatDate(usuario.fecha_fin_labores),
                  <Calendar className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </div>

            {/* Columna 2 - Roles y Estado */}
            <div className="space-y-6">
              {/* Roles y Permisos */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg mb-6">
                  <h2 className="text-base font-semibold text-green-800 dark:text-green-300 mb-1 flex items-center">
                    <Shield className="w-4 h-4 mr-2" />
                    Roles y Permisos
                  </h2>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Roles asignados al usuario
                  </p>
                </div>

                <div className="space-y-4">
                  {usuario.roles && usuario.roles.length > 0 ? (
                    usuario.roles.map((role) => (
                      <div key={role.id} className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center mr-3">
                            <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-green-800 dark:text-green-200 capitalize">
                              {role.name}
                            </span>
                            <p className="text-xs text-green-600 dark:text-green-300 mt-1">
                              Permisos de {role.name.toLowerCase()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          No tiene roles asignados
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Estado de la Cuenta */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg mb-6">
                  <h2 className="text-base font-semibold text-purple-800 dark:text-purple-300 mb-1 flex items-center">
                    {usuario.estado_activo ? (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    ) : (
                      <XCircle className="w-4 h-4 mr-2" />
                    )}
                    Estado de la Cuenta
                  </h2>
                  <p className="text-xs text-purple-600 dark:text-purple-400">
                    Estado actual de la cuenta
                  </p>
                </div>

                <div className={`p-4 border rounded-lg ${
                  usuario.estado_activo 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                }`}>
                  <div className="flex items-start">
                    {usuario.estado_activo ? (
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 mr-3 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                    )}
                    <div>
                      <h4 className={`text-base font-semibold ${
                        usuario.estado_activo 
                          ? 'text-green-800 dark:text-green-200'
                          : 'text-red-800 dark:text-red-200'
                      }`}>
                        {usuario.estado_activo ? 'Cuenta Activa' : 'Cuenta Inactiva'}
                      </h4>
                      <p className={`text-sm mt-2 ${
                        usuario.estado_activo 
                          ? 'text-green-700 dark:text-green-300'
                          : 'text-red-700 dark:text-red-300'
                      }`}>
                        {usuario.estado_activo 
                          ? 'La cuenta está activa y operativa. El usuario puede acceder al sistema según los permisos asignados a sus roles.'
                          : 'La cuenta está inactiva. El usuario no puede acceder al sistema hasta que sea reactivada por un administrador.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna 3 - Información del Sistema */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg mb-6">
                <h2 className="text-base font-semibold text-indigo-800 dark:text-indigo-300 mb-1 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Información del Sistema
                </h2>
                <p className="text-xs text-indigo-600 dark:text-indigo-400">
                  Datos técnicos y fechas
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ID de Usuario
                  </label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-md">
                    <span className="text-sm font-mono text-gray-900 dark:text-gray-100">
                      #{usuario.id}
                    </span>
                  </div>
                </div>

                {usuario.created_at && renderInfoField(
                  'Fecha de Registro',
                  formatDateTime(usuario.created_at),
                  <Calendar className="w-4 h-4 text-gray-400" />
                )}

                {usuario.updated_at && renderInfoField(
                  'Última Actualización',
                  formatDateTime(usuario.updated_at),
                  <Calendar className="w-4 h-4 text-gray-400" />
                )}

                {/* Información adicional del sistema */}
                <div className="mt-8 bg-gradient-to-r from-gray-50 to-indigo-50 dark:from-gray-900/20 dark:to-indigo-900/20 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <Clock className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
                        Información del Sistema
                      </h4>
                      <div className="text-gray-700 dark:text-gray-300 space-y-1">
                        <div className="text-xs">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            <span className="text-blue-600 dark:text-blue-400">
                              Usuario registrado en el sistema
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${usuario.estado_activo ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            <span className={usuario.estado_activo ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                              Estado: {usuario.estado_activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}