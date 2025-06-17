import { Head, Link, router } from '@inertiajs/react';
import { Book, UserCheck, Calendar, CheckCircle, Search, X, AlertCircle } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type PrestamoPageProps, type Prestamo } from './types';
import { useState, useEffect } from 'react';

const breadcrumbs = [
  {
    title: 'Préstamos',
    href: '/prestamos',
  },
  {
    title: 'Listado de Préstamos Activos',
    href: '/prestamos/listado',
  },
];

// Función para obtener la fecha actual en formato YYYY-MM-DD (hora local)
const obtenerFechaActual = () => {
  const hoy = new Date();
  const año = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${año}-${mes}-${dia}`;
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

export default function Listado({ auth, prestamos, flash }: PrestamoPageProps) {
  const [codigoLector, setCodigoLector] = useState('');
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);
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

  // Mostrar notificaciones de flash
  useEffect(() => {
    if (flash?.success) {
      setAlerts(prev => ({
        ...prev,
        success: flash.success || null,
        timestamp: Date.now()
      }));
    } else if (flash?.error) {
      setAlerts(prev => ({
        ...prev,
        error: flash.error || null,
        timestamp: Date.now()
      }));
    }
  }, [flash]);

  // Asegurar que la fecha se establezca cuando se abre el modal
  useEffect(() => {
    if (modalAbierto && !fechaDevuelto) {
      setFechaDevuelto(obtenerFechaActual());
    }
  }, [modalAbierto, fechaDevuelto]);

  const handleDevolucion = (prestamoId: number) => {
    setPrestamoSeleccionado(prestamoId);
    setFechaDevuelto(obtenerFechaActual()); // Establecer fecha actual
    setObservaciones('');
    setModalAbierto(true);
  };

  const confirmarDevolucion = () => {
    if (!prestamoSeleccionado || !fechaDevuelto) return;

    router.post(`/prestamos/${prestamoSeleccionado}/devolver`, {
      fecha_devuelto: fechaDevuelto,
      observaciones: observaciones
    });
    setModalAbierto(false);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setPrestamoSeleccionado(null);
    setFechaDevuelto('');
    setObservaciones('');
  };

  const handleBuscar = () => {
    if (!codigoLector.trim()) return;

    setBusquedaRealizada(true);
    router.get('/prestamos/listado', { codigo_lector: codigoLector }, {
      preserveState: true,
      preserveScroll: true
    });
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
      <div className="absolute inset-0 overflow-hidden pointer-events-none fixed">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl dark:bg-blue-600/10"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-indigo-500/5 blur-3xl dark:bg-indigo-600/10"></div>
      </div>
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Listado de Préstamos Activos
          </h1>
          <div className="flex gap-4">
            <div className="relative">
              <input
                type="text"
                value={codigoLector}
                onChange={(e) => setCodigoLector(e.target.value)}
                placeholder="Ingrese el código del lector"
                className="w-80 pl-10 py-2.5 pr-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                          text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                          shadow-sm transition-all duration-200"
                onKeyPress={(e) => e.key === 'Enter' && handleBuscar()}
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
            <button
              onClick={handleBuscar}
              disabled={!codigoLector.trim()}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white 
                       px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg
                       transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed
                       disabled:transform-none disabled:shadow-md"
            >
              <Search className="w-5 h-5" />
              Buscar
            </button>
          </div>
        </div>

        {/* Estado inicial mejorado */}
        {!busquedaRealizada && (
          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl">
            <div className="relative p-16 text-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
              {/* Elementos decorativos */}
              <div className="absolute top-8 left-8 w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full opacity-60"></div>
              <div className="absolute top-12 right-12 w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full opacity-40"></div>
              <div className="absolute bottom-8 left-16 w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-full opacity-50"></div>
              <div className="absolute bottom-12 right-8 w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full opacity-45"></div>

              <div className="relative z-10">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                  <Search className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Buscar Préstamos Activos
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-lg mb-6 max-w-lg mx-auto leading-relaxed">
                  Ingrese el código del lector en el campo de búsqueda para encontrar todos los préstamos activos asociados a ese usuario.
                </p>

                {/* Características destacadas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 max-w-2xl mx-auto">
                  <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                      <Book className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Información completa</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Devolución rápida</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center">
                      <UserCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Datos del lector</span>
                  </div>
                </div>

                {/* Instrucciones paso a paso */}
                <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 max-w-md mx-auto">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">¿Cómo usar?</h4>
                  <div className="space-y-3 text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400">1</div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Ingrese el código del lector</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400">2</div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Haga clic en "Buscar" o presione Enter</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400">3</div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Revise los préstamos y procese devoluciones</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Resultados */}
        {busquedaRealizada && (
          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl">
            {prestamos?.data.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <Book className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No se encontraron préstamos
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  El lector no tiene préstamos registrados o tiene los prestamos vencidos ingrese a Gestion de prestamos --Prestamos vencidos
                  para poder relizar la devolución.
                </p>
              </div>
            ) : prestamos && prestamos.data.filter(prestamo => prestamo.estado === 'VENCIDO').length > 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
                  <X className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-medium text-red-900 dark:text-red-100 mb-2">
                  Préstamo Vencido
                </h3>
                <p className="text-red-600 dark:text-red-400">
                  El usuario no puede devolver el libro porque el préstamo está vencido y necesita una multa
                </p>
              </div>
            ) : (
              <>
                {/* Header de resultados mejorado */}
                <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-blue-50/40 dark:from-gray-800 dark:to-gray-800/60 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Préstamos Activos
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {prestamos?.data.filter(prestamo => prestamo.estado === 'ACTIVO').length} préstamo{prestamos?.data.filter(prestamo => prestamo.estado === 'ACTIVO').length !== 1 ? 's' : ''} activo{prestamos?.data.filter(prestamo => prestamo.estado === 'ACTIVO').length !== 1 ? 's' : ''} encontrado{prestamos?.data.filter(prestamo => prestamo.estado === 'ACTIVO').length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-500/15 rounded-xl">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">En tiempo</span>
                    </div>
                  </div>
                </div>

                {/* Lista de préstamos mejorada */}
                <div className="p-6 space-y-6">
                  {prestamos?.data
                    .filter(prestamo => prestamo.estado === 'ACTIVO')
                    .map((prestamo: Prestamo, index) => (
                      <div key={prestamo.id} className="group relative">
                        <div className="bg-gradient-to-r from-white to-gray-50/60 dark:from-gray-800 dark:to-gray-800/60
                                      border border-gray-200 dark:border-gray-700 rounded-2xl p-8
                                      hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-blue-400/10
                                      transition-all duration-500 transform hover:-translate-y-2
                                      hover:border-blue-300 dark:hover:border-blue-500/50
                                      backdrop-blur-sm">

                          {/* Header de la tarjeta mejorado */}
                          <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 dark:from-blue-400 dark:via-blue-500 dark:to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                <Book className="h-8 w-8 text-white" />
                              </div>
                              <div>
                                <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                  {prestamo.ejemplar?.libro?.titulo}
                                </h4>
                                <p className="text-gray-500 dark:text-gray-400 font-medium">
                                  ISBN: {prestamo.ejemplar?.libro?.isbn}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-500/15 dark:to-indigo-500/15 
                                            text-blue-800 dark:text-blue-200 px-4 py-2 rounded-xl text-sm font-bold
                                            border border-blue-200 dark:border-blue-500/25">
                                Préstamo #{index + 1}
                              </div>
                            </div>
                          </div>

                          {/* Grid de información mejorado */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            {/* Ejemplar */}
                            <div className="bg-white/70 dark:bg-gray-700/50 backdrop-blur-sm rounded-xl p-5 border border-gray-200/60 dark:border-gray-600/60 hover:shadow-lg transition-all duration-300">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-500/20 dark:to-indigo-500/15 rounded-lg flex items-center justify-center">
                                  <Book className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ejemplar</span>
                              </div>
                              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">#{prestamo.ejemplar?.numEjemplar}</div>
                              <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">{prestamo.ejemplar?.codigo}</div>
                            </div>

                            {/* Lector */}
                            <div className="bg-white/70 dark:bg-gray-700/50 backdrop-blur-sm rounded-xl p-5 border border-gray-200/60 dark:border-gray-600/60 hover:shadow-lg transition-all duration-300">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-500/20 dark:to-purple-500/15 rounded-lg flex items-center justify-center">
                                  <UserCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                </div>
                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lector</span>
                              </div>
                              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{prestamo.lector?.nombre}</div>
                              <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Usuario activo</div>
                            </div>

                            {/* Fecha Préstamo */}
                            <div className="bg-white/70 dark:bg-gray-700/50 backdrop-blur-sm rounded-xl p-5 border border-gray-200/60 dark:border-gray-600/60 hover:shadow-lg transition-all duration-300">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-500/20 dark:to-emerald-500/15 rounded-lg flex items-center justify-center">
                                  <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Préstamo</span>
                              </div>
                              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {new Date(prestamo.fecha_prestamo).toLocaleDateString('es-ES', {
                                  day: 'numeric',
                                  month: 'short'
                                })}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                {new Date(prestamo.fecha_prestamo).getFullYear()}
                              </div>
                            </div>

                            {/* Fecha Devolución */}
                            <div className="bg-white/70 dark:bg-gray-700/50 backdrop-blur-sm rounded-xl p-5 border border-gray-200/60 dark:border-gray-600/60 hover:shadow-lg transition-all duration-300">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-500/20 dark:to-amber-500/15 rounded-lg flex items-center justify-center">
                                  <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                </div>
                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Vencimiento</span>
                              </div>
                              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {new Date(prestamo.fecha_devolucion).toLocaleDateString('es-ES', {
                                  day: 'numeric',
                                  month: 'short'
                                })}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                {new Date(prestamo.fecha_devolucion).getFullYear()}
                              </div>
                            </div>
                          </div>

                          {/* Footer con acción */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Préstamo Activo</span>
                            </div>

                            <button
                              onClick={() => handleDevolucion(prestamo.id)}
                              className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 
                                       dark:from-emerald-500 dark:to-green-500 dark:hover:from-emerald-600 dark:hover:to-green-600
                                       text-white px-6 py-3 rounded-xl flex items-center gap-3 transition-all duration-300 
                                       shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold"
                            >
                              <CheckCircle className="h-5 w-5" />
                              Procesar Devolución
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Modal de devolución */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Registrar Devolución
              </h3>
              <button
                onClick={cerrarModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 
                           p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Fecha de Devolución
                </label>
                <input
                  type="date"
                  value={fechaDevuelto}
                  onChange={(e) => setFechaDevuelto(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                             focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 
                             focus:border-transparent transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Observaciones
                </label>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                             placeholder-gray-500 dark:placeholder-gray-400
                             focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 
                             focus:border-transparent transition-all duration-200 h-24 resize-none"
                  placeholder="Ingrese las observaciones sobre la devolución"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={cerrarModal}
                  className="px-6 py-3 text-sm font-semibold rounded-xl shadow-sm
                             bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                             border border-gray-300 dark:border-gray-600
                             hover:bg-gray-50 dark:hover:bg-gray-600
                             focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarDevolucion}
                  disabled={!fechaDevuelto}
                  className="px-6 py-3 text-sm font-semibold rounded-xl shadow-sm
                             bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white
                             focus:outline-none focus:ring-2 focus:ring-blue-500
                             disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Confirmar Devolución
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Listado de Préstamos Activos" />
      {content}
    </AppLayout>
  );
}