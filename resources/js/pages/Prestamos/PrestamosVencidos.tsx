import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Search, Book, AlertCircle, X, Calendar, Clock, Filter, FilterX, ChevronDown } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type Prestamo } from './types';

// Constantes
const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Préstamos',
    href: '/prestamos',
  },
  {
    title: 'Préstamos Vencidos',
    href: '/prestamos/vencidos',
  },
];

// Componente de notificación
const Notification = ({ notification, onClose }: { 
  notification: { show: boolean; type: string; message: string }, 
  onClose: () => void 
}) => {
  if (!notification.show) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-full duration-300">
      <div className={`
        flex items-center justify-between min-w-80 max-w-md p-4 rounded-xl shadow-xl backdrop-blur-sm border
        ${notification.type === 'success' 
          ? 'bg-green-50/95 dark:bg-green-900/95 border-green-200 dark:border-green-800' 
          : 'bg-red-50/95 dark:bg-red-900/95 border-red-200 dark:border-red-800'
        }
      `}>
        <div className="flex items-center">
          {notification.type === 'success' ? (
            <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-300" />
            </div>
          ) : (
            <div className="flex-shrink-0 w-8 h-8 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-300" />
            </div>
          )}
          <p className={`ml-3 text-sm font-medium ${
            notification.type === 'success' 
              ? 'text-green-800 dark:text-green-200' 
              : 'text-red-800 dark:text-red-200'
          }`}>
            {notification.message}
          </p>
        </div>
        <button
          onClick={onClose}
          className="ml-4 flex-shrink-0 rounded-full p-1.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </button>
      </div>
    </div>
  );
};

type PrestamosVencidosProps = {
  auth: any;
  prestamos?: {
    data: Prestamo[];
  };
  flash?: {
    success?: string;
    error?: string;
  };
};

export default function PrestamosVencidos({
  auth,
  prestamos = { data: [] },
  flash = {},
}: PrestamosVencidosProps) {
  const { errors = {} } = usePage().props as any;
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    diasVencimiento: '',
  });
  const [notification, setNotification] = useState({
    show: false,
    type: '',
    message: ''
  });

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

  // Filtrar préstamos
  const filteredPrestamos = prestamos.data.filter((prestamo: Prestamo) => {
    const matchesSearch = !searchTerm ||
      prestamo.ejemplar?.libro?.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prestamo.ejemplar?.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prestamo.usuario?.nombre.toLowerCase().includes(searchTerm.toLowerCase());

    const diasVencidos = selectedFilters.diasVencimiento
      ? Math.ceil((new Date().getTime() - new Date(prestamo.fecha_devolucion).getTime()) / (1000 * 3600 * 24))
      : 0;

    const matchesDiasVencimiento = !selectedFilters.diasVencimiento ||
      (selectedFilters.diasVencimiento === '7' && diasVencidos <= 7) ||
      (selectedFilters.diasVencimiento === '15' && diasVencidos <= 15 && diasVencidos > 7) ||
      (selectedFilters.diasVencimiento === '30' && diasVencidos <= 30 && diasVencidos > 15) ||
      (selectedFilters.diasVencimiento === 'mas30' && diasVencidos > 30);

    return matchesSearch && matchesDiasVencimiento;
  });

  const resetFilters = () => {
    setSelectedFilters({
      diasVencimiento: '',
    });
    setSearchTerm('');
  };

  const hasActiveFilters = selectedFilters.diasVencimiento || searchTerm;

  return (
    <AppLayout
      title="Préstamos Vencidos"
      breadcrumbs={breadcrumbs}
      renderHeader={() => (
        <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
          Préstamos Vencidos
        </h2>
      )}
    >
      <Head title="Préstamos Vencidos" />

      {/* Notificación */}
      <Notification 
        notification={notification} 
        onClose={() => setNotification(prev => ({ ...prev, show: false }))} 
      />

      <div className="space-y-6">
        {/* Cabecera moderna */}
        <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-700 rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <AlertCircle className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    Préstamos Vencidos
                  </h1>
                  <p className="text-red-100 mt-1">
                    {filteredPrestamos.length} préstamos pendientes de devolución
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Búsqueda */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Buscar por título, código o lector..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              />
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
            </div>

            {/* Botones de acción */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl border font-medium transition-all ${
                  showFilters || hasActiveFilters
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                <Filter className="h-5 w-5" />
                <span>Filtros</span>
                {hasActiveFilters && (
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>

              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <FilterX className="h-4 w-4" />
                  <span>Limpiar</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Panel de filtros avanzados */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-in slide-in-from-top-2 duration-200">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Días de Vencimiento</label>
              <div className="relative">
                <select
                  className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none cursor-pointer"
                  value={selectedFilters.diasVencimiento}
                  onChange={(e) => setSelectedFilters({ ...selectedFilters, diasVencimiento: e.target.value })}
                >
                  <option value="">Todos los períodos</option>
                  <option value="7">Hasta 7 días</option>
                  <option value="15">Entre 8 y 15 días</option>
                  <option value="30">Entre 16 y 30 días</option>
                  <option value="mas30">Más de 30 días</option>
                </select>
                <ChevronDown className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        )}

        {/* Tabla de préstamos vencidos */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Código</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Título</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lector</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fecha Préstamo</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fecha Devolución</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Días Vencido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredPrestamos.length > 0 ? (
                  filteredPrestamos.map((prestamo: Prestamo) => {
                    const diasVencidos = Math.ceil(
                      (new Date().getTime() - new Date(prestamo.fecha_devolucion).getTime()) / (1000 * 3600 * 24)
                    );

                    return (
                      <tr key={prestamo.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-mono text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            {prestamo.ejemplar?.codigo}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {prestamo.ejemplar?.libro?.titulo}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {prestamo.usuario?.nombre}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {new Date(prestamo.fecha_prestamo).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {new Date(prestamo.fecha_devolucion).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800">
                            {diasVencidos} días
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Book className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 font-medium">No se encontraron préstamos vencidos</p>
                          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                            {hasActiveFilters ? 'Intenta ajustar los filtros de búsqueda' : 'Todos los préstamos están al día'}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}