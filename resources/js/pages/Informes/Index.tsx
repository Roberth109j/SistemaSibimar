import React, { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { 
  FileBarChart, 
  Download, 
  Calendar, 
  BookOpen, 
  BookmarkX, 
  BarChart3, 
  PieChart,
  Filter,
  CheckCircle,
  AlertCircle,
  X,
  Eye
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

// Tipos específicos para informes
interface RangoFecha {
  inicio: string;
  fin: string;
}

interface RangosFecha {
  mensual: RangoFecha;
  trimestral: RangoFecha;
  semestral: RangoFecha;
  anual: RangoFecha;
}

interface InformesProps {
  auth: any;
  flash?: {
    success?: string;
    error?: string;
  };
}

type TipoInforme = 'prestamos-realizados' | 'libros-no-devueltos';
type TipoPeriodo = 'personalizado' | 'mensual' | 'trimestral' | 'semestral' | 'anual';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Informes', href: '/informes' },
];

// Componente de Notificación
function AlertNotification({
  type,
  message,
  onClose,
}: {
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
}) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible) return null;

  return (
    <div className={`fixed top-6 right-6 z-50 max-w-md rounded-lg shadow-xl border-l-4 p-5 transition-all duration-300 ${
      type === 'success' 
        ? 'bg-green-50 border-green-500 text-green-800 dark:bg-green-900/20 dark:border-green-500 dark:text-green-200'
        : 'bg-red-50 border-red-500 text-red-800 dark:bg-red-900/20 dark:border-red-500 dark:text-red-200'
    }`}>
      <div className="flex items-start">
        {type === 'success' ? (
          <CheckCircle className="h-6 w-6 mr-4 flex-shrink-0 text-green-500" />
        ) : (
          <AlertCircle className="h-6 w-6 mr-4 flex-shrink-0 text-red-500" />
        )}
        <div className="flex-grow">
          <p className="font-semibold">{message}</p>
        </div>
        <button onClick={onClose} className="ml-4 text-gray-400 hover:text-gray-600">
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

export default function Index({ auth, flash }: InformesProps) {
  // Obtener datos de la página de Inertia
  const { props } = usePage();
  
  // Estados del formulario
  const [tipoInforme, setTipoInforme] = useState<TipoInforme>('prestamos-realizados');
  const [tipoPeriodo, setTipoPeriodo] = useState<TipoPeriodo>('mensual');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [cargando, setCargando] = useState(false);
  const [rangosFecha, setRangosFecha] = useState<RangosFecha | null>(null);
  
  // Estado de notificaciones
  const [alerts, setAlerts] = useState<{
    success: string | null;
    error: string | null;
  }>({
    success: flash?.success || null,
    error: flash?.error || null,
  });

  // Obtener rangos de fecha predefinidos
  useEffect(() => {
    fetch('/informes/rangos-fecha')
      .then(res => res.json())
      .then(data => {
        setRangosFecha(data);
        // Establecer fechas por defecto (mensual)
        if (data.mensual) {
          setFechaInicio(data.mensual.inicio);
          setFechaFin(data.mensual.fin);
        }
      })
      .catch(console.error);
  }, []);

  // Actualizar fechas cuando cambia el tipo de período
  useEffect(() => {
    if (rangosFecha && tipoPeriodo !== 'personalizado') {
      const rango = rangosFecha[tipoPeriodo];
      if (rango) {
        setFechaInicio(rango.inicio);
        setFechaFin(rango.fin);
      }
    }
  }, [tipoPeriodo, rangosFecha]);

  // Función para obtener el token CSRF
  const getCSRFToken = () => {
    const metaTag = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement;
    return metaTag ? metaTag.getAttribute('content') : '';
  };

  // Generar vista previa - MÉTODO CORREGIDO
  const generarVistaPrevia = () => {
    if (!fechaInicio || !fechaFin) {
      setAlerts(prev => ({ ...prev, error: 'Debe seleccionar fechas de inicio y fin' }));
      return;
    }

    if (new Date(fechaInicio) > new Date(fechaFin)) {
      setAlerts(prev => ({ ...prev, error: 'La fecha de inicio no puede ser mayor a la fecha de fin' }));
      return;
    }

    setCargando(true);

    const datos = {
      _token: getCSRFToken(),
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      periodo: tipoPeriodo !== 'personalizado' ? tipoPeriodo : null,
      formato: 'vista'
    };

    console.log('Vista previa - Datos enviados:', datos);

    // Usar router.post con método explícito
    const url = tipoInforme === 'prestamos-realizados' 
      ? '/informes/prestamos-realizados'
      : '/informes/libros-no-devueltos';

    router.post(url, datos, {
      preserveScroll: false,
      preserveState: false,
      forceFormData: true,
      onStart: () => {
        console.log('Iniciando petición POST para vista previa');
      },
      onSuccess: (page) => {
        setCargando(false);
        console.log('Vista previa generada exitosamente', page);
      },
      onError: (errors) => {
        setCargando(false);
        console.error('Error en vista previa:', errors);
        
        // Manejar errores específicos
        if (errors.message && errors.message.includes('419')) {
          setAlerts(prev => ({ 
            ...prev, 
            error: 'Sesión expirada. Recargue la página e intente nuevamente.' 
          }));
        } else {
          const errorMessage = typeof errors === 'object' 
            ? Object.values(errors).flat().join(', ')
            : 'Error al generar la vista previa';
          setAlerts(prev => ({ 
            ...prev, 
            error: errorMessage
          }));
        }
      },
      onFinish: () => {
        setCargando(false);
      }
    });
  };

  // Descargar PDF
  const descargarPDF = () => {
    if (!fechaInicio || !fechaFin) {
      setAlerts(prev => ({ ...prev, error: 'Debe seleccionar fechas de inicio y fin' }));
      return;
    }

    if (new Date(fechaInicio) > new Date(fechaFin)) {
      setAlerts(prev => ({ ...prev, error: 'La fecha de inicio no puede ser mayor a la fecha de fin' }));
      return;
    }

    setCargando(true);

    const params = new URLSearchParams({
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      ...(tipoPeriodo !== 'personalizado' && { periodo: tipoPeriodo })
    });

    const url = tipoInforme === 'prestamos-realizados' 
      ? `/informes/descargar-prestamos?${params}`
      : `/informes/descargar-no-devueltos?${params}`;

    // Método de descarga universal
    window.open(url, '_blank');
    
    setTimeout(() => {
      setCargando(false);
      setAlerts(prev => ({ 
        ...prev, 
        success: 'PDF generado exitosamente. Verifique su carpeta de descargas.' 
      }));
    }, 2000);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Generación de Informes" />

      <div className="py-8 px-6 bg-slate-50 dark:bg-black min-h-screen">
        {/* Notificaciones */}
        {alerts.success && (
          <AlertNotification
            type="success"
            message={alerts.success}
            onClose={() => setAlerts(prev => ({ ...prev, success: null }))}
          />
        )}
        {alerts.error && (
          <AlertNotification
            type="error"
            message={alerts.error}
            onClose={() => setAlerts(prev => ({ ...prev, error: null }))}
          />
        )}

        {/* Efectos de fondo */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl dark:bg-blue-600/10"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-indigo-500/5 blur-3xl dark:bg-indigo-600/10"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Generación de Informes
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Genere informes detallados de préstamos y libros no devueltos con estadísticas visuales en formato PDF
            </p>
          </div>

          {/* Formulario Principal */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-8">
              {/* Selección de Tipo de Informe */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Tipo de Informe
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Préstamos Realizados */}
                  <div
                    className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      tipoInforme === 'prestamos-realizados'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    onClick={() => setTipoInforme('prestamos-realizados')}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg ${
                        tipoInforme === 'prestamos-realizados'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                      }`}>
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          Préstamos Realizados
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Reporte completo de todos los préstamos realizados en un período, 
                          incluyendo estadísticas, gráficos y análisis detallado.
                        </p>
                        <div className="mt-3 flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                          <BarChart3 className="w-4 h-4" />
                          <span>Incluye gráficos estadísticos</span>
                        </div>
                      </div>
                    </div>
                    {tipoInforme === 'prestamos-realizados' && (
                      <div className="absolute top-3 right-3">
                        <CheckCircle className="w-5 h-5 text-blue-500" />
                      </div>
                    )}
                  </div>

                  {/* Libros No Devueltos */}
                  <div
                    className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      tipoInforme === 'libros-no-devueltos'
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-400'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    onClick={() => setTipoInforme('libros-no-devueltos')}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg ${
                        tipoInforme === 'libros-no-devueltos'
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                      }`}>
                        <BookmarkX className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          Libros No Devueltos
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Listado de libros pendientes de devolución con datos del estudiante, 
                          subgrado, días de retraso y severidad.
                        </p>
                        <div className="mt-3 flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                          <PieChart className="w-4 h-4" />
                          <span>Análisis por severidad</span>
                        </div>
                      </div>
                    </div>
                    {tipoInforme === 'libros-no-devueltos' && (
                      <div className="absolute top-3 right-3">
                        <CheckCircle className="w-5 h-5 text-red-500" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Selección de Período */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Período del Informe
                </h3>
                
                {/* Botones de Período Predefinido */}
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: 'mensual', label: 'Este Mes' },
                      { key: 'trimestral', label: 'Este Trimestre' },
                      { key: 'semestral', label: 'Este Semestre' },
                      { key: 'anual', label: 'Este Año' },
                      { key: 'personalizado', label: 'Personalizado' }
                    ].map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => setTipoPeriodo(key as TipoPeriodo)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          tipoPeriodo === key
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selección de Fechas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Fecha de Inicio
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={fechaInicio}
                        onChange={(e) => {
                          setFechaInicio(e.target.value);
                          setTipoPeriodo('personalizado');
                        }}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Fecha de Fin
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={fechaFin}
                        onChange={(e) => {
                          setFechaFin(e.target.value);
                          setTipoPeriodo('personalizado');
                        }}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Información del período seleccionado */}
                {fechaInicio && fechaFin && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Filter className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        Período seleccionado: {new Date(fechaInicio).toLocaleDateString('es-ES')} - {new Date(fechaFin).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Botones de Acción */}
              <div className="flex items-center justify-end space-x-4">
                <button
                  onClick={generarVistaPrevia}
                  disabled={cargando || !fechaInicio || !fechaFin}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center space-x-2 disabled:cursor-not-allowed"
                >
                  {cargando ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Generando...</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-5 h-5" />
                      <span>Vista Previa</span>
                    </>
                  )}
                </button>

                <button
                  onClick={descargarPDF}
                  disabled={cargando || !fechaInicio || !fechaFin}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {cargando ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Descargando...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      <span>Descargar PDF</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Características de los informes */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FileBarChart className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-2" />
                Características de los Informes
              </h3>
              <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Estadísticas detalladas con gráficos visuales</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Vista previa en pantalla con datos interactivos</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Formato PDF profesional listo para imprimir</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Datos organizados por grado y estado</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Compatible con todos los navegadores</span>
                </li>
              </ul>
            </div>

            {/* Guía de uso */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Guía de Uso
              </h3>
              <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400 flex-shrink-0">1</div>
                  <span>Seleccione el tipo de informe que desea generar</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400 flex-shrink-0">2</div>
                  <span>Elija un período predefinido o configure fechas personalizadas</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400 flex-shrink-0">3</div>
                  <span>Use "Vista Previa" para ver el informe en pantalla con gráficos interactivos</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center text-xs font-bold text-red-600 dark:text-red-400 flex-shrink-0">4</div>
                  <span>Use "Descargar PDF" para obtener el archivo listo para imprimir</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}