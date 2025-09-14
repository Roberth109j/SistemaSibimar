import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, Edit, BookOpen } from 'lucide-react';
import AppLayout from '../../layouts/app-layout';
import { BreadcrumbItem, Grado } from './types';

type ShowPageProps = {
  auth: {
    user: {
      id: number;
      name: string;
      email: string;
      roles?: Array<{ name: string }>;
    };
  };
  grado: Grado;
};

const ShowPage = ({ auth, grado }: ShowPageProps) => {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Grados', href: '/grados' },
    { title: `${grado.grado}${grado.subGrado ? ` - ${grado.subGrado}` : ''}`, href: `/grados/${grado.id}` },
  ];

  // Verificar si el usuario es administrador
  const isAdmin = auth.user?.roles?.some((role: any) => role.name === 'Administrador') || false;

  // Si no es admin, mostrar mensaje de acceso denegado
  if (!isAdmin) {
    return (
      <AppLayout
        renderHeader={() => (
          <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
            Acceso Denegado
          </h2>
        )}
        breadcrumbs={breadcrumbs}
      >
        <Head title="Acceso Denegado" />
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
            <div className="p-6 text-center">
              <div className="mx-auto mb-4 h-12 w-12 text-red-500">
                <AlertCircle className="h-12 w-12" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
                Acceso Denegado
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                No tienes permisos para ver los detalles de grados. Solo los administradores pueden acceder a esta sección.
              </p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Función para obtener el nombre de la sección desde la relación
  const getSeccionNombre = () => {
    return grado.seccion?.nombre || 'Sin sección';
  };

  return (
    <AppLayout
      renderHeader={() => (
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
            Detalles del Grado: {grado.grado}{grado.subGrado ? ` - ${grado.subGrado}` : ''}
          </h2>
          <div className="flex items-center space-x-4">
            <Link
              href="/grados"
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-lg transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Link>
            <Link
              href={`/grados/${grado.id}/edit`}
              className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-all duration-200 font-medium"
            >
              <Edit className="w-4 h-4" />
              Editar Grado
            </Link>
          </div>
        </div>
      )}
      breadcrumbs={breadcrumbs}
    >
      <Head title={`${grado.grado}${grado.subGrado ? ` - ${grado.subGrado}` : ''} - Detalles`} />
      <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="overflow-hidden bg-white shadow-xl sm:rounded-lg dark:bg-gray-800">
          {/* Header del grado */}
          <div className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 px-6 py-8">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-full bg-blue-500 dark:bg-blue-600 text-white shadow-lg">
                <BookOpen className="w-8 h-8" />
              </div>
              <div className="ml-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {grado.grado} {grado.subGrado ? `- ${grado.subGrado}` : ''}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  Información detallada del grado académico
                </p>
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="px-6 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Información básica */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Información Básica
                </h3>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Grado
                    </dt>
                    <dd className="mt-1 text-base text-gray-900 dark:text-white font-medium">
                      {grado.grado}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Sub Grado
                    </dt>
                    <dd className="mt-1 text-base text-gray-900 dark:text-white font-medium">
                      {grado.subGrado || '—'}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Información de sección */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Sección
                </h3>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Sección Asignada
                    </dt>
                    <dd className="mt-1 text-base text-gray-900 dark:text-white font-medium">
                      {getSeccionNombre()}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Estado */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Estado
                </h3>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Estado Actual
                    </dt>
                    <dd className="mt-1">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        grado.estado === 'ACTIVO'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {grado.estado}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Información adicional */}
            <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Información del Sistema
              </h3>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    ID del Grado
                  </dt>
                  <dd className="mt-1 text-base text-gray-900 dark:text-white font-mono">
                    #{grado.id}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    ID de Sección
                  </dt>
                  <dd className="mt-1 text-base text-gray-900 dark:text-white font-mono">
                    #{grado.seccion_id}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ShowPage;