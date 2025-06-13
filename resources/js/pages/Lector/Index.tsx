import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Search, CheckCircle, AlertCircle, X, Plus, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import AppLayout from '../../layouts/app-layout';
import { type BreadcrumbItem, type Lector, type Grado } from './types';
import ShowLector from './Show';

type FlashMessage = {
  success?: string;
  error?: string;
};

type PaginatedLectors = {
  data: Lector[];
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
  lectores: PaginatedLectors | { data: Lector[]; total?: number };
  flash?: FlashMessage;
  errors?: Record<string, string>;
  filters?: {
    search?: string;
    tipo?: string;
    subgrado?: string;
    estado?: string;
  };
  grados?: Grado[];
  // Nuevos props del backend mejorado
  perPageOptions?: number[];
  currentPerPage?: number;
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
  { title: 'Lectores', href: '/lectores' },
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
  lectores, 
  flash, 
  errors = {}, 
  filters: initialFilters = {}, 
  grados = [],
  perPageOptions = [10, 25, 50, 100],
  currentPerPage = 10,
  pagination
}: IndexProps) => {
  const page = usePage();

  const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    tipo: initialFilters.tipo || '',
    subgrado: initialFilters.subgrado || '',
    estado: initialFilters.estado || '',
  });

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

  useEffect(() => {
    if (flash) {
      setAlerts({
        success: flash.success || null,
        error: flash.error || null,
        timestamp: Date.now()
      });
    }
  }, [flash, page.props.flash]);

  const applyFilters = (currentSearchTerm: string, currentSelectedFilters: typeof selectedFilters, perPage?: number): void => {
    const params = new URLSearchParams();
    if (currentSearchTerm) params.set('search', currentSearchTerm);
    if (currentSelectedFilters.tipo) params.set('tipo', currentSelectedFilters.tipo);
    if (currentSelectedFilters.subgrado) params.set('subgrado', currentSelectedFilters.subgrado);
    if (currentSelectedFilters.estado) params.set('estado', currentSelectedFilters.estado);
    if (perPage) params.set('per_page', perPage.toString());

    router.get(`/lectores?${params.toString()}`, {}, {
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

  const handlePerPageChange = (newPerPage: number): void => {
    applyFilters(searchTerm, selectedFilters, newPerPage);
  };

  const resetFilters = (): void => {
    setSearchTerm('');
    setSelectedFilters({
      tipo: '',
      subgrado: '',
      estado: ''
    });
    router.get('/lectores', {}, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  // Obtener lista única de subgrados para el filtro
  const uniqueSubgrados = [...new Set(grados?.map(grado => grado.subGrado).filter(Boolean))];

  // Usar datos de paginación mejorados si están disponibles, sino fallback a los originales
  const paginationData = pagination || {
    current_page: 'current_page' in lectores ? lectores.current_page : 1,
    last_page: 'last_page' in lectores ? lectores.last_page : 1,
    per_page: currentPerPage,
    total: lectores.total || 0,
    from: 'from' in lectores ? lectores.from : null,
    to: 'to' in lectores ? lectores.to : null,
    has_pages: (lectores.total || 0) > currentPerPage
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

  const content = (
    <div className="py-8 px-6 bg-slate-50 dark:bg-black min-h-screen">
      {renderAlerts()}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-500/5 filter blur-3xl dark:bg-blue-600/10"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-indigo-500/5 filter blur-3xl dark:bg-indigo-600/10"></div>
      </div>
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Gestión de Lectores
          </h1>
          <div className="flex gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar lectores..."
                className="w-64 pl-10 py-2.5 pr-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                          text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                          shadow-sm transition-all duration-200"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm border border-gray-300 dark:border-gray-700"
            >
              <Filter className="w-5 h-5" />
              <span>Filtros</span>
            </button>

            <Link
              href={route('lectores.create')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white 
                        px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg
                        transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              <span>Nuevo Lector</span>
            </Link>
          </div>
        </div>

        {/* Panel de filtros */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border border-gray-100 dark:border-gray-700 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Filtros avanzados</h3>
              <button
                onClick={resetFilters}
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Restablecer filtros
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tipo</label>
                <select
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={selectedFilters.tipo}
                  onChange={(e) => handleFilterChange('tipo', e.target.value)}
                >
                  <option value="">Todos los tipos</option>
                  <option value="ESTUDIANTE">Estudiante</option>
                  <option value="DOCENTE">Docente</option>
                  <option value="OTRO">Otro</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">SubGrado</label>
                <select
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={selectedFilters.subgrado}
                  onChange={(e) => handleFilterChange('subgrado', e.target.value)}
                >
                  <option value="">Todos los subgrados</option>
                  {uniqueSubgrados.map((subgrado, index) => (
                    <option key={index} value={subgrado}>
                      {subgrado}
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
                  <option value="ACTIVO">Activo</option>
                  <option value="INACTIVO">Inactivo</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Información de resultados mejorada */}
        {paginationData.total > 0 && (
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Mostrando {paginationData.from || 1} a {paginationData.to || lectores.data.length} de {paginationData.total} resultados
          </div>
        )}

        {/* Tabla */}
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Código</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Nombre</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Tipo</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">SubGrado</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Estado</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {lectores.data.length > 0 ? (
                  lectores.data.map((lector) => (
                    <tr key={lector.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-3 whitespace-nowrap">
                        <span className="text-sm font-mono text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          {lector.codigo}
                        </span>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300 font-medium text-sm">{lector.nombre}</td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          lector.tipo === 'ESTUDIANTE' 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' 
                            : lector.tipo === 'DOCENTE'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                            : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                        }`}>
                          {lector.tipo}
                        </span>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300 text-sm">
                        {lector.grado?.subGrado || '—'}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          lector.estado === 'ACTIVO' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {lector.estado}
                        </span>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <ShowLector lector={lector} />
                          <Link
                            href={route('lectores.edit', lector.id)}
                            className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 
                                      transition-colors p-1 bg-amber-50 dark:bg-amber-900/30 rounded hover:bg-amber-100 dark:hover:bg-amber-800/40"
                            title="Editar"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      No hay lectores disponibles
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Paginación mejorada y más robusta */}
        {paginationData.has_pages && paginationData.last_page > 1 && (
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
      <Head title="Gestión de Lectores" />
      {content}
    </AppLayout>
  );
};

export default Index;