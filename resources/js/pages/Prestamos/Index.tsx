import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Search, Book, BookOpen, UserCheck, CheckCircle, AlertCircle, X } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

// Tipos para TypeScript
/**
 * @typedef {Object} Libro
 * @property {number} id
 * @property {string} isbn
 * @property {string} titulo
 * @property {Object} autor
 * @property {Object} editorial
 * @property {Object} seccion
 */

/**
 * @typedef {Object} Ejemplar
 * @property {number} id
 * @property {string} codigo
 * @property {string} estado
 * @property {number} libro_id
 * @property {number} numEjemplar
 */

/**
 * @typedef {Object} PrestamoPageProps
 * @property {Object} auth
 * @property {Ejemplar[]} ejemplares
 * @property {Object} flash
 * @property {Libro} libro
 */

// Constantes
const breadcrumbs = [
  {
    title: 'Préstamos',
    href: '/prestamos',
  },
];

// Función para calcular la fecha de devolución (2 días hábiles)
const calcularFechaDevolucion = (fechaPrestamo: string) => {
  const fecha = new Date(fechaPrestamo);
  let diasAgregados = 0;
  while (diasAgregados < 2) {
    fecha.setDate(fecha.getDate() + 1);
    // Si no es fin de semana (0 = domingo, 6 = sábado)
    if (fecha.getDay() !== 0 && fecha.getDay() !== 6) {
      diasAgregados++;
    }
  }
  return fecha.toISOString().split('T')[0];
};

// Función para obtener la fecha actual en formato YYYY-MM-DD
const obtenerFechaActual = () => {
  const hoy = new Date();
  return hoy.toISOString().split('T')[0];
};

