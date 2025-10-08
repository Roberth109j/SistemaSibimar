import React, { ReactNode, useEffect, useState } from 'react';
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
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    if (open) {
      setAnimationClass('animate-in');
      document.body.style.overflow = 'hidden';
    } else {
      setAnimationClass('animate-out');
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open && animationClass !== 'animate-in') return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // ✅ Prevenir propagación al formulario padre
    e.preventDefault();
    e.stopPropagation();

    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // ✅ Handler específico para el botón X
  const handleCloseClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  return (
    <>
      <style>
        {`
          @keyframes modal-in {
            0% { opacity: 0; transform: scale(0.95) translateY(10px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
          }
          
          @keyframes modal-out {
            0% { opacity: 1; transform: scale(1); }
            100% { opacity: 0; transform: scale(0.95); }
          }
          
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          
          .animate-in {
            animation: modal-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          
          .animate-out {
            animation: modal-out 0.2s ease-out forwards;
          }
          
          .shimmer-effect {
            background: linear-gradient(90deg, 
              rgba(255,255,255,0) 0%, 
              rgba(255,255,255,0.1) 50%, 
              rgba(255,255,255,0) 100%);
            background-size: 200% 100%;
            animation: shimmer 2s infinite;
          }
        `}
      </style>

      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
      >
        <div
          className={`w-full max-w-md ${animationClass} overflow-hidden relative`}
          onClick={e => e.stopPropagation()}
        >
          {/* Card with subtle shadow and border */}
          <div className="overflow-hidden rounded-xl shadow-[0_20px_50px_rgba(8,112,184,0.2)] dark:shadow-[0_20px_50px_rgba(10,47,108,0.3)] border border-blue-100/50 dark:border-blue-950/20">

            {/* Header with title */}
            {title && (
              <div className={`relative overflow-hidden ${titleGradient
                  ? 'bg-gradient-to-r from-[#0a2f6c] via-[#0f3b83] to-[#0a2f6c]'
                  : 'bg-[#0a2f6c]'
                } dark:bg-[#0a2f6c] px-6 py-4`}>

                {/* Animated light effect */}
                <div className="absolute inset-0 shimmer-effect pointer-events-none"></div>

                {/* Decorative elements */}
                <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-blue-400/20 blur-md"></div>
                <div className="absolute left-1/3 -bottom-8 w-16 h-16 rounded-full bg-indigo-400/10 blur-md"></div>

                {/* Barra azul */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-400 dark:bg-blue-500"></div>

                <div className="flex items-center justify-between relative z-10">
                  <h2 className="text-lg font-medium text-white pl-2">{title}</h2>

                  <button
                    type="button" // ✅ CRÍTICO: Previene submit del form padre
                    onClick={handleCloseClick} // ✅ Usa el handler específico
                    className="group p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/30"
                    aria-label="Cerrar"
                  >
                    <X className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </div>
            )}

            {/* Content area */}
            <div className="bg-gradient-to-b from-white to-slate-50 dark:from-[#131e33] dark:to-[#0f172e] p-6">
              {/* Pattern overlay */}
              <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#4285F4 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

              {/* Description */}
              {description && (
                <div className="mb-5 p-4 bg-blue-50 dark:bg-[#162447] rounded-lg border-l-4 border-[#0a2f6c] dark:border-blue-500">
                  <p className="text-sm text-gray-700 dark:text-blue-100">{description}</p>
                </div>
              )}

              {/* Main content */}
              <div className="relative z-10 space-y-4">
                {children}
              </div>

              {/* Footer */}
              {footer && (
                <div className="mt-6 pt-4 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700/50">
                  {footer}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Componente para el banner
export function FormInfoBanner({ message = "Complete los campos para continuar" }) {
  return (
    <div className="bg-blue-50 dark:bg-[#162447] border-l-4 border-[#0a2f6c] dark:border-blue-500 rounded-md p-4 mb-4">
      <p className="text-sm text-blue-800 dark:text-blue-100">{message}</p>
    </div>
  );
}

// Componente para mostrar errores
export function InputError({ message }: { message: string | undefined }) {
  if (!message) return null;

  return (
    <div className="flex items-center mt-1.5">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      <p className="text-sm text-red-600 dark:text-red-400">{message}</p>
    </div>
  );
}