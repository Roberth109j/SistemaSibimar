import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, EjemplarPageProps, ESTADO } from './types';

// Definir las migas de pan (breadcrumbs)
const getBreadcrumbs = (libroId: number, libroTitulo: string, ejemplarId: number): BreadcrumbItem[] => [
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
    href: `/libros/${libroId}`,
  },
  {
    title: 'Ejemplares',
    href: `/libros/${libroId}/ejemplares`,
  },
  {
    title: `Ejemplar #${ejemplarId}`,
    href: `/libros/${libroId}/ejemplares/${ejemplarId}`,
  },
];

export default function Show({ auth, libro, ejemplar, success }: EjemplarPageProps) {
  if (!ejemplar) {
    return <div>Cargando ejemplar...</div>;
  }

  const breadcrumbs = getBreadcrumbs(libro.id, libro.titulo, ejemplar.id);

  return (
    <AppLayout
      breadcrumbs={breadcrumbs}
      renderHeader={() => (
        <h2 className="text-xl font-semibold leading-tight text-gray-800">
          Detalles del Ejemplar #{ejemplar.id}
        </h2>
      )}
    >
      <Head title={`Ejemplar #${ejemplar.id} - ${libro.titulo}`} />

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
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Información del Ejemplar
                </h3>
                <Link
                  href={route('ejemplares.edit', [libro.id, ejemplar.id])}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Editar Ejemplar
                </Link>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded mb-6">
                <h4 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Información del Libro</h4>
                <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">Título:</span> {libro.titulo}</p>
                <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">Autor:</span> {libro.autor}</p>
                {libro.editorial && <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">Editorial:</span> {libro.editorial}</p>}
                {libro.anio_publicacion && <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">Año de Publicación:</span> {libro.anio_publicacion}</p>}
                {libro.isbn && <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">ISBN:</span> {libro.isbn}</p>}
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 border dark:border-gray-700 rounded mb-6">
                <h4 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">Información del Ejemplar</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Numero del ejemplar</p>
                    <p className="font-medium text-gray-900 dark:text-white">{ejemplar.numEjemplar}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Tipo de Adquisición</p>
                    <p className="font-medium text-gray-900 dark:text-white">{ejemplar.tipo_adquisicion}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Estado</p>
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
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Fecha de Registro</p>
                    <p className="font-medium text-gray-900 dark:text-white">{new Date(ejemplar.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                
                {ejemplar.observaciones && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Observaciones</p>
                    <p className="bg-gray-50 dark:bg-gray-700 p-3 rounded mt-1 text-gray-700 dark:text-gray-300">{ejemplar.observaciones}</p>
                  </div>
                )}
              </div>

              <div className="flex space-x-4">
                <Link 
                  href={route('ejemplares.index', libro.id)}
                  className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  ← Volver a Ejemplares
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}