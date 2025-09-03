import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Search, CheckCircle, AlertCircle, X, Filter, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';
import AppLayout from '../../layouts/app-layout';
import { 
  BreadcrumbItem, 
  FlashMessage, 
  Grado, 
  Seccion, 
  PaginatedGrados, 
  IndexProps,
  AlertNotificationProps,
  AlertState,
  FilterState
} from './types';
import CreateGrado from './Create';
import EditGrado from './Edit';
import ShowGrado from './Show';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Grados', href: '/grados' },
];

function AlertNotification({
  type,
  message,
  className = '',
  autoClose = true,
  duration = 4000,
}: AlertNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [animateOut, setAnimateOut] = useState(false);

  useEffect(() => {
    if (autoClose && message) {
      const timer = setTimeout(() => {
        setAnimateOut(true);
        const hideTimer = setTimeout(() => {
          setIsVisible(false);
        }, 500);
        return () => clearTimeout(hideTimer);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, message]);

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
  grados, 
  flash, 
  errors = {},
  sort_order = 'asc', // Por defecto orden jerárquico ascendente
  search = '',
  start_number = 0,
  filters = {},
  all_grados = [],
  all_estados = [],
  all_secciones = [],
  seccionId = null,
  pagination
}: IndexProps) => {
  const page = usePage();
  const [searchTerm, setSearchTerm] = useState(search);
  
  // ✅ DETERMINAR SI EL PANEL DEBE ESTAR ABIERTO INICIALMENTE
  const hasActiveFilters = !!(filters.grado_filter || filters.estado || filters.seccion_filter);
  const [showFilters, setShowFilters] = useState(hasActiveFilters);
  
  const [selectedFilters, setSelectedFilters] = useState<FilterState>({
    grado_filter: filters.grado_filter || '',
    estado: filters.estado || '',
    seccion_filter: filters.seccion_filter || '',
  });

  // ✅ ACTUALIZAR EL ESTADO DEL PANEL CUANDO CAMBIEN LOS FILTROS
  useEffect(() => {
    const hasFilters = !!(filters.grado_filter || filters.estado || filters.seccion_filter);
    setShowFilters(hasFilters);
  }, [filters]);

  const [alerts, setAlerts] = useState<AlertState>({
    success: null,
    error: null,
    timestamp: 0
  });

  // Ref para controlar flash messages duplicados
  const flashProcessedRef = useRef<string>('');

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
  }, [flash, page.props.flash]);

  // Debounce para la búsqueda automática
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.trim() !== search) {
        handleSearch();
      }
    }, 500); // 500ms de delay

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Función para manejar la búsqueda
  const handleSearch = useCallback(() => {
    const params = new URLSearchParams();
    
    // Agregar búsqueda si existe
    if (searchTerm.trim()) {
      params.set('search', searchTerm.trim());
    }
    
    // Mantener filtros existentes
    if (selectedFilters.grado_filter) {
      params.set('grado_filter', selectedFilters.grado_filter);
    }
    if (selectedFilters.estado) {
      params.set('estado', selectedFilters.estado);
    }
    if (selectedFilters.seccion_filter) {
      params.set('seccion_filter', selectedFilters.seccion_filter);
    }
    
    // Mantener orden actual
    if (sort_order) {
      params.set('sort_order', sort_order);
    }
    
    // Resetear a primera página
    params.set('page', '1');
    
    router.visit(`/grados?${params.toString()}`, {
      preserveState: true,
      preserveScroll: false,
      only: ['grados', 'pagination', 'search', 'sort_order', 'filters', 'start_number']
    });
  }, [searchTerm, selectedFilters, sort_order]);

  // Función para manejar el ordenamiento - SOLO GRADO
  const handleSort = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    
    // Alternar entre asc y desc
    const newOrder = sort_order === 'asc' ? 'desc' : 'asc';
    params.set('sort_order', newOrder);
    
    // Resetear a primera página al cambiar ordenamiento
    params.set('page', '1');
    
    console.log('Changing sort order to:', newOrder); // Debug
    
    router.visit(`/grados?${params.toString()}`, {
      preserveState: true,
      preserveScroll: false,
      only: ['grados', 'pagination', 'sort_order', 'start_number']
    });
  }, [sort_order]);

  // Función para obtener el ícono de ordenamiento
  const getSortIcon = () => {
    return sort_order === 'asc' ? (
      <ChevronUp className="w-4 h-4 text-blue-600" />
    ) : (
      <ChevronDown className="w-4 h-4 text-blue-600" />
    );
  };

  const handleFilterChange = useCallback((filterType: string, value: string): void => {
    const newFilters = { ...selectedFilters, [filterType]: value };
    setSelectedFilters(newFilters);

    const params = new URLSearchParams();
    
    // Mantener búsqueda
    if (searchTerm.trim()) {
      params.set('search', searchTerm.trim());
    }
    
    // Agregar filtros
    if (newFilters.grado_filter) {
      params.set('grado_filter', newFilters.grado_filter);
    }
    if (newFilters.estado) {
      params.set('estado', newFilters.estado);
    }
    if (newFilters.seccion_filter) {
      params.set('seccion_filter', newFilters.seccion_filter);
    }
    
    // Mantener orden
    if (sort_order) {
      params.set('sort_order', sort_order);
    }
    
    // Resetear página
    params.set('page', '1');
    
    router.visit(`/grados?${params.toString()}`, {
      preserveState: true,
      preserveScroll: false,
      only: ['grados', 'pagination', 'filters', 'start_number']
    });
  }, [selectedFilters, searchTerm, sort_order]);

  const resetFilters = useCallback((): void => {
    setSearchTerm('');
    setSelectedFilters({
      grado_filter: '',
      estado: '',
      seccion_filter: ''
    });
    
    // Resetear solo manteniendo el orden jerárquico por defecto
    router.visit('/grados?sort_order=asc', {
      preserveState: true,
      preserveScroll: false,
      only: ['grados', 'pagination', 'search', 'filters', 'start_number']
    });
  }, []);

  // Usar datos de paginación
  const paginationData = pagination || {
    current_page: 'current_page' in grados ? grados.current_page : 1,
    last_page: 'last_page' in grados ? grados.last_page : 1,
    per_page: 10,
    total: grados.total || 0,
    from: 'from' in grados ? grados.from : null,
    to: 'to' in grados ? grados.to : null,
    has_pages: (grados.total || 0) > 10
  };

  // Función para obtener nombre de sección
  const getSeccionNombre = (grado: Grado) => {
    return grado.seccion?.nombre || 'Sin sección';
  };

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlerts(prev => ({
      ...prev,
      [type]: message,
      timestamp: Date.now()
    }));
  };

  const renderAlerts = () => {
    return (
      <>
        {alerts.success && (
          <AlertNotification
            key={`success-${alerts.timestamp}`}
            type="success"
            message={alerts.success}
          />
        )}
        {alerts.error && (
          <AlertNotification
            key={`error-${alerts.timestamp}`}
            type="error"
            message={alerts.error}
          />
        )}
      </>
    );
  };

  // Debug para verificar los datos
  console.log('Sort order:', sort_order);
  console.log('Grados data:', grados.data);

  const content = (
    <div className="relative py-8 px-6 bg-slate-50 dark:bg-black min-h-screen">
      {renderAlerts()}
      
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl dark:bg-blue-600/10"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-indigo-500/5 blur-3xl dark:bg-indigo-600/10"></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Gestión de Grados
            </h1>
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar grados..."
                className="w-64 pl-10 py-2.5 pr-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                          text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                          shadow-sm transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm border ${
                hasActiveFilters || showFilters
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-600'
                  : 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border-gray-300 dark:border-gray-700'
              }`}
            >
              <Filter className="w-5 h-5" />
              <span>Filtros</span>
            </button>

            <CreateGrado
              onSuccess={(message) => showAlert('success', message)}
              onError={(message) => showAlert('error', message)}
              errors={errors}
              all_secciones={all_secciones}
              seccionId={seccionId}
            />
          </div>
        </div>

        {/* Panel de filtros */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border border-gray-100 dark:border-gray-700 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Filtros avanzados</h3>
              <button
                onClick={resetFilters}
                className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
              >
                Restablecer filtros
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Grado</label>
                <select
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={selectedFilters.grado_filter}
                  onChange={(e) => handleFilterChange('grado_filter', e.target.value)}
                >
                  <option value="">Todos los grados</option>
                  {all_grados.map((grado) => (
                    <option key={grado} value={grado}>
                      {grado}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Estado</label>
                <select
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={selectedFilters.estado}
                  onChange={(e) => handleFilterChange('estado', e.target.value)}
                >
                  <option value="">Todos los estados</option>
                  {all_estados.map((estado) => (
                    <option key={estado} value={estado}>
                      {estado}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sección</label>
                <select
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={selectedFilters.seccion_filter}
                  onChange={(e) => handleFilterChange('seccion_filter', e.target.value)}
                >
                  <option value="">Todas las secciones</option>
                  {all_secciones?.map((seccion) => (
                    <option key={seccion.id} value={seccion.id.toString()}>
                      {seccion.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Información de resultados */}
        {paginationData.total > 0 && (
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Mostrando {paginationData.from || 1} a {paginationData.to || grados.data.length} de {paginationData.total} resultados
          </div>
        )}
        
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] table-fixed">
              <colgroup>
                <col className="w-16" />
                <col className="w-32" />
                <col className="w-32" />
                <col className="w-32" />
                <col className="w-32" />
                <col className="w-28" />
              </colgroup>
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="px-3 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    N°
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    <button
                      onClick={handleSort}
                      className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      type="button"
                    >
                      GRADO
                      {getSortIcon()}
                    </button>
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Subgrado</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Sección</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {grados.data.length > 0 ? (
                  grados.data.map((grado, index) => (
                    <tr key={grado.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-3 py-3 whitespace-nowrap text-center text-gray-600 dark:text-gray-400 text-sm font-medium">
                        {start_number + index + 1}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-sm max-w-xs">
                        <div className="truncate font-semibold" title={grado.grado}>
                          {grado.grado}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-sm max-w-xs">
                        <div className="truncate" title={grado.subGrado || '-'}>
                          {grado.subGrado || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-sm max-w-xs">
                        <div className="truncate" title={getSeccionNombre(grado)}>
                          {getSeccionNombre(grado)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-sm">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          grado.estado === 'ACTIVO' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-800/40 dark:text-green-100' 
                            : 'bg-red-100 text-red-800 dark:bg-red-800/40 dark:text-red-100'
                        }`}>
                          {grado.estado}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex justify-center space-x-2">
                          <ShowGrado 
                            grado={grado} 
                            tableNumber={start_number + index + 1}
                          />
                          <EditGrado
                            grado={grado}
                            onSuccess={(message) => showAlert('success', message)}
                            onError={(message) => showAlert('error', message)}
                            errors={errors}
                            all_secciones={all_secciones}
                            seccionId={seccionId}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      No hay grados disponibles
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Paginación */}
        {paginationData.has_pages && paginationData.last_page > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Página {paginationData.current_page} de {paginationData.last_page}
            </div>

            <div className="flex items-center space-x-2">
              <Link
                href={paginationData.current_page > 1 ? 
                  `${window.location.pathname}?${new URLSearchParams({
                    ...Object.fromEntries(new URLSearchParams(window.location.search)),
                    page: String(paginationData.current_page - 1)
                  })}` : '#'}
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                  paginationData.current_page > 1
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50'
                }`}
                onClick={(e) => {
                  if (paginationData.current_page <= 1) e.preventDefault();
                }}
                preserveState
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>

              {[...Array(paginationData.last_page)].map((_, index) => {
                const pageNum = index + 1;
                const maxVisiblePages = 5;
                const currentPage = paginationData.current_page;
                const halfVisible = Math.floor(maxVisiblePages / 2);

                let showPage = false;
                if (paginationData.last_page <= maxVisiblePages) {
                  showPage = true;
                } else if (
                  pageNum === 1 ||
                  pageNum === paginationData.last_page ||
                  (pageNum >= currentPage - halfVisible && pageNum <= currentPage + halfVisible)
                ) {
                  showPage = true;
                }

                if (showPage) {
                  return (
                    <Link
                      key={pageNum}
                      href={`${window.location.pathname}?${new URLSearchParams({
                        ...Object.fromEntries(new URLSearchParams(window.location.search)),
                        page: String(pageNum)
                      })}`}
                      className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                      }`}
                      preserveState
                    >
                      {pageNum}
                    </Link>
                  );
                } else if (
                  (pageNum === 2 && currentPage > halfVisible + 1) ||
                  (pageNum === paginationData.last_page - 1 && currentPage < paginationData.last_page - halfVisible)
                ) {
                  return (
                    <span key={pageNum} className="flex items-center justify-center w-10 h-10 text-sm font-medium text-gray-500 dark:text-gray-400">
                      ...
                    </span>
                  );
                }
                return null;
              })}

              <Link
                href={paginationData.current_page < paginationData.last_page ? 
                  `${window.location.pathname}?${new URLSearchParams({
                    ...Object.fromEntries(new URLSearchParams(window.location.search)),
                    page: String(paginationData.current_page + 1)
                  })}` : '#'}
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                  paginationData.current_page < paginationData.last_page
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50'
                }`}
                onClick={(e) => {
                  if (paginationData.current_page >= paginationData.last_page) e.preventDefault();
                }}
                preserveState
              >
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Gestión de Grados" />
      {content}
    </AppLayout>
  );
};

export default Index;