import React from 'react';
import { useForm } from '@inertiajs/react';

type FormProps = {
  initialData: {
    apellidos: string;
    nombres: string;
  };
  errors?: Record<string, string>;
  submitUrl: string;
  method?: 'post' | 'put' | 'patch';
  onCancel: () => void;
  submitButtonText?: string;
};

export default function AutorForm({
  initialData,
  errors = {},
  submitUrl,
  method = 'post',
  onCancel,
  submitButtonText = 'Guardar'
}: FormProps) {
  const form = useForm(initialData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (method === 'post') {
      form.post(submitUrl);
    } else if (method === 'put') {
      form.put(submitUrl);
    } else {
      form.patch(submitUrl);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      <div>
        <label htmlFor="apellidos" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Apellidos
        </label>
        <input
          id="apellidos"
          type="text"
          name="apellidos"
          value={form.data.apellidos}
          onChange={(e) => form.setData('apellidos', e.target.value)}
          className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
          required
        />
        {errors.apellidos && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.apellidos}</p>
        )}
      </div>

      <div>
        <label htmlFor="nombres" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nombres
        </label>
        <input
          id="nombres"
          type="text"
          name="nombres"
          value={form.data.nombres}
          onChange={(e) => form.setData('nombres', e.target.value)}
          className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
          required
        />
        {errors.nombres && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.nombres}</p>
        )}
      </div>

      <div className="flex justify-end pt-5">
        <button
          type="button"
          onClick={onCancel}
          className="mr-3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={form.processing}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {submitButtonText}
        </button>
      </div>
    </form>
  );
}