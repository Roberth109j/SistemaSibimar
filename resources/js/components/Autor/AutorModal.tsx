import React from 'react';
import { useForm } from '@inertiajs/react';
import { X } from 'lucide-react';

type AutorFormData = {
  nombres: string;
  apellidos: string;
};

type AutorModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialData?: AutorFormData;
  autor?: {
    id: number;
    nombres: string;
    apellidos: string;
  };
  isEditing?: boolean;
  errors?: Record<string, string>;
};

export default function AutorModal({
  isOpen,
  onClose,
  initialData = { nombres: '', apellidos: '' },
  autor,
  isEditing = false,
  errors = {}
}: AutorModalProps) {
  const form = useForm({
    nombres: initialData.nombres || '',
    apellidos: initialData.apellidos || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && autor) {
      form.put(`/autores/${autor.id}`, {
        onSuccess: () => {
          onClose();
        },
      });
    } else {
      form.post('/autores', {
        onSuccess: () => {
          onClose();
        },
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-auto overflow-hidden rounded-xl shadow-2xl">
        {/* Encabezado del modal en azul para todos los modales como muestran las imágenes */}
        <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {isEditing ? 'Editar Autor' : 'Crear Nuevo Autor'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo del modal con soporte para modo claro/oscuro */}
        <div className="bg-white dark:bg-gray-800 p-6 space-y-5">
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
              className="block w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                placeholder-gray-400 focus:border-blue-500 transition-colors duration-200"
              required
              placeholder="Ingrese los nombres"
            />
            {errors.nombres && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.nombres}</p>
            )}
          </div>

          {isEditing ? null : (
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
                className="block w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                  border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                  placeholder-gray-400 focus:border-blue-500 transition-colors duration-200"
                required
                placeholder="Ingrese los apellidos"
              />
              {errors.apellidos && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.apellidos}</p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium rounded-lg shadow-sm
                bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                border border-gray-300 dark:border-gray-600
                hover:bg-gray-50 dark:hover:bg-gray-600
                focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={form.processing}
              className="px-5 py-2.5 text-sm font-medium rounded-lg shadow-sm
                bg-blue-600 hover:bg-blue-700 text-white
                focus:outline-none focus:ring-2 focus:ring-blue-500
                disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {form.processing ? 
                (isEditing ? 'Actualizando...' : 'Guardando...') : 
                (isEditing ? 'Actualizar' : 'Guardar')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}