import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Search, Filter, Users, X, Download, Calendar, Book } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Reportes',
    href: '/reportes',
  },
  {
    title: 'Historial de Préstamos',
    href: '/reportes/historial-prestamos',
  },
];

import { type Prestamo, type HistorialPrestamosProps } from './types';

export default function HistorialPrestamos({ auth, prestamos = { data: [], links: [], total: 0 }, flash = {} }: HistorialPrestamosProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    estado: '',
    fechaInicio: '',
    fechaFin: '',
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(
      route('reportes.historial-prestamos'),
      { search: searchTerm, ...selectedFilters },
      { preserveState: true }
    );
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setSelectedFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = () => {
    router.get(
      route('reportes.historial-prestamos'),
      { search: searchTerm, ...selectedFilters },
      { preserveState: true }
    );
    setShowFilters(false);
  };

  const clearFilters = () => {
    setSelectedFilters({
      estado: '',
      fechaInicio: '',
      fechaFin: '',
    });
    router.get(route('reportes.historial-prestamos'), { search: searchTerm });
    setShowFilters(false);
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'DEVUELTO':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800';
      case 'ACTIVO':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'VENCIDO':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 border-gray-200 dark:border-gray-800';
    }
  };

  return (
    <AppLayout
      user={auth.user}
      breadcrumbs={breadcrumbs}
    >
      <Head title="Historial de Préstamos" />

      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
              Historial de Préstamos
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Registro histórico de todos los préstamos realizados
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <Filter className="w-4 h-4" />
              Filtros
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Estado
                </label>
                <select
                  name="estado"
                  value={selectedFilters.estado}
                  onChange={handleFilterChange}
                  className="block w-full px-3 py-2 mt-1 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                >
                  <option value="">Todos</option>
                  <option value="ACTIVO">Activo</option>
                  <option value="DEVUELTO">Devuelto</option>
                  <option value="VENCIDO">Vencido</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Fecha Inicio
                </label>
                <input
                  type="date"
                  name="fechaInicio"
                  value={selectedFilters.fechaInicio}
                  onChange={handleFilterChange}
                  className="block w-full px-3 py-2 mt-1 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Fecha Fin
                </label>
                <input
                  type="date"
                  name="fechaFin"
                  value={selectedFilters.fechaFin}
                  onChange={handleFilterChange}
                  className="block w-full px-3 py-2 mt-1 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Limpiar
              </button>
              <button
                onClick={applyFilters}
                className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Aplicar
              </button>
            </div>
          </div>
        )}

        {/* Search */}
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por código de lector, título del libro o código de ejemplar..."
            className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500"
          />
        </form>

        {/* Table */}
        <div className="overflow-hidden border border-gray-200 rounded-lg shadow-sm dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Lector
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Libro
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Ejemplar
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Fecha Préstamo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Fecha Devolución
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Fecha Devuelto
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {prestamos.data.map((prestamo) => (
                  <tr key={prestamo.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center mr-3">
                          <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {prestamo.lector.nombre}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Código: {prestamo.lector.codigo}
                          </div>
                        </div>
                      </div>
                    </td>
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
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {format(new Date(prestamo.fecha_prestamo), 'dd/MM/yyyy', { locale: es })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {format(new Date(prestamo.fecha_devolucion), 'dd/MM/yyyy', { locale: es })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {prestamo.fecha_devuelto
                          ? format(new Date(prestamo.fecha_devuelto), 'dd/MM/yyyy', { locale: es })
                          : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                          prestamo.estado
                        )}`}
                      >
                        {prestamo.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}