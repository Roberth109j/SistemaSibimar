import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { CheckCircle, AlertCircle, X, AlertTriangle } from 'lucide-react';
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
  // Crear fecha con la zona horaria de Bogotá
  const hoy = new Date();
  // Formatear como YYYY-MM-DD asegurando que sea la fecha correcta en Colombia
  const año = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${año}-${mes}-${dia}`;
};

// Función para calcular fecha de devolución por defecto (2 días hábiles)
const calcularFechaDevolucionDefault = (fechaPrestamo: string): string => {
  // Parsear fecha de préstamo y crear una nueva fecha a medianoche para evitar problemas de zona horaria
  const [año, mes, dia] = fechaPrestamo.split('-').map(Number);
  const fecha = new Date(año, mes - 1, dia, 0, 0, 0);
  
  let diasAgregados = 0;
  while (diasAgregados < 2) {
    fecha.setDate(fecha.getDate() + 1);
    if (fecha.getDay() !== 0 && fecha.getDay() !== 6) {
      diasAgregados++;
    }
  }
  
  // Formatear la fecha de resultado como YYYY-MM-DD
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
  
  // Estado del wizard
  const [pasoActual, setPasoActual] = useState<1 | 2 | 3 | 4>(1);
  const [libroSeleccionado, setLibroSeleccionado] = useState<Libro | null>(
    libroInicial && 'id' in libroInicial ? libroInicial : null
  );
  const [ejemplarSeleccionado, setEjemplarSeleccionado] = useState<Ejemplar | null>(null);
  // CAMBIO: En lugar de codigoEstudiante, usar lectorSeleccionado
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

  // Actualizar fecha de devolución cuando se selecciona el ejemplar
  useEffect(() => {
    if (ejemplarSeleccionado) {
      const fechaDefault = calcularFechaDevolucionDefault(formularioPrestamo.fecha_prestamo);
      setFormularioPrestamo(prev => ({
        ...prev,
        fecha_devolucion: fechaDefault
      }));
    }
  }, [ejemplarSeleccionado, formularioPrestamo.fecha_prestamo]);

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
          
          if (libro) {  // Verificar que sea un objeto Libro válido
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

  // Seleccionar ejemplar
  const handleSeleccionarEjemplar = (ejemplar: Ejemplar) => {
    setEjemplarSeleccionado(ejemplar);
    setPasoActual(3);
  };

  // CAMBIO: Escanear código de estudiante - ahora recibe el objeto lector completo
  const handleEscanearEstudiante = (lector: Lector) => {
    setLectorSeleccionado(lector);
    setMostrarResumen(true);
  };

  // CAMBIO: Confirmar préstamo - actualizado para usar lectorSeleccionado
  const handleConfirmarPrestamo = () => {
    if (!ejemplarSeleccionado || !lectorSeleccionado) return;

    setCargando(true);
    router.post(
      '/prestamos',
      {
        ejemplar_id: ejemplarSeleccionado.id,
        codigo_lector: lectorSeleccionado.codigo, // Usar el código del lector seleccionado
        fecha_prestamo: formularioPrestamo.fecha_prestamo,
        fecha_devolucion: formularioPrestamo.fecha_devolucion,
        estado: formularioPrestamo.estado,
        observaciones: formularioPrestamo.observaciones,
      },
      {
        onSuccess: () => {
          setNotificacion({
            show: true,
            type: 'success',
            message: '¡Préstamo registrado exitosamente!'
          });
          
          // Reiniciar después de un breve delay
          setTimeout(() => {
            handleReiniciar();
          }, 2000);
        },
        onError: (errors) => {
          setCargando(false);
          
          // Si hay error de código de lector, volver al paso 3 para mostrar el error
          if (errors.codigo_lector) {
            setMostrarResumen(false);
            // El error se mostrará automáticamente en el componente PasoEscanearEstudiante
          } else {
            // Para otros errores, mostrar notificación general
            const errorMessage = errors.ejemplar_id || 'Error al procesar el préstamo';
            setNotificacion({
              show: true,
              type: 'error',
              message: errorMessage
            });
          }
        }
      }
    );
  };

  // CAMBIO: Reiniciar formulario - actualizado para limpiar lectorSeleccionado
  const handleReiniciar = () => {
    setPasoActual(1);
    setLibroSeleccionado(null);
    setEjemplarSeleccionado(null);
    setLectorSeleccionado(null); // CAMBIO: Limpiar lectorSeleccionado
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

  // CAMBIO: Puede avanzar al siguiente paso - actualizado para verificar lectorSeleccionado
  const puedeAvanzar = (): boolean => {
    switch (pasoActual) {
      case 1: return !!libroSeleccionado;
      case 2: return !!ejemplarSeleccionado;
      case 3: return !!lectorSeleccionado; // CAMBIO: Verificar lectorSeleccionado
      default: return false;
    }
  };

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
        {/* Título principal - alineado a la izquierda con gradiente colorido */}
        <div className="mb-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Préstamo Individual
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

        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl dark:bg-blue-600/10"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-indigo-500/5 blur-3xl dark:bg-indigo-600/10"></div>
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          {/* Indicador de pasos */}
          <IndicadorPasos 
            pasoActual={pasoActual} 
            libroSeleccionado={!!libroSeleccionado}
            ejemplarSeleccionado={!!ejemplarSeleccionado}
            estudianteEscaneado={!!lectorSeleccionado} // CAMBIO: Usar lectorSeleccionado
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
                onSeleccionar={handleSeleccionarEjemplar}
                onVolver={handlePasoAnterior}
                ejemplarSeleccionado={ejemplarSeleccionado}
              />
            )}

            {/* CAMBIO: Actualizado para pasar la función que recibe un objeto Lector */}
            {pasoActual === 3 && libroSeleccionado && ejemplarSeleccionado && (
              <PasoEscanearEstudiante
                libro={libroSeleccionado}
                ejemplar={ejemplarSeleccionado}
                formularioPrestamo={formularioPrestamo}
                onActualizarFormulario={setFormularioPrestamo}
                onEscanear={handleEscanearEstudiante} // Esta función ahora recibe un objeto Lector
                onVolver={handlePasoAnterior}
                error={errors.codigo_lector}
              />
            )}
          </div>

          {/* CAMBIO: Modal de resumen - actualizado para pasar el objeto lector completo */}
          {mostrarResumen && libroSeleccionado && ejemplarSeleccionado && lectorSeleccionado && (
            <ResumenPrestamo
              libro={libroSeleccionado}
              ejemplar={ejemplarSeleccionado}
              lector={lectorSeleccionado} // CAMBIO: Pasar el objeto lector completo
              formularioPrestamo={formularioPrestamo}
              onConfirmar={handleConfirmarPrestamo}
              onCancelar={() => setMostrarResumen(false)}
              cargando={cargando}
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