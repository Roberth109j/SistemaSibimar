import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Search, Calendar, BookX, Filter } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
  },
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

  const handleSearch = () => {
    router.get(
      route('prestamos.vencidos'),
      { search: searchTerm, dias_vencido: diasVencido },
      { preserveState: true }
    );
  };

  const handleFilterChange = (dias: string) => {
    setDiasVencido(dias);
    router.get(
      route('prestamos.vencidos'),
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

  return (
    <AppLayout
      title="Préstamos Vencidos"
      breadcrumbs={breadcrumbs}
      renderHeader={() => (
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
            Préstamos Vencidos
          </h2>
          <span className="px-3 py-1 text-sm font-medium text-red-800 bg-red-100 rounded-full dark:bg-red-900 dark:text-red-200">
            {prestamos.total} vencidos
          </span>
        </div>
      )}
    >
      <Head title="Préstamos Vencidos" />

      <div className="p-6 overflow-hidden bg-white shadow-sm dark:bg-gray-800 sm:rounded-lg">
        {/* Barra de búsqueda y filtros */}
        <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center flex-1 gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  className="w-full px-4 py-2 pr-8 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                  placeholder="Buscar por título, código o lector..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  className="absolute p-1 text-gray-400 transform -translate-y-1/2 right-2 top-1/2 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="relative">
              <select
                className="w-full px-4 py-2 pr-8 border rounded-lg appearance-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                value={diasVencido}
                onChange={(e) => handleFilterChange(e.target.value)}
              >
                <option value="">Todos los vencidos</option>
                <option value="7">7 días o más</option>
                <option value="15">15 días o más</option>
                <option value="30">30 días o más</option>
              </select>
              <Filter className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 right-2 top-1/2" />
            </div>
          </div>
        </div>

        {/* Tabla de préstamos vencidos */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-sm font-medium text-left text-gray-700 bg-gray-50 dark:text-gray-300 dark:bg-gray-700">
                <th className="px-4 py-3">Título del libro</th>
                <th className="px-4 py-3">Lector</th>
                <th className="px-4 py-3">Fecha Préstamo</th>
                <th className="px-4 py-3">Fecha Devolución</th>
                <th className="px-4 py-3">Días De Retrazo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {prestamos.data.map((prestamo) => (
                <tr
                  key={prestamo.id}
                  className="text-gray-700 bg-white dark:text-gray-300 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-4 py-3 text-sm">{prestamo.ejemplar.libro.titulo}</td>
                  <td className="px-4 py-3 text-sm">
                    {prestamo.lector.nombre}
                    <br />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {prestamo.lector.codigo}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {format(new Date(prestamo.fecha_prestamo + 'T00:00:00Z'), 'dd/MM/yyyy', { locale: es })}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {format(new Date(prestamo.fecha_devolucion + 'T00:00:00Z'), 'dd/MM/yyyy', { locale: es })}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="px-2 py-1 text-sm font-medium text-red-800 bg-red-100 rounded-full dark:bg-red-900 dark:text-red-200">
                      {calcularDiasVencido(prestamo.fecha_devolucion)} días
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {prestamos.data.length === 0 && (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <BookX className="w-16 h-16 text-gray-400 dark:text-gray-600" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                No hay préstamos vencidos
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                No se encontraron préstamos vencidos con los filtros actuales.
              </p>
            </div>
          )}
        </div>

        {/* Paginación */}
        {prestamos.links && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-600 sm:px-6">
            <div className="flex justify-between flex-1 sm:hidden">
              {prestamos.links.prev && (
                <a
                  href={prestamos.links.prev}
                  className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Anterior
                </a>
              )}
              {prestamos.links.next && (
                <a
                  href={prestamos.links.next}
                  className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Siguiente
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}