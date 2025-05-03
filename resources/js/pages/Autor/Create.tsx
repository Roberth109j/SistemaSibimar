import { useState } from 'react';
import { router } from '@inertiajs/react';
import { X as XIcon } from 'lucide-react';
import { type AutorFormData, type AutorCreateProps } from './types';

export default function CreateAutor({ isModal, open, onClose, errors: initialErrors }: AutorCreateProps) {
  const [formData, setFormData] = useState<AutorFormData>({ nombres: '', apellidos: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>(initialErrors || {});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    console.log('Enviando datos:', formData);

    router.post('/autores', formData, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        console.log('Éxito: Autor creado');
        setFormErrors({});
        setFormData({ nombres: '', apellidos: '' });
        onClose();
        setTimeout(() => {
          router.visit('/autores', { preserveState: false });
        }, 1000); // Delay to allow notification to show
        setIsProcessing(false);
      },
      onError: (errors) => {
        console.log('Errores de validación:', errors);
        setFormErrors(errors);
        setIsProcessing(false);
      },
      onFinish: () => {
        console.log('Solicitud finalizada');
        setIsProcessing(false);
      },
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-auto overflow-hidden rounded-lg shadow-2xl transform transition-all duration-300 animate-fade-in-up">
        <div className="bg-blue-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Crear Autor</h2>
            <button onClick={onClose} className="rounded-full p-1 bg-white/20 hover:bg-white/30 text-white transition-colors">
              <XIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 text-gray-900 dark:text-gray-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="nombres" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombres
              </label>
              <input
                id="nombres"
                type="text"
                value={formData.nombres}
                onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                className="block w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                  border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                  placeholder-gray-400 focus:border-blue-500 transition-colors duration-200"
                required
                placeholder="Ingrese los nombres"
              />
              {formErrors.nombres && <p className="text-red-500 text-sm mt-1">{formErrors.nombres}</p>}
            </div>
            <div>
              <label htmlFor="apellidos" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Apellidos
              </label>
              <input
                id="apellidos"
                type="text"
                value={formData.apellidos}
                onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                className="block w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                  border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                  placeholder-gray-400 focus:border-blue-500 transition-colors duration-200"
                required
                placeholder="Ingrese los apellidos"
              />
              {formErrors.apellidos && <p className="text-red-500 text-sm mt-1">{formErrors.apellidos}</p>}
            </div>
            <div className="flex justify-end gap-3 pt-5">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-medium border rounded-lg shadow-sm
                  text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 
                  border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600
                  focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="px-5 py-2.5 text-sm font-medium text-white border border-transparent rounded-lg shadow-sm
                  bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isProcessing ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}