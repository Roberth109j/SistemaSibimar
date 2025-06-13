import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Eye, Pencil, BookOpen, PlusCircle, ArrowLeft, CheckCircle, Package, Tag } from 'lucide-react';
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

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case ESTADO.DISPONIBLE:
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      case ESTADO.PRESTADO:
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
    }
  };

  return (
    <AppLayout
      breadcrumbs={breadcrumbs}
      renderHeader={() => (
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Ejemplares de {libro.titulo}
          </h2>
        </div>
      )}
    >
      <Head title={`Ejemplares - ${libro.titulo}`} />

      <div className="py-8 px-6 bg-slate-50 dark:bg-black min-h-screen">
        {/* Efectos de fondo decorativos */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-500/5 filter blur-3xl dark:bg-blue-600/10"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-indigo-500/5 filter blur-3xl dark:bg-indigo-600/10"></div>
        </div>

        <div className="max-w-full mx-auto relative z-10">
          
          {/* Mensaje de éxito */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 rounded-xl flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="font-medium">{success}</span>
            </div>
          )}

          {/* Header con información del libro y botón de acción */}
          <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {libro.titulo}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Gestión de ejemplares disponibles
                  </p>
                </div>
              </div>
              <Link 
                href={route('ejemplares.create', libro.id)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white
                  px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg
                  transform hover:-translate-y-0.5 font-semibold"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Registrar Nuevo Ejemplar</span>
              </Link>
            </div>
          </div>

          {/* Tabla de ejemplares */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {ejemplares.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider" style={{width: '70px'}}>
                        <div className="flex items-center space-x-1">
                          <Tag className="w-3 h-3" />
                          <span>N° EJ.</span>
                        </div>
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider" style={{width: '140px'}}>
                        <div className="flex items-center space-x-1">
                          <Package className="w-3 h-3" />
                          <span>Tipo Adquisición</span>
                        </div>
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider" style={{width: '100px'}}>
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>Estado</span>
                        </div>
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider" style={{width: '180px'}}>Observaciones</th>
                      <th className="px-3 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider" style={{width: '80px'}}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                    {ejemplares.map((ejemplar, index) => (
                      <tr key={ejemplar.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-3 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300 font-medium text-sm">
                          {ejemplar.numEjemplar}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300 text-sm">
                          {ejemplar.tipo_adquisicion}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getEstadoBadge(ejemplar.estado)}`}>
                            {ejemplar.estado}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-gray-700 dark:text-gray-300 text-sm">
                          <div className="truncate" title={ejemplar.observaciones || 'Sin observaciones'}>
                            {ejemplar.observaciones || (
                              <span className="text-gray-400 dark:text-gray-500">-</span>
                            )}
                          </div>
                        </td>
                        <td className="px-2 py-3 whitespace-nowrap">
                          <div className="flex justify-center space-x-1">
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
              <div className="p-12 text-center">
                <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No hay ejemplares registrados
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Este libro aún no tiene ejemplares físicos registrados en el sistema.
                </p>
                <Link 
                  href={route('ejemplares.create', libro.id)}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white
                    px-4 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Registrar Primer Ejemplar</span>
                </Link>
              </div>
            )}
          </div>

          {/* Botón de navegación y estadísticas */}
          <div className="mt-6 flex justify-between items-center">
            <Link 
              href={route('libros.index', libro.id)}
              className="px-4 py-2 border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al Libro
            </Link>

            {ejemplares.length > 0 && (
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>
                    {ejemplares.filter(e => e.estado === ESTADO.DISPONIBLE).length} Disponibles
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>
                    {ejemplares.filter(e => e.estado === ESTADO.PRESTADO).length} Prestados
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span>
                    {ejemplares.length} Total
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Información adicional */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start space-x-3">
              <div className="p-1 bg-blue-100 dark:bg-blue-800/50 rounded">
                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                  Gestión de ejemplares
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                  Aquí puedes administrar todos los ejemplares físicos de este libro. 
                  Cada ejemplar tiene un número único y puede tener diferentes estados y observaciones.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}