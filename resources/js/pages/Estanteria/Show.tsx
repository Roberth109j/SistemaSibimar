import { X as XIcon } from 'lucide-react';
import { type EstanteriaShowProps } from './types';

export default function ShowEstanteria({ isModal, open, onClose, estanteria }: EstanteriaShowProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-auto overflow-hidden rounded-lg shadow-2xl transform transition-all duration-300 animate-fade-in-up">
        <div className="bg-blue-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Detalles de la Estantería</h2>
            <button onClick={onClose} className="rounded-full p-1 bg-white/20 hover:bg-white/30 text-white transition-colors">
              <XIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 text-gray-900 dark:text-gray-100">
          <div className="space-y-6">
            <div className="overflow-hidden bg-white dark:bg-gray-800 shadow-md rounded-lg">
              <div className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 dark:from-blue-600/20 dark:to-indigo-600/20 px-6 py-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg">
                    <span className="text-xl font-bold">{estanteria.id}</span>
                  </div>
                  <div className="ml-5">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {estanteria.cod_estante}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">ID: {estanteria.id}</p>
                    {estanteria.created_at && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">Creado: {estanteria.created_at}</p>
                    )}
                    {estanteria.updated_at && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">Actualizado: {estanteria.updated_at}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="px-6 py-5">
                <dl className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Código
                    </dt>
                    <dd className="mt-2 text-base text-gray-900 dark:text-white font-medium">
                      {estanteria.cod_estante}
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Descripción
                    </dt>
                    <dd className="mt-2 text-base text-gray-900 dark:text-white font-medium">
                      {estanteria.descripcion || '-'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                  rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 
                  hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 
                  focus:ring-blue-500 transition-colors transform hover:-translate-y-0.5 hover:shadow-md"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}