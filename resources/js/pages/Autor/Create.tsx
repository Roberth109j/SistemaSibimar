// create.tsx
import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { X as XMarkIcon } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

type CreateProps = {
  auth: {
    user: any;
  };
  errors?: Record<string, string>;
};

export default function Create({ auth, errors = {} }: CreateProps) {
  const form = useForm({
    apellidos: '',
    nombres: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.post('/autores');
  };

  // Contenido original
  const content = (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Crear Nuevo Autor</h1>
        <Link
          href="/autores"
          className="text-gray-400 hover:text-white"
        >
          <XMarkIcon className="w-6 h-6" />
        </Link>
      </div>
      
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
          <div>
            <label htmlFor="apellidos" className="block text-sm font-medium text-gray-300 mb-1">
              Apellidos
            </label>
            <input
              id="apellidos"
              type="text"
              name="apellidos"
              value={form.data.apellidos}
              onChange={(e) => form.setData('apellidos', e.target.value)}
              className="block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
              required
            />
            {errors.apellidos && (
              <p className="mt-2 text-sm text-red-400">{errors.apellidos}</p>
            )}
          </div>

          <div>
            <label htmlFor="nombres" className="block text-sm font-medium text-gray-300 mb-1">
              Nombres
            </label>
            <input
              id="nombres"
              type="text"
              name="nombres"
              value={form.data.nombres}
              onChange={(e) => form.setData('nombres', e.target.value)}
              className="block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
              required
            />
            {errors.nombres && (
              <p className="mt-2 text-sm text-red-400">{errors.nombres}</p>
            )}
          </div>

          <div className="flex justify-end pt-5">
            <Link
              href="/autores"
              className="mr-3 px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={form.processing}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </>
  );

  // Corregido: eliminando el prop user
  return (
    <AppLayout>
      <Head title="Crear Autor" />
      {content}
    </AppLayout>
  );
}