import React, { useState, useCallback } from 'react';
import { Head } from '@inertiajs/react';
import { Book, Search, X, CheckCircle, ArrowLeft, Calendar, User, Package, AlertCircle, Clock } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import ConfirmacionModal from './ConfirmacionModal';
import {
  Prestamo,
  LectorInfo,
  DevolucionPageProps,
  AlertNotificationProps,
  AlertState,
  AlertColorScheme,
  BuscarPrestamosResponse,
  DevolucionResponse,
  EstadoPrestamo,
  DURACION_ALERTAS,
  BreadcrumbItem
} from './types';

// Breadcrumbs para la página de devoluciones
const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Devoluciones', href: '/devoluciones' }
];

// Función auxiliar para formatear fechas correctamente sin cambios de zona horaria
const formatearFechaSinZonaHoraria = (fechaString: string): string => {
  // Parsear la fecha como está, sin conversión de zona horaria
  const [año, mes, dia] = fechaString.split('-').map(Number);
  const fecha = new Date(año, mes - 1, dia);
  
  return fecha.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

// Función auxiliar para calcular días de diferencia sin problemas de zona horaria
const calcularDiferenciaDias = (fechaString: string): number => {
  // Obtener fecha actual en formato local (sin hora)
  const hoy = new Date();
  const fechaHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  
  // Parsear fecha objetivo sin hora
  const [año, mes, dia] = fechaString.split('-').map(Number);
  const fechaObjetivo = new Date(año, mes - 1, dia);
  
  // Calcular diferencia en milisegundos y convertir a días
  const diferenciaMilisegundos = fechaObjetivo.getTime() - fechaHoy.getTime();
  return Math.floor(diferenciaMilisegundos / (1000 * 60 * 60 * 24));
};

// Función auxiliar para obtener fecha actual en formato YYYY-MM-DD
const obtenerFechaActualLocal = (): string => {
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
  duration = DURACION_ALERTAS.SUCCESS,
}: AlertNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [animateOut, setAnimateOut] = useState(false);

  React.useEffect(() => {
    if (autoClose && message) {
      const alertDuration = type === 'error' ? DURACION_ALERTAS.ERROR : duration;
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

  const colors: AlertColorScheme = {
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

export default function DevolucionIndex({ auth, flash }: DevolucionPageProps) {
  const [codigoLector, setCodigoLector] = useState<string>('');
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [lectorInfo, setLectorInfo] = useState<LectorInfo | null>(null);
  const [cargando, setCargando] = useState<boolean>(false);
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [prestamoSeleccionado, setPrestamoSeleccionado] = useState<Prestamo | null>(null);
  const [fechaDevuelto, setFechaDevuelto] = useState<string>('');
  const [observaciones, setObservaciones] = useState<string>('');
  const [procesandoDevolucion, setProcesandoDevolucion] = useState<boolean>(false);

  // Estado para alertas
  const [alerts, setAlerts] = useState<AlertState>({
    success: null,
    error: null,
    timestamp: 0
  });

  const mostrarAlerta = useCallback((tipo: 'success' | 'error', mensaje: string): void => {
    setAlerts({
      success: tipo === 'success' ? mensaje : null,
      error: tipo === 'error' ? mensaje : null,
      timestamp: Date.now()
    });
  }, []);

  const limpiarBusqueda = useCallback((): void => {
    setCodigoLector('');
    setPrestamos([]);
    setLectorInfo(null);
  }, []);

  const buscarPrestamos = useCallback(async (): Promise<void> => {
    if (!codigoLector.trim()) {
      mostrarAlerta('error', 'Debe ingresar un código de lector');
      return;
    }

    setCargando(true);
    try {
      const response = await fetch('/devoluciones/buscar-prestamos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({ codigo: codigoLector.trim() })
      });

      const data: BuscarPrestamosResponse = await response.json();
      
      if (data.success) {
        setLectorInfo(data.lector || null);
        setPrestamos(data.prestamos || []);
        if ((data.prestamos?.length || 0) === 0) {
          mostrarAlerta('success', 'Lector encontrado. No tiene préstamos pendientes.');
        } else {
          mostrarAlerta('success', `Se encontraron ${data.prestamos?.length || 0} préstamo(s) pendiente(s)`);
        }
      } else {
        mostrarAlerta('error', data.message || 'No se encontró el lector o error al buscar préstamos');
        setPrestamos([]);
        setLectorInfo(null);
      }
    } catch (error) {
      mostrarAlerta('error', 'Error de conexión. Intente nuevamente.');
      setPrestamos([]);
      setLectorInfo(null);
    } finally {
      setCargando(false);
    }
  }, [codigoLector, mostrarAlerta]);

  const abrirModal = useCallback((prestamo: Prestamo): void => {
    setPrestamoSeleccionado(prestamo);
    // Usar la función auxiliar para obtener fecha actual
    setFechaDevuelto(obtenerFechaActualLocal());
    setObservaciones('');
    setModalAbierto(true);
  }, []);

  const cerrarModal = useCallback((): void => {
    setModalAbierto(false);
    setPrestamoSeleccionado(null);
  }, []);

  const confirmarDevolucion = useCallback(async (): Promise<void> => {
    if (!prestamoSeleccionado || !fechaDevuelto) {
      mostrarAlerta('error', 'Debe seleccionar una fecha de devolución');
      return;
    }

    setProcesandoDevolucion(true);
    try {
      const response = await fetch(`/devoluciones/${prestamoSeleccionado.id}/devolver`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          fecha_devuelto: fechaDevuelto,
          observaciones: observaciones
        })
      });

      const data: DevolucionResponse = await response.json();

      if (data.success) {
        setPrestamos(prev => prev.filter(p => p.id !== prestamoSeleccionado.id));
        mostrarAlerta('success', `Préstamo del ejemplar #${prestamoSeleccionado.ejemplar.numEjemplar} devuelto exitosamente`);
        setModalAbierto(false);
        setPrestamoSeleccionado(null);
      } else {
        mostrarAlerta('error', data.message || 'Error al procesar la devolución');
      }
    } catch (error) {
      mostrarAlerta('error', 'Error de conexión al procesar la devolución');
    } finally {
      setProcesandoDevolucion(false);
    }
  }, [prestamoSeleccionado, fechaDevuelto, observaciones, mostrarAlerta]);

  const getEstadoBadge = useCallback((estado: string): string => {
    switch (estado.toUpperCase() as EstadoPrestamo) {
      case 'VENCIDO':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      case 'ACTIVO':
      case 'PENDIENTE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
      case 'PROXIMO_VENCER':
        return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
    }
  }, []);

  // Función corregida para calcular días de vencimiento
  const calcularDiasVencimiento = useCallback((fechaDevolucion: string): number => {
    return calcularDiferenciaDias(fechaDevolucion);
  }, []);

  const renderAlerts = useCallback(() => {
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
            duration={DURACION_ALERTAS.ERROR}
          />
        )}
      </>
    );
  }, [alerts]);

  return (
    <AppLayout
      breadcrumbs={breadcrumbs}
      renderHeader={() => (
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Devolución de Préstamos
          </h2>
        </div>
      )}
    >
      <Head title="Devolución de Préstamos" />
      
      <div className="py-8 px-6 bg-slate-50 dark:bg-black min-h-screen">
        {/* Renderizar alertas */}
        {renderAlerts()}

        {/* Efectos de fondo decorativos */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-green-500/5 filter blur-3xl dark:bg-green-600/10"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-emerald-500/5 filter blur-3xl dark:bg-emerald-600/10"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Buscador */}
          <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full">
                <Search className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Devolucion de material bibliográfico  
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Ingrese el código del lector para encontrar sus préstamos
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={codigoLector}
                  onChange={(e) => setCodigoLector(e.target.value)}
                  placeholder="Ingrese código del lector"
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                             shadow-sm transition-all duration-200"
                  onKeyPress={(e) => e.key === 'Enter' && buscarPrestamos()}
                />
                {codigoLector && (
                  <button
                    onClick={limpiarBusqueda}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    title="Limpiar búsqueda"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <button
                onClick={buscarPrestamos}
                disabled={cargando || !codigoLector.trim()}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 
                           disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed
                           text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-300 
                           shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-semibold whitespace-nowrap"
              >
                <Search className="w-5 h-5" />
                <span>{cargando ? 'Buscando...' : 'Buscar Préstamos'}</span>
              </button>
            </div>
          </div>

          {/* Información del lector */}
          {lectorInfo && (
            <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 
                           rounded-xl border border-blue-200 dark:border-blue-800 shadow-lg">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-800/50 rounded-full">
                  <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">
                    {lectorInfo.nombre}
                  </h3>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm">
                    <div className="flex items-center gap-1 text-blue-700 dark:text-blue-300">
                      <span className="font-medium">Código:</span>
                      <span>{lectorInfo.codigo}</span>
                    </div>
                    {lectorInfo.email && (
                      <div className="flex items-center gap-1 text-blue-700 dark:text-blue-300">
                        <span className="font-medium">Email:</span>
                        <span>{lectorInfo.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-blue-700 dark:text-blue-300">
                      <span className="font-medium">Préstamos pendientes:</span>
                      <span className="font-bold">{prestamos.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Lista de préstamos */}
          {prestamos.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Book className="w-5 h-5" />
                  Préstamos Pendientes ({prestamos.length})
                </h3>
              </div>

              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {prestamos.map((prestamo) => {
                  const diasVencimiento = calcularDiasVencimiento(prestamo.fecha_devolucion);
                  
                  return (
                    <div key={prestamo.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start space-x-4">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                              <Book className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                {prestamo.ejemplar.libro.titulo}
                              </h4>
                              {prestamo.ejemplar.libro.autor && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  Por: {prestamo.ejemplar.libro.autor}
                                </p>
                              )}
                              
                              <div className="flex flex-wrap gap-4 mt-3 text-sm">
                                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                  <Package className="w-4 h-4" />
                                  <span className="font-medium">Ejemplar #</span>
                                  <span className="font-bold text-blue-600 dark:text-blue-400">
                                    {prestamo.ejemplar.numEjemplar}
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                  <span className="font-medium">ISBN:</span>
                                  <span>{prestamo.ejemplar.libro.isbn}</span>
                                </div>
                                
                                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                  <Calendar className="w-4 h-4" />
                                  <span className="font-medium">Prestado:</span>
                                  <span>{formatearFechaSinZonaHoraria(prestamo.fecha_prestamo)}</span>
                                </div>
                                
                                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                  <Clock className="w-4 h-4" />
                                  <span className="font-medium">Debe devolver:</span>
                                  <span className={diasVencimiento < 0 ? 'text-red-600 font-bold' : diasVencimiento <= 3 ? 'text-orange-600 font-semibold' : ''}>
                                    {formatearFechaSinZonaHoraria(prestamo.fecha_devolucion)}
                                  </span>
                                  {diasVencimiento < 0 && (
                                    <span className="text-red-600 font-bold">
                                      ({Math.abs(diasVencimiento)} días vencido)
                                    </span>
                                  )}
                                  {diasVencimiento >= 0 && diasVencimiento <= 3 && (
                                    <span className="text-orange-600 font-semibold">
                                      ({diasVencimiento} días restantes)
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="mt-3">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getEstadoBadge(prestamo.estado)}`}>
                                  {prestamo.estado === 'VENCIDO' && <AlertCircle className="w-3 h-3 mr-1" />}
                                  {prestamo.estado}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex-shrink-0">
                          <button
                            onClick={() => abrirModal(prestamo)}
                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 
                                     text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-300 
                                     shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-semibold"
                          >
                            <CheckCircle className="w-5 h-5" />
                            <span>Devolver</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Estado inicial */}
          {prestamos.length === 0 && !lectorInfo && !cargando && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Buscar Préstamos Pendientes
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Ingrese el código del lector para encontrar sus préstamos activos y procesar devoluciones.
              </p>
            </div>
          )}

          {/* Sin resultados */}
          {prestamos.length === 0 && lectorInfo && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-500 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                ¡Excelente! No hay préstamos pendientes
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                El lector <strong>{lectorInfo.nombre}</strong> no tiene libros por devolver en este momento.
              </p>
            </div>
          )}

          {/* Información adicional */}
          <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 
                          rounded-xl border border-green-200 dark:border-green-800">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-800/50 rounded-lg">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-green-800 dark:text-green-300 font-medium mb-1">
                  Proceso de Devolución
                </p>
                <p className="text-sm text-green-700 dark:text-green-400">
                  Busque al lector por su código para visualizar todos sus préstamos pendientes. 
                  Puede procesar múltiples devoluciones y agregar observaciones sobre el estado de los libros.
                  Los préstamos vencidos se destacan en rojo para una identificación rápida.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de devolución */}
      <ConfirmacionModal
        isOpen={modalAbierto}
        onClose={cerrarModal}
        prestamoSeleccionado={prestamoSeleccionado}
        fechaDevuelto={fechaDevuelto}
        setFechaDevuelto={setFechaDevuelto}
        observaciones={observaciones}
        setObservaciones={setObservaciones}
        procesandoDevolucion={procesandoDevolucion}
        onConfirmar={confirmarDevolucion}
      />
    </AppLayout>
  );
}