export default function Index({
  auth,
  ejemplares = [],
  libro = null,
  flash = {},
}) {
  const { errors = {} } = usePage().props;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLibro, setSelectedLibro] = useState(libro);
  const [selectedEjemplar, setSelectedEjemplar] = useState(null);
  const [codigoLector, setCodigoLector] = useState('');
  const [view, setView] = useState(libro ? 'ejemplares' : 'search');
  const [notification, setNotification] = useState({
    show: false,
    type: '',
    message: ''
  });
  const [showPrestamoModal, setShowPrestamoModal] = useState(false);
  const [prestamoForm, setPrestamoForm] = useState({
    fecha_prestamo: '',
    fecha_devolucion: '',
    estado: 'ACTIVO',
    observaciones: ''
  });
  const [availableEjemplares, setAvailableEjemplares] = useState(ejemplares);

  // Inicializar el estado con los datos recibidos
  useEffect(() => {
    if (libro) {
      setSelectedLibro(libro);
      setView('ejemplares');
    }
    
    if (ejemplares && ejemplares.length > 0) {
      setAvailableEjemplares(ejemplares);
    }
  }, [libro, ejemplares]);

  // Mostrar notificaciones de flash
  useEffect(() => {
    if (flash?.success) {
      setNotification({
        show: true,
        type: 'success',
        message: flash.success
      });
    } else if (flash?.error) {
      setNotification({
        show: true,
        type: 'error',
        message: flash.error
      });
    }

    const timer = setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);

    return () => clearTimeout(timer);
  }, [flash]);

  // Efecto para establecer las fechas cuando se abre el modal
  useEffect(() => {
    if (showPrestamoModal) {
      const fechaActual = obtenerFechaActual();
      setPrestamoForm(prev => ({
        ...prev,
        fecha_prestamo: fechaActual,
        fecha_devolucion: calcularFechaDevolucion(fechaActual)
      }));
    }
  }, [showPrestamoModal]);

  // Función para buscar libro
  const handleSearch = () => {
    if (!searchTerm.trim()) return;

    router.get(
      route('libros.search'),
      { search: searchTerm },
      {
        preserveState: true,
        onSuccess: (page) => {
          const libro = page.props.libro;
          const ejemplares = page.props.ejemplares;
          
          if (libro) {
            setSelectedLibro(libro);
            setAvailableEjemplares(ejemplares || []);
            setView('ejemplares');
          } else {
            setNotification({
              show: true,
              type: 'error',
              message: 'No se encontró el libro'
            });
          }
        },
        onError: () => {
          setNotification({
            show: true,
            type: 'error',
            message: 'No se encontró el libro'
          });
        }
      }
    );
  };

  // Función para realizar préstamo
  const handlePrestamo = () => {
    if (!selectedEjemplar || !codigoLector.trim()) return;
    setShowPrestamoModal(true);
  };

  // Función para limpiar el formulario y volver a la página principal
  const resetFormAndRedirect = () => {
    setShowPrestamoModal(false);
    setView('search');
    setSelectedLibro(null);
    setSelectedEjemplar(null);
    setCodigoLector('');
    setSearchTerm('');
    setAvailableEjemplares([]);
    setPrestamoForm({
      fecha_prestamo: '',
      fecha_devolucion: '',
      estado: 'ACTIVO',
      observaciones: ''
    });
  };

  // Función para confirmar y guardar el préstamo
  const handleConfirmarPrestamo = () => {
    if (!selectedEjemplar || !codigoLector.trim()) return;

    router.post(
      route('prestamos.store'),
      {
        ejemplar_id: selectedEjemplar.id,
        codigo_lector: codigoLector,
        fecha_prestamo: prestamoForm.fecha_prestamo,
        fecha_devolucion: prestamoForm.fecha_devolucion,
        estado: prestamoForm.estado,
        observaciones: prestamoForm.observaciones,
      },
      {
        onSuccess: () => {
          // Cuando se confirma, volver a la página principal y limpiar todos los datos
          router.visit(route('prestamos.index'), {
            onSuccess: () => {
              resetFormAndRedirect();
            }
          });
        },
        onError: (errors) => {
          // Manejar errores específicos
          setShowPrestamoModal(false);
          const errorMessage = errors.codigo_lector || errors.ejemplar_id || 'Error al procesar el préstamo';
          setNotification({
            show: true,
            type: 'error',
            message: errorMessage
          });
        }
      }
    );
  };

  // Función para cancelar el préstamo
  const handleCancelarPrestamo = () => {
    setShowPrestamoModal(false);
    resetFormAndRedirect();
  };

  // Manejar la tecla Enter en el campo de búsqueda
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <AppLayout
      title="Gestión de Préstamos"
      breadcrumbs={breadcrumbs}
      renderHeader={() => (
        <h2 className="text-xl font-semibold leading-tight text-gray-800">
          Gestión de Préstamos
        </h2>
      )}
    >
      <Head title="Gestión de Préstamos" />

      {/* Notificación */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 flex items-center justify-between min-w-72 p-4 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'
        }`}>
          <div className="flex items-center">
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
            )}
            <p className={notification.type === 'success' ? 'text-green-700' : 'text-red-700'}>
              {notification.message}
            </p>
          </div>
          <button
            onClick={() => setNotification(prev => ({ ...prev, show: false }))}
            className="ml-4 text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col gap-6">
        {/* Vista de búsqueda */}
        {view === 'search' && (
          <div className="border-sidebar-border/70 dark:border-sidebar-border rounded-xl border bg-white dark:bg-gray-800 p-6">
            <h3 className="text-lg font-semibold mb-4">Buscar Libro</h3>
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ingrese código o nombre del libro"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Search className="w-5 h-5" />
                Buscar
              </button>
            </div>
          </div>
        )}

        {/* Vista de ejemplares */}
        {view === 'ejemplares' && selectedLibro && (
          <div className="border-sidebar-border/70 dark:border-sidebar-border rounded-xl border bg-white dark:bg-gray-800 p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold">{selectedLibro.titulo}</h3>
                <p className="text-gray-600">ISBN: {selectedLibro.isbn}</p>
              </div>
              <button
                onClick={() => {
                  setView('search');
                  setSelectedLibro(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableEjemplares && availableEjemplares.length > 0 ? (
                availableEjemplares.map((ejemplar) => (
                  <div
                    key={ejemplar.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Número de Ejemplar: {ejemplar.numEjemplar}</span>
                      <span className={`px-2 py-1 rounded text-sm ${
                        ejemplar.estado === 'DISPONIBLE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {ejemplar.estado}
                      </span>
                    </div>
                    {ejemplar.estado === 'DISPONIBLE' && (
                      <button
                        onClick={() => {
                          setSelectedEjemplar(ejemplar);
                          setView('prestamo');
                        }}
                        className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <BookOpen className="w-5 h-5" />
                        Prestar
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <Book className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">No hay ejemplares disponibles para este libro</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal de confirmación de préstamo */}
        {showPrestamoModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Confirmar Préstamo</h3>
                <button
                  onClick={handleCancelarPrestamo}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block font-medium mb-2 text-gray-700">Fecha de Préstamo</label>
                  <input
                    type="date"
                    value={prestamoForm.fecha_prestamo}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-2 text-gray-700">Fecha de Devolución</label>
                  <input
                    type="date"
                    value={prestamoForm.fecha_devolucion}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-2 text-gray-700">Observaciones</label>
                  <textarea
                    value={prestamoForm.observaciones}
                    onChange={(e) => setPrestamoForm(prev => ({ ...prev, observaciones: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    rows={3}
                    placeholder="Ingrese observaciones opcionales..."
                  />
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button
                    onClick={handleCancelarPrestamo}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmarPrestamo}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium shadow-sm"
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vista de préstamo */}
        {view === 'prestamo' && selectedEjemplar && selectedLibro && (
          <div className="border-sidebar-border/70 dark:border-sidebar-border rounded-xl border bg-white dark:bg-gray-800 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Realizar Préstamo</h3>
              <button
                onClick={() => {
                  setView('ejemplares');
                  setSelectedEjemplar(null);
                  setCodigoLector('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <label htmlFor="codigoLector" className="block font-medium mb-2">
                Código del Lector
              </label>
              <div className="flex gap-4">
                <input
                  id="codigoLector"
                  type="text"
                  value={codigoLector}
                  onChange={(e) => setCodigoLector(e.target.value)}
                  placeholder="Ingrese el código del lector"
                  className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handlePrestamo}
                  disabled={!codigoLector.trim()}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <UserCheck className="w-5 h-5" />
                  Confirmar Préstamo
                </button>
              </div>
              {errors.codigo_lector && (
                <p className="text-red-500 text-sm mt-1">{errors.codigo_lector}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}