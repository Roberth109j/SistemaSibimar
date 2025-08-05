import React, { useEffect } from 'react';
import { CheckCircle, X, Loader2, FileText } from 'lucide-react';
import { Prestamo } from './types';

interface ConfirmacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  prestamoSeleccionado: Prestamo | null;
  fechaDevuelto: string;
  setFechaDevuelto: (fecha: string) => void;
  observaciones: string;
  setObservaciones: (observaciones: string) => void;
  procesandoDevolucion: boolean;
  onConfirmar: () => void;
}

export default function ConfirmacionModal({
  isOpen,
  onClose,
  prestamoSeleccionado,
  fechaDevuelto,
  setFechaDevuelto,
  observaciones,
  setObservaciones,
  procesandoDevolucion,
  onConfirmar
}: ConfirmacionModalProps) {
  // Establecer la fecha actual y las observaciones del ejemplar cuando se abre el modal
  useEffect(() => {
    if (isOpen && prestamoSeleccionado) {
      const fechaActual = new Date().toISOString().split('T')[0];
      setFechaDevuelto(fechaActual);
      
      // Cargar las observaciones existentes del ejemplar SOLO la primera vez que se abre
      if (prestamoSeleccionado.ejemplar?.observaciones) {
        setObservaciones(prestamoSeleccionado.ejemplar.observaciones);
      } else {
        setObservaciones('');
      }
    }
  }, [isOpen, prestamoSeleccionado]); // Removidas las dependencias que causaban el loop

  if (!isOpen || !prestamoSeleccionado) return null;

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md shadow-2xl transform transition-all max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Confirmar Devolución
              </h3>
            </div>
            <button
              onClick={onClose}
              disabled={procesandoDevolucion}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-1.5 transition-all disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-4 space-y-5">
          {/* Formulario de devolución */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fecha de devolución
              </label>
              <input
                type="date"
                value={fechaDevuelto}
                readOnly
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 
                           bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white
                           cursor-not-allowed opacity-75
                           transition-all duration-200"
              />
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                La fecha de devolución se establece automáticamente con la fecha actual
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Observaciones del estado del ejemplar
              </label>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 h-24
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                           placeholder-gray-400 dark:placeholder-gray-500 resize-none
                           transition-all duration-200"
                placeholder="Registre el estado actual del ejemplar o agregue nuevas observaciones..."
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-1">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {prestamoSeleccionado.ejemplar?.observaciones ? 
                    'Estado previo cargado. Puede modificar o agregar observaciones.' :
                    'Registre cualquier daño, marca o condición especial del ejemplar.'
                  }
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {observaciones.length}/500
                </div>
              </div>
            </div>
          </div>

          {/* Mensaje informativo */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-lg p-3">
            <p className="text-xs text-blue-800 dark:text-blue-300">
              <strong>Importante:</strong> Verifique el estado físico del libro antes de confirmar la devolución. 
              Las observaciones se guardarán permanentemente en el ejemplar para futuras consultas.
            </p>
          </div>
        </div>

        {/* Footer con acciones */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={procesandoDevolucion}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 text-sm font-medium disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirmar}
              disabled={!fechaDevuelto || procesandoDevolucion}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 dark:from-green-500 dark:to-green-600 text-white rounded-lg hover:from-green-700 hover:to-green-800 dark:hover:from-green-600 dark:hover:to-green-700 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md flex items-center gap-2 disabled:opacity-50 disabled:from-gray-400 disabled:to-gray-500"
            >
              {procesandoDevolucion ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Confirmar Devolución</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}