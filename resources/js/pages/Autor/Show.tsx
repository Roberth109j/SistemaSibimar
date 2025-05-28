import React, { useState } from 'react';
import { Eye } from 'lucide-react';
import Modal from '@/components/Modal';
import { Autor } from './types';

type ShowModalProps = {
  autor: Autor;
};

export default function ShowAutor({ autor }: ShowModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const content = (
    <div className="space-y-6">
      <div className="overflow-hidden bg-white dark:bg-gray-800 shadow-md rounded-lg">
        <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 px-6 py-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center justify-center h-14 w-14 rounded-full bg-blue-500 dark:bg-blue-600 text-white shadow-lg">
              <span className="text-xl font-bold">{autor.id}</span>
            </div>
            <div className="ml-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {autor.nombres} {autor.apellidos}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">ID: {autor.id}</p>
            </div>
          </div>
        </div>
        <div className="px-6 py-5">
          <dl className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Nombres
              </dt>
              <dd className="mt-2 text-base text-gray-900 dark:text-white font-medium">
                {autor.nombres}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Apellidos
              </dt>
              <dd className="mt-2 text-base text-gray-900 dark:text-white font-medium">
                {autor.apellidos}
              </dd>
            </div>
          </dl>
        </div>
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
        title="Detalles del Autor"
        footer={modalFooter}
      >
        {content}
      </Modal>
    </>
  );
}