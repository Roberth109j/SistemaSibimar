import React, { useState } from 'react';
import { Eye } from 'lucide-react';
import Modal from '../../components/Modal';
import { type Lector } from './types';

type ShowProps = {
  lector: Lector;
};

export default function Show({ lector }: ShowProps) {
  const [isOpen, setIsOpen] = useState(false);

  const content = (
    <div className="space-y-6">
      <div className="overflow-hidden bg-white dark:bg-gray-800 shadow-md rounded-lg">
        <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 px-6 py-5">
          <div className="flex items-center">
            <div className="ml-5 flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white break-words leading-tight">
                {lector.nombre}
              </h3>
            </div>
          </div>
        </div>
        <div className="px-6 py-5">
          <dl className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Código
              </dt>
              <dd className="mt-1.5 text-sm text-gray-900 dark:text-white font-medium font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                {lector.codigo}
              </dd>
            </div>
            <div className="sm:col-span-1 pl-8">
              <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Tipo de Lector
              </dt>
              <dd className="mt-1.5">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                  lector.tipo === 'ESTUDIANTE' 
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' 
                    : lector.tipo === 'DOCENTE'
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                    : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                }`}>
                  {lector.tipo}
                </span>
              </dd>
            </div>
            <div className="sm:col-span-1 pr-8">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Nombre Completo
              </dt>
              <dd className="mt-2 text-base text-gray-900 dark:text-white font-medium break-words">
                {lector.nombre}
              </dd>
            </div>
            <div className="sm:col-span-1 pl-8">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Grado Académico
              </dt>
              <dd className="mt-2 text-base text-gray-900 dark:text-white font-medium break-words">
                {lector.grado ? `${lector.grado.grado}${lector.grado.subGrado ? ` - ${lector.grado.subGrado}` : ''}` : 'No asignado'}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Estado
              </dt>
              <dd className="mt-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  lector.estado === 'ACTIVO' 
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' 
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {lector.estado}
                </span>
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
      
      <div style={{ 
        '--modal-max-width': '650px' 
      } as React.CSSProperties}>
        <style>
          {`
            .custom-modal-width .fixed.inset-0.z-50 > div {
              max-width: var(--modal-max-width) !important;
            }
          `}
        </style>
        <div className="custom-modal-width">
          <Modal
            open={isOpen}
            onClose={() => setIsOpen(false)}
            title="Detalles del Lector"
            footer={modalFooter}
          >
            {content}
          </Modal>
        </div>
      </div>
    </>
  );
}