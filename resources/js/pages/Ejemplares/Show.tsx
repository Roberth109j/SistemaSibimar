import React, { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { BookOpen, Edit3, ArrowLeft, Calendar, Package, Tag, MessageSquare, CheckCircle, AlertCircle, X } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, EjemplarPageProps, ESTADO } from './types';

// Definir las migas de pan (breadcrumbs)
const getBreadcrumbs = (libroId: number, libroTitulo: string, ejemplarId: number): BreadcrumbItem[] => [
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
    href: `/libros/${libroId}`,
  },
  {
    title: 'Ejemplares',
    href: `/libros/${libroId}/ejemplares`,
  },
  {
    title: `Ejemplar #${ejemplarId}`,
    href: `/libros/${libroId}/ejemplares/${ejemplarId}`,
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

export default function Show({ auth, libro, ejemplar, success }: EjemplarPageProps) {
  const page = usePage();

  if (!ejemplar) {
    return <div>Cargando ejemplar...</div>;
  }

  const breadcrumbs = getBreadcrumbs(libro.id, libro.titulo, ejemplar.id);

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
            Detalles del Ejemplar #{ejemplar.id}
          </h2>
        </div>
      )}
    >
      <Head title={`Ejemplar #${ejemplar.id} - ${libro.titulo}`} />

      <div className="py-8 px-6 bg-slate-50 dark:bg-black min-h-screen">
        {/* Renderizar alertas */}
        {renderAlerts()}

        {/* Efectos de fondo decorativos */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-500/5 filter blur-3xl dark:bg-blue-600/10"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-indigo-500/5 filter blur-3xl dark:bg-indigo-600/10"></div>
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          
          {/* Mensaje de éxito - MANTENER COMO RESPALDO */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 rounded-xl flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="font-medium">{success}</span>
            </div>
          )}

          {/* Header del libro */}
          <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {libro.titulo}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Visualizando ejemplar #{ejemplar.id}
                  </p>
                </div>
              </div>
              <Link
                href={route('ejemplares.edit', [libro.id, ejemplar.id])}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center gap-2 text-sm"
              >
                <Edit3 className="w-4 h-4" />
                Editar Ejemplar
              </Link>
            </div>
          </div>

          {/* Información del libro */}
          <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Información del Libro
                </h4>
              </div>
              
              <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-gray-700/50 dark:to-blue-900/10 p-6 rounded-xl border border-slate-200/50 dark:border-gray-600/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Título</p>
                    <p className="text-base font-semibold text-gray-900 dark:text-white leading-tight">{libro.titulo}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Autor</p>
                    <p className="text-base font-semibold text-gray-900 dark:text-white leading-tight">
                      {libro.autor?.nombre_completo || `${libro.autor?.nombres || ''} ${libro.autor?.apellidos || ''}`.trim() || 'Autor no especificado'}
                    </p>
                  </div>
                  {libro.editorial && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Editorial</p>
                      <p className="text-base font-medium text-gray-800 dark:text-gray-200 leading-tight">{libro.editorial}</p>
                    </div>
                  )}
                  {libro.anio_publicacion && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Año</p>
                      <p className="text-base font-medium text-gray-800 dark:text-gray-200 leading-tight">{libro.anio_publicacion}</p>
                    </div>
                  )}
                  {libro.isbn && (
                    <div className="md:col-span-2 space-y-1">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">ISBN</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white leading-tight">
                        {libro.isbn}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Información del ejemplar */}
          <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                  <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Información del Ejemplar
                </h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Número del Ejemplar
                    </p>
                  </div>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400 ml-4">
                    {ejemplar.numEjemplar}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Tipo de Adquisición
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white ml-4">
                    {ejemplar.tipo_adquisicion}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Estado
                    </p>
                  </div>
                  <div className="ml-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getEstadoBadge(ejemplar.estado)}`}>
                      {ejemplar.estado}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Fecha de Registro
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white ml-4">
                    {new Date(ejemplar.created_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              
              {ejemplar.observaciones && (
                <div className="mt-6 space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Observaciones
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200/60 dark:border-amber-800/60 p-3 rounded-xl ml-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {ejemplar.observaciones}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Botón de navegación */}
          <div className="flex justify-start">
            <Link 
              href={route('ejemplares.index', libro.id)}
              className="px-4 py-2 border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a Ejemplares
            </Link>
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
                  Información del ejemplar
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                  Aquí puedes ver todos los detalles de este ejemplar específico. 
                  Usa el botón "Editar Ejemplar" para realizar modificaciones.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}