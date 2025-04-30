import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type Grado } from './types';

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
    title: 'Editar Grado',
    href: '#',
  },
];

interface Props {
  grado: Grado;
}

export default function Edit({ grado }: Props) {
  const { data, setData, put, processing, errors } = useForm({
    grado: grado.grado,
    subGrado: grado.subGrado || '',
    estado: grado.estado || 'ACTIVO',
    seccion_id: grado.seccion_id || '',
  });

  const gradosDisponibles = [
    'Prescolar', 'Primero', 'Segundo', 'Tercero', 'Cuarto',
    'Quinto', 'Sexto', 'Séptimo', 'Octavo', 'Noveno',
    'Décimo', 'Once'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('grados.update', grado.id));
  };

  return (
    <AppLayout
      title="Editar Grado"
      breadcrumbs={breadcrumbs}
      renderHeader={() => (
        <h2 className="text-xl font-semibold leading-tight text-gray-800">
          Editar Grado
        </h2>
      )}
    >
      <Head title="Editar Grado" />

      <div className="py-6">
        <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label
                  htmlFor="grado"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Grado *
                </label>
                <select
                  id="grado"
                  value={data.grado}
                  onChange={(e) => setData('grado', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                  required
                >
                  <option value="">Seleccione un grado</option>
                  {gradosDisponibles.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                {errors.grado && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.grado}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="subGrado"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Sub Grado
                </label>
                <input
                  type="text"
                  id="subGrado"
                  value={data.subGrado}
                  onChange={(e) => setData('subGrado', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                />
                {errors.subGrado && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.subGrado}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="estado"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Estado *
                </label>
                <select
                  id="estado"
                  value={data.estado}
                  onChange={(e) => setData('estado', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                  required
                >
                  <option value="ACTIVO">Activo</option>
                  <option value="INACTIVO">Inactivo</option>
                </select>
                {errors.estado && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.estado}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="seccion_id"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Sección *
                </label>
                <input
                  type="number"
                  id="seccion_id"
                  value={data.seccion_id}
                  onChange={(e) => setData('seccion_id', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                  required
                />
                {errors.seccion_id && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.seccion_id}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-4">
                <a
                  href={route('grados.index')}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                >
                  Cancelar
                </a>
                <button
                  type="submit"
                  disabled={processing}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}