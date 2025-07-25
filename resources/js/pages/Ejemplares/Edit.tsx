import React, { FormEvent, useState, useEffect } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { BookOpen, Save, ArrowLeft, CheckCircle, AlertCircle, X } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, EjemplarPageProps, TipoAdquisicion, Estado } from './types';

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
  {
    title: 'Editar',
    href: `/libros/${libroId}/ejemplares/${ejemplarId}/edit`,
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

export default function Edit({ auth, libro, ejemplar, tiposAdquisicion, estados }: EjemplarPageProps) {
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
    if (page.props.flash) {
      const flash = page.props.flash as any;
      setAlerts({
        success: flash.success || null,
        error: flash.error || null,
        timestamp: Date.now()
      });
    }
  }, [page.props.flash]);

  // Formulario con Inertia - removemos numEjemplar porque no es editable
  const form = useForm({
    tipo_adquisicion: ejemplar.tipo_adquisicion,
    estado: ejemplar.estado,
    observaciones: ejemplar.observaciones || '',
  });

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlerts(prev => ({
      ...prev,
      [type]: message,
      timestamp: Date.now()
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Validar campos requeridos (removemos numEjemplar)
    const camposRequeridos = {
      tipo_adquisicion: 'Tipo de Adquisición',
      estado: 'Estado',
    };

    const camposFaltantes = Object.entries(camposRequeridos)
      .filter(([key]) => !form.data[key as keyof typeof form.data])
      .map(([, label]) => label);

    if (camposFaltantes.length > 0) {
      const mensaje = `Por favor, complete los siguientes campos obligatorios:\n- ${camposFaltantes.join('\n- ')}`;
      alert(mensaje);
      return;
    }

    // Mostrar indicador de carga
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.setAttribute('disabled', 'true');
      submitButton.textContent = 'Guardando...';
    }

    form.patch(route('ejemplares.update', [libro.id, ejemplar.id]), {
      onSuccess: (page: any) => {
        const successMessage = page.props.flash?.success || 'Ejemplar actualizado correctamente';
        showAlert('success', successMessage);
        // NO redirigir - quedarse en la página de edición con la notificación
      },
      onError: (errors) => {
        // Mostrar errores específicos del servidor
        const errorMessages = Object.values(errors).join('\n');
        if (errorMessages) {
          showAlert('error', 'Se encontraron los siguientes errores:\n' + errorMessages);
        }

        // Restaurar el botón
        if (submitButton) {
          submitButton.removeAttribute('disabled');
          submitButton.textContent = 'Guardar Cambios';
        }
      }
    });
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
            Editar Ejemplar #{ejemplar.numEjemplar}
          </h2>
        </div>
      )}
    >
      <Head title={`Editar Ejemplar #${ejemplar.numEjemplar}`} />

      <div className="py-8 px-6 bg-slate-50 dark:bg-black min-h-screen">
        {/* Renderizar alertas */}
        {renderAlerts()}

        {/* Efectos de fondo decorativos */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-500/5 filter blur-3xl dark:bg-blue-600/10"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-indigo-500/5 filter blur-3xl dark:bg-indigo-600/10"></div>
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          {/* Header del libro */}
          <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {libro.titulo}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Editando ejemplar #{ejemplar.numEjemplar}
                </p>
              </div>
            </div>
          </div>

          {/* Formulario principal */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Número de Ejemplar - Solo lectura e informativo */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-800/50 rounded-full">
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">#{ejemplar.numEjemplar}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-300">
                          Número del Ejemplar
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Este número se asignó automáticamente y no se puede modificar
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300">
                        🔒 No editable
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Tipo de Adquisición */}
                  <div className="space-y-2">
                    <label htmlFor="tipo_adquisicion" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Tipo de Adquisición <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="tipo_adquisicion"
                      value={form.data.tipo_adquisicion}
                      onChange={e => form.setData('tipo_adquisicion', e.target.value as TipoAdquisicion)}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 px-3 py-2 text-sm"
                    >
                      {tiposAdquisicion.map(tipo => (
                        <option key={tipo} value={tipo}>
                          {tipo}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Forma en que se obtuvo el ejemplar
                    </p>
                    {form.errors.tipo_adquisicion && (
                      <p className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded-md border-l-2 border-red-500">
                        {form.errors.tipo_adquisicion}
                      </p>
                    )}
                  </div>

                  {/* Estado */}
                  <div className="space-y-2">
                    <label htmlFor="estado" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Estado <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="estado"
                      value={form.data.estado}
                      onChange={e => form.setData('estado', e.target.value as Estado)}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 px-3 py-2 text-sm"
                    >
                      {estados.map(estado => (
                        <option key={estado} value={estado}>
                          {estado}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Estado actual del ejemplar
                    </p>
                    {form.errors.estado && (
                      <p className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded-md border-l-2 border-red-500">
                        {form.errors.estado}
                      </p>
                    )}
                  </div>
                </div>

                {/* Observaciones - Ocupa toda la fila */}
                <div className="space-y-2">
                  <label htmlFor="observaciones" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Observaciones
                  </label>
                  <textarea
                    id="observaciones"
                    rows={3}
                    value={form.data.observaciones}
                    onChange={e => form.setData('observaciones', e.target.value)}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 px-3 py-2 text-sm resize-none"
                    placeholder="Agregue observaciones adicionales (opcional)"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Información adicional sobre el ejemplar
                  </p>
                  {form.errors.observaciones && (
                    <p className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded-md border-l-2 border-red-500">
                      {form.errors.observaciones}
                    </p>
                  )}
                </div>

                {/* Botones de acción */}
                <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
                  <a
                    href={route('ejemplares.index', libro.id)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Volver a Lista
                  </a>
                  
                  <button
                    type="submit"
                    disabled={form.processing}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      <span>{form.processing ? 'Guardando...' : 'Guardar Cambios'}</span>
                    </div>
                  </button>
                </div>
              </form>
            </div>
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
                  Información importante
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                  Los campos marcados con <span className="text-red-500">*</span> son obligatorios. 
                  El número de ejemplar #{ejemplar.numEjemplar} se asignó automáticamente y no se puede modificar para mantener la integridad del sistema.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}