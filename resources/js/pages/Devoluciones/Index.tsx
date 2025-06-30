import { Head, Link, router } from '@inertiajs/react';
import { Book, UserCheck, Calendar, CheckCircle, Search, X, AlertCircle } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type PrestamoPageProps, type Prestamo } from '../Prestamos/types';
import { useState, useEffect } from 'react';
import { obtenerFechaActual, formatearFecha, calcularDiasRestantes } from './utils';
import AlertNotification from './AlertNotification';

const breadcrumbs = [
  {
    title: 'Listado de Préstamos Activos',
    href: '/prestamos/devoluciones',
  },
];

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
    }, {
      onSuccess: () => {
        router.visit('/prestamos/listado');
      }
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
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl dark:bg-blue-600/10"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-indigo-500/5 blur-3xl dark:bg-indigo-600/10"></div>
      </div>
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Listado de Préstamos Activos
            </span>
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
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Buscar Préstamos Activos
                  </span>
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
                    .map((prestamo: Prestamo, index) => {
                      // CORREGIDO: Calcular días restantes usando la nueva función
                      const tiempoRestante = calcularDiasRestantes(prestamo.fecha_devolucion);
                      
                      return (
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
                                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{(prestamo as any).lector?.nombre || 'Usuario'}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Usuario activo</div>
                              </div>

                              {/* Fecha Préstamo - CORREGIDO */}
                              <div className="bg-white/70 dark:bg-gray-700/50 backdrop-blur-sm rounded-xl p-5 border border-gray-200/60 dark:border-gray-600/60 hover:shadow-lg transition-all duration-300">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-500/20 dark:to-emerald-500/15 rounded-lg flex items-center justify-center">
                                    <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                  </div>
                                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Préstamo</span>
                                </div>
                                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                  {formatearFecha(prestamo.fecha_prestamo, { day: 'numeric', month: 'short' })}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                  {prestamo.fecha_prestamo && new Date(prestamo.fecha_prestamo).getFullYear()}
                                </div>
                              </div>

                              {/* Fecha Devolución - CORREGIDO */}
                              <div className={`backdrop-blur-sm rounded-xl p-5 border-2 hover:shadow-xl transition-all duration-300 relative overflow-hidden ${
                                tiempoRestante.estado === 'vencido' 
                                  ? 'bg-gradient-to-br from-red-50/80 to-red-100/80 dark:from-red-500/10 dark:to-red-600/10 border-red-200/60 dark:border-red-500/30 hover:border-red-300 dark:hover:border-red-400'
                                  : tiempoRestante.estado === 'vence_hoy'
                                  ? 'bg-gradient-to-br from-orange-50/80 to-yellow-50/80 dark:from-orange-500/10 dark:to-yellow-500/10 border-orange-200/60 dark:border-orange-500/30 hover:border-orange-300 dark:hover:border-orange-400'
                                  : 'bg-gradient-to-br from-amber-50/80 to-orange-50/80 dark:from-amber-500/10 dark:to-orange-500/10 border-amber-200/60 dark:border-amber-500/30 hover:border-amber-300 dark:hover:border-amber-400'
                              }`}>
                                
                                {/* Efecto de brillo */}
                                <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-br ${
                                  tiempoRestante.estado === 'vencido'
                                    ? 'from-red-100/20 via-transparent to-red-100/20 dark:from-red-300/5 dark:via-transparent dark:to-red-300/5'
                                    : tiempoRestante.estado === 'vence_hoy'
                                    ? 'from-orange-100/20 via-transparent to-yellow-100/20 dark:from-orange-300/5 dark:via-transparent dark:to-yellow-300/5'
                                    : 'from-amber-100/20 via-transparent to-orange-100/20 dark:from-amber-300/5 dark:via-transparent dark:to-orange-300/5'
                                }`}></div>
                                
                                <div className="relative z-10">
                                  <div className="flex items-center gap-3 mb-3">
                                    <div className={`w-9 h-9 bg-gradient-to-br rounded-xl flex items-center justify-center shadow-md ${
                                      tiempoRestante.estado === 'vencido'
                                        ? 'from-red-200 to-red-300 dark:from-red-500/40 dark:to-red-600/40'
                                        : tiempoRestante.estado === 'vence_hoy'
                                        ? 'from-orange-200 to-yellow-300 dark:from-orange-500/40 dark:to-yellow-500/40'
                                        : 'from-amber-200 to-orange-300 dark:from-amber-500/40 dark:to-orange-500/40'
                                    }`}>
                                      <Calendar className={`h-5 w-5 ${
                                        tiempoRestante.estado === 'vencido'
                                          ? 'text-red-700 dark:text-red-300'
                                          : tiempoRestante.estado === 'vence_hoy'
                                          ? 'text-orange-700 dark:text-orange-300'
                                          : 'text-amber-700 dark:text-amber-300'
                                      }`} />
                                    </div>
                                    <span className={`text-xs font-bold uppercase tracking-wider ${
                                      tiempoRestante.estado === 'vencido'
                                        ? 'text-red-700 dark:text-red-300'
                                        : tiempoRestante.estado === 'vence_hoy'
                                        ? 'text-orange-700 dark:text-orange-300'
                                        : 'text-amber-700 dark:text-amber-300'
                                    }`}>
                                      {tiempoRestante.estado === 'vencido' ? 'Vencido' : 'Vencimiento'}
                                    </span>
                                  </div>
                                  
                                  <div className="space-y-1">
                                    <div className={`text-2xl font-bold ${
                                      tiempoRestante.estado === 'vencido'
                                        ? 'text-red-800 dark:text-red-200'
                                        : tiempoRestante.estado === 'vence_hoy'
                                        ? 'text-orange-800 dark:text-orange-200'
                                        : 'text-amber-800 dark:text-amber-200'
                                    }`}>
                                      {formatearFecha(prestamo.fecha_devolucion, { day: 'numeric', month: 'short' })}
                                    </div>
                                    <div className={`text-sm font-semibold ${
                                      tiempoRestante.estado === 'vencido'
                                        ? 'text-red-600 dark:text-red-400'
                                        : tiempoRestante.estado === 'vence_hoy'
                                        ? 'text-orange-600 dark:text-orange-400'
                                        : 'text-amber-600 dark:text-amber-400'
                                    }`}>
                                      {prestamo.fecha_devolucion && new Date(prestamo.fecha_devolucion).getFullYear()}
                                    </div>
                                    
                                    {/* Indicador de tiempo restante/vencido */}
                                    <div className="flex items-center gap-2 mt-2">
                                      <div className={`w-2 h-2 rounded-full animate-pulse ${
                                        tiempoRestante.estado === 'vencido'
                                          ? 'bg-red-500'
                                          : tiempoRestante.estado === 'vence_hoy'
                                          ? 'bg-orange-500'
                                          : 'bg-amber-500'
                                      }`}></div>
                                      <span className={`text-xs font-medium ${
                                        tiempoRestante.estado === 'vencido'
                                          ? 'text-red-600 dark:text-red-400'
                                          : tiempoRestante.estado === 'vence_hoy'
                                          ? 'text-orange-600 dark:text-orange-400'
                                          : 'text-amber-600 dark:text-amber-400'
                                      }`}>
                                        {tiempoRestante.estado === 'vencido'
                                          ? `Vencido hace ${tiempoRestante.dias} día${tiempoRestante.dias !== 1 ? 's' : ''}`
                                          : tiempoRestante.estado === 'vence_hoy'
                                          ? 'Vence hoy'
                                          : `${tiempoRestante.dias} día${tiempoRestante.dias !== 1 ? 's' : ''} restante${tiempoRestante.dias !== 1 ? 's' : ''}`
                                        }
                                      </span>
                                    </div>
                                  </div>
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
                      );
                    })}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Modal de devolución - MEJORADO con el estilo de la imagen */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-600/50 relative overflow-hidden">
            
            {/* Efectos de fondo */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl"></div>

            <div className="relative z-10">
              {/* Header del modal */}
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Registrar Devolución
                  </h3>
                  <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                </div>
                <button
                  onClick={cerrarModal}
                  className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-slate-700/50 transition-all duration-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Mensaje informativo */}
              <div className="bg-blue-500/10 border-l-4 border-blue-500 p-4 rounded-lg mb-6">
                <p className="text-blue-100 text-sm">
                  Complete los campos para continuar con el proceso de devolución
                </p>
              </div>

              <div className="space-y-6">
                {/* Campo Fecha de Devolución */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Fecha de Devolución <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={fechaDevuelto}
                      onChange={(e) => setFechaDevuelto(e.target.value)}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-xl p-4 
                                text-white placeholder-gray-400 focus:outline-none 
                                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                                transition-all duration-200 hover:bg-slate-700/70"
                      required
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Campo Observaciones */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Observaciones <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl p-4 
                              text-white placeholder-gray-400 focus:outline-none 
                              focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                              transition-all duration-200 hover:bg-slate-700/70 h-28 resize-none"
                    placeholder="Ingrese las observaciones sobre la devolución"
                  />
                </div>

                {/* Botones de acción */}
                <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-600/50">
                  <button
                    onClick={cerrarModal}
                    className="px-6 py-3 text-sm font-semibold rounded-xl
                              bg-slate-700 text-gray-300 border border-slate-600
                              hover:bg-slate-600 hover:text-white
                              focus:outline-none focus:ring-2 focus:ring-slate-500 
                              transition-all duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmarDevolucion}
                    disabled={!fechaDevuelto}
                    className="px-6 py-3 text-sm font-semibold rounded-xl
                              bg-gradient-to-r from-blue-600 to-indigo-600 
                              hover:from-blue-700 hover:to-indigo-700 
                              text-white shadow-lg hover:shadow-xl
                              focus:outline-none focus:ring-2 focus:ring-blue-500
                              disabled:opacity-50 disabled:cursor-not-allowed 
                              disabled:hover:from-blue-600 disabled:hover:to-indigo-600
                              transition-all duration-200 transform hover:scale-105 disabled:transform-none"
                  >
                    Guardar
                  </button>
                </div>
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