import React, { ReactNode } from 'react';

export type FormField = {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  disabled?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void; // SOLO agregué HTMLTextAreaElement
  options?: { value: string; label: string }[];
  rows?: number; // SOLO agregué esta propiedad opcional
  className?: string; // SOLO agregué esta propiedad opcional
};

type FormProps = {
  initialData: Record<string, any>;
  fields: FormField[];
  errors?: Record<string, string>;
  submitUrl?: string; // Made optional
  method?: 'post' | 'put' | 'patch';
  onSuccess?: () => void;
  onCancel: () => void;
  submitButtonText?: string;
  cancelButtonText?: string;
  isEditing?: boolean;
  children?: ReactNode;
  showButtons?: boolean;
  id?: string;
  accentColor?: 'blue' | 'amber' | 'green' | 'red' | 'indigo';
  processing?: boolean;
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
  accentColor = 'blue',
  processing = false
}: FormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSuccess) onSuccess();
  };

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

  const selectedColor = colorMap[accentColor]; // Siempre usar el color especificado
  const { gradient, focus, ring, bg } = selectedColor;

  // Estilos personalizados para el select
  const getCustomStyles = () => {
    const styles = document.createElement('style');
    styles.textContent = `
      /* Estilo para los elementos de la lista desplegable */
      select.custom-select option {
        background-color: #ffffff;
        color: #1f2937;
        padding: 10px;
      }
      
      /* Estilo para modo oscuro */
      .dark select.custom-select option {
        background-color: #1e293b;
        color: #e5e7eb;
        padding: 10px;
      }
      
      /* Estilo para el elemento seleccionado/hover */
      select.custom-select option:checked,
      select.custom-select option:hover {
        background-color: #3b82f6;
        color: white;
      }
      
      /* Estilo para el elemento seleccionado/hover en modo oscuro */
      .dark select.custom-select option:checked,
      .dark select.custom-select option:hover {
        background-color: #2563eb;
        color: white;
      }
    `;
    document.head.appendChild(styles);
  };

  // Ejecutar una vez al montar el componente
  React.useEffect(() => {
    getCustomStyles();
    return () => {
      // Cleanup lógica si es necesario
    };
  }, []);

  return (
    <form 
      id={id} 
      onSubmit={handleSubmit} 
      className="space-y-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700/50 p-6 relative overflow-hidden backdrop-blur-md"
    >
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 dark:via-blue-600 to-transparent opacity-50"></div>
        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-blue-500/5 dark:bg-blue-600/10 blur-2xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-indigo-500/5 dark:bg-indigo-600/10 blur-2xl"></div>
        <div className="absolute inset-0 opacity-5 dark:opacity-10" 
             style={{ backgroundImage: 'radial-gradient(#4285F4 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
      </div>

      <div className="space-y-6 relative z-10">
        {fields && fields.map((field) => (
          <div key={field.name} className="relative">
            <label 
              htmlFor={field.name} 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            >
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              {field.type === 'select' ? (
                <div className="relative">
                  <select
                    id={field.name}
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    required={field.required}
                    disabled={field.disabled || processing}
                    className={`custom-select block w-full px-4 py-3 rounded-lg border appearance-none transition-all duration-200
                      ${errors[field.name]
                        ? 'border-red-500 dark:border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/20'
                        : `border-gray-300 dark:border-gray-600 ${focus} bg-gray-50 dark:bg-gray-700/80`
                      } 
                      shadow-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400
                      focus:outline-none focus:ring-2 focus:ring-opacity-50 pr-10`}
                  >
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-300">
                    <svg 
                      className="h-5 w-5" 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 20 20" 
                      fill="currentColor" 
                      aria-hidden="true"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                  </div>
                </div>
              ) : field.type === 'textarea' ? (
                // SOLO AGREGUÉ ESTA SECCIÓN PARA TEXTAREA SIN TOCAR NADA MÁS
                <textarea
                  id={field.name}
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={field.placeholder}
                  required={field.required}
                  disabled={field.disabled || processing}
                  rows={field.rows || 3}
                  className={`block w-full px-4 py-3 rounded-lg border transition-all duration-200
                    ${errors[field.name]
                      ? 'border-red-500 dark:border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/20'
                      : `border-gray-300 dark:border-gray-600 ${focus} bg-gray-50 dark:bg-gray-700/80`
                    } 
                    shadow-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-opacity-50 resize-vertical ${field.className || ''}`}
                  style={{
                    minHeight: '80px',
                    maxHeight: '300px'
                  }}
                />
              ) : (
                <input
                  id={field.name}
                  type={field.type}
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={field.placeholder}
                  required={field.required}
                  autoComplete={field.autoComplete}
                  disabled={field.disabled || processing}
                  className={`block w-full px-4 py-3 rounded-lg border transition-all duration-200
                    ${errors[field.name]
                      ? 'border-red-500 dark:border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/20'
                      : `border-gray-300 dark:border-gray-600 ${focus} bg-gray-50 dark:bg-gray-700/80`
                    } 
                    shadow-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                />
              )}
              <div className="absolute right-0 top-0 bottom-0 w-1 bg-blue-300 dark:bg-blue-600 rounded-r-md opacity-70"></div>
            </div>
            {errors[field.name] && (
              <div className="flex items-center mt-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-600 dark:text-red-400">{errors[field.name]}</p>
              </div>
            )}
            {/* SOLO AGREGUÉ ESTE CONTADOR PARA TEXTAREA */}
            {field.type === 'textarea' && field.value && (
              <div className={`text-xs text-right mt-1 ${
                String(field.value).length > 255 
                  ? 'text-red-600 dark:text-red-400 font-medium' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {String(field.value).length}/255 caracteres
                {String(field.value).length > 255 && (
                  <div className="text-red-600 dark:text-red-400 text-xs mt-1 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    ¡Has excedido el límite! Reduce el texto.
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        
        {children}
      </div>

      {showButtons && (
        <div className="flex items-center gap-3 pt-2 pb-4">
          <div className="h-px bg-gray-200 dark:bg-gray-700 flex-grow"></div>
          <div className="h-2 w-2 rounded-full bg-blue-400 dark:bg-blue-600"></div>
          <div className="h-px bg-gray-200 dark:bg-gray-700 flex-grow"></div>
        </div>
      )}

      {showButtons && (
        <div className="flex justify-end space-x-3 relative z-10">
          <button
            type="button"
            onClick={onCancel}
            disabled={processing}
            className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm
                    text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700
                    hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2
                    focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200
                    transform hover:-translate-y-0.5 hover:shadow-md"
          >
            {cancelButtonText}
          </button>
          <button
            type="submit"
            disabled={processing}
            className={`px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium
                    text-white bg-gradient-to-r ${gradient}
                    focus:outline-none focus:ring-2 focus:ring-offset-2 ${ring}
                    disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200
                    transform hover:-translate-y-0.5 hover:shadow-lg`}
          >
            {processing ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {submitButtonText}...
              </span>
            ) : (
              submitButtonText
            )}
          </button>
        </div>
      )}
    </form>
  );
}