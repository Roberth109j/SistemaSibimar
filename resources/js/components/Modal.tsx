import React, { ReactNode } from 'react';
import { X } from 'lucide-react';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  description?: string;
  titleGradient?: boolean;
  footer?: ReactNode;
};

export default function Modal({
  open,
  onClose,
  children,
  title,
  description,
  titleGradient = false,
  footer
}: ModalProps) {
  if (!open) return null;

  // Estilos del título según la imagen proporcionada
  const headerBgClass = titleGradient 
    ? 'bg-gradient-to-r from-blue-600 to-blue-500' 
    : 'bg-blue-600';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="relative w-full max-w-md mx-auto overflow-hidden rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado del modal */}
        {title && (
          <div className={`${headerBgClass} px-6 py-3 flex items-center justify-between`}>
            <h2 className="text-lg font-medium text-white">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Cuerpo del modal */}
        <div className="bg-gray-800 text-white p-5 space-y-4">
          {description && (
            <p className="text-sm text-gray-300">{description}</p>
          )}
          {children}
          
          {/* Footer opcional */}
          {footer && (
            <div className="flex justify-end gap-2 mt-6">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}