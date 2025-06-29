import React from 'react';
import { Link } from '@inertiajs/react';
import { BookOpen } from 'lucide-react';
import { type Libro, type PaginatedData, type BadgeEstadoProps } from './types';

// --- Componente Badge Estado ---
const BadgeEstado: React.FC<BadgeEstadoProps> = ({ tipo, cantidad }) => {
  const estilos = {
    disponibles: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
    prestados: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100',
    inactivos: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estilos[tipo]}`}>
      {cantidad}
    </span>
  );
};

// --- Componente de Paginación ---
const Paginacion: React.FC<{ enlaces: PaginatedData<any>['links'] }> = ({ enlaces }) => {
  return (
    <nav className="flex justify-center py-4">
      <div className="flex items-center space-x-1">
        {enlaces.map((enlace, index) => (
          <Link
            key={index}
            href={enlace.url || '#'}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              enlace.active
                ? 'bg-blue-600 text-white'
                : enlace.url
                ? 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
            dangerouslySetInnerHTML={{ __html: enlace.label }}
          />
        ))}
      </div>
    </nav>
  );
};

// --- Props del componente ---
interface TablaInventarioProps {
  libros: PaginatedData<Libro>;
}

const TablaInventario: React.FC<TablaInventarioProps> = ({ libros }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-16">
                #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Información del Libro
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Autor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Editorial
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Disponibles
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Prestados
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Inactivos
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {libros.data.map((libro, index) => {
              // Calcular el número de fila considerando la paginación
              const numeroFila = (libros.current_page - 1) * libros.per_page + index + 1;
              
              return (
                <tr key={libro.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-sm font-medium">
                      {numeroFila}
                    </span>
                  </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {libro.titulo}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      ISBN: {libro.isbn}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                  {libro.autor ? `${libro.autor.nombres} ${libro.autor.apellidos}` : 'N/A'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                  {libro.editorial?.nombre || 'N/A'}
                </td>
                <td className="px-6 py-4 text-center">
                  <BadgeEstado tipo="disponibles" cantidad={libro.ejemplares_disponibles_count} />
                </td>
                <td className="px-6 py-4 text-center">
                  <BadgeEstado tipo="prestados" cantidad={libro.ejemplares_prestados_count} />
                </td>
                <td className="px-6 py-4 text-center">
                  <BadgeEstado tipo="inactivos" cantidad={libro.ejemplares_inactivos_count} />
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    {libro.ejemplares_count}
                  </span>
                </td>
              </tr>
            )
            })}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {libros.data.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <Paginacion enlaces={libros.links} />
        </div>
      )}

      {/* Estado vacío */}
      {libros.data.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No se encontraron libros
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Intenta ajustar los filtros de búsqueda.
          </p>
        </div>
      )}
    </div>
  );
};

export default TablaInventario;