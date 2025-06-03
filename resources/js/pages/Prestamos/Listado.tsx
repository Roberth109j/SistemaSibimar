import { Head, Link, router } from '@inertiajs/react';
import { Book, UserCheck, Calendar, CheckCircle, Search, X } from 'lucide-react';
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

export default function Listado({ auth, prestamos, flash }: PrestamoPageProps) {
  const [codigoLector, setCodigoLector] = useState('');
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [prestamoSeleccionado, setPrestamoSeleccionado] = useState<number | null>(null);
  const [fechaDevuelto, setFechaDevuelto] = useState('');
  const [observaciones, setObservaciones] = useState('');

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

  return (
    <AppLayout
      user={auth.user}
      header={
        <h2 className="text-xl font-semibold leading-tight text-gray-900 dark:text-gray-100">
          Listado de Préstamos Activos
        </h2>
      }
      breadcrumbs={breadcrumbs}
    >
      <Head title="Listado de Préstamos Activos" />

      {/* Notificaciones de flash */}
      {flash?.success && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-700 shadow-sm">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mr-3" />
            <p className="text-emerald-800 dark:text-emerald-200 font-medium">
              {flash.success}
            </p>
          </div>
        </div>
      )}

      {flash?.error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-700 shadow-sm">
          <div className="flex items-center">
            <X className="w-5 h-5 text-red-600 dark:text-red-400 mr-3" />
            <p className="text-red-800 dark:text-red-200 font-medium">
              {flash.error}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-6">
        {/* Buscador */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  value={codigoLector}
                  onChange={(e) => setCodigoLector(e.target.value)}
                  placeholder="Ingrese el código del lector"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                           placeholder-gray-500 dark:placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 
                           focus:border-transparent transition-all duration-200"
                  onKeyPress={(e) => e.key === 'Enter' && handleBuscar()}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
              </div>
            </div>
            <button
              onClick={handleBuscar}
              disabled={!codigoLector.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 
                       disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed
                       text-white font-medium rounded-lg transition-all duration-200 
                       flex items-center gap-2 shadow-sm hover:shadow-md"
            >
              <Search className="w-5 h-5" />
              Buscar
            </button>
          </div>
        </div>

        {/* Resultados */}
        {busquedaRealizada && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
            {prestamos?.data.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                  <Book className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
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
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Préstamos Activos
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {prestamos?.data.filter(prestamo => prestamo.estado === 'ACTIVO').length} préstamo{prestamos?.data.filter(prestamo => prestamo.estado === 'ACTIVO').length !== 1 ? 's' : ''} encontrado{prestamos?.data.filter(prestamo => prestamo.estado === 'ACTIVO').length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          Libro
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          Ejemplar
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          Lector
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          Fecha Préstamo
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          Fecha Devolución
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {prestamos?.data
                        .filter(prestamo => prestamo.estado === 'ACTIVO')
                        .map((prestamo: Prestamo) => (
                        <tr key={prestamo.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center mr-3">
                                <Book className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {prestamo.ejemplar?.libro?.titulo}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  ISBN: {prestamo.ejemplar?.libro?.isbn}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              #{prestamo.ejemplar?.numEjemplar}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {prestamo.ejemplar?.codigo}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center mr-3">
                                <UserCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {prestamo.lector?.nombre}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2" />
                              <div className="text-sm text-gray-700 dark:text-gray-300">
                                {new Date(prestamo.fecha_prestamo).toLocaleDateString('es-ES', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2" />
                              <div className="text-sm text-gray-700 dark:text-gray-300">
                                {new Date(prestamo.fecha_devolucion).toLocaleDateString('es-ES', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => handleDevolucion(prestamo.id)}
                              className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 
                                       dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white 
                                       rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Devolver
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Modal de devolución */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Registrar Devolución
              </h3>
              <button 
                onClick={cerrarModal} 
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 
                         p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha de Devolución
                </label>
                <input
                  type="date"
                  value={fechaDevuelto}
                  onChange={(e) => setFechaDevuelto(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                           focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 
                           focus:border-transparent transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Observaciones
                </label>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                           placeholder-gray-500 dark:placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 
                           focus:border-transparent transition-all duration-200 h-24 resize-none"
                  placeholder="Ingrese las observaciones sobre la devolución"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={cerrarModal}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 
                           transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarDevolucion}
                  disabled={!fechaDevuelto}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 
                           disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed
                           text-white rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
                >
                  Confirmar Devolución
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}