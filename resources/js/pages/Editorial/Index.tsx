import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Search, CheckCircle, AlertCircle, X, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import AppLayout from '../../layouts/app-layout';
import { type BreadcrumbItem } from './types';
import CreateEditorial from './Create';
import EditEditorial from './Edit';
import ShowEditorial from './Show';
import Pagination from '../../components/Pagination';

type Libro = {
  id: number;
  titulo: string;
};

type Editorial = {
  id: number;
  nombre: string;
  ciudad: string | null;
  pais: string | null;
  libros?: Libro[];
};

type FlashMessage = {
  success?: string;
  error?: string;
};

type PaginatedEditoriales = {
  data: Editorial[];
  links?: any[];
  from?: number;
  to?: number;
  total?: number;
  current_page: number;
  last_page: number;
  per_page?: number;
};

type IndexProps = {
  auth: {
    user: any;
  };
  editoriales: PaginatedEditoriales | { data: Editorial[]; total?: number };
  flash?: FlashMessage;
  errors?: Record<string, string>;
  filters?: {
    search?: string;
    ciudad?: string;
    pais?: string;
  };
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    has_pages: boolean;
  };
};

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Editoriales', href: '/editoriales' },
];

function AlertNotification({
  type,
  message,
  className = '',
  autoClose = true,
  duration = 4000,
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
  editoriales: initialEditoriales, 
  flash, 
  errors = {}, 
  filters: initialFilters = {},
  pagination
}: IndexProps) => {
  const page = usePage();

  const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    ciudad: initialFilters.ciudad || '',
    pais: initialFilters.pais || '',
  });
  const [editoriales, setEditoriales] = useState<Editorial[]>('data' in initialEditoriales ? initialEditoriales.data : initialEditoriales);

  const [alerts, setAlerts] = useState<{
    success: string | null;
    error: string | null;
    timestamp: number;
  }>({
    success: null,
    error: null,
    timestamp: 0
  });

  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Ref para controlar si ya se procesó el flash message
  const flashProcessedRef = useRef<string>('');

  // Sync editoriales with props
  useEffect(() => {
    const newEditoriales = 'data' in initialEditoriales ? initialEditoriales.data : initialEditoriales;
    setEditoriales(newEditoriales);
  }, [initialEditoriales]);

  // UseEffect mejorado para manejar flash messages
  useEffect(() => {
    if (flash) {
      const flashKey = `${flash.success || ''}-${flash.error || ''}`;
      
      // Solo procesar si es un mensaje nuevo
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

  // Función para cerrar alertas manualmente
  const handleCloseAlert = useCallback((type: 'success' | 'error') => {
    setAlerts(prev => ({
      ...prev,
      [type]: null
    }));
  }, []);

  const applyFilters = (currentSearchTerm: string, currentSelectedFilters: typeof selectedFilters): void => {
    const params = new URLSearchParams();
    if (currentSearchTerm) params.set('search', currentSearchTerm);
    if (currentSelectedFilters.ciudad) params.set('ciudad', currentSelectedFilters.ciudad);
    if (currentSelectedFilters.pais) params.set('pais', currentSelectedFilters.pais);

    router.get(`/editoriales?${params.toString()}`, {}, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const handleSearch = (value: string): void => {
    setSearchTerm(value);
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    const timeout = setTimeout(() => {
      applyFilters(value, selectedFilters);
    }, 500);
    setSearchTimeout(timeout);
  };

  const handleFilterChange = (filterType: string, value: string): void => {
    const newFilters = { ...selectedFilters, [filterType]: value };
    setSelectedFilters(newFilters);
    applyFilters(searchTerm, newFilters);
  };

  const resetFilters = (): void => {
    setSearchTerm('');
    setSelectedFilters({
      ciudad: '',
      pais: ''
    });
    router.get('/editoriales', {}, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  // Usar datos de paginación si están disponibles
  const paginationData = pagination || {
    current_page: 'current_page' in initialEditoriales ? initialEditoriales.current_page : 1,
    last_page: 'last_page' in initialEditoriales ? initialEditoriales.last_page : 1,
    per_page: 10,
    total: initialEditoriales.total || 0,
    from: 'from' in initialEditoriales ? initialEditoriales.from : null,
    to: 'to' in initialEditoriales ? initialEditoriales.to : null,
    has_pages: (initialEditoriales.total || 0) > 10
  };

  // Filtrado local solo si no hay paginación del servidor
  const filteredEditoriales = pagination ? editoriales : (searchTerm
    ? editoriales.filter(
        editorial =>
          editorial.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (editorial.ciudad && editorial.ciudad.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (editorial.pais && editorial.pais.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : editoriales);

  // Obtener ciudades y países únicos para los filtros
  const uniqueCiudades = [...new Set(editoriales.map(editorial => editorial.ciudad).filter(Boolean))] as string[];
  const uniquePaises = [...new Set(editoriales.map(editorial => editorial.pais).filter(Boolean))] as string[];

  const showAlert = (type: 'success' | 'error', message: string) => {
    console.log(`Showing alert: ${type} - ${message}`);
    setAlerts(prev => ({
      ...prev,
      [type]: message,
      timestamp: Date.now()
    }));
  };

  const renderAlerts = () => {
    console.log('Rendering alerts:', alerts);
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

  const content = (
    <div className="py-8 px-6 bg-slate-50 dark:bg-black min-h-screen">
      {renderAlerts()}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-500/5 filter blur-3xl dark:bg-blue-600/10"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-indigo-500/5 filter blur-3xl dark:bg-indigo-600/10"></div>
      </div>
      <div className="max-w-full mx-auto relative z-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Gestión de Editoriales
          </h1>
          <div className="flex gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar editoriales..."
                className="w-64 pl-10 py-2.5 pr-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                          text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                          shadow-sm transition-all duration-200"
                value={searchTerm}
                onChange={(e) => pagination ? handleSearch(e.target.value) : setSearchTerm(e.target.value)}
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm border border-gray-300 dark:border-gray-700"
            >
              <Filter className="w-5 h-5" />
              <span>Filtros</span>
            </button>

            <CreateEditorial
              onSuccess={(message) => showAlert('success', message)}
              onError={(message) => showAlert('error', message)}
              errors={errors}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Ciudad</label>
                <select
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={selectedFilters.ciudad}
                  onChange={(e) => handleFilterChange('ciudad', e.target.value)}
                >
                  <option value="">Todas las ciudades</option>
                  {uniqueCiudades.map((ciudad, index) => (
                    <option key={index} value={ciudad}>
                      {ciudad}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">País</label>
                <select
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={selectedFilters.pais}
                  onChange={(e) => handleFilterChange('pais', e.target.value)}
                >
                  <option value="">Todos los países</option>
                  {uniquePaises.map((pais, index) => (
                    <option key={index} value={pais}>
                      {pais}
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
            Mostrando {paginationData.from || 1} a {paginationData.to || filteredEditoriales.length} de {paginationData.total} resultados
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {pagination ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] table-fixed">
                <colgroup>
                  <col className="w-16" />
                  <col className="w-48" />
                  <col className="w-32" />
                  <col className="w-32" />
                  <col className="w-24" />
                </colgroup>
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="px-3 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">N°</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nombre</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ciudad</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">País</th>
                    <th className="px-4 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                  {filteredEditoriales.length > 0 ? (
                    filteredEditoriales.map((editorial, index) => (
                      <tr key={editorial.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-3 py-3 whitespace-nowrap text-center text-gray-600 dark:text-gray-400 text-sm font-medium">
                          {(paginationData.current_page - 1) * paginationData.per_page + index + 1}
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-sm max-w-xs">
                          <div className="truncate" title={editorial.nombre}>
                            {editorial.nombre}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300 text-sm">{editorial.ciudad || '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300 text-sm">{editorial.pais || '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex justify-center space-x-2">
                            <ShowEditorial editorial={editorial} />
                            <EditEditorial
                              editorial={editorial}
                              onSuccess={(message) => showAlert('success', message)}
                              onError={(message) => showAlert('error', message)}
                              errors={errors}
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        No hay editoriales disponibles
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <Pagination items={filteredEditoriales} itemsPerPage={10}>
              {(paginatedEditoriales) => (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] table-fixed">
                    <colgroup>
                      <col className="w-16" />
                      <col className="w-48" />
                      <col className="w-32" />
                      <col className="w-32" />
                      <col className="w-24" />
                    </colgroup>
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-700">
                        <th className="px-3 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nombre</th>
                        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ciudad</th>
                        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">País</th>
                        <th className="px-4 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                      {paginatedEditoriales.length > 0 ? (
                        paginatedEditoriales.map((editorial) => (
                          <tr key={editorial.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="px-3 py-3 whitespace-nowrap text-center text-gray-600 dark:text-gray-400 text-sm font-medium">{editorial.id}</td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-sm max-w-xs">
                              <div className="truncate" title={editorial.nombre}>
                                {editorial.nombre}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300 text-sm">{editorial.ciudad || '-'}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300 text-sm">{editorial.pais || '-'}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex justify-center space-x-2">
                                <ShowEditorial editorial={editorial} />
                                <EditEditorial
                                  editorial={editorial}
                                  onSuccess={(message) => showAlert('success', message)}
                                  onError={(message) => showAlert('error', message)}
                                  errors={errors}
                                />
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                            No hay editoriales disponibles
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </Pagination>
          )}
        </div>

        {/* Paginación del servidor */}
        {pagination && paginationData.has_pages && paginationData.last_page > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            {/* Información de paginación */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Página {paginationData.current_page} de {paginationData.last_page}
            </div>

            {/* Controles de paginación */}
            <div className="flex items-center space-x-2">
              {/* Botón anterior */}
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

              {/* Números de página */}
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

              {/* Botón siguiente */}
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
      <Head title="Gestión de Editoriales" />
      {content}
    </AppLayout>
  );
};

export default Index;