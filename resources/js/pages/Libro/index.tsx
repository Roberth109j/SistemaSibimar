import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Search, CheckCircle, AlertCircle, X, Filter, BookOpen, PlusCircle, Eye, Pencil, ChevronLeft, ChevronRight } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

// --- Interfaces TypeScript Mejoradas ---
interface BreadcrumbItem {
  title: string;
  href: string;
}

interface Autor {
  id: number;
  nombres: string;
  apellidos: string;
}

interface Estanteria {
  id: number;
  cod_estante: string;
}

interface Seccion {
  id: number;
  nombre: string;
}

interface Libro {
  id: number;
  isbn: string;
  titulo: string;
  sign_top?: string;
  ejemplares_count: number;
  autor?: Autor;
  estanteria?: Estanteria;
  seccion?: Seccion;
}

interface PaginatedLibros {
  data: Libro[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

interface FilterOptions {
  search?: string;
  clase?: string;
  idioma?: string;
  estanteria?: string;
}

interface LibroPageProps {
  auth?: any;
  libros: PaginatedLibros;
  clases: string[];
  idiomas: string[];
  estanterias: Estanteria[];
  filters: FilterOptions;
  seccionId?: number | null;
  flash?: {
    success?: string;
    error?: string;
  };
  errors?: Record<string, string>;
}

// --- Componente AlertNotification ---
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
  }, [message]);

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
      className={`fixed top-6 right-6 z-50 max-w-md transition-all duration-500 ease-in-out transform ${
        animateOut ? 'opacity-0 translate-x-full scale-95' : 'opacity-100 translate-x-0 scale-100'
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
                  className={`h-1 rounded-full transition-all duration-100 ${
                    type === 'success' ? 'bg-green-500' : 'bg-red-500'
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
function useLibroFilters(initialFilters: FilterOptions) {
  const [searchTerm, setSearchTerm] = useState<string>(initialFilters.search || '');
  const [selectedFilters, setSelectedFilters] = useState({
    clase: initialFilters.clase || '',
    idioma: initialFilters.idioma || '',
    estanteria: initialFilters.estanteria || ''
  });
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const applyFilters = useCallback((currentSearchTerm: string, currentSelectedFilters: typeof selectedFilters) => {
    const params: Record<string, string> = {};
    if (currentSearchTerm) params.search = currentSearchTerm;
    if (currentSelectedFilters.clase) params.clase = currentSelectedFilters.clase;
    if (currentSelectedFilters.idioma) params.idioma = currentSelectedFilters.idioma;
    if (currentSelectedFilters.estanteria) params.estanteria = currentSelectedFilters.estanteria;

    router.get('/libros', params, {
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
      clase: '',
      idioma: '',
      estanteria: ''
    });
    router.get('/libros', {}, {
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
  libros: PaginatedLibros;
  filters: FilterOptions;
}

function PaginationComponent({ libros, filters }: PaginationProps) {
  const handlePageChange = useCallback((page: number) => {
    router.get('/libros', {
      ...filters,
      page: page
    }, {
      preserveState: true,
      preserveScroll: true,
    });
  }, [filters]);

  if (libros.last_page <= 1) return null;

  return (
    <div className="mt-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Página {libros.current_page} de {libros.last_page}
      </div>

      <div className="flex items-center space-x-2">
        {/* Botón anterior */}
        <button
          onClick={() => handlePageChange(libros.current_page - 1)}
          disabled={libros.current_page <= 1}
          className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
            libros.current_page > 1
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50'
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Números de página */}
        {[...Array(libros.last_page)].map((_, index) => {
          const pageNum = index + 1;
          const maxVisiblePages = 5;
          const currentPage = libros.current_page;
          const halfVisible = Math.floor(maxVisiblePages / 2);

          let showPage = false;
          if (libros.last_page <= maxVisiblePages) {
            showPage = true;
          } else if (
            pageNum === 1 ||
            pageNum === libros.last_page ||
            (pageNum >= currentPage - halfVisible && pageNum <= currentPage + halfVisible)
          ) {
            showPage = true;
          }

          if (showPage) {
            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                  currentPage === pageNum
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {pageNum}
              </button>
            );
          } else if (
            (pageNum === 2 && currentPage > halfVisible + 1) ||
            (pageNum === libros.last_page - 1 && currentPage < libros.last_page - halfVisible)
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
          onClick={() => handlePageChange(libros.current_page + 1)}
          disabled={libros.current_page >= libros.last_page}
          className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
            libros.current_page < libros.last_page
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

// --- Componente Index Principal ---
const Index: React.FC<LibroPageProps> = ({
  auth,
  libros,
  clases,
  idiomas,
  estanterias = [],
  filters: initialFilters = {},
  seccionId,
  flash,
  errors = {}
}) => {
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
  // Usar hook personalizado para filtros
  const {
    searchTerm,
    selectedFilters,
    handleSearch,
    handleFilterChange,
    resetFilters
  } = useLibroFilters(initialFilters);

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

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Libros', href: '/libros' },
  ];

  const content = (
    <div className="py-8 px-6 bg-slate-50 dark:bg-black min-h-screen">
      {renderAlerts()}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl dark:bg-blue-600/10"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-indigo-500/5 blur-3xl dark:bg-indigo-600/10"></div>
      </div>
      <div className="max-w-full mx-auto relative z-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Gestión de Libros
          </h1>
          <div className="flex gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por título, ISBN o autor..."
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
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm border border-gray-300 dark:border-gray-700"
            >
              <Filter className="w-5 h-5" />
              <span>Filtros</span>
            </button>

            <Link
              href="/libros/create"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white
                px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg
                transform hover:-translate-y-0.5"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Nuevo Libro</span>
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
                className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
              >
                Restablecer filtros
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Clase</label>
                <select
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  value={selectedFilters.clase}
                  onChange={(e) => handleFilterChange('clase', e.target.value)}
                >
                  <option value="">Todas las clases</option>
                  {clases.map((clase: string) => (
                    <option key={clase} value={clase}>{clase}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Idioma</label>
                <select
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  value={selectedFilters.idioma}
                  onChange={(e) => handleFilterChange('idioma', e.target.value)}
                >
                  <option value="">Todos los idiomas</option>
                  {idiomas.map((idioma: string) => (
                    <option key={idioma} value={idioma}>{idioma}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Estantería</label>
                <select
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  value={selectedFilters.estanteria}
                  onChange={(e) => handleFilterChange('estanteria', e.target.value)}
                >
                  <option value="">Todas las estanterías</option>
                  {estanterias.map((estanteria: Estanteria) => (
                    <option key={estanteria.id} value={estanteria.id}>{estanteria.cod_estante}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Información de resultados */}
        {libros.total > 0 && (
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Mostrando {libros.from || 1} a {libros.to || libros.data.length} de {libros.total} resultados
          </div>
        )}

        {/* Tabla de libros */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] table-fixed">
              <colgroup>
                <col className="w-16" />
                <col className="w-32" />
                <col className="w-48" />
                <col className="w-44" />
                <col className="w-24" />
                <col className="w-24" />
                <col className="w-24" />
                <col className="w-20" />
                <col className="w-32" />
              </colgroup>
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="px-3 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">N°</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">ISBN</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Título</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Autor</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Sign. Top.</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Sección</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estantería</th>
                  <th className="px-3 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ej.Disp</th>
                  <th className="px-4 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                {libros.data.length > 0 ? (
                  libros.data.map((libro: Libro, index: number) => (
                    <tr key={libro.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-3 py-3 whitespace-nowrap text-center text-gray-600 dark:text-gray-400 text-sm font-medium">
                        {(libros.current_page - 1) * libros.per_page + index + 1}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300 font-medium text-sm">{libro.isbn}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-sm max-w-xs">
                        <div className="truncate" title={libro.titulo}>
                          {libro.titulo}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-sm max-w-xs">
                        <div className="truncate" title={libro.autor ? `${libro.autor.nombres} ${libro.autor.apellidos}` : '-'}>
                          {libro.autor ? `${libro.autor.nombres} ${libro.autor.apellidos}` : '-'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300 text-sm">{libro.sign_top || '-'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300 text-sm">
                        {libro.seccion ? libro.seccion.nombre : '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300 text-sm">
                        {libro.estanteria ? libro.estanteria.cod_estante : '-'}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-center text-gray-700 dark:text-gray-300">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                          {libro.ejemplares_count || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex justify-center space-x-2">
                          <Link
                            href={`/libros/${libro.id}`}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 
                                      transition-colors p-1 bg-blue-50 dark:bg-blue-900/30 rounded hover:bg-blue-100 dark:hover:bg-blue-800/40"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          
                          <Link
                            href={`/libros/${libro.id}/edit`}
                            className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 
                                      transition-colors p-1 bg-amber-50 dark:bg-amber-900/30 rounded hover:bg-amber-100 dark:hover:bg-amber-800/40"
                            title="Editar libro"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          
                          <Link
                            href={`/libros/${libro.id}/ejemplares`}
                            className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300
                                      transition-colors p-1 bg-purple-50 dark:bg-purple-900/30 rounded hover:bg-purple-100 dark:hover:bg-purple-800/40"
                            title="Ejemplares"
                          >
                            <BookOpen className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      No hay libros disponibles
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Paginación usando el componente mejorado */}
        <PaginationComponent libros={libros} filters={initialFilters} />
      </div>
    </div>
  );

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Gestión de Libros" />
      {content}
    </AppLayout>
  );
};

export default Index;