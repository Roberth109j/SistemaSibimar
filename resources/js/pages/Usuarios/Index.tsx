import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Search, CheckCircle, AlertCircle, X, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Plus, Edit, Eye, Trash2, UserPlus, ToggleLeft, ToggleRight, Filter } from 'lucide-react';
import AppLayout from '../../layouts/app-layout';
import { type BreadcrumbItem, type IndexProps, type Usuario } from './types';
import CreateUsuario from './Create';
import EditUsuario from '@/pages/Usuarios/Edit';
import ShowUsuario from './Show';

// --- Interfaces TypeScript ---
interface FilterOptions {
  search?: string;
  estado_filter?: string;
}

// --- Componente AlertNotification Mejorado ---
interface AlertNotificationProps {
  type: 'success' | 'error';
  message: string;
  className?: string;
  autoClose?: boolean;
  duration?: number;
  onClose?: () => void;
}

function AlertNotification({
  type,
  message,
  className = '',
  autoClose = true,
  duration = 6000,
  onClose,
}: AlertNotificationProps) {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [animateOut, setAnimateOut] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [remainingTime, setRemainingTime] = useState<number>(duration);
  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = useCallback(() => {
    if (!autoClose || !message) return;

    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      setAnimateOut(true);
      hideTimerRef.current = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, 500);
    }, remainingTime);
  }, [autoClose, message, remainingTime, onClose]);

  const pauseTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      const elapsed = Date.now() - startTimeRef.current;
      setRemainingTime(prev => Math.max(0, prev - elapsed));
      setIsPaused(true);
    }
  }, []);

  const resumeTimer = useCallback(() => {
    if (isPaused && remainingTime > 0) {
      setIsPaused(false);
      startTimer();
    }
  }, [isPaused, remainingTime, startTimer]);

  const handleClose = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setAnimateOut(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  }, [onClose]);

  useEffect(() => {
    if (!message) return;

    setIsVisible(true);
    setAnimateOut(false);
    setIsPaused(false);
    setRemainingTime(duration);

    const initTimer = setTimeout(() => {
      startTimer();
    }, 100);

    return () => {
      clearTimeout(initTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [message, duration, startTimer]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  if (!isVisible || !message) return null;

  const colors = {
    success: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-400 dark:border-green-500',
      text: 'text-green-800 dark:text-green-200',
      icon: 'text-green-500 dark:text-green-400'
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-400 dark:border-red-500',
      text: 'text-red-800 dark:text-red-200',
      icon: 'text-red-500 dark:text-red-400'
    }
  };

  const Icon = type === 'success' ? CheckCircle : AlertCircle;

  return (
    <div
      className={`fixed top-6 right-6 z-50 max-w-md transition-all duration-500 ease-in-out transform ${animateOut ? 'opacity-0 translate-x-full scale-95' : 'opacity-100 translate-x-0 scale-100'
        } ${className}`}
      onMouseEnter={pauseTimer}
      onMouseLeave={resumeTimer}
    >
      <div
        className={`rounded-xl shadow-2xl border-l-4 backdrop-blur-sm
                    ${colors[type].border} ${colors[type].bg}
                    flex items-start p-4 transition-all duration-300 
                    hover:shadow-xl hover:-translate-y-1`}
      >
        <Icon className={`h-6 w-6 mt-0.5 mr-3 flex-shrink-0 ${colors[type].icon}`} />
        <div className="flex-grow">
          <p className={`text-sm font-semibold ${colors[type].text} leading-relaxed`}>
            {message}
          </p>
          {autoClose && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                <div
                  className={`h-1 rounded-full transition-all duration-100 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  style={{
                    width: `${(remainingTime / duration) * 100}%`,
                    transition: isPaused ? 'none' : `width ${remainingTime}ms linear`
                  }}
                />
              </div>
            </div>
          )}
        </div>
        <button
          onClick={handleClose}
          className="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 
                     focus:outline-none transition-colors p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          title="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// --- Hook personalizado para manejo de filtros ---
function useUsuarioFilters(initialFilters: FilterOptions) {
  const [searchTerm, setSearchTerm] = useState<string>(initialFilters.search || '');
  const [selectedFilters, setSelectedFilters] = useState({
    estado_filter: initialFilters.estado_filter || ''
  });
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const applyFilters = useCallback((currentSearchTerm: string, currentSelectedFilters: typeof selectedFilters) => {
    const params: Record<string, string> = {};
    if (currentSearchTerm) params.search = currentSearchTerm;
    if (currentSelectedFilters.estado_filter) params.estado_filter = currentSelectedFilters.estado_filter;

    router.get('/usuarios', params, {
      preserveState: true,
      preserveScroll: true,
    });
  }, []);

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    const timeout = setTimeout(() => {
      applyFilters(value, selectedFilters);
    }, 500);
    setSearchTimeout(timeout);
  }, [selectedFilters, searchTimeout, applyFilters]);

  const handleFilterChange = useCallback((filterType: string, value: string) => {
    const newFilters = { ...selectedFilters, [filterType]: value };
    setSelectedFilters(newFilters);
    applyFilters(searchTerm, newFilters);
  }, [searchTerm, selectedFilters, applyFilters]);

  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedFilters({
      estado_filter: ''
    });
    router.get('/usuarios', {}, {
      preserveState: true,
      preserveScroll: true,
    });
  }, []);

  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  return {
    searchTerm,
    selectedFilters,
    handleSearch,
    handleFilterChange,
    resetFilters
  };
}

// --- Componente de Paginación Mejorado ---
interface PaginationProps {
  usuarios: any;
  filters: FilterOptions;
  sort_order: string;
}

function PaginationComponent({ usuarios, filters, sort_order }: PaginationProps) {
  const handlePageChange = useCallback((page: number) => {
    router.get('/usuarios', {
      ...filters,
      sort_order,
      page: page
    }, {
      preserveState: true,
      preserveScroll: true,
    });
  }, [filters, sort_order]);

  const totalUsuarios = 'total' in usuarios ? usuarios.total : usuarios.length;
  const currentPage = 'current_page' in usuarios ? usuarios.current_page : 1;
  const lastPage = 'last_page' in usuarios ? usuarios.last_page : 1;

  if (lastPage <= 1) return null;

  return (
    <div className="mt-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Página {currentPage} de {lastPage}
      </div>

      <div className="flex items-center space-x-2">
        {/* Botón anterior */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${currentPage > 1
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50'
            }`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Números de página */}
        {[...Array(lastPage)].map((_, index) => {
          const pageNum = index + 1;
          const maxVisiblePages = 5;
          const halfVisible = Math.floor(maxVisiblePages / 2);

          let showPage = false;
          if (lastPage <= maxVisiblePages) {
            showPage = true;
          } else if (
            pageNum === 1 ||
            pageNum === lastPage ||
            (pageNum >= currentPage - halfVisible && pageNum <= currentPage + halfVisible)
          ) {
            showPage = true;
          }

          if (showPage) {
            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-colors ${currentPage === pageNum
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
              >
                {pageNum}
              </button>
            );
          } else if (
            (pageNum === 2 && currentPage > halfVisible + 1) ||
            (pageNum === lastPage - 1 && currentPage < lastPage - halfVisible)
          ) {
            return (
              <span key={pageNum} className="flex items-center justify-center w-10 h-10 text-sm font-medium text-gray-500 dark:text-gray-400">
                ...
              </span>
            );
          }
          return null;
        })}

        {/* Botón siguiente */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= lastPage}
          className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${currentPage < lastPage
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50'
            }`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Usuarios', href: '/usuarios' },
];

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
  start_number = 0,
  filters = {}
}: IndexProps) => {
  const page = usePage();
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Estados para modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showShowModal, setShowShowModal] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);

  // Usar hook personalizado para filtros
  const {
    searchTerm,
    selectedFilters,
    handleSearch,
    handleFilterChange,
    resetFilters
  } = useUsuarioFilters({ search, estado_filter: filters?.estado_filter });

  // Estado mejorado para alertas
  const [alerts, setAlerts] = useState<{
    success: string | null;
    error: string | null;
    timestamp: number;
  }>({
    success: null,
    error: null,
    timestamp: 0
  });

  const flashProcessedRef = useRef<string>('');

  // Verificar si el usuario es administrador
  const isAdmin = auth.user?.roles?.some((role: any) => role.name === 'Administrador') || false;

  // Si no es admin, mostrar mensaje de acceso denegado
  if (!isAdmin) {
    return (
      <AppLayout
        renderHeader={() => (
          <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
            Acceso Denegado
          </h2>
        )}
        breadcrumbs={breadcrumbs}
      >
        <Head title="Acceso Denegado" />
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
            <div className="p-6 text-center">
              <div className="mx-auto mb-4 h-12 w-12 text-red-500">
                <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
                Acceso Denegado
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                No tienes permisos para acceder a la gestión de usuarios. Solo los administradores pueden acceder a esta sección.
              </p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  useEffect(() => {
    if (flash) {
      const flashKey = `${flash.success || ''}-${flash.error || ''}`;

      if (flashKey && flashKey !== flashProcessedRef.current) {
        flashProcessedRef.current = flashKey;

        setAlerts({
          success: flash.success || null,
          error: flash.error || null,
          timestamp: Date.now()
        });
      }
    }
  }, [flash]);

  const handleCloseAlert = useCallback((type: 'success' | 'error') => {
    setAlerts(prev => ({
      ...prev,
      [type]: null
    }));
  }, []);

  const renderAlerts = (): React.ReactElement => {
    return (
      <>
        {alerts.success && (
          <AlertNotification
            key={`success-${alerts.timestamp}`}
            type="success"
            message={alerts.success}
            duration={6000}
            onClose={() => handleCloseAlert('success')}
          />
        )}
        {alerts.error && (
          <AlertNotification
            key={`error-${alerts.timestamp}`}
            type="error"
            message={alerts.error}
            duration={8000}
            onClose={() => handleCloseAlert('error')}
          />
        )}
      </>
    );
  };

  const handleSort = () => {
    const newSortOrder = sort_order === 'asc' ? 'desc' : 'asc';
    router.get('/usuarios', {
      search: searchTerm,
      sort_order: newSortOrder,
      estado_filter: selectedFilters.estado_filter,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleToggleEstado = (usuario: Usuario) => {
    if (confirm(`¿Estás seguro de que deseas ${usuario.estado_activo ? 'desactivar' : 'activar'} al usuario "${usuario.name}"?`)) {
      router.patch(`/usuarios/${usuario.id}/toggle-estado`, {}, {
        onSuccess: () => {
          setAlerts(prev => ({
            ...prev,
            success: `Usuario ${usuario.estado_activo ? 'desactivado' : 'activado'} exitosamente`,
            timestamp: Date.now()
          }));
        },
        onError: () => {
          setAlerts(prev => ({
            ...prev,
            error: 'Error al cambiar el estado del usuario',
            timestamp: Date.now()
          }));
        }
      });
    }
  };

  const handleDelete = (usuario: Usuario) => {
    if (confirm(`¿Estás seguro de que deseas eliminar al usuario "${usuario.name}"?`)) {
      router.delete(`/usuarios/${usuario.id}`, {
        onSuccess: () => {
          setAlerts(prev => ({
            ...prev,
            success: 'Usuario eliminado exitosamente',
            timestamp: Date.now()
          }));
        },
        onError: () => {
          setAlerts(prev => ({
            ...prev,
            error: 'Error al eliminar el usuario',
            timestamp: Date.now()
          }));
        }
      });
    }
  };

  const handleCreate = () => {
    setSelectedUsuario(null);
    setShowCreateModal(true);
  };

  const handleCreateSuccess = (message: string) => {
    setAlerts(prev => ({
      ...prev,
      success: message,
      timestamp: Date.now()
    }));
    setShowCreateModal(false);
    router.reload();
  };

  const handleCreateError = (message: string) => {
    setAlerts(prev => ({
      ...prev,
      error: message,
      timestamp: Date.now()
    }));
  };

  const handleEditSuccess = () => {
    setAlerts(prev => ({
      ...prev,
      success: 'Usuario actualizado exitosamente',
      timestamp: Date.now()
    }));
    setShowEditModal(false);
    setSelectedUsuario(null);
    router.reload();
  };

  const handleEditError = () => {
    setAlerts(prev => ({
      ...prev,
      error: 'Error al actualizar el usuario',
      timestamp: Date.now()
    }));
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
      case 'Administrador':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'primaria':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'bachillerato':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const content = (
    <div className="py-4 px-3 sm:py-6 sm:px-4 bg-slate-50 dark:bg-black min-h-screen">
      {renderAlerts()}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl dark:bg-blue-600/10"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-indigo-500/5 blur-3xl dark:bg-indigo-600/10"></div>
      </div>
      <div className="max-w-full mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Administración de Usuarios
          </h1>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar usuarios..."
                className="w-full sm:w-64 lg:w-72 pl-9 py-2 pr-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700
                           text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           shadow-sm transition-all duration-200 text-sm"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm border border-gray-300 dark:border-gray-700 text-sm"
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filtros</span>
            </button>

            <button
              onClick={handleCreate}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white
                px-3 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg
                transform hover:-translate-y-0.5 text-sm"
            >
              <UserPlus className="w-4 h-4" />
              <span>Crear Usuario</span>
            </button>
          </div>
        </div>

        {/* Panel de filtros */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md border border-gray-100 dark:border-gray-700 mb-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-3">
              <h3 className="text-base font-semibold text-gray-800 dark:text-white">Filtros avanzados</h3>
              <button
                onClick={resetFilters}
                className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 self-start sm:self-auto"
              >
                Restablecer filtros
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Estado</label>
                <select
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm"
                  value={selectedFilters.estado_filter}
                  onChange={(e) => handleFilterChange('estado_filter', e.target.value)}
                >
                  <option value="">Todos los estados</option>
                  <option value="activo">Activos</option>
                  <option value="inactivo">Inactivos</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Información de resultados */}
        {typeof totalUsuarios === 'number' && totalUsuarios > 0 && (
          <div className="mb-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Mostrando {fromRecord || 1} a {toRecord || usuariosData.length} de {totalUsuarios} resultados
          </div>
        )}

        {/* Tabla de usuarios */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <colgroup>
                <col className="min-w-[140px]" />
                <col className="min-w-[180px]" />
                <col className="min-w-[100px]" />
                <col className="min-w-[90px]" />
                <col className="min-w-[120px]" />
                <col className="min-w-[100px]" />
                <col className="min-w-[100px]" />
                <col className="min-w-[100px]" />
              </colgroup>
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="px-2 sm:px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    <button
                      onClick={handleSort}
                      className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-100"
                    >
                      <span>Nombre</span>
                      {sort_order === 'asc' ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </button>
                  </th>
                  <th className="px-2 sm:px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                  <th className="px-2 sm:px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">Sección</th>
                  <th className="px-2 sm:px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                  <th className="px-2 sm:px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">Roles</th>
                  <th className="px-2 sm:px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden lg:table-cell">F. Inicio</th>
                  <th className="px-2 sm:px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden lg:table-cell">F. Fin</th>
                  <th className="px-2 sm:px-3 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                {usuariosData.length > 0 ? (
                  usuariosData.map((usuario, index) => (
                    <tr key={usuario.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-2 sm:px-3 py-2 text-gray-700 dark:text-gray-300 font-medium text-xs sm:text-sm">
                        <div className="flex flex-col">
                          <span className="font-medium truncate">{usuario.name}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 sm:hidden truncate">
                            {usuario.seccion?.nombre || 'Sin asignar'}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 sm:px-3 py-2 text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
                        <div className="flex flex-col">
                          <div className="truncate max-w-[140px] sm:max-w-[180px]" title={usuario.email}>
                            {usuario.email}
                          </div>
                          <div className="md:hidden mt-1">
                            <div className="flex flex-wrap gap-1">
                              {usuario.roles && usuario.roles.length > 0 ? (
                                usuario.roles.slice(0, 1).map((role: { id: number; name: string }) => (
                                  <span
                                    key={role.id}
                                    className={`inline-flex items-center px-1 py-0.5 rounded text-xs font-medium ${getRoleBadgeColor(role.name)}`}
                                  >
                                    {role.name}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-gray-500 dark:text-gray-400">Sin roles</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 sm:px-3 py-2 text-gray-700 dark:text-gray-300 text-xs sm:text-sm hidden sm:table-cell">
                        <div className="truncate" title={usuario.seccion?.nombre || 'Sin asignar'}>
                          {usuario.seccion?.nombre || 'Sin asignar'}
                        </div>
                      </td>
                      <td className="px-2 sm:px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-medium ${usuario.estado_activo
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                            }`}>
                            {usuario.estado_activo ? 'Activo' : 'Inactivo'}
                          </span>
                          <button
                            onClick={() => handleToggleEstado(usuario)}
                            className={`p-0.5 sm:p-1 rounded-md transition-colors ${usuario.estado_activo
                                ? 'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300'
                                : 'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300'
                              }`}
                            title={usuario.estado_activo ? 'Desactivar usuario' : 'Activar usuario'}
                          >
                            {usuario.estado_activo ? <ToggleRight className="h-3 w-3 sm:h-4 sm:w-4" /> : <ToggleLeft className="h-3 w-3 sm:h-4 sm:w-4" />}
                          </button>
                        </div>
                      </td>
                      <td className="px-2 sm:px-3 py-2 whitespace-nowrap hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {usuario.roles && usuario.roles.length > 0 ? (
                            usuario.roles.slice(0, 2).map((role: { id: number; name: string }) => (
                              <span
                                key={role.id}
                                className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(role.name)}`}
                              >
                                {role.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Sin roles</span>
                          )}
                        </div>
                      </td>
                      <td className="px-2 sm:px-3 py-2 whitespace-nowrap hidden lg:table-cell">
                        <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                          {usuario.fecha_inicio_labores ? new Date(usuario.fecha_inicio_labores).toLocaleDateString('es-ES') : 'N/A'}
                        </div>
                      </td>
                      <td className="px-2 sm:px-3 py-2 whitespace-nowrap hidden lg:table-cell">
                        <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                          {usuario.fecha_fin_labores ? new Date(usuario.fecha_fin_labores).toLocaleDateString('es-ES') : 'N/A'}
                        </div>
                      </td>
                      <td className="px-2 sm:px-3 py-2 whitespace-nowrap">
                        <div className="flex justify-center space-x-1">
                          <button
                            onClick={() => handleShow(usuario)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 
                                      transition-colors p-1 bg-blue-50 dark:bg-blue-900/30 rounded hover:bg-blue-100 dark:hover:bg-blue-800/40"
                            title="Ver detalles"
                          >
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>

                          <button
                            onClick={() => handleEdit(usuario)}
                            className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 
                                      transition-colors p-1 bg-amber-50 dark:bg-amber-900/30 rounded hover:bg-amber-100 dark:hover:bg-amber-800/40"
                            title="Editar usuario"
                          >
                            <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>


                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-6 text-center text-gray-500 dark:text-gray-400 text-sm">
                      {searchTerm ? 'No se encontraron usuarios que coincidan con la búsqueda.' : 'No hay usuarios registrados.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Paginación usando el componente mejorado */}
        <PaginationComponent usuarios={usuarios} filters={{ search: searchTerm, estado_filter: selectedFilters.estado_filter }} sort_order={sort_order} />
      </div>
    </div>
  );

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Administración de Usuarios" />
      {content}

      {/* Modales */}
      <CreateUsuario
        auth={auth}
        secciones={secciones}
        roles={roles}
        errors={errors}
        onSuccess={handleCreateSuccess}
        onError={handleCreateError}
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {showEditModal && selectedUsuario && (
        <EditUsuario
          auth={auth}
          usuario={selectedUsuario}
          secciones={secciones}
          roles={roles}
          errors={errors}
          onSuccess={handleEditSuccess}
          onError={handleEditError}
          open={showEditModal}
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