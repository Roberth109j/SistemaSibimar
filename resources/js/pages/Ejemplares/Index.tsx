import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Eye, Pencil } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, EjemplarPageProps, ESTADO } from './types';

// Constantes
const getBreadcrumbs = (libroId: number, libroTitulo: string): BreadcrumbItem[] => [
  {
    title: 'Dashboard',
    href: '/dashboard',
  },
  {
    title: 'Libros',
    href: '/libros',
  },
  {
    title: libroTitulo,
    href: '/libros',
  },
  {
    title: 'Ejemplares',
    href: `/libros/${libroId}/ejemplares`,
  },
];

export default function Index({ auth, libro, ejemplares = [], success }: EjemplarPageProps) {
  const breadcrumbs = getBreadcrumbs(libro.id, libro.titulo);

  return (
    <AppLayout
      breadcrumbs={breadcrumbs}
      renderHeader={() => (
        <h2 className="text-xl font-semibold leading-tight text-gray-800">
          Ejemplares de {libro.titulo}
        </h2>
      )}
    >
      <Head title={`Ejemplares - ${libro.titulo}`} />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {success && (
            <div className="mb-4 p-4 bg-green-100 border border-green-200 text-green-700 rounded">
              {success}
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Ejemplares disponibles
                </h3>
                <Link 
                  href={route('ejemplares.create', libro.id)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Registrar Nuevo Ejemplar
                </Link>
              </div>

              {ejemplares.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Numero del ejemplar</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tipo Adquisición</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Observaciones</th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {ejemplares.map((ejemplar) => (
                        <tr key={ejemplar.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{ejemplar.numEjemplar}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{ejemplar.tipo_adquisicion}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span 
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                ejemplar.estado === ESTADO.DISPONIBLE 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                                  : ejemplar.estado === ESTADO.PRESTADO 
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' 
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {ejemplar.estado}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {ejemplar.observaciones || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex justify-center space-x-2">
                              <Link 
                                href={route('ejemplares.show', [libro.id, ejemplar.id])}
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 
                                          transition-colors p-1 bg-blue-50 dark:bg-blue-900/30 rounded hover:bg-blue-100 dark:hover:bg-blue-800/40"
                                title="Ver detalles"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                              <Link 
                                href={route('ejemplares.edit', [libro.id, ejemplar.id])}
                                className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 
                                          transition-colors p-1 bg-amber-50 dark:bg-amber-900/30 rounded hover:bg-amber-100 dark:hover:bg-amber-800/40"
                                title="Editar ejemplar"
                              >
                                <Pencil className="w-4 h-4" />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded text-center text-gray-700 dark:text-gray-300">
                  No hay ejemplares registrados para este libro.
                </div>
              )}

              <div className="mt-6">
                <Link 
                  href={route('libros.index', libro.id)}
                  className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  ← Volver al Libro
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}