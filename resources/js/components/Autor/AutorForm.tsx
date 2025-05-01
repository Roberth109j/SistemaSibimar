import React from 'react';
import { useForm } from '@inertiajs/react';

type FormProps = {
  initialData: {
    nombres: string;
    apellidos: string;
  };
  errors?: Record<string, string>;
  submitUrl: string;
  method?: 'post' | 'put' | 'patch';
  onCancel: () => void;
  submitButtonText?: string;
  isEditing?: boolean;
};

export default function AutorForm({
  initialData,
  errors = {},
  submitUrl,
  method = 'post',
  onCancel,
  submitButtonText = 'Guardar',
  isEditing = false
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

  // Definir colores según si es edición (ámbar) o creación (azul)
  const gradientColors = isEditing ? 
    'from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700' : 
    'from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700';

  const focusColors = isEditing ?
    'focus:ring-amber-500 focus:border-amber-500' :
    'focus:ring-blue-500 focus:border-blue-500';

  const ringFocus = isEditing ?
    'focus:ring-amber-500' :
    'focus:ring-blue-500';

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      <div className="space-y-6">
        {/* Campo de Nombres */}
        <div className="relative">
          <label htmlFor="nombres" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nombres
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              id="nombres"
              type="text"
              name="nombres"
              value={form.data.nombres}
              onChange={(e) => form.setData('nombres', e.target.value)}
              className={`block w-full px-4 py-3 rounded-lg border ${
                errors.nombres
                  ? 'border-red-500 dark:border-red-500 focus:ring-red-500 focus:border-red-500'
                  : `border-gray-300 dark:border-gray-600 ${focusColors}`
              } shadow-sm transition-colors duration-200
              bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-opacity-50`}
              placeholder="Ingrese los nombres"
              required
            />
          </div>
          {errors.nombres && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.nombres}</p>
          )}
        </div>

        {/* Campo de Apellidos */}
        <div className="relative">
          <label htmlFor="apellidos" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Apellidos
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              id="apellidos"
              type="text"
              name="apellidos"
              value={form.data.apellidos}
              onChange={(e) => form.setData('apellidos', e.target.value)}
              className={`block w-full px-4 py-3 rounded-lg border ${
                errors.apellidos
                  ? 'border-red-500 dark:border-red-500 focus:ring-red-500 focus:border-red-500'
                  : `border-gray-300 dark:border-gray-600 ${focusColors}`
              } shadow-sm transition-colors duration-200
              bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-opacity-50`}
              placeholder="Ingrese los apellidos"
              required
            />
          </div>
          {errors.apellidos && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.apellidos}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm
                    text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700
                    hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2
                    focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={form.processing}
          className={`px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium
                    text-white bg-gradient-to-r ${gradientColors}
                    focus:outline-none focus:ring-2 focus:ring-offset-2 ${ringFocus}
                    disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200
                    transform hover:-translate-y-0.5 hover:shadow-lg`}
        >
          {form.processing ? `${submitButtonText}...` : submitButtonText}
        </button>
      </div>
    </form>
  );
}