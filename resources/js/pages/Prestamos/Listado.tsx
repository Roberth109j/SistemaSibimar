import { Head, Link, router } from '@inertiajs/react';
import { Book, UserCheck, Calendar, CheckCircle, Search, X } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type PrestamoPageProps, type Prestamo } from './types';
import { useState } from 'react';

const breadcrumbs = [
  {
    title: 'Dashboard',
    href: '/dashboard',
  },
  {
    title: 'Préstamos',
    href: '/prestamos',
  },
  {
    title: 'Listado de Préstamos Activos',
    href: '/prestamos/listado',
  },
];

export default function Listado({ auth, prestamos, flash }: PrestamoPageProps) {
  const [codigoLector, setCodigoLector] = useState('');
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [prestamoSeleccionado, setPrestamoSeleccionado] = useState<number | null>(null);
  const [fechaDevuelto, setFechaDevuelto] = useState('');
  const [observaciones, setObservaciones] = useState('');

  const handleDevolucion = (prestamoId: number) => {
    setPrestamoSeleccionado(prestamoId);
    setFechaDevuelto(new Date().toISOString().split('T')[0]);
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
      header={<h2 className="text-xl font-semibold">Listado de Préstamos Activos</h2>}
      breadcrumbs={breadcrumbs}
    >
      <Head title="Listado de Préstamos Activos" />

      {flash?.success && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
          {flash.success}
        </div>
      )}

      {flash?.error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {flash.error}
        </div>
      )}

      <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  value={codigoLector}
                  onChange={(e) => setCodigoLector(e.target.value)}
                  placeholder="Ingrese el código del lector"
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleBuscar()}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
            <button
              onClick={handleBuscar}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Buscar
            </button>
          </div>
          {busquedaRealizada && (
            <div className="overflow-x-auto">
              {prestamos?.data.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No se encontraron préstamos activos para este lector
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Libro
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ejemplar
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lector
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha Préstamo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha Devolución
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {prestamos?.data.map((prestamo: Prestamo) => (
                      <tr key={prestamo.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Book className="h-5 w-5 text-gray-400 mr-2" />
                            <div className="text-sm font-medium text-gray-900">
                              {prestamo.ejemplar?.libro?.titulo}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{prestamo.ejemplar?.numEjemplar}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <UserCheck className="h-5 w-5 text-gray-400 mr-2" />
                            <div className="text-sm text-gray-900">{prestamo.usuario?.nombre}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                            <div className="text-sm text-gray-900">{prestamo.fecha_prestamo}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                            <div className="text-sm text-gray-900">{prestamo.fecha_devolucion}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleDevolucion(prestamo.id)}
                            className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Devolver
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Registrar Devolución</h3>
              <button onClick={cerrarModal} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Devolución
                </label>
                <input
                  type="date"
                  value={fechaDevuelto}
                  onChange={(e) => setFechaDevuelto(e.target.value)}
                  className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observaciones
                </label>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 h-24"
                  placeholder="Ingrese las observaciones sobre la devolución"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={cerrarModal}
                  className="px-4 py-2 border rounded-md hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarDevolucion}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
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