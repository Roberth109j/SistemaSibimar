import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { CheckCircle, AlertCircle, X, AlertTriangle, User, Users } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { 
  type PrestamoPageProps, 
  type Libro, 
  type Ejemplar, 
  type NotificationType, 
  type PrestamoForm,
  type Lector 
} from './types';

// Componentes del wizard
import { IndicadorPasos } from './components/IndicadorPasos';
import { PasoBuscarLibro } from './components/PasoBuscarLibro';
import { PasoSeleccionarEjemplar } from './components/PasoSeleccionarEjemplar';
import { PasoEscanearEstudiante } from './components/PasoEscanearEstudiante';
import { ResumenPrestamo } from './components/ResumenPrestamo';

// Constantes
const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Préstamos',
    href: '/prestamos',
  },
  {
    title: 'Nuevo Préstamo',
    href: '#',
  },
];

// Función para obtener la fecha actual
const obtenerFechaActual = (): string => {
  const hoy = new Date();
  const año = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${año}-${mes}-${dia}`;
};

// Función para calcular fecha de devolución por defecto (2 días hábiles)
const calcularFechaDevolucionDefault = (fechaPrestamo: string): string => {
  const [año, mes, dia] = fechaPrestamo.split('-').map(Number);
  const fecha = new Date(año, mes - 1, dia, 0, 0, 0);
  
  let diasAgregados = 0;
  while (diasAgregados < 2) {
    fecha.setDate(fecha.getDate() + 1);
    if (fecha.getDay() !== 0 && fecha.getDay() !== 6) {
      diasAgregados++;
    }
  }
  
  const añoResultado = fecha.getFullYear();
  const mesResultado = String(fecha.getMonth() + 1).padStart(2, '0');
  const diaResultado = String(fecha.getDate()).padStart(2, '0');
  return `${añoResultado}-${mesResultado}-${diaResultado}`;
};

export default function Index({
  auth,
  ejemplares: ejemplaresIniciales = [],
  libro: libroInicial = null,
  flash = {},
}: PrestamoPageProps) {
  const { errors = {} } = usePage().props;
  
  // NUEVO: Estado para tipo de préstamo
  const [tipoPrestamo, setTipoPrestamo] = useState<'individual' | 'masivo' | null>(null);
  
  // Estado del wizard
  const [pasoActual, setPasoActual] = useState<1 | 2 | 3 | 4>(1);
  const [libroSeleccionado, setLibroSeleccionado] = useState<Libro | null>(
    libroInicial && 'id' in libroInicial ? libroInicial : null
  );
  
  // MODIFICADO: Ahora puede ser un array para préstamos masivos
  const [ejemplaresSeleccionados, setEjemplaresSeleccionados] = useState<Ejemplar[]>([]);
  
  const [lectorSeleccionado, setLectorSeleccionado] = useState<Lector | null>(null);
  const [ejemplaresDisponibles, setEjemplaresDisponibles] = useState<Ejemplar[]>(
    Array.isArray(ejemplaresIniciales) ? ejemplaresIniciales : []
  );
  const [cargando, setCargando] = useState<boolean>(false);
  const [mostrarResumen, setMostrarResumen] = useState<boolean>(false);
  
  // Estado del formulario de préstamo
  const [formularioPrestamo, setFormularioPrestamo] = useState<PrestamoForm>({
    fecha_prestamo: obtenerFechaActual(),
    fecha_devolucion: '',
    estado: 'ACTIVO',
    observaciones: ''
  });
  
  // Estado de notificaciones
  const [notificacion, setNotificacion] = useState<NotificationType>({
    show: false,
    type: 'success',
    message: ''
  });

  // Inicializar si viene con libro preseleccionado
  useEffect(() => {
    if (libroInicial && 'id' in libroInicial) {
      setLibroSeleccionado(libroInicial as Libro);
      setPasoActual(2);
    }
    if (ejemplaresIniciales && Array.isArray(ejemplaresIniciales) && ejemplaresIniciales.length > 0) {
      setEjemplaresDisponibles(ejemplaresIniciales);
    }
  }, [libroInicial, ejemplaresIniciales]);

  // Mostrar notificaciones flash
  useEffect(() => {
    if (flash?.success) {
      setNotificacion({
        show: true,
        type: 'success',
        message: flash.success
      });
    } else if (flash?.error) {
      setNotificacion({
        show: true,
        type: 'error',
        message: flash.error
      });
    }

    const timer = setTimeout(() => {
      setNotificacion(prev => ({ ...prev, show: false }));
    }, 5000);

    return () => clearTimeout(timer);
  }, [flash]);

  // Actualizar fecha de devolución cuando se seleccionan ejemplares
  useEffect(() => {
    if (ejemplaresSeleccionados.length > 0) {
      const fechaDefault = calcularFechaDevolucionDefault(formularioPrestamo.fecha_prestamo);
      setFormularioPrestamo(prev => ({
        ...prev,
        fecha_devolucion: fechaDefault
      }));
    }
  }, [ejemplaresSeleccionados, formularioPrestamo.fecha_prestamo]);

  // NUEVO: Seleccionar tipo de préstamo
  const handleSeleccionarTipo = (tipo: 'individual' | 'masivo') => {
    setTipoPrestamo(tipo);
    setPasoActual(1);
  };

  // Buscar libro
  const handleBuscarLibro = (codigoLibro: string) => {
    if (!codigoLibro.trim()) return;
    
    setCargando(true);
    router.get(
      '/libros/search',
      { search: codigoLibro },
      {
        preserveState: true,
        onSuccess: (page) => {
          const libro = page.props.libro;
          const ejemplares = page.props.ejemplares || [];
          
          if (libro) {
            setLibroSeleccionado(libro as Libro);
            setEjemplaresDisponibles(Array.isArray(ejemplares) ? ejemplares : []);
            setPasoActual(2);
          } else {
            setNotificacion({
              show: true,
              type: 'error',
              message: 'No se encontró ningún libro con el ISBN proporcionado'
            });
          }
          setCargando(false);
        },
        onError: (errors) => {
          setNotificacion({
            show: true,
            type: 'error',
            message: errors.message || 'No se encontró ningún libro con el ISBN proporcionado'
          });
          setCargando(false);
        }
      }
    );
  };

  // MODIFICADO: Seleccionar ejemplares (individual o múltiples)
  const handleSeleccionarEjemplares = (ejemplares: Ejemplar | Ejemplar[]) => {
    const ejemplaresArray = Array.isArray(ejemplares) ? ejemplares : [ejemplares];
    setEjemplaresSeleccionados(ejemplaresArray);
    if (ejemplaresArray.length > 0) {
      setPasoActual(3);
    }
  };

  // Escanear código de estudiante
  const handleEscanearEstudiante = (lector: Lector) => {
    setLectorSeleccionado(lector);
    setMostrarResumen(true);
  };

  // MODIFICADO: Confirmar préstamo (individual o masivo)
  const handleConfirmarPrestamo = () => {
    if (ejemplaresSeleccionados.length === 0 || !lectorSeleccionado) return;

    setCargando(true);
    
    // Decidir qué controlador usar según la cantidad de ejemplares
    const esPrestamoMasivo = tipoPrestamo === 'masivo' && ejemplaresSeleccionados.length > 1;
    const url = esPrestamoMasivo ? '/prestamos/masivo' : '/prestamos';
    
    const datos = esPrestamoMasivo ? {
      ejemplar_ids: ejemplaresSeleccionados.map(ejemplar => ejemplar.id),
      codigo_lector: lectorSeleccionado.codigo,
      fecha_prestamo: formularioPrestamo.fecha_prestamo,
      fecha_devolucion: formularioPrestamo.fecha_devolucion,
      estado: formularioPrestamo.estado
    } : {
      ejemplar_id: ejemplaresSeleccionados[0].id,
      codigo_lector: lectorSeleccionado.codigo,
      fecha_prestamo: formularioPrestamo.fecha_prestamo,
      fecha_devolucion: formularioPrestamo.fecha_devolucion,
      estado: formularioPrestamo.estado,
      observaciones: formularioPrestamo.observaciones
    };

    router.post(url, datos, {
      onSuccess: () => {
        setNotificacion({
          show: true,
          type: 'success',
          message: esPrestamoMasivo 
            ? '¡Préstamos masivos registrados exitosamente!'
            : '¡Préstamo registrado exitosamente!'
        });
        
        setTimeout(() => {
          handleReiniciar();
        }, 2000);
      },
      onError: (errors) => {
        setCargando(false);
        
        if (errors.codigo_lector) {
          setMostrarResumen(false);
        } else {
          const errorMessage = errors.ejemplar_id || errors.ejemplar_ids || 'Error al procesar el préstamo';
          setNotificacion({
            show: true,
            type: 'error',
            message: errorMessage
          });
        }
      }
    });
  };

  // Reiniciar formulario
  const handleReiniciar = () => {
    setTipoPrestamo(null);
    setPasoActual(1);
    setLibroSeleccionado(null);
    setEjemplaresSeleccionados([]);
    setLectorSeleccionado(null);
    setEjemplaresDisponibles([]);
    setMostrarResumen(false);
    setCargando(false);
    setFormularioPrestamo({
      fecha_prestamo: obtenerFechaActual(),
      fecha_devolucion: '',
      estado: 'ACTIVO',
      observaciones: ''
    });
  };

  // Navegar entre pasos
  const handlePasoAnterior = () => {
    if (pasoActual > 1) {
      setPasoActual((pasoActual - 1) as 1 | 2 | 3);
    }
  };

  // Puede avanzar al siguiente paso
  const puedeAvanzar = (): boolean => {
    switch (pasoActual) {
      case 1: return !!libroSeleccionado;
      case 2: return ejemplaresSeleccionados.length > 0;
      case 3: return !!lectorSeleccionado;
      default: return false;
    }
  };

  // NUEVO: Si no ha seleccionado tipo de préstamo, mostrar selector
  if (!tipoPrestamo) {
    return (
      <AppLayout
        breadcrumbs={breadcrumbs}
        renderHeader={() => (
          <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-white">
            Gestión de Préstamos
          </h2>
        )}
      >
        <Head title="Nuevo Préstamo" />

        <div className="py-6 px-20 bg-slate-50 dark:bg-black min-h-screen">
          <div className="mb-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Nuevo Préstamo de Libros
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Seleccione el tipo de préstamo que desea realizar
            </p>
          </div>

          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl dark:bg-blue-600/10"></div>
            <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-indigo-500/5 blur-3xl dark:bg-indigo-600/10"></div>
          </div>

          <div className="max-w-4xl mx-auto relative z-10">
            <div className="grid md:grid-cols-2 gap-8 mt-8">
              {/* Préstamo Individual */}
              <div
                className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:shadow-xl cursor-pointer transition-all duration-300 overflow-hidden group"
                onClick={() => handleSeleccionarTipo('individual')}
              >
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/70 transition-all duration-300">
                      <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Préstamo Individual
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Un ejemplar por préstamo
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Proceso rápido y sencillo
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Control detallado por ejemplar
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Ideal para préstamos diarios
                      </span>
                    </div>
                  </div>

                  <button className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                    Seleccionar Individual
                  </button>
                </div>
              </div>

              {/* Préstamo Masivo */}
              <div
                className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-green-300 hover:shadow-xl cursor-pointer transition-all duration-300 overflow-hidden group"
                onClick={() => handleSeleccionarTipo('masivo')}
              >
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-900/70 transition-all duration-300">
                      <Users className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Préstamo Masivo
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Múltiples ejemplares del mismo libro
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Selección múltiple con checkboxes
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Mismo período para todos
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Ideal para proyectos o grupos
                      </span>
                    </div>
                  </div>

                  <button className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
                    Seleccionar Masivo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      breadcrumbs={breadcrumbs}
      renderHeader={() => (
        <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-white">
          Gestión de Préstamos
        </h2>
      )}
    >
      <Head title="Nuevo Préstamo" />

      <div className="py-6 px-20 bg-slate-50 dark:bg-black min-h-screen">
        {/* Título principal modificado - AHORA SIEMPRE AZUL */}
        <div className="mb-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Préstamo {tipoPrestamo === 'masivo' ? 'Masivo' : 'Individual'}
            {tipoPrestamo === 'masivo' && ejemplaresSeleccionados.length > 0 && (
              <span className="text-sm ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                {ejemplaresSeleccionados.length} ejemplares
              </span>
            )}
          </h1>
        </div>

        {/* Notificación */}
        {notificacion.show && (
          <div className={`fixed top-4 right-4 z-50 flex items-center justify-between min-w-[320px] max-w-md p-4 rounded-lg shadow-xl backdrop-blur-sm transition-all duration-300 ${
            notificacion.type === 'success' 
              ? 'bg-green-50/95 dark:bg-green-800/40 border-l-4 border-green-500' 
              : notificacion.type === 'error'
              ? 'bg-red-50/95 dark:bg-red-800/40 border-l-4 border-red-500'
              : notificacion.type === 'warning'
              ? 'bg-yellow-50/95 dark:bg-yellow-800/40 border-l-4 border-yellow-500'
              : 'bg-blue-50/95 dark:bg-blue-800/40 border-l-4 border-blue-500'
          }`}>
            <div className="flex items-center">
              {notificacion.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 mr-3 flex-shrink-0" />
              ) : notificacion.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 mr-3 flex-shrink-0" />
              ) : notificacion.type === 'warning' ? (
                <AlertTriangle className="w-5 h-5 text-yellow-500 dark:text-yellow-400 mr-3 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-blue-500 dark:text-blue-400 mr-3 flex-shrink-0" />
              )}
              <p className={`${
                notificacion.type === 'success' 
                  ? 'text-green-700 dark:text-green-100' 
                  : notificacion.type === 'error'
                  ? 'text-red-700 dark:text-red-100'
                  : notificacion.type === 'warning'
                  ? 'text-yellow-700 dark:text-yellow-100'
                  : 'text-blue-700 dark:text-blue-100'
              } text-sm font-medium`}>
                {notificacion.message}
              </p>
            </div>
            <button
              onClick={() => setNotificacion(prev => ({ ...prev, show: false }))}
              className="ml-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Efectos de fondo - AHORA SIEMPRE AZUL */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl dark:bg-blue-600/10"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-indigo-500/5 blur-3xl dark:bg-indigo-600/10"></div>
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          {/* Indicador de pasos */}
          <IndicadorPasos 
            pasoActual={pasoActual} 
            libroSeleccionado={!!libroSeleccionado}
            ejemplarSeleccionado={ejemplaresSeleccionados.length > 0}
            estudianteEscaneado={!!lectorSeleccionado}
          />

          {/* Contenido del paso actual */}
          <div className="mt-6">
            {pasoActual === 1 && (
              <PasoBuscarLibro
                onBuscar={handleBuscarLibro}
                cargando={cargando}
                libroSeleccionado={libroSeleccionado}
              />
            )}

            {pasoActual === 2 && libroSeleccionado && (
              <PasoSeleccionarEjemplar
                libro={libroSeleccionado}
                ejemplares={ejemplaresDisponibles}
                onSeleccionar={handleSeleccionarEjemplares}
                onVolver={handlePasoAnterior}
                ejemplarSeleccionado={ejemplaresSeleccionados.length === 1 ? ejemplaresSeleccionados[0] : null}
                // NUEVO: Pasar tipo de préstamo y ejemplares seleccionados
                tipoPrestamo={tipoPrestamo}
                ejemplaresSeleccionados={ejemplaresSeleccionados}
              />
            )}

            {pasoActual === 3 && libroSeleccionado && ejemplaresSeleccionados.length > 0 && (
              <PasoEscanearEstudiante
                libro={libroSeleccionado}
                ejemplar={ejemplaresSeleccionados[0]} // Para compatibilidad
                formularioPrestamo={formularioPrestamo}
                onActualizarFormulario={setFormularioPrestamo}
                onEscanear={handleEscanearEstudiante}
                onVolver={handlePasoAnterior}
                error={errors.codigo_lector}
                // NUEVO: Pasar información adicional para préstamos masivos
                tipoPrestamo={tipoPrestamo}
                ejemplaresSeleccionados={ejemplaresSeleccionados}
              />
            )}
          </div>

          {/* Modal de resumen */}
          {mostrarResumen && libroSeleccionado && ejemplaresSeleccionados.length > 0 && lectorSeleccionado && (
            <ResumenPrestamo
              libro={libroSeleccionado}
              ejemplar={ejemplaresSeleccionados[0]} // Para compatibilidad
              lector={lectorSeleccionado}
              formularioPrestamo={formularioPrestamo}
              onConfirmar={handleConfirmarPrestamo}
              onCancelar={() => setMostrarResumen(false)}
              cargando={cargando}
              // NUEVO: Pasar información adicional para préstamos masivos
              tipoPrestamo={tipoPrestamo}
              ejemplaresSeleccionados={ejemplaresSeleccionados}
            />
          )}

          {/* Botón de cancelar/reiniciar siempre visible */}
          {(pasoActual > 1 || libroSeleccionado) && !mostrarResumen && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleReiniciar}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline text-sm"
              >
                Cancelar y empezar de nuevo
              </button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}