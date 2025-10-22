import React, { useState, useCallback, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import { Book, Search, X, CheckCircle, ArrowLeft, Calendar, User, Package, AlertCircle, Clock, Trash2, RotateCcw, MessageSquare, ChevronDown, ChevronUp, Filter, Eye, EyeOff } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import ConfirmacionModalMultiple from './ConfirmacionModal';
import axios from 'axios';
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
  BreadcrumbItem,
  LIMITES_DEVOLUCION_MULTIPLE,
  paginarPrestamos,
  filtrarPrestamos,
  FiltrosPrestamos,
  calcularEstadisticasDevolucion
} from './types';

// Breadcrumbs para la página de devoluciones
const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Devoluciones', href: '/devoluciones' }
];

// Función auxiliar para formatear fechas correctamente sin cambios de zona horaria
const formatearFechaSinZonaHoraria = (fechaString: string): string => {
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
  const hoy = new Date();
  const fechaHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  
  const [año, mes, dia] = fechaString.split('-').map(Number);
  const fechaObjetivo = new Date(año, mes - 1, dia);
  
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
  
  // MEJORADO: Estados para devolución múltiple SIN LÍMITES
  const [prestamosSeleccionados, setPrestamosSeleccionados] = useState<Set<number>>(new Set());
  const [fechaDevuelto, setFechaDevuelto] = useState<string>('');
  const [observacionesGlobales, setObservacionesGlobales] = useState<string>('');
  const [observacionesIndividuales, setObservacionesIndividuales] = useState<Map<number, string>>(new Map());
  const [procesandoDevolucion, setProcesandoDevolucion] = useState<boolean>(false);

  // NUEVOS: Estados para observaciones opcionales
  const [prestamosConObservacionesExpandidas, setPrestamosConObservacionesExpandidas] = useState<Set<number>>(new Set());
  const [mostrarObservacionesGlobales, setMostrarObservacionesGlobales] = useState<boolean>(false);

  // NUEVOS: Estados para paginación y filtros
  const [paginaActual, setPaginaActual] = useState<number>(1);
  const [filtros, setFiltros] = useState<FiltrosPrestamos>({
    soloVencidos: false,
    soloActivos: false,
    conObservaciones: false,
    busquedaTexto: ''
  });
  const [mostrarFiltros, setMostrarFiltros] = useState<boolean>(false);

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
    setPrestamosSeleccionados(new Set());
    setObservacionesIndividuales(new Map());
    setPrestamosConObservacionesExpandidas(new Set());
    setMostrarObservacionesGlobales(false);
    setPaginaActual(1);
    setFiltros({
      soloVencidos: false,
      soloActivos: false,
      conObservaciones: false,
      busquedaTexto: ''
    });
  }, []);

  const buscarPrestamos = useCallback(async (): Promise<void> => {
    if (!codigoLector.trim()) {
      mostrarAlerta('error', 'Debe ingresar un código de lector');
      return;
    }

    setCargando(true);
    try {
      const response = await axios.post('/devoluciones/buscar-prestamos', {
        codigo: codigoLector.trim()
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });

      const data: BuscarPrestamosResponse = response.data;
      
      if (data.success) {
        setLectorInfo(data.lector || null);
        setPrestamos(data.prestamos || []);
        setPrestamosSeleccionados(new Set()); // Limpiar selecciones previas
        setObservacionesIndividuales(new Map()); // Limpiar observaciones previas
        setPrestamosConObservacionesExpandidas(new Set()); // Limpiar expansiones
        setPaginaActual(1); // Resetear paginación
        
        if ((data.prestamos?.length || 0) === 0) {
          mostrarAlerta('success', 'Lector encontrado. No tiene préstamos pendientes.');
        } else {
          const cantidad = data.prestamos?.length || 0;
          mostrarAlerta('success', `Se encontraron ${cantidad} préstamo(s) pendiente(s). ${cantidad > 50 ? 'Use los filtros para navegar más fácilmente.' : ''}`);
        }
      } else {
        mostrarAlerta('error', data.message || 'No se encontró el lector o error al buscar préstamos');
        setPrestamos([]);
        setLectorInfo(null);
      }
    } catch (error: any) {
      console.error('Error en buscarPrestamos:', error);
      
      if (error.response?.status === 419) {
        mostrarAlerta('error', 'Sesión expirada. El token CSRF se ha renovado automáticamente, intente nuevamente.');
      } else if (error.response?.status === 404) {
        mostrarAlerta('error', 'Lector no encontrado o inactivo');
      } else if (error.response?.data?.message) {
        mostrarAlerta('error', error.response.data.message);
      } else {
        mostrarAlerta('error', 'Error de conexión. Intente nuevamente.');
      }
      
      setPrestamos([]);
      setLectorInfo(null);
    } finally {
      setCargando(false);
    }
  }, [codigoLector, mostrarAlerta]);

  // MEJORADO: Manejar selección individual de préstamos
  const toggleSeleccionPrestamo = useCallback((prestamoId: number): void => {
    setPrestamosSeleccionados(prev => {
      const nuevaSeleccion = new Set(prev);
      if (nuevaSeleccion.has(prestamoId)) {
        nuevaSeleccion.delete(prestamoId);
        // Limpiar observaciones individuales si se deselecciona
        setObservacionesIndividuales(prevObs => {
          const nuevasObs = new Map(prevObs);
          nuevasObs.delete(prestamoId);
          return nuevasObs;
        });
        // Cerrar expansión de observaciones si se deselecciona
        setPrestamosConObservacionesExpandidas(prevExp => {
          const nuevasExp = new Set(prevExp);
          nuevasExp.delete(prestamoId);
          return nuevasExp;
        });
      } else {
        nuevaSeleccion.add(prestamoId);
      }
      return nuevaSeleccion;
    });
  }, []);

  // MEJORADO: Seleccionar/Deseleccionar todos (filtrados)
  const toggleSeleccionTodos = useCallback((): void => {
    const prestamosFiltrados = filtrarPrestamos(prestamos, filtros);
    const prestamosVisibles = paginaActual === 1 
      ? prestamosFiltrados 
      : prestamosFiltrados; // Seleccionar todos los filtrados, no solo los de la página actual
    
    if (prestamosSeleccionados.size === prestamosVisibles.length) {
      // Deseleccionar todos
      setPrestamosSeleccionados(new Set());
      setObservacionesIndividuales(new Map());
      setPrestamosConObservacionesExpandidas(new Set());
    } else {
      // Seleccionar todos los filtrados
      setPrestamosSeleccionados(new Set(prestamosVisibles.map(p => p.id)));
    }
  }, [prestamos, prestamosSeleccionados.size, filtros, paginaActual]);

  // NUEVO: Toggle observaciones individuales
  const toggleObservacionesIndividuales = useCallback((prestamoId: number): void => {
    setPrestamosConObservacionesExpandidas(prev => {
      const nuevasExp = new Set(prev);
      if (nuevasExp.has(prestamoId)) {
        nuevasExp.delete(prestamoId);
        // También limpiar la observación si se colapsa
        setObservacionesIndividuales(prevObs => {
          const nuevasObs = new Map(prevObs);
          nuevasObs.delete(prestamoId);
          return nuevasObs;
        });
      } else {
        nuevasExp.add(prestamoId);
      }
      return nuevasExp;
    });
  }, []);

  // MEJORADO: Abrir modal para devolución múltiple
  const abrirModalMultiple = useCallback((): void => {
    if (prestamosSeleccionados.size === 0) {
      mostrarAlerta('error', 'Debe seleccionar al menos un préstamo para devolver');
      return;
    }
    setFechaDevuelto(obtenerFechaActualLocal());
    setModalAbierto(true);
  }, [prestamosSeleccionados.size, mostrarAlerta]);

  const cerrarModal = useCallback((): void => {
    setModalAbierto(false);
  }, []);

  // MEJORADO: Confirmar devolución múltiple
  const confirmarDevolucionMultiple = useCallback(async (): Promise<void> => {
    if (prestamosSeleccionados.size === 0 || !fechaDevuelto) {
      mostrarAlerta('error', 'Debe seleccionar préstamos y una fecha de devolución');
      return;
    }

    setProcesandoDevolucion(true);
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') 
        || document.querySelector('input[name="_token"]')?.getAttribute('value') 
        || '';

      // Preparar datos para devolución múltiple con manejo mejorado de observaciones
      const prestamosParaDevolver = Array.from(prestamosSeleccionados).map(prestamoId => {
        const observacionIndividual = observacionesIndividuales.get(prestamoId);
        return {
          id: prestamoId,
          observaciones: observacionIndividual && observacionIndividual.trim() 
            ? observacionIndividual.trim() 
            : null
        };
      });

      const response = await fetch('/devoluciones/devolver-multiple', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          prestamos: prestamosParaDevolver,
          fecha_devuelto: fechaDevuelto,
          observaciones_globales: observacionesGlobales.trim() || null
        })
      });

      if (!response.ok) {
        if (response.status === 419) {
          mostrarAlerta('error', 'Sesión expirada. Recargue la página e intente nuevamente.');
          return;
        }
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Remover préstamos devueltos de la lista
        setPrestamos(prev => prev.filter(p => !prestamosSeleccionados.has(p.id)));
        setPrestamosSeleccionados(new Set());
        setObservacionesIndividuales(new Map());
        setPrestamosConObservacionesExpandidas(new Set());
        setMostrarObservacionesGlobales(false);
        
        const cantidadDevueltos = data.prestamos_devueltos || prestamosParaDevolver.length;
        mostrarAlerta('success', `${cantidadDevueltos} préstamo(s) devuelto(s) exitosamente`);
        setModalAbierto(false);
      } else {
        mostrarAlerta('error', data.message || 'Error al procesar las devoluciones');
      }
    } catch (error) {
      console.error('Error en confirmarDevolucionMultiple:', error);
      mostrarAlerta('error', 'Error de conexión al procesar las devoluciones');
    } finally {
      setProcesandoDevolucion(false);
    }
  }, [prestamosSeleccionados, fechaDevuelto, observacionesGlobales, observacionesIndividuales, mostrarAlerta]);

  const getEstadoBadge = useCallback((estado: string): string => {
    switch (estado.toUpperCase() as EstadoPrestamo) {
      case 'VENCIDO':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      case 'ACTIVO':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
      case 'DEVUELTO':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
    }
  }, []);

  const calcularDiasVencimiento = useCallback((fechaDevolucion: string): number => {
    return calcularDiferenciaDias(fechaDevolucion);
  }, []);

  // NUEVOS: Memos para prestamos filtrados y paginados
  const prestamosFiltrados = useMemo(() => {
    return filtrarPrestamos(prestamos, filtros);
  }, [prestamos, filtros]);

  const { prestamosEnPagina, paginacion } = useMemo(() => {
    return paginarPrestamos(prestamosFiltrados, paginaActual);
  }, [prestamosFiltrados, paginaActual]);

  const estadisticas = useMemo(() => {
    return calcularEstadisticasDevolucion(prestamos, prestamosSeleccionados, observacionesIndividuales);
  }, [prestamos, prestamosSeleccionados, observacionesIndividuales]);

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
                  Devolución de material bibliográfico  
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

          {/* NUEVO: Filtros y búsqueda para lotes grandes */}
          {prestamos.length > 0 && (
            <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col space-y-4">
                {/* Primera fila: Controles de selección y filtros */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="selectAll"
                        checked={prestamosSeleccionados.size === prestamosFiltrados.length && prestamosFiltrados.length > 0}
                        onChange={toggleSeleccionTodos}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded 
                                   focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 
                                   focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label htmlFor="selectAll" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Seleccionar todos ({prestamosFiltrados.length})
                      </label>
                    </div>
                    
                    {prestamosSeleccionados.size > 0 && (
                      <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-medium">
                          {prestamosSeleccionados.size} seleccionado(s)
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setMostrarFiltros(!mostrarFiltros)}
                      className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 
                                 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg flex items-center gap-2 
                                 transition-all duration-200 text-sm font-medium"
                    >
                      <Filter className="w-4 h-4" />
                      <span>Filtros</span>
                      {mostrarFiltros ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {prestamosSeleccionados.size > 0 && (
                      <>
                        <button
                          onClick={() => {
                            setPrestamosSeleccionados(new Set());
                            setObservacionesIndividuales(new Map());
                            setPrestamosConObservacionesExpandidas(new Set());
                          }}
                          className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 
                                     text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg flex items-center gap-2 
                                     transition-all duration-200 text-sm font-medium"
                          title="Limpiar selección"
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span>Limpiar</span>
                        </button>
                        
                        <button
                          onClick={abrirModalMultiple}
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 
                                     text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 
                                     shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-semibold text-sm"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Devolver ({prestamosSeleccionados.size})</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Estadísticas rápidas */}
                {prestamos.length > 10 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                      <div className="font-medium text-blue-800 dark:text-blue-300">Total</div>
                      <div className="text-xl font-bold text-blue-900 dark:text-blue-100">{estadisticas.totalPrestamos}</div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                      <div className="font-medium text-red-800 dark:text-red-300">Vencidos</div>
                      <div className="text-xl font-bold text-red-900 dark:text-red-100">{estadisticas.prestamosVencidos}</div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                      <div className="font-medium text-green-800 dark:text-green-300">Activos</div>
                      <div className="text-xl font-bold text-green-900 dark:text-green-100">{estadisticas.prestamosActivos}</div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                      <div className="font-medium text-purple-800 dark:text-purple-300">Seleccionados</div>
                      <div className="text-xl font-bold text-purple-900 dark:text-purple-100">{estadisticas.prestamosSeleccionados}</div>
                    </div>
                  </div>
                )}

                {/* Panel de filtros expandible */}
                {mostrarFiltros && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Búsqueda de texto */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Buscar libro
                        </label>
                        <input
                          type="text"
                          value={filtros.busquedaTexto}
                          onChange={(e) => setFiltros(prev => ({ ...prev, busquedaTexto: e.target.value }))}
                          placeholder="Título, código o #ejemplar"
                          className="w-full text-xs p-2 border border-gray-300 dark:border-gray-600 rounded 
                                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                     focus:ring-1 focus:ring-blue-500 focus:border-blue-500
                                     placeholder-gray-400 dark:placeholder-gray-500"
                        />
                      </div>

                      {/* Filtros de estado */}
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Estado</label>
                        <div className="flex gap-2">
                          <label className="flex items-center text-xs">
                            <input
                              type="checkbox"
                              checked={filtros.soloVencidos}
                              onChange={(e) => setFiltros(prev => ({ ...prev, soloVencidos: e.target.checked }))}
                              className="w-3 h-3 text-red-600 mr-1"
                            />
                            Solo vencidos
                          </label>
                          <label className="flex items-center text-xs">
                            <input
                              type="checkbox"
                              checked={filtros.soloActivos}
                              onChange={(e) => setFiltros(prev => ({ ...prev, soloActivos: e.target.checked }))}
                              className="w-3 h-3 text-green-600 mr-1"
                            />
                            Solo activos
                          </label>
                        </div>
                      </div>

                      {/* Botón limpiar filtros */}
                      <div className="flex items-end">
                        <button
                          onClick={() => {
                            setFiltros({
                              soloVencidos: false,
                              soloActivos: false,
                              conObservaciones: false,
                              busquedaTexto: ''
                            });
                            setPaginaActual(1);
                          }}
                          className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 
                                     text-gray-700 dark:text-gray-300 px-3 py-2 rounded transition-all duration-200"
                        >
                          Limpiar filtros
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Lista de préstamos con paginación */}
          {prestamos.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Book className="w-5 h-5" />
                    Préstamos Pendientes 
                    <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
                      ({prestamosFiltrados.length} de {prestamos.length})
                    </span>
                  </h3>
                  
                  {paginacion.mostrarPaginacion && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Página {paginacion.paginaActual} de {paginacion.totalPaginas}
                    </div>
                  )}
                </div>
              </div>

              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {prestamosEnPagina.map((prestamo) => {
                  const diasVencimiento = calcularDiasVencimiento(prestamo.fecha_devolucion);
                  const isSelected = prestamosSeleccionados.has(prestamo.id);
                  const observacionesExpanded = prestamosConObservacionesExpandidas.has(prestamo.id);
                  const observacionIndividual = (observacionesIndividuales.get(prestamo.id) ?? prestamo.ejemplar.observaciones ?? '');
                  
                  return (
                    <div 
                      key={prestamo.id} 
                      className={`p-6 transition-all duration-200 ${
                        isSelected 
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Checkbox para selección */}
                        <div className="flex items-center pt-1">
                          <input
                            type="checkbox"
                            id={`prestamo-${prestamo.id}`}
                            checked={isSelected}
                            onChange={() => toggleSeleccionPrestamo(prestamo.id)}
                            className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded 
                                       focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 
                                       focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          />
                        </div>

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
                                  Por: {prestamo.ejemplar.libro.autor.apellidos}, {prestamo.ejemplar.libro.autor.nombres}
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
                                  <span className="font-medium">Código:</span>
                                  <span>{prestamo.ejemplar.libro.codigo_unico}</span>
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

                              <div className="flex items-center gap-3 mt-3">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getEstadoBadge(prestamo.estado)}`}>
                                  {prestamo.estado === 'VENCIDO' && <AlertCircle className="w-3 h-3 mr-1" />}
                                  {prestamo.estado}
                                </span>

                                {/* Botón para ver observaciones específicas (solo lectura) */}
                                {isSelected && (
                                  <button
                                    onClick={() => toggleObservacionesIndividuales(prestamo.id)}
                                    className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                                      observacionesExpanded
                                        ? 'bg-gray-100 text-gray-800 border border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                                        : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
                                    }`}
                                    title={observacionesExpanded ? 'Ocultar observaciones específicas' : 'Ver observaciones específicas (solo lectura)'}
                                  >
                                    <Eye className="w-3 h-3 mr-1" />
                                    {observacionesExpanded ? 'Ocultar obs.' : 'Ver obs.'}
                                    {observacionesExpanded ? <EyeOff className="w-3 h-3 ml-1" /> : <MessageSquare className="w-3 h-3 ml-1" />}
                                  </button>
                                )}
                              </div>

                              {/* Campo de observaciones específicas SOLO LECTURA - Edición en modal de confirmación */}
                              {isSelected && observacionesExpanded && (
                                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Observaciones específicas para el ejemplar #{prestamo.ejemplar.numEjemplar}:
                                  </label>
                                  <textarea
                                    value={observacionIndividual}
                                    readOnly
                                    placeholder="Las observaciones específicas se editarán en la confirmación de devolución..."
                                    className="w-full text-xs p-2 border border-gray-300 dark:border-gray-600 rounded 
                                               bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300
                                               cursor-not-allowed resize-none opacity-75"
                                    rows={2}
                                  />
                                  <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    <span className="flex items-center gap-1">
                                      <MessageSquare className="w-3 h-3" />
                                      Edición disponible en "Confirmar Devolución Múltiple"
                                    </span>
                                    <span className="text-blue-600 dark:text-blue-400 font-medium">Solo lectura</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Paginación */}
              {paginacion.mostrarPaginacion && (
                <div className="p-6 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Mostrando {((paginacion.paginaActual - 1) * paginacion.itemsPorPagina) + 1} - {Math.min(paginacion.paginaActual * paginacion.itemsPorPagina, paginacion.totalItems)} de {paginacion.totalItems} préstamos
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPaginaActual(prev => Math.max(1, prev - 1))}
                        disabled={paginacion.paginaActual === 1}
                        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 
                                   px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 
                                   disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        Anterior
                      </button>
                      
                      <span className="text-sm text-gray-600 dark:text-gray-400 px-3">
                        {paginacion.paginaActual} / {paginacion.totalPaginas}
                      </span>
                      
                      <button
                        onClick={() => setPaginaActual(prev => Math.min(paginacion.totalPaginas, prev + 1))}
                        disabled={paginacion.paginaActual === paginacion.totalPaginas}
                        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 
                                   px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 
                                   disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                </div>
              )}
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
                Ingrese el código del lector para encontrar sus préstamos activos y procesar devoluciones múltiples ilimitadas.
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

          {/* Información adicional mejorada */}
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
                  Sistema de Devolución Múltiple Mejorado
                </p>
                <p className="text-sm text-green-700 dark:text-green-400">
                  <strong>Nuevo:</strong> Procese cantidades ilimitadas de préstamos simultáneamente. 
                  Use filtros para manejar lotes grandes. Las observaciones específicas son opcionales - use el botón "Agregar obs." cuando necesite notas particulares para ejemplares específicos. 
                  Las observaciones globales se aplican a todos los ejemplares seleccionados que no tengan observaciones individuales.
                  Ideal para docentes con múltiples préstamos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de devolución múltiple */}
      <ConfirmacionModalMultiple
        isOpen={modalAbierto}
        onClose={cerrarModal}
        prestamosSeleccionados={Array.from(prestamosSeleccionados).map(id => 
          prestamos.find(p => p.id === id)!
        )}
        fechaDevuelto={fechaDevuelto}
        setFechaDevuelto={setFechaDevuelto}
        observacionesGlobales={observacionesGlobales}
        setObservacionesGlobales={setObservacionesGlobales}
        observacionesIndividuales={observacionesIndividuales}
        setObservacionesIndividuales={setObservacionesIndividuales}
        procesandoDevolucion={procesandoDevolucion}
        onConfirmar={confirmarDevolucionMultiple}
        prestamosConObservacionesExpandidas={prestamosConObservacionesExpandidas}
        setPrestamosConObservacionesExpandidas={setPrestamosConObservacionesExpandidas}
        mostrarObservacionesGlobales={mostrarObservacionesGlobales}
        setMostrarObservacionesGlobales={setMostrarObservacionesGlobales}
      />
    </AppLayout>
  );
}