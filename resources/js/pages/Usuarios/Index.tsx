import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Search, CheckCircle, AlertCircle, X, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Plus, Edit, Eye, Trash2, UserPlus } from 'lucide-react';
import AppLayout from '../../layouts/app-layout';
import { type BreadcrumbItem, type IndexProps, type Usuario } from './types';
import CreateUsuario from './Create';
import EditUsuario from '@/pages/Usuarios/Edit';
import ShowUsuario from './Show';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Usuarios', href: '/usuarios' },
];

function AlertNotification({
  type,
  message,
  className = '',
  autoClose = true,
  duration = 6000,
}: {
  type: 'success' | 'error';
  message: string;
  className?: string;
  autoClose?: boolean;
  duration?: number;
}) {
  const [isVisible, setIsVisible] = useState(true);
  const [animateOut, setAnimateOut] = useState(false);

  useEffect(() => {
    if (autoClose && message) {
      const alertDuration = type === 'error' ? 7000 : duration;
      const timer = setTimeout(() => {
        setAnimateOut(true);
        const hideTimer = setTimeout(() => {
          setIsVisible(false);
        }, 500);
        return () => clearTimeout(hideTimer);
      }, alertDuration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, message, type]);

  if (!isVisible || !message) return null;

  const colors = {
    success: {
      light: { bg: 'bg-green-100', border: 'border-green-500', text: 'text-green-800', icon: 'text-green-500' },
      dark: { bg: 'dark:bg-green-800/40', border: 'dark:border-green-500', text: 'dark:text-green-100', icon: 'dark:text-green-400' }
    },
    error: {
      light: { bg: 'bg-red-100', border: 'border-red-500', text: 'text-red-800', icon: 'text-red-500' },
      dark: { bg: 'dark:bg-red-800/40', border: 'dark:border-red-500', text: 'dark:text-red-100', icon: 'dark:text-red-400' }
    }
  };

  const Icon = type === 'success' ? CheckCircle : AlertCircle;

  return (
    <div className={`fixed top-6 right-6 z-50 ${animateOut ? 'opacity-0 translate-x-20' : 'opacity-100 translate-x-0'} transition-all duration-500 ease-in-out transform ${className}`}>
      <div
        className={`max-w-md rounded-lg shadow-xl border-l-4 
                    ${colors[type].light.border} ${colors[type].dark.border}
                    ${colors[type].light.bg} ${colors[type].dark.bg} 
                    flex items-start p-5 transition-all duration-300 animate-slide-in-right`}
      >
        <Icon className={`h-6 w-6 mt-0.5 mr-4 flex-shrink-0 ${colors[type].light.icon} ${colors[type].dark.icon}`} />
        <div className="flex-grow">
          <p className={`text-base font-semibold ${colors[type].light.text} ${colors[type].dark.text}`}>
            {message}
          </p>
        </div>
        <button
          onClick={() => setAnimateOut(true)}
          className="ml-4 flex-shrink-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

const Index = ({ 
  auth, 
  usuarios, 
  secciones = [],
  roles = [],
  flash, 
  errors = {},
  pagination,
  sort_order = 'asc',
  search = '',
  start_number = 0
}: IndexProps) => {
  const page = usePage();
  const [searchTerm, setSearchTerm] = useState(search);

  const [alerts, setAlerts] = useState<{
    success: string | null;
    error: string | null;
  }>({ success: null, error: null });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showShowModal, setShowShowModal] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);

  // Verificar si el usuario es administrador
  const isAdmin = auth.user?.roles?.some((role: any) => role.name === 'Administrador') || false;

  // Si no es admin, redirigir o mostrar mensaje de acceso denegado
  if (!isAdmin) {
    return (
      <AppLayout
        title="Acceso Denegado"
        renderHeader={() => (
          <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
            Acceso Denegado
          </h2>
        )}
      >
        <Head title="Acceso Denegado" />
        <div className="py-12">
          <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
              <div className="p-6 text-gray-900 dark:text-gray-100">
                <div className="text-center">
                  <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Acceso Denegado
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    No tienes permisos para acceder a la administración de usuarios.
                    Esta sección está restringida solo para administradores.
                  </p>
                  <Link
                    href="/dashboard"
                    className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                  >
                    Volver al Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  useEffect(() => {
    if (flash?.success) {
      setAlerts(prev => ({ ...prev, success: flash.success || null }));
    }
    if (flash?.error) {
      setAlerts(prev => ({ ...prev, error: flash.error || null }));
    }
  }, [flash]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get('/usuarios', {
      search: searchTerm,
      sort_order,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleSort = () => {
    const newSortOrder = sort_order === 'asc' ? 'desc' : 'asc';
    router.get('/usuarios', {
      search: searchTerm,
      sort_order: newSortOrder,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleDelete = (usuario: Usuario) => {
    if (confirm(`¿Estás seguro de que deseas eliminar al usuario "${usuario.name}"?`)) {
      router.delete(`/usuarios/${usuario.id}`, {
        onSuccess: () => {
          setAlerts(prev => ({ ...prev, success: 'Usuario eliminado exitosamente' }));
        },
        onError: () => {
          setAlerts(prev => ({ ...prev, error: 'Error al eliminar el usuario' }));
        }
      });
    }
  };

  const handleCreate = () => {
    setSelectedUsuario(null);
    setShowCreateModal(true);
  };

  const handleEdit = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setShowEditModal(true);
  };

  const handleShow = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setShowShowModal(true);
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowShowModal(false);
    setSelectedUsuario(null);
  };

  const usuariosData = Array.isArray(usuarios) ? usuarios : usuarios.data || [];
  const totalUsuarios = 'total' in usuarios ? usuarios.total : usuariosData.length;
  const currentPage = 'current_page' in usuarios ? usuarios.current_page : 1;
  const lastPage = 'last_page' in usuarios ? usuarios.last_page : 1;
  const fromRecord = 'from' in usuarios ? usuarios.from : start_number + 1;
  const toRecord = 'to' in usuarios ? usuarios.to : start_number + usuariosData.length;

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

  return (
    <AppLayout
      title="Usuarios"
      renderHeader={() => (
        <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
          Administración de Usuarios
        </h2>
      )}
      breadcrumbs={breadcrumbs}
    >
      <Head title="Usuarios" />

      {/* Alertas */}
      {alerts.success && (
        <AlertNotification
          type="success"
          message={alerts.success}
          autoClose={true}
          duration={6000}
        />
      )}
      {alerts.error && (
        <AlertNotification
          type="error"
          message={alerts.error}
          autoClose={true}
          duration={7000}
        />
      )}

      <div className="py-12">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              {/* Header con búsqueda y botón crear */}
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Lista de Usuarios
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    ({totalUsuarios} {totalUsuarios === 1 ? 'usuario' : 'usuarios'})
                  </span>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Buscador */}
                  <form onSubmit={handleSearch} className="flex">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Buscar usuarios..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      />
                      <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    >
                      Buscar
                    </button>
                  </form>

                  {/* Botón crear */}
                  <button
                    onClick={handleCreate}
                    className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700 focus:bg-green-700 active:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition ease-in-out duration-150"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Crear Usuario
                  </button>
                </div>
              </div>

              {/* Tabla */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                        #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                        <button
                          onClick={handleSort}
                          className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-100"
                        >
                          <span>Nombre</span>
                          {sort_order === 'asc' ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                        Roles
                      </th>

                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                        Fecha Creación
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {usuariosData.length > 0 ? (
                      usuariosData.map((usuario, index) => (
                        <tr key={usuario.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {(fromRecord || 1) + index}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {usuario.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-gray-100">
                              {usuario.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-wrap gap-1">
                              {usuario.roles && usuario.roles.length > 0 ? (
                                usuario.roles.map((role: { id: number; name: string }) => (
                                  <span
                                    key={role.id}
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      getRoleBadgeColor(role.name)
                                    }`}
                                  >
                                    {role.name}
                                  </span>
                                ))
                              ) : (
                                <span className="text-sm text-gray-500 dark:text-gray-400">Sin roles</span>
                              )}
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-gray-100">
                              {usuario.created_at ? new Date(usuario.created_at).toLocaleDateString('es-ES') : 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleShow(usuario)}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                title="Ver detalles"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleEdit(usuario)}
                                className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                                title="Editar"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(usuario)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                title="Eliminar"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                          {searchTerm ? 'No se encontraron usuarios que coincidan con la búsqueda.' : 'No hay usuarios registrados.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              {lastPage > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Mostrando {fromRecord} a {toRecord} de {totalUsuarios} resultados
                  </div>
                  <div className="flex items-center space-x-2">
                    {currentPage > 1 && (
                      <Link
                        href={`/usuarios?page=${currentPage - 1}&search=${searchTerm}&sort_order=${sort_order}`}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Link>
                    )}
                    
                    <span className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Página {currentPage} de {lastPage}
                    </span>
                    
                    {currentPage < lastPage && (
                      <Link
                        href={`/usuarios?page=${currentPage + 1}&search=${searchTerm}&sort_order=${sort_order}`}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modales */}
      {showCreateModal && (
        <CreateUsuario
          auth={auth}
          secciones={secciones}
          roles={roles}
          errors={errors}
          onClose={closeModals}
        />
      )}

      {showEditModal && selectedUsuario && (
        <EditUsuario
          auth={auth}
          usuario={selectedUsuario}
          secciones={secciones}
          roles={roles}
          errors={errors}
          onClose={closeModals}
        />
      )}

      {showShowModal && selectedUsuario && (
        <ShowUsuario
          auth={auth}
          usuario={selectedUsuario}
          onClose={closeModals}
        />
      )}
    </AppLayout>
  );
};

export default Index;