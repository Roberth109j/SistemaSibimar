import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import {
  Search,
  PlusCircle,
  Eye,
  Edit,
  Filter,
  Users,
  CheckCircle,
  AlertCircle,
  X,
  GraduationCap,
  UserCheck,
  FilterX,
  ChevronDown,
  Settings,
  Download
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type LectorPageProps, type Lector } from './types';

// Constantes
const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Lectores',
    href: '/lectores',
  },
];

// Componente de notificación
const Notification = ({
  notification,
  onClose
}: {
  notification: { show: boolean; type: string; message: string },
  onClose: () => void
}) => {
  if (!notification.show) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-full duration-300">
      <div className={`
        flex items-center justify-between min-w-80 max-w-md p-4 rounded-xl shadow-xl backdrop-blur-sm border
        ${notification.type === 'success'
          ? 'bg-green-50/95 dark:bg-green-900/95 border-green-200 dark:border-green-800'
          : 'bg-red-50/95 dark:bg-red-900/95 border-red-200 dark:border-red-800'
        }
      `}>
        <div className="flex items-center">
          {notification.type === 'success' ? (
            <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-300" />
            </div>
          ) : (
            <div className="flex-shrink-0 w-8 h-8 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-300" />
            </div>
          )}
          <p className={`ml-3 text-sm font-medium ${notification.type === 'success'
              ? 'text-green-800 dark:text-green-200'
              : 'text-red-800 dark:text-red-200'
            }`}>
            {notification.message}
          </p>
        </div>
        <button
          onClick={onClose}
          className="ml-4 flex-shrink-0 rounded-full p-1.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </button>
      </div>
    </div>
  );
};

