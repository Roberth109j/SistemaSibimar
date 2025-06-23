import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Search, Calendar, BookX, Filter, X, CheckCircle, Clock, User, Book, AlertTriangle } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Préstamos',
    href: '/prestamos',
  },
  {
    title: 'Vencidos',
    href: '/prestamos/vencidos',
  },
];

interface Prestamo {
  id: number;
  ejemplar: {
    id: number;
    codigo: string;
    libro: {
      titulo: string;
    };
  };
  lector: {
    id: number;
    nombre: string;
    codigo: string;
  };
  fecha_prestamo: string;
  fecha_devolucion: string;
  estado: string;
}

interface Props {
  prestamos: {
    data: Prestamo[];
    links: any;
    total: number;
  };
}

export default function Vencidos({ prestamos }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [diasVencido, setDiasVencido] = useState('');
  const [notification, setNotification] = useState({
    show: false,
    type: '',
    message: ''
  });

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

  const handleSearch = () => {
    router.get(
      '/prestamos/vencidos',
      { search: searchTerm, dias_vencido: diasVencido },
      { preserveState: true }
    );
  };

  const handleFilterChange = (dias: string) => {
    setDiasVencido(dias);
    router.get(
      '/prestamos/vencidos',
      { search: searchTerm, dias_vencido: dias },
      { preserveState: true }
    );
  };

  const calcularDiasVencido = (fechaDevolucion: string) => {
    const dias = differenceInDays(
      new Date(),
      new Date(fechaDevolucion + 'T00:00:00Z')
    );
    return dias > 0 ? dias : 0;
  };

  const getSeverityColor = (dias: number) => {
    if (dias >= 30) return 'bg-red-600 text-white';
    if (dias >= 15) return 'bg-orange-500 text-white';
    if (dias >= 7) return 'bg-yellow-500 text-black';
    return 'bg-red-500 text-white';
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Préstamos Vencidos" />

      <div className="min-h-screen bg-white dark:bg-black p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-2">
                Préstamos Vencidos
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Gestión de préstamos con fechas de devolución vencidas
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span className="text-red-700 dark:text-red-300 font-medium">
                {prestamos.total} vencidos
              </span>
            </div>
          </div>

          {/* Filtros y búsqueda */}
          <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 rounded-xl p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600/50 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                    placeholder="Buscar por título, código o lector..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>
              
              <div className="lg:w-64">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600/50 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 appearance-none"
                    value={diasVencido}
                    onChange={(e) => handleFilterChange(e.target.value)}
                  >
                    <option value="">Todos los vencidos</option>
                    <option value="7">7 días o más</option>
                    <option value="15">15 días o más</option>
                    <option value="30">30 días o más</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleSearch}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Buscar
              </button>
            </div>
          </div>
        </div>

        {/* Lista de préstamos */}
        <div className="space-y-4">
          {prestamos.data.length > 0 ? (
            prestamos.data.map((prestamo) => {
              const diasVencidos = calcularDiasVencido(prestamo.fecha_devolucion);
              return (
                <div
                  key={prestamo.id}
                  className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 rounded-xl p-6 hover:bg-gray-50 dark:hover:bg-gray-900/70 transition-all duration-200 shadow-sm"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Información del préstamo */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Lector */}
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-gray-900 dark:text-white font-medium truncate">
                            {prestamo.lector.nombre}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Código: {prestamo.lector.codigo}
                          </p>
                        </div>
                      </div>

                      {/* Libro */}
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <Book className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-gray-900 dark:text-white font-medium line-clamp-2">
                            {prestamo.ejemplar.libro.titulo}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Ejemplar #{prestamo.ejemplar.codigo}
                          </p>
                        </div>
                      </div>

                      {/* Fechas */}
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-gray-900 dark:text-white font-medium">
                            {format(new Date(prestamo.fecha_prestamo + 'T00:00:00Z'), 'dd/MM/yyyy', { locale: es })}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Vencía: {format(new Date(prestamo.fecha_devolucion + 'T00:00:00Z'), 'dd/MM/yyyy', { locale: es })}
                          </p>
                        </div>
                      </div>

                      {/* Estado */}
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-red-100 dark:bg-red-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <Clock className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="min-w-0">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(diasVencidos)}`}>
                            {diasVencidos} días
                          </span>
                          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                            de retraso
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-3 lg:flex-col lg:items-end">
                      <button
                        onClick={() => handleDevolucion(prestamo.id)}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Devolver
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 rounded-xl p-12 text-center shadow-sm">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookX className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                No hay préstamos vencidos
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                No se encontraron préstamos vencidos con los filtros actuales.
              </p>
            </div>
          )}
        </div>

        {/* Paginación */}
        {prestamos.links && (
          <div className="mt-8 flex items-center justify-center gap-2">
            {prestamos.links.prev && (
              <a
                href={prestamos.links.prev}
                className="px-4 py-2 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200"
              >
                Anterior
              </a>
            )}
            {prestamos.links.next && (
              <a
                href={prestamos.links.next}
                className="px-4 py-2 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200"
              >
                Siguiente
              </a>
            )}
          </div>
        )}
      </div>

      {/* Modal de Devolución */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={cerrarModal} />
          <div className="relative w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Confirmar Devolución
                </h3>
                <button
                  onClick={cerrarModal}
                  className="w-8 h-8 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors duration-200"
                >
                  <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
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
                    className="w-full px-3 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Observaciones
                  </label>
                  <textarea
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Agregar observaciones (opcional)..."
                    className="w-full px-3 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={cerrarModal}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarDevolucion}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
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