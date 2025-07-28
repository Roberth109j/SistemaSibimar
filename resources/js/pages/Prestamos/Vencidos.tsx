import { useState, useEffect, useCallback } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Search, Calendar, BookX, Filter, X, CheckCircle, Clock, User, Book, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
// @ts-ignore
import debounce from 'lodash/debounce';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Préstamos',
    href: '/prestamos',
  },
  {
    title: 'Vencidos',
    href: '/prestamos/vencidos',
  },
];

interface Prestamo {
  id: number;
  ejemplar: {
    id: number;
    codigo: string;
    numEjemplar?: number;
    libro: {
      titulo: string;
      isbn?: string;
    };
  };
  lector: {
    id: number;
    nombre: string;
    codigo: string;
    grado?: {
      nombre: string;
    };
  };
  fecha_prestamo: string;
  fecha_devolucion: string;
  estado: string;
  dias_retraso?: number;
}

interface PaginationLinks {
  url: string | null;
  label: string;
  active: boolean;
}

interface Props {
  prestamos: {
    data: Prestamo[];
    current_page: number;
    per_page: number;
    last_page: number;
    total: number;
    from: number;
    to: number;
    links: PaginationLinks[];
  };
  filters?: {
    search?: string;
    dias_vencido?: string;
  };
  search_stats?: {
    total_found: number;
    has_filters: boolean;
    search_term: string;
    dias_filter: string;
  };
}

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

  const Icon = type === 'success' ? CheckCircle : AlertTriangle;

  return (
    <div className={`fixed top-6 right-6 z-50 ${animateOut ? 'opacity-0 translate-x-20' : 'opacity-100 translate-x-0'} transition-all duration-500 ease-in-out transform ${className}`}>
      <div
        className={`max-w-md rounded-lg shadow-xl border-l-4 
                    ${colors[type].light.border} ${colors[type].dark.border}
                    ${colors[type].light.bg} ${colors[type].dark.bg} 
                    flex items-start p-5 transition-all duration-300`}
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

export default function Vencidos({ prestamos, filters, search_stats }: Props) {
  const { props: pageProps } = usePage();
  const currentFilters = (pageProps.filters as Props['filters']) || {};

  const [searchTerm, setSearchTerm] = useState(currentFilters.search || '');
  const [showFilters, setShowFilters] = useState(false);
  const [diasVencido, setDiasVencido] = useState(currentFilters.dias_vencido || '');
  const [isSearching, setIsSearching] = useState(false);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [prestamoSeleccionado, setPrestamoSeleccionado] = useState<number | null>(null);
  const [fechaDevuelto, setFechaDevuelto] = useState('');
  const [observaciones, setObservaciones] = useState('');

  const [alerts, setAlerts] = useState<{
    success: string | null;
    error: string | null;
    timestamp: number;
  }>({
    success: null,
    error: null,
    timestamp: 0
  });

  // Función para búsqueda global con debounce
  const debouncedGlobalSearch = useCallback(
    debounce((searchValue: string) => {
      setIsSearching(true);

      const searchParams = {
        search: searchValue.trim() || undefined,
        dias_vencido: diasVencido || undefined,
        page: undefined
      };

      router.get('/prestamos/vencidos', searchParams, {
        preserveState: true,
        preserveScroll: false,
        replace: false,
        onSuccess: (page) => {
          const responseFilters = (page.props.filters as Props['filters']);
          const responseStats = (page.props.search_stats as Props['search_stats']);
          const responsePrestamos = (page.props.prestamos as Props['prestamos']);

          if (responseFilters?.search !== searchValue.trim()) {
            console.warn('El servidor no devolvió el término de búsqueda esperado:', {
              expected: searchValue.trim(),
              received: responseFilters?.search
            });
          }

          setIsSearching(false);
        },
        onError: (errors) => {
          console.error("Error en búsqueda global:", errors);
          setIsSearching(false);
          setAlerts({
            success: null,
            error: 'Error al realizar la búsqueda global. Por favor, intente de nuevo.',
            timestamp: Date.now()
          });
        }
      });
    }, 600),
    [diasVencido]
  );

  // Función para manejar cambios en el input de búsqueda
  const handleGlobalSearch = useCallback((value: string) => {
    setSearchTerm(value);

    // Si el valor está vacío, limpiar búsqueda inmediatamente
    if (!value.trim()) {
      setIsSearching(true);
      router.get('/prestamos/vencidos', {
        dias_vencido: diasVencido || undefined
      }, {
        preserveState: true,
        preserveScroll: false,
        replace: false,
        onSuccess: () => {
          setIsSearching(false);
        },
        onError: () => {
          setIsSearching(false);
          setAlerts({
            success: null,
            error: 'Error al limpiar la búsqueda. Por favor, intente de nuevo.',
            timestamp: Date.now()
          });
        }
      });
    } else {
      debouncedGlobalSearch(value);
    }
  }, [diasVencido, debouncedGlobalSearch]);

  // Inicialización
  useEffect(() => {
    setSearchTerm(currentFilters.search || '');
    setDiasVencido(currentFilters.dias_vencido || '');
  }, []);

  // Sincronización con el servidor
  useEffect(() => {
    if (!isSearching) {
      const serverSearch = filters?.search || '';
      const currentSearch = searchTerm || '';

      if (serverSearch !== currentSearch) {
        if (serverSearch === '' && currentSearch !== '') {
          // El servidor devolvió búsqueda vacía, pero tenemos término local
          // No actualizar para evitar pérdida de datos
        } else {
          setSearchTerm(serverSearch);
        }
      }
    }

    setDiasVencido(filters?.dias_vencido || '');
  }, [filters, isSearching]);

  // Limpiar debounce al desmontar
  useEffect(() => {
    return () => {
      debouncedGlobalSearch.cancel();
    };
  }, [debouncedGlobalSearch]);

  const handleDevolucion = (prestamoId: number) => {
    setPrestamoSeleccionado(prestamoId);
    setFechaDevuelto(new Date().toISOString().split('T')[0]);
    setObservaciones('');
    setModalAbierto(true);
  };

  const confirmarDevolucion = () => {
    if (!prestamoSeleccionado || !fechaDevuelto) return;

    const currentParams = {
      search: searchTerm.trim() || undefined,
      dias_vencido: diasVencido || undefined,
      page: prestamos.current_page
    };

    router.post(`/prestamos/${prestamoSeleccionado}/devolver-vencido`, {
      fecha_devuelto: fechaDevuelto,
      observaciones: observaciones,
      ...currentParams
    }, {
      onSuccess: () => {
        setModalAbierto(false);
        setAlerts({
          success: 'Préstamo devuelto exitosamente',
          error: null,
          timestamp: Date.now()
        });
      },
      onError: (errors) => {
        console.error("Error al devolver el préstamo:", errors);
        setModalAbierto(false);
        setAlerts({
          success: null,
          error: 'Hubo un error al devolver el préstamo. Por favor, intente de nuevo.',
          timestamp: Date.now()
        });
      }
    });
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setPrestamoSeleccionado(null);
    setFechaDevuelto('');
    setObservaciones('');
  };

  const handleFilterChange = (dias: string) => {
    setDiasVencido(dias);
    setIsSearching(true);
    router.get(
      '/prestamos/vencidos',
      {
        search: searchTerm.trim() || undefined,
        dias_vencido: dias || undefined
      },
      {
        preserveState: true,
        preserveScroll: false,
        onSuccess: () => {
          setIsSearching(false);
        },
        onError: () => {
          setIsSearching(false);
          setAlerts({
            success: null,
            error: 'Error al aplicar los filtros. Por favor, intente de nuevo.',
            timestamp: Date.now()
          });
        }
      }
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDiasVencido('');
    setIsSearching(true);

    debouncedGlobalSearch.cancel();

    router.visit('/prestamos/vencidos', {
      method: 'get',
      data: {},
      preserveState: false,
      preserveScroll: false,
      replace: true,
      onSuccess: () => {
        setIsSearching(false);
        setShowFilters(false);
      },
      onError: () => {
        setIsSearching(false);
        setAlerts({
          success: null,
          error: 'Error al restablecer los filtros. Por favor, intente de nuevo.',
          timestamp: Date.now()
        });
      }
    });
  };

  const calcularDiasVencido = (fechaDevolucion: string) => {
    if (!fechaDevolucion) return 0;

    try {
      const devDate = new Date(fechaDevolucion + 'T00:00:00Z');
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      const dias = differenceInDays(today, devDate);
      return dias > 0 ? dias : 0;
    } catch (error) {
      console.error('Error calculando días vencidos:', error);
      return 0;
    }
  };

  const getSeverityColor = (dias: number) => {
    if (dias >= 30) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    if (dias >= 15) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
    if (dias >= 7) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
  };

  const goToPage = (url: string | null) => {
    if (!url) return;

    const urlObj = new URL(url, window.location.origin);
    const page = urlObj.searchParams.get('page');

    setIsSearching(true);
    router.get('/prestamos/vencidos',
      {
        search: searchTerm.trim() || undefined,
        dias_vencido: diasVencido || undefined,
        page: page || '1'
      },
      {
        preserveState: true,
        preserveScroll: true,
        onSuccess: () => {
          setIsSearching(false);
        },
        onError: () => {
          setIsSearching(false);
          setAlerts({
            success: null,
            error: 'Error al cambiar de página. Por favor, intente de nuevo.',
            timestamp: Date.now()
          });
        }
      }
    );
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

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Préstamos Vencidos" />

      <div className="py-8 px-6 bg-slate-50 dark:bg-black min-h-screen">
        {renderAlerts()}

        {/* Fondo decorativo */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-500/5 filter blur-3xl dark:bg-blue-600/10"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-indigo-500/5 filter blur-3xl dark:bg-indigo-600/10"></div>
        </div>

        <div className="max-w-full mx-auto relative z-10 px-2 sm:px-4 lg:px-6">
          {/* Header mejorado */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Préstamos Vencidos
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Gestión de préstamos con fechas de devolución vencidas
                </p>
                {search_stats?.has_filters && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                      🔍 Búsqueda activa
                    </span>
                    {search_stats.search_term && (
                      <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                        "{search_stats.search_term}"
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="🔍 Buscar GLOBALMENTE: nombre del lector, código o título del libro..."
                  className="w-full sm:w-96 pl-10 py-2.5 pr-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                            text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                            shadow-sm transition-all duration-200"
                  value={searchTerm}
                  onChange={(e) => {
                    handleGlobalSearch(e.target.value);
                  }}
                  disabled={isSearching}
                />
                <Search className={`w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 ${isSearching ? 'text-blue-500 animate-spin' : 'text-gray-400'
                  }`} />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm border border-gray-300 dark:border-gray-700"
              >
                <Filter className="w-5 h-5" />
                <span>Filtros</span>
              </button>

              <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-blue-700 dark:text-blue-300 font-medium">
                  {search_stats?.has_filters ? search_stats.total_found : prestamos.total} vencidos
                  {search_stats?.has_filters && search_stats.total_found !== prestamos.total && (
                    <span className="text-xs ml-1 opacity-75">
                      (de {prestamos.total} total)
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Panel de filtros mejorado */}
          {showFilters && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border border-gray-100 dark:border-gray-700 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Filtros avanzados</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  disabled={isSearching}
                >
                  Restablecer filtros
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Días vencidos</label>
                  <select
                    value={diasVencido}
                    onChange={(e) => handleFilterChange(e.target.value)}
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSearching}
                  >
                    <option value="">Todos los vencidos</option>
                    <option value="7">7 días o más</option>
                    <option value="15">15 días o más</option>
                    <option value="30">30 días o más</option>
                  </select>
                </div>

                {/* Información de búsqueda activa */}
                {search_stats?.has_filters && (
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Estado de búsqueda</label>
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700">
                      <div className="text-sm text-blue-800 dark:text-blue-200">
                        ✅ Búsqueda activa: {search_stats.total_found} resultados encontrados
                        {search_stats.search_term && (
                          <div className="text-xs mt-1 opacity-75">
                            Término: "{search_stats.search_term}"
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSearching}
                >
                  Limpiar
                </button>
              </div>
            </div>
          )}

          {/* Información de resultados mejorada */}
          {prestamos.total > 0 && (
            <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">
                    Mostrando {prestamos.from || 0} a {prestamos.to || 0} de {prestamos.total} préstamos vencidos
                  </span>
                  {search_stats?.has_filters && (
                    <span className="block sm:inline sm:ml-1 text-blue-600 dark:text-blue-400">
                      🔍 Búsqueda global activa
                    </span>
                  )}
                </div>

                {(searchTerm?.trim() || diasVencido) && (
                  <div className="flex flex-wrap gap-2">
                    {searchTerm?.trim() && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                        <Search className="w-3 h-3" />
                        "{searchTerm}"
                      </span>
                    )}
                    {diasVencido && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-xs">
                        <Calendar className="w-3 h-3" />
                        {diasVencido}+ días
                      </span>
                    )}
                    <button
                      onClick={clearFilters}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full text-xs transition-colors"
                      disabled={isSearching}
                    >
                      <X className="w-3 h-3" />
                      Limpiar
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tabla de préstamos vencidos mejorada */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 relative">
            {isSearching && (
              <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
                <div className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Buscando en toda la base de datos...
                  </span>
                </div>
              </div>
            )}

            <div className="overflow-hidden">
              <table className="w-full table-fixed">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="w-1/5 px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                      Lector
                    </th>
                    <th className="w-1/5 px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                      Libro
                    </th>
                    <th className="w-20 px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                      Ejemplar
                    </th>
                    <th className="w-24 px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                      Fecha Préstamo
                    </th>
                    <th className="w-24 px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                      Fecha Vencimiento
                    </th>
                    <th className="w-24 px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                      Días Vencido
                    </th>
                    <th className="w-24 px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {prestamos.data.length > 0 ? (
                    prestamos.data.filter(prestamo => prestamo != null).map((prestamo) => {
                      const diasVencidos = prestamo.dias_retraso || calcularDiasVencido(prestamo?.fecha_devolucion || '');
                      return (
                        <tr key={prestamo?.id || Math.random()} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="px-6 py-3">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                                <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 break-words">
                                  {prestamo?.lector?.nombre || 'Sin nombre'}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 break-words">
                                  Código: {prestamo?.lector?.codigo || 'Sin código'}
                                </div>
                                {prestamo?.lector?.grado?.nombre && (
                                  <div className="text-xs text-blue-600 dark:text-blue-400 break-words">
                                    {prestamo.lector.grado.nombre}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-3">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                                <Book className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 break-words">
                                  {prestamo?.ejemplar?.libro?.titulo || 'Sin título'}
                                </div>
                                {prestamo?.ejemplar?.libro?.isbn && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400 break-words">
                                    ISBN: {prestamo.ejemplar.libro.isbn}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap">
                            <span className="text-sm font-mono text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                              #{prestamo?.ejemplar?.numEjemplar || 'Sin ejemplar'}
                            </span>
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300 font-medium text-sm">
                            {prestamo?.fecha_prestamo ? format(new Date(prestamo.fecha_prestamo + 'T00:00:00Z'), 'dd/MM/yyyy', { locale: es }) : 'Sin fecha'}
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300 font-medium text-sm">
                            {prestamo?.fecha_devolucion ? format(new Date(prestamo.fecha_devolucion + 'T00:00:00Z'), 'dd/MM/yyyy', { locale: es }) : 'Sin fecha'}
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(diasVencidos)}`}>
                              <Clock className="w-3 h-3 mr-1" />
                              {diasVencidos} días
                            </span>
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap">
                            <button
                              onClick={() => handleDevolucion(prestamo?.id || 0)}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition-colors duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={!prestamo?.id || isSearching}
                            >
                              <CheckCircle className="w-3 h-3" />
                              Devolver
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center">
                        <div className="flex flex-col items-center">
                          <BookX className="w-12 h-12 text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            {search_stats?.has_filters ? 'No se encontraron resultados' : 'No hay préstamos vencidos'}
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
                            {searchTerm?.trim()
                              ? `No se encontraron préstamos vencidos que coincidan con "${searchTerm}" en toda la base de datos.`
                              : diasVencido
                                ? 'No se encontraron préstamos vencidos con los filtros de días especificados.'
                                : 'No se encontraron préstamos vencidos en el sistema.'
                            }
                          </p>
                          {(searchTerm?.trim() || diasVencido) && (
                            <button
                              onClick={clearFilters}
                              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
                              disabled={isSearching}
                            >
                              Mostrar todos los préstamos vencidos
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Paginación mejorada */}
          {prestamos.links && prestamos.links.length > 3 && (
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              {/* Información de paginación mejorada */}
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {prestamos.total > 0 && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span>
                      Mostrando {prestamos.from || 0} a {prestamos.to || 0} de {prestamos.total} préstamos vencidos
                    </span>
                    {search_stats?.has_filters && (
                      <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                        🔍 Resultados de búsqueda global
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Controles de paginación */}
              <div className="flex items-center space-x-2">
                {prestamos.links.map((link: any, index: number) => {
                  // Botón anterior
                  if (link.label.includes('Previous') || link.label.includes('Anterior') || link.label === '&laquo;') {
                    return (
                      <button
                        key={index}
                        onClick={() => goToPage(link.url)}
                        disabled={!link.url || isSearching}
                        className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${link.url && !isSearching
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50'
                          }`}
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                    );
                  }

                  // Botón siguiente
                  if (link.label.includes('Next') || link.label.includes('Siguiente') || link.label === '&raquo;') {
                    return (
                      <button
                        key={index}
                        onClick={() => goToPage(link.url)}
                        disabled={!link.url || isSearching}
                        className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${link.url && !isSearching
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50'
                          }`}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    );
                  }

                  // Números de página y puntos suspensivos
                  if (!link.label.includes('Previous') && !link.label.includes('Next') &&
                    !link.label.includes('Anterior') && !link.label.includes('Siguiente') &&
                    link.label !== '&laquo;' && link.label !== '&raquo;') {

                    // Si es "..." 
                    if (link.label === '...') {
                      return (
                        <span key={index} className="flex items-center justify-center w-10 h-10 text-sm font-medium text-gray-500 dark:text-gray-400">
                          ...
                        </span>
                      );
                    }

                    // Número de página
                    return (
                      <button
                        key={index}
                        onClick={() => goToPage(link.url)}
                        disabled={isSearching}
                        className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-colors ${link.active
                          ? 'bg-blue-600 text-white shadow-md'
                          : isSearching
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                          }`}
                      >
                        {link.label}
                      </button>
                    );
                  }

                  return null;
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Devolución */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={cerrarModal} />
          <div className="relative w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Confirmar Devolución
                </h3>
                <button
                  onClick={cerrarModal}
                  className="w-8 h-8 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors duration-200"
                >
                  <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fecha de Devolución
                  </label>
                  <input
                    type="date"
                    value={fechaDevuelto}
                    onChange={(e) => setFechaDevuelto(e.target.value)}
                    className="w-full px-3 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Observaciones
                  </label>
                  <textarea
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Agregar observaciones (opcional)..."
                    className="w-full px-3 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={cerrarModal}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarDevolucion}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Confirmar Devolución
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}