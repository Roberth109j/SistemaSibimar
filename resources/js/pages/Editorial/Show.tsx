import React, { useState } from 'react';
import { Eye } from 'lucide-react';
import { BookOpen } from 'lucide-react';
import Modal from '@/components/Modal';
import { Editorial } from './types';

type ShowModalProps = {
  editorial: Editorial;
};

export default function ShowEditorial({ editorial }: ShowModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const content = (
    <div className="space-y-6">
      <div className="overflow-hidden bg-white dark:bg-gray-800 shadow-md rounded-lg">
        <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 px-6 py-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center justify-center h-14 w-14 rounded-full bg-blue-500 dark:bg-blue-600 text-white shadow-lg">
              <span className="text-xl font-bold">{editorial.id}</span>
            </div>
            <div className="ml-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editorial.nombre}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">ID: {editorial.id}</p>
            </div>
          </div>
        </div>
        <div className="px-6 py-5">
          <dl className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Nombre
              </dt>
              <dd className="mt-2 text-base text-gray-900 dark:text-white font-medium">
                {editorial.nombre}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Ciudad
              </dt>
              <dd className="mt-2 text-base text-gray-900 dark:text-white font-medium">
                {editorial.ciudad || '-'}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                País
              </dt>
              <dd className="mt-2 text-base text-gray-900 dark:text-white font-medium">
                {editorial.pais || '-'}
              </dd>
            </div>
          </dl>
        </div>
        {editorial.libros && editorial.libros.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base font-medium text-gray-900 dark:text-white">
                  Libros de la Editorial ({editorial.libros.length})
                </h3>
              </div>
            </div>
            <div className="px-6 py-4">
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {editorial.libros.map((libro) => (
                  <li key={libro.id} className="py-3 flex items-center">
                    <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-blue-500 dark:bg-blue-600 text-white">
                      <span className="text-xs font-medium">{libro.id}</span>
                    </div>
                    <div className="ml-3 text-gray-700 dark:text-gray-300">
                      {libro.titulo}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const modalFooter = (
    <button
      onClick={() => setIsOpen(false)}
      className="px-5 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
          rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 
          hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 
          focus:ring-blue-500 transition-colors"
    >
      Cerrar
    </button>
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 
                  transition-colors p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800/40"
        title="Ver detalles"
      >
        <Eye className="w-5 h-5" />
      </button>
      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Detalles de la Editorial"
        description={`ID: ${editorial.id} - ${editorial.nombre}`}
        footer={modalFooter}
      >
        {content}
      </Modal>
    </>
  );
}