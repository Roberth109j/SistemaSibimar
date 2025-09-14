import React from 'react';
import { Head } from '@inertiajs/react';
import { AlertCircle } from 'lucide-react';
import AppLayout from '../../layouts/app-layout';
import { BreadcrumbItem } from './types';
import CreateGrado from './Create';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Grados', href: '/grados' },
  { title: 'Crear Grado', href: '/grados/create' },
];

type CreatePageProps = {
  auth: {
    user: {
      id: number;
      name: string;
      email: string;
      roles?: Array<{ name: string }>;
    };
  };
  all_secciones: Array<{ id: number; nombre: string }>;
  seccionId?: number | null;
  errors?: Record<string, string>;
};

const CreatePage = ({ auth, all_secciones, seccionId, errors = {} }: CreatePageProps) => {
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
                No tienes permisos para crear grados. Solo los administradores pueden acceder a esta sección.
              </p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      renderHeader={() => (
        <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
          Crear Nuevo Grado
        </h2>
      )}
      breadcrumbs={breadcrumbs}
    >
      <Head title="Crear Grado" />
      <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
          <div className="p-6">
            <CreateGrado
              onSuccess={(message) => {
                // Redirigir a la lista de grados con mensaje de éxito
                window.location.href = '/grados?success=' + encodeURIComponent(message);
              }}
              onError={(message) => {
                console.error('Error:', message);
              }}
              errors={errors}
              all_secciones={all_secciones}
              seccionId={seccionId}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default CreatePage;