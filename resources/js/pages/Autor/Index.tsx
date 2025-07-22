import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Search, CheckCircle, AlertCircle, X, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';
import AppLayout from '../../layouts/app-layout';
import { type BreadcrumbItem } from './types';
import CreateAutor from './Create';
import EditAutor from './Edit';
import ShowAutor from './Show';

type Libro = {
  id: number;
  titulo: string;
};

type Autor = {
  id: number;
  nombres: string;
  apellidos: string;
  created_at?: string;
  updated_at?: string;
  libros?: Libro[];
};

type FlashMessage = {
  success?: string;
  error?: string;
};

type PaginatedAutores = {
  data: Autor[];
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
  autores: PaginatedAutores | { data: Autor[]; total?: number };
  flash?: FlashMessage;
  errors?: Record<string, string>;
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    has_pages: boolean;
  };
  sort_order?: string;
  search?: string;
  start_number?: number;
};

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Autores', href: '/autores' },
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
  autores, 
  flash, 
  errors = {},
  pagination,
  sort_order = 'asc', // Por defecto A-Z
  search = '',
  start_number = 0
}: IndexProps) => {
  const page = usePage();
  const [searchTerm, setSearchTerm] = useState(search);

  const [alerts, setAlerts] = useState<{
    success: string | null;
    error: string | null;
    timestamp: number;
  }>({
    success: null,
    error: null,
    timestamp: 0
  });

  useEffect(() => {
    if (flash) {
      setAlerts({
        success: flash.success || null,
        error: flash.error || null,
        timestamp: Date.now()
      });
    }
  }, [flash, page.props.flash]);

  // Debounce para la búsqueda automática
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const currentParams = new URLSearchParams(window.location.search);
      
      if (searchTerm.trim() !== search) {
        if (searchTerm.trim()) {
          currentParams.set('search', searchTerm.trim());
        } else {
          currentParams.delete('search');
        }
        
        // Resetear a primera página al buscar
        currentParams.set('page', '1');
        
        // Navegar con Inertia.js
        router.visit(`${window.location.pathname}?${currentParams.toString()}`, {
          preserveState: true,
          preserveScroll: true
        });
      }
    }, 500); // 500ms de delay

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, search]);

  // Función para manejar el ordenamiento - SOLO APELLIDOS
  const handleSort = () => {
    const currentParams = new URLSearchParams(window.location.search);
    
    // Alternar entre asc y desc
    const newOrder = sort_order === 'asc' ? 'desc' : 'asc';
    currentParams.set('sort_order', newOrder);
    
    // Resetear a primera página al cambiar ordenamiento
    currentParams.set('page', '1');
    
    // Navegar con Inertia.js
    router.visit(`${window.location.pathname}?${currentParams.toString()}`, {
      preserveState: true,
      preserveScroll: true
    });
  };

  // Función para obtener el ícono de ordenamiento
  const getSortIcon = () => {
    return sort_order === 'asc' ? (
      <ChevronUp className="w-4 h-4 text-blue-600" />
    ) : (
      <ChevronDown className="w-4 h-4 text-blue-600" />
    );
  };

  // Usar datos de paginación si están disponibles, sino fallback a los originales
  const paginationData = pagination || {
    current_page: 'current_page' in autores ? autores.current_page : 1,
    last_page: 'last_page' in autores ? autores.last_page : 1,
    per_page: 10,
    total: autores.total || 0,
    from: 'from' in autores ? autores.from : null,
    to: 'to' in autores ? autores.to : null,
    has_pages: (autores.total || 0) > 10
  };
  
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
            duration={7000}
          />
        )}
      </>
    );
  };

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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Gestión de Autores
          </h1>
            <div className="flex gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar autores..."
                  className="w-64 pl-10 py-2.5 pr-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                            text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                            shadow-sm transition-all duration-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>

              <CreateAutor
                onSuccess={(message) => showAlert('success', message)}
                onError={(message) => showAlert('error', message)}
                errors={errors}
              />
            </div>
        </div>

        {/* Información de resultados */}
        {paginationData.total > 0 && (
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Mostrando {paginationData.from || 1} a {paginationData.to || autores.data.length} de {paginationData.total} resultados
          </div>
        )}
        
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] table-fixed">
              <colgroup>
                <col className="w-16" />
                <col className="w-32" />
                <col className="w-32" />
                <col className="w-40" />
                <col className="w-28" />
              </colgroup>
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="px-3 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    N°
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nombres</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    <button
                      onClick={handleSort}
                      className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      APELLIDOS
                      {getSortIcon()}
                    </button>
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nombre Completo</th>
                  <th className="px-4 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {autores.data.length > 0 ? (
                  autores.data.map((autor, index) => (
                    <tr key={autor.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-3 py-3 whitespace-nowrap text-center text-gray-600 dark:text-gray-400 text-sm font-medium">
                        {start_number + index + 1}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-sm max-w-xs">
                        <div className="truncate" title={autor.nombres}>
                          {autor.nombres}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-sm max-w-xs">
                        <div className="truncate" title={autor.apellidos}>
                          {autor.apellidos}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-sm max-w-xs">
                        <div className="truncate" title={`${autor.nombres} ${autor.apellidos}`}>
                          {`${autor.nombres} ${autor.apellidos}`}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex justify-center space-x-2">
                          <ShowAutor 
                            autor={autor} 
                            position={start_number + index + 1}
                          />
                          <EditAutor
                            autor={autor}
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
                      No hay autores disponibles
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
      <Head title="Gestión de Autores" />
      {content}
    </AppLayout>
  );
};

export default Index;