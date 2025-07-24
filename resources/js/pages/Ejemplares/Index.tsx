import React, { useState, useCallback, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye, Pencil, BookOpen, PlusCircle, ArrowLeft, CheckCircle, Package, Tag, Search, X, AlertCircle } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, EjemplarPageProps, ESTADO } from './types';

// Constantes
const getBreadcrumbs = (libroId: number, libroTitulo: string): BreadcrumbItem[] => [
  {
    title: 'Dashboard',
    href: '/dashboard',
  },
  {
    title: 'Libros',
    href: '/libros',
  },
  {
    title: libroTitulo,
    href: '/libros',
  },
  {
    title: 'Ejemplares',
    href: `/libros/${libroId}/ejemplares`,
  },
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

export default function Index({ auth, libro, ejemplares = [], search = '', success }: EjemplarPageProps) {
  const page = usePage();
  const breadcrumbs = getBreadcrumbs(libro.id, libro.titulo);
  const [searchTerm, setSearchTerm] = useState<string>(search);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Estado para las alertas
  const [alerts, setAlerts] = useState<{
    success: string | null;
    error: string | null;
    timestamp: number;
  }>({
    success: null,
    error: null,
    timestamp: 0
  });

  // Detectar mensajes flash y mostrar notificaciones
  useEffect(() => {
    if (success) {
      setAlerts({
        success: success,
        error: null,
        timestamp: Date.now()
      });
    }
    
    // También detectar mensajes flash del page props
    if (page.props.flash) {
      const flash = page.props.flash as any;
      setAlerts({
        success: flash.success || null,
        error: flash.error || null,
        timestamp: Date.now()
      });
    }
  }, [success, page.props.flash]);

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case ESTADO.DISPONIBLE:
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      case ESTADO.PRESTADO:
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
    }
  };

  // Función para manejar la búsqueda con debounce más rápido
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    
    // Limpiar timeout anterior
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Si el campo está vacío, buscar inmediatamente
    if (!value.trim()) {
      router.get(route('ejemplares.index', libro.id), {}, {
        preserveState: true,
        preserveScroll: true,
      });
      return;
    }

    // Para números, usar un debounce más corto
    const timeout = setTimeout(() => {
      const params: Record<string, string> = {};
      if (value.trim()) {
        params.search = value.trim();
      }

      router.get(route('ejemplares.index', libro.id), params, {
        preserveState: true,
        preserveScroll: true,
      });
    }, 150); // Reducido de 500ms a 150ms

    setSearchTimeout(timeout);
  }, [libro.id, searchTimeout]);

  // Función para limpiar búsqueda
  const clearSearch = () => {
    setSearchTerm('');
    router.get(route('ejemplares.index', libro.id), {}, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  // Función para búsqueda instantánea al presionar Enter
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // Limpiar timeout si existe
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      // Buscar inmediatamente
      const params: Record<string, string> = {};
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      router.get(route('ejemplares.index', libro.id), params, {
        preserveState: true,
        preserveScroll: true,
      });
    }
  };
  
  // Cleanup del timeout cuando el componente se desmonte
  React.useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  // Función para renderizar las alertas
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
            duration={7000}
          />
        )}
      </>
    );
  };

  return (
    <AppLayout
      breadcrumbs={breadcrumbs}
      renderHeader={() => (
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Ejemplares de {libro.titulo}
          </h2>
        </div>
      )}
    >
      <Head title={`Ejemplares - ${libro.titulo}`} />

      <div className="py-8 px-6 bg-slate-50 dark:bg-black min-h-screen">
        {/* Renderizar alertas */}
        {renderAlerts()}

        {/* Efectos de fondo decorativos */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-500/5 filter blur-3xl dark:bg-blue-600/10"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-indigo-500/5 filter blur-3xl dark:bg-indigo-600/10"></div>
        </div>

        <div className="max-w-full mx-auto relative z-10">

          {/* Header con información del libro, buscador y botón de acción */}
          <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {libro.titulo}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Gestión de ejemplares disponibles
                  </p>
                </div>
              </div>

              {/* Buscador y botón */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Buscador por número de ejemplar */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    min="1"
                    placeholder="Buscar por N° ejemplar..."
                    className="block w-full sm:w-64 pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg 
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                               shadow-sm transition-all duration-200
                               [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  {searchTerm && (
                    <button
                      onClick={clearSearch}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      title="Limpiar búsqueda"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <Link 
                  href={route('ejemplares.create', libro.id)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white
                    px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg
                    transform hover:-translate-y-0.5 font-semibold whitespace-nowrap"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>Registrar Nuevo Ejemplar</span>
                </Link>
              </div>
            </div>

            {/* Indicador de búsqueda activa */}
            {searchTerm && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Search className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                      Buscando ejemplar #{searchTerm}
                    </span>
                    <span className="text-xs text-blue-600 dark:text-blue-400">
                      ({ejemplares.length} resultado{ejemplares.length !== 1 ? 's' : ''})
                    </span>
                  </div>
                  <button
                    onClick={clearSearch}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                  >
                    Mostrar todos
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Tabla de ejemplares */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {ejemplares.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider" style={{width: '70px'}}>
                        <div className="flex items-center space-x-1">
                          <Tag className="w-3 h-3" />
                          <span>N° EJ.</span>
                        </div>
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider" style={{width: '140px'}}>
                        <div className="flex items-center space-x-1">
                          <Package className="w-3 h-3" />
                          <span>Tipo Adquisición</span>
                        </div>
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider" style={{width: '100px'}}>
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>Estado</span>
                        </div>
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider" style={{width: '180px'}}>Observaciones</th>
                      <th className="px-3 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider" style={{width: '80px'}}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                    {ejemplares.map((ejemplar, index) => (
                      <tr key={ejemplar.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-3 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300 font-medium text-sm">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                            searchTerm && ejemplar.numEjemplar.toString() === searchTerm.trim() 
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 ring-2 ring-yellow-500' 
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}>
                            {ejemplar.numEjemplar}
                          </span>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300 text-sm">
                          {ejemplar.tipo_adquisicion}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getEstadoBadge(ejemplar.estado)}`}>
                            {ejemplar.estado}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-gray-700 dark:text-gray-300 text-sm">
                          <div className="truncate" title={ejemplar.observaciones || 'Sin observaciones'}>
                            {ejemplar.observaciones || (
                              <span className="text-gray-400 dark:text-gray-500">-</span>
                            )}
                          </div>
                        </td>
                        <td className="px-2 py-3 whitespace-nowrap">
                          <div className="flex justify-center space-x-1">
                            <Link 
                              href={route('ejemplares.show', [libro.id, ejemplar.id])}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 
                                        transition-colors p-1 bg-blue-50 dark:bg-blue-900/30 rounded hover:bg-blue-100 dark:hover:bg-blue-800/40"
                              title="Ver detalles"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link 
                              href={route('ejemplares.edit', [libro.id, ejemplar.id])}
                              className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 
                                        transition-colors p-1 bg-amber-50 dark:bg-amber-900/30 rounded hover:bg-amber-100 dark:hover:bg-amber-800/40"
                              title="Editar ejemplar"
                            >
                              <Pencil className="w-4 h-4" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  {searchTerm ? (
                    <Search className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  ) : (
                    <BookOpen className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  )}
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {searchTerm ? 'No se encontró el ejemplar' : 'No hay ejemplares registrados'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  {searchTerm 
                    ? `No existe un ejemplar con el número #${searchTerm} para este libro.`
                    : 'Este libro aún no tiene ejemplares físicos registrados en el sistema.'
                  }
                </p>
                {searchTerm ? (
                  <button
                    onClick={clearSearch}
                    className="inline-flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white
                      px-4 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium"
                  >
                    <X className="w-4 h-4" />
                    <span>Mostrar todos los ejemplares</span>
                  </button>
                ) : (
                  <Link 
                    href={route('ejemplares.create', libro.id)}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white
                      px-4 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Registrar Primer Ejemplar</span>
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Botón de navegación y estadísticas */}
          <div className="mt-6 flex justify-between items-center">
            <Link 
              href={route('libros.index', libro.id)}
              className="px-4 py-2 border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al Libro
            </Link>

            {ejemplares.length > 0 && (
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>
                    {ejemplares.filter(e => e.estado === ESTADO.DISPONIBLE).length} Disponibles
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>
                    {ejemplares.filter(e => e.estado === ESTADO.PRESTADO).length} Prestados
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span>
                    {ejemplares.length} {searchTerm ? 'Encontrado' + (ejemplares.length !== 1 ? 's' : '') : 'Total'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Información adicional */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start space-x-3">
              <div className="p-1 bg-blue-100 dark:bg-blue-800/50 rounded">
                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                  Gestión de ejemplares
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                  Aquí puedes administrar todos los ejemplares físicos de este libro. 
                  Usa el buscador para encontrar rápidamente un ejemplar específico por su número.
                  Cada ejemplar tiene un número único asignado automáticamente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}