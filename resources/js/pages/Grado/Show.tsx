import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type Grado } from './types';
import { Edit, ArrowLeft } from 'lucide-react';

// Constantes
const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
  },
  {
    title: 'Grados',
    href: '/grados',
  },
  {
    title: 'Ver Grado',
    href: '#',
  },
];

interface Props {
  grado: Grado;
}

export default function Show({ grado }: Props) {
  return (
    <AppLayout
      title="Ver Grado"
      breadcrumbs={breadcrumbs}
      renderHeader={() => (
        <h2 className="text-xl font-semibold leading-tight text-gray-800">
          Ver Grado
        </h2>
      )}
    >
      <Head title="Ver Grado" />

      <div className="py-6">
        <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                Detalles del Grado
              </h3>
              <div className="flex gap-2">
                <a
                  href={route('grados.edit', grado.id)}
                  className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
                >
                  <Edit className="w-5 h-5" />
                </a>
                <a
                  href={route('grados.index')}
                  className="inline-flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Volver
                </a>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Grado</dt>
                  <dd className="mt-1 text-lg text-gray-900 dark:text-gray-100">{grado.nombre}</dd>
                </div>

                {grado.descripcion && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Sub Grado</dt>
                    <dd className="mt-1 text-lg text-gray-900 dark:text-gray-100">{grado.descripcion}</dd>
                  </div>
                )}

                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Estado</dt>
                  <dd className="mt-1 text-lg text-gray-900 dark:text-gray-100">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        grado.estado === 'ACTIVO'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {grado.estado}
                    </span>
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Sección ID</dt>
                  <dd className="mt-1 text-lg text-gray-900 dark:text-gray-100">{grado.seccion_id}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Fecha de Creación</dt>
                  <dd className="mt-1 text-lg text-gray-900 dark:text-gray-100">
                    {new Date(grado.created_at || '').toLocaleDateString()}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Última Actualización</dt>
                  <dd className="mt-1 text-lg text-gray-900 dark:text-gray-100">
                    {new Date(grado.updated_at || '').toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}