// Componente de badge de estado
const StatusBadge = ({
  status,
  type
}: {
  status: string;
  type: 'estado' | 'tipo'
}) => {
  const getStatusStyles = () => {
    if (type === 'estado') {
      switch (status) {
        case 'ACTIVO':
          return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
        case 'INACTIVO':
          return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600';
        default:
          return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800';
      }
    } else {
      switch (status) {
        case 'ESTUDIANTE':
          return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800';
        case 'DOCENTE':
          return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800';
        default:
          return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800';
      }
    }
  };

  const getIcon = () => {
    if (type === 'tipo') {
      if (status === 'ESTUDIANTE') return <GraduationCap className="w-3 h-3" />;
      if (status === 'DOCENTE') return <UserCheck className="w-3 h-3" />;
    }
    return null;
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusStyles()}`}>
      {getIcon()}
      {status}
    </span>
  );
};

// Componente de vista de detalles
const LectorDetails = ({
  lector,
  onClose,
  onEdit
}: {
  lector: Lector;
  onClose: () => void;
  onEdit: (lector: Lector) => void;
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden">
    {/* Header */}
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              Detalles del Lector
            </h2>
            <p className="text-indigo-100 text-sm">
              Información completa del registro
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(lector)}
            className="px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            <span className="hidden sm:inline">Editar</span>
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>

    {/* Content */}
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Código
            </dt>
            <dd className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {lector.codigo}
            </dd>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Nombre Completo
            </dt>
            <dd className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {lector.nombre}
            </dd>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Tipo
            </dt>
            <dd>
              <StatusBadge status={lector.tipo} type="tipo" />
            </dd>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Grado
            </dt>
            <dd className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {lector.grado ? lector.grado.grado : 'No asignado'}
            </dd>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
          Estado
        </dt>
        <dd>
          <StatusBadge status={lector.estado} type="estado" />
        </dd>
      </div>
    </div>
  </div>
);

// Componente principal
export default function Index({
  auth,
  lectores,
  filters = {},
  grados = [],
}: LectorPageProps) {
  const { errors = {}, flash = {} } = usePage().props as any;

  // Estados
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    tipo: '',
    grado: '',
    estado: ''
  });
  const [selectedLector, setSelectedLector] = useState<Lector | null>(null);
  const [view, setView] = useState('list');
  const [notification, setNotification] = useState({
    show: false,
    type: '',
    message: ''
  });

  // Mostrar notificaciones de flash
  useEffect(() => {
    if (flash?.success) {
      setNotification({
        show: true,
        type: 'success',
        message: flash.success
      });
    } else if (flash?.error) {
      setNotification({
        show: true,
        type: 'error',
        message: flash.error
      });
    }

    const timer = setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);

    return () => clearTimeout(timer);
  }, [flash]);

  // Manejar cambios en los filtros
  const handleFiltersChange = () => {
    router.get(
      route('lectores.index'),
      {
        search: searchTerm,
        tipo: selectedFilters.tipo,
        grado: selectedFilters.grado,
        estado: selectedFilters.estado,
      },
      {
        preserveState: true,
        preserveScroll: true,
        replace: true,
      }
    );
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleFiltersChange();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedFilters]);

  // Funciones de acción
  const handleShowLector = (lector: Lector) => {
    setSelectedLector(lector);
    setView('show');
  };

  const handleEditLector = (lector: Lector) => {
    router.get(route('lectores.edit', lector.id));
  };

  const resetFilters = () => {
    setSelectedFilters({
      tipo: '',
      grado: '',
      estado: ''
    });
    setSearchTerm('');
  };

  const hasActiveFilters = selectedFilters.tipo || selectedFilters.grado || selectedFilters.estado || searchTerm;

  return (
    <AppLayout
      title="Gestión de Lectores"
      breadcrumbs={breadcrumbs}
      renderHeader={() => (
        <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
          Gestión de Lectores
        </h2>
      )}
    >
      <Head title="Gestión de Lectores" />

      {/* Notificación */}
      <Notification
        notification={notification}
        onClose={() => setNotification(prev => ({ ...prev, show: false }))}
      />

      <div className="space-y-6">
        {/* Vista de detalles */}
        {view === 'show' && selectedLector && (
          <LectorDetails
            lector={selectedLector}
            onClose={() => setView('list')}
            onEdit={handleEditLector}
          />
        )}

        {view === 'list' && (
          <>
            {/* Cabecera moderna */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-2xl shadow-xl overflow-hidden">
              <div className="px-6 py-8">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Users className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-white">
                        Gestión de Lectores
                      </h1>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    <Link
                      href={route('lectores.create')}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl"
                    >
                      <PlusCircle className="h-5 w-5" />
                      <span>Nuevo Lector</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Barra de búsqueda y filtros */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Búsqueda */}
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Buscar por nombre o código..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                  <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                </div>

                {/* Botones de acción */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl border font-medium transition-all ${showFilters || hasActiveFilters
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
                        : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                  >
                    <Filter className="h-5 w-5" />
                    <span>Filtros</span>
                    {hasActiveFilters && (
                      <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                    )}
                  </button>

                  {hasActiveFilters && (
                    <button
                      onClick={resetFilters}
                      className="inline-flex items-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <FilterX className="h-4 w-4" />
                      <span>Limpiar</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Panel de filtros avanzados */}
            {showFilters && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-in slide-in-from-top-2 duration-200">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Filtros Avanzados
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Tipo de Lector
                    </label>
                    <div className="relative">
                      <select
                        className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
                        value={selectedFilters.tipo}
                        onChange={(e) => setSelectedFilters({ ...selectedFilters, tipo: e.target.value })}
                      >
                        <option value="">Todos los tipos</option>
                        <option value="ESTUDIANTE">Estudiante</option>
                        <option value="DOCENTE">Docente</option>
                        <option value="OTRO">Otro</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Grado
                    </label>
                    <div className="relative">
                      <select
                        className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
                        value={selectedFilters.grado}
                        onChange={(e) => setSelectedFilters({ ...selectedFilters, grado: e.target.value })}
                      >
                        <option value="">Todos los grados</option>
                        {grados.map((grado: any) => (
                          <option key={grado.id} value={grado.id}>
                            {grado.grado}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Estado
                    </label>
                    <div className="relative">
                      <select
                        className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
                        value={selectedFilters.estado}
                        onChange={(e) => setSelectedFilters({ ...selectedFilters, estado: e.target.value })}
                      >
                        <option value="">Todos los estados</option>
                        <option value="ACTIVO">Activo</option>
                        <option value="INACTIVO">Inactivo</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tabla de lectores */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Código
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Nombre
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Grado
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {lectores.data.length > 0 ? (
                      lectores.data.map((lector: Lector) => (
                        <tr
                          key={lector.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-mono text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                              {lector.codigo}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {lector.nombre}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={lector.tipo} type="tipo" />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                            {lector.grado ? lector.grado.grado : '—'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={lector.estado} type="estado" />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleShowLector(lector)}
                                className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                title="Ver detalles"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <Link
                                href={route('lectores.edit', lector.id)}
                                className="p-2 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                                title="Editar"
                              >
                                <Edit className="w-4 h-4" />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <Users className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                            <div>
                              <p className="text-gray-500 dark:text-gray-400 font-medium">
                                No se encontraron lectores
                              </p>
                              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                                {hasActiveFilters
                                  ? 'Intenta ajustar los filtros de búsqueda'
                                  : 'Comienza agregando un nuevo lector'
                                }
                              </p>
                            </div>
                            {!hasActiveFilters && (
                              <Link
                                href={route('lectores.create')}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                              >
                                <PlusCircle className="w-4 h-4" />
                                Agregar Lector
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              {'links' in lectores && (lectores as any).links.length > 3 && (
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Mostrando {(lectores as any).from} a {(lectores as any).to} de {(lectores as any).total} registros
                    </div>
                    <div className="flex gap-2">
                      {(lectores as any).links.map((link: { url: string | null; active: boolean; label: string }, i: number) => {
                        if (link.url === null) return null;

                        return (
                          <button
                            key={i}
                            onClick={() => {
                              // Extrae el número de página de la URL
                              const url = link.url ? new URL(link.url, window.location.origin) : null;
                              const page = url?.searchParams.get('page') || 1;

                              // Navega manteniendo todos los filtros
                              router.get(route('lectores.index'), {
                                search: searchTerm,
                                tipo: selectedFilters.tipo,
                                grado: selectedFilters.grado,
                                estado: selectedFilters.estado,
                                page: page
                              }, {
                                preserveState: true,
                                preserveScroll: true,
                              });
                            }}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${link.active
                                ? 'bg-indigo-600 text-white'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                              }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}