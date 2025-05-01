import React, { ReactNode } from 'react';
import { useForm } from '@inertiajs/react';

type FormField = {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  disabled?: boolean;
};

type FormProps = {
  initialData: Record<string, any>;
  fields: FormField[];
  errors?: Record<string, string>;
  submitUrl: string;
  method?: 'post' | 'put' | 'patch';
  onSuccess?: (data: any) => void;
  onCancel: () => void;
  submitButtonText?: string;
  cancelButtonText?: string;
  isEditing?: boolean;
  children?: ReactNode;
  showButtons?: boolean;
  id?: string;
  accentColor?: 'blue' | 'amber' | 'green' | 'red' | 'indigo';
};

export default function Form({
  initialData,
  fields,
  errors = {},
  submitUrl,
  method = 'post',
  onSuccess,
  onCancel,
  submitButtonText = 'Guardar',
  cancelButtonText = 'Cancelar',
  isEditing = false,
  children,
  showButtons = true,
  id = 'form',
  accentColor = 'blue'
}: FormProps) {
  const form = useForm(initialData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const options = {
      onSuccess: () => {
        if (onSuccess) onSuccess(form.data);
      }
    };
    
    if (method === 'post') {
      form.post(submitUrl, options);
    } else if (method === 'put') {
      form.put(submitUrl, options);
    } else {
      form.patch(submitUrl, options);
    }
  };

  // Definir colores según el accentColor proporcionado
  const colorMap = {
    blue: {
      gradient: 'from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700',
      focus: 'focus:ring-blue-500 focus:border-blue-500',
      ring: 'focus:ring-blue-500',
      bg: 'bg-blue-600 hover:bg-blue-700'
    },
    amber: {
      gradient: 'from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700',
      focus: 'focus:ring-amber-500 focus:border-amber-500',
      ring: 'focus:ring-amber-500',
      bg: 'bg-amber-600 hover:bg-amber-700'
    },
    green: {
      gradient: 'from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700',
      focus: 'focus:ring-green-500 focus:border-green-500',
      ring: 'focus:ring-green-500',
      bg: 'bg-green-600 hover:bg-green-700'
    },
    red: {
      gradient: 'from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700',
      focus: 'focus:ring-red-500 focus:border-red-500',
      ring: 'focus:ring-red-500',
      bg: 'bg-red-600 hover:bg-red-700'
    },
    indigo: {
      gradient: 'from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700',
      focus: 'focus:ring-indigo-500 focus:border-indigo-500',
      ring: 'focus:ring-indigo-500',
      bg: 'bg-indigo-600 hover:bg-indigo-700'
    }
  };

  // Usar colores basados en si es edición o creación
  const selectedColor = isEditing ? colorMap.amber : colorMap[accentColor];
  const { gradient, focus, ring, bg } = selectedColor;

  return (
    <form id={id} onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6">
        {/* Renderiza todos los campos según la configuración proporcionada */}
        {fields.map((field) => (
          <div key={field.name} className="relative">
            <label 
              htmlFor={field.name} 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              {field.label}
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                id={field.name}
                type={field.type}
                name={field.name}
                value={form.data[field.name] || ''}
                onChange={(e) => form.setData(field.name, e.target.value)}
                placeholder={field.placeholder}
                required={field.required}
                autoComplete={field.autoComplete}
                disabled={field.disabled || form.processing}
                className={`block w-full px-4 py-3 rounded-lg border ${
                  errors[field.name]
                    ? 'border-red-500 dark:border-red-500 focus:ring-red-500 focus:border-red-500'
                    : `border-gray-300 dark:border-gray-600 ${focus}`
                } shadow-sm transition-colors duration-200
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-opacity-50`}
              />
            </div>
            {errors[field.name] && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors[field.name]}</p>
            )}
          </div>
        ))}
        
        {/* Espacio para contenido adicional */}
        {children}
      </div>

      {/* Botones condicionales */}
      {showButtons && (
        <div className="flex justify-end space-x-3 pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm
                      text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700
                      hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2
                      focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
          >
            {cancelButtonText}
          </button>
          <button
            type="submit"
            disabled={form.processing}
            className={`px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium
                      text-white bg-gradient-to-r ${gradient}
                      focus:outline-none focus:ring-2 focus:ring-offset-2 ${ring}
                      disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200
                      transform hover:-translate-y-0.5 hover:shadow-lg`}
          >
            {form.processing ? `${submitButtonText}...` : submitButtonText}
          </button>
        </div>
      )}
    </form>
  );
}