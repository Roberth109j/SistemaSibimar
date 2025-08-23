import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Search, CheckCircle, AlertCircle, X, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import AppLayout from '../../layouts/app-layout';
import { type BreadcrumbItem } from './types';
import CreateEstanteria from './Create';
import EditEstanteria from './Edit';
import ShowEstanteria from './Show';
import { type Estanteria } from './types';

type FlashMessage = {
  success?: string;
  error?: string;
};

type PaginatedEstanterias = {
  data: Estanteria[];
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
  estanterias: PaginatedEstanterias | { data: Estanteria[]; total?: number };
  flash?: FlashMessage;
  errors?: Record<string, string>;
  filters?: {
    search?: string;
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
  all_secciones?: Array<{ id: number; nombre: string }>;
  seccionId?: number | null;
};

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Estanterías', href: '/estanterias' },
];

// Componente para descripción expandible
const ExpandableDescription = ({ text, maxLength = 40 }: { text: string | null; maxLength?: number }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!text) return <span className="text-gray-400 italic">-</span>;
  
  if (text.length <= maxLength) {
    return (
      <div className="whitespace-pre-wrap break-words leading-relaxed">
        {text}
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      <div className={`whitespace-pre-wrap break-words leading-relaxed transition-all duration-200 ${
        isExpanded 
          ? 'max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800' 
          : 'line-clamp-2 overflow-hidden'
      }`}>
        {isExpanded ? text : `${text.substring(0, maxLength)}...`}
      </div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 
                   text-xs font-medium flex items-center gap-1 transition-colors hover:underline"
        title={isExpanded ? 'Mostrar menos' : 'Mostrar más'}
      >
        {isExpanded ? (
          <>
            <ChevronUp className="w-3 h-3" />
            Mostrar menos
          </>
        ) : (
          <>
            <ChevronDown className="w-3 h-3" />
            Mostrar más
          </>
        )}
      </button>
    </div>
  );
};

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
  estanterias, 
  flash, 
  errors = {}, 
  filters: initialFilters = {},
  pagination,
  all_secciones = [],
  seccionId = null
}: IndexProps) => {
  const page = usePage();

  const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

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

  const applyFilters = (currentSearchTerm: string): void => {
    const params = new URLSearchParams();
    if (currentSearchTerm) params.set('search', currentSearchTerm);

    router.get(`/estanterias?${params.toString()}`, {}, {
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
      applyFilters(value);
    }, 500);
    setSearchTimeout(timeout);
  };

  const resetFilters = (): void => {
    setSearchTerm('');
    router.get('/estanterias', {}, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  // Usar datos de paginación mejorados si están disponibles, sino fallback a los originales
  const paginationData = pagination || {
    current_page: 'current_page' in estanterias ? estanterias.current_page : 1,
    last_page: 'last_page' in estanterias ? estanterias.last_page : 1,
    per_page: 10,
    total: estanterias.total || 0,
    from: 'from' in estanterias ? estanterias.from : null,
    to: 'to' in estanterias ? estanterias.to : null,
    has_pages: (estanterias.total || 0) > 10
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
          />
        )}
      </>
    );
  };

  const content = (
    <div className="py-8 px-6 bg-slate-50 dark:bg-black min-h-screen">
      {renderAlerts()}
      
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-500/5 filter blur-3xl dark:bg-blue-600/10"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-indigo-500/5 filter blur-3xl dark:bg-indigo-600/10"></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Gestión de Estanterías
          </h1>
          <div className="flex gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar estanterías..."
                className="w-64 pl-10 py-2.5 pr-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                          text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                          shadow-sm transition-all duration-200"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
            <CreateEstanteria
              onSuccess={(message) => showAlert('success', message)}
              onError={(message) => showAlert('error', message)}
              errors={errors}
              all_secciones={all_secciones}
              seccionId={seccionId}
            />
          </div>
        </div>

        {/* Información de resultados */}
        {paginationData.total > 0 && (
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Mostrando {paginationData.from || 1} a {paginationData.to || estanterias.data.length} de {paginationData.total} resultados
          </div>
        )}
        
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] table-fixed">
              <colgroup>
                <col className="w-16" />
                <col className="w-32" />
                <col className="w-32" />
                <col className="w-48" />
                <col className="w-28" />
              </colgroup>
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="px-4 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">N°</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Código</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Sección</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Descripción</th>
                  <th className="px-4 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {estanterias.data.length > 0 ? (
                  estanterias.data.map((estanteria) => (
                    <tr key={estanteria.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-3 py-3 whitespace-nowrap text-center text-gray-600 dark:text-gray-400 text-sm font-medium">
                        {estanteria.position}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-sm max-w-xs">
                        <div className="truncate" title={estanteria.cod_estante}>
                          {estanteria.cod_estante}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-sm">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {estanteria.seccion?.nombre || 'Sin sección'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-sm align-top">
                        <ExpandableDescription text={estanteria.descripcion} maxLength={50} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex justify-center space-x-2">
                          <ShowEstanteria estanteria={estanteria} />
                          <EditEstanteria
                            estanteria={estanteria}
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
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      No hay estanterías disponibles
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
            {/* Información de paginación */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Página {paginationData.current_page} de {paginationData.last_page}
            </div>

            {/* Controles de paginación */}
            <div className="flex items-center space-x-2">
              {/* Botón anterior */}
              <Link
                href={paginationData.current_page > 1 ? 
                  `/estanterias?${new URLSearchParams({
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
                preserveScroll
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
                      href={`/estanterias?${new URLSearchParams({
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
                  `/estanterias?${new URLSearchParams({
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
      <Head title="Gestión de Estanterías" />
      {content}
    </AppLayout>
  );
};

export default Index;