import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

interface AlertProps {
  type: 'success' | 'error';
  message: string;
  className?: string;
  autoClose?: boolean;
  duration?: number;
  position?: 'top-center' | 'top-right';
}

export default function AlertNotification({
  type,
  message,
  className = '',
  autoClose = true,
  duration = 4000,
  position = 'top-right'
}: AlertProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [animateOut, setAnimateOut] = useState(false);

  useEffect(() => {
    if (autoClose && message) {
      const timer = setTimeout(() => {
        // Primero activamos la animación de salida
        setAnimateOut(true);
        
        // Después de que termine la animación, ocultamos el componente
        const hideTimer = setTimeout(() => {
          setIsVisible(false);
        }, 500); // Duración de la animación
        
        return () => clearTimeout(hideTimer);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, message]);

  if (!isVisible || !message) return null;

  // Colores más contrastantes para mejor visibilidad en ambos temas
  const colors = {
    success: {
      light: {
        bg: 'bg-green-100',
        border: 'border-green-500',
        text: 'text-green-800',
        icon: 'text-green-500'
      },
      dark: {
        bg: 'dark:bg-green-800/40',
        border: 'dark:border-green-500',
        text: 'dark:text-green-100',
        icon: 'dark:text-green-400'
      }
    },
    error: {
      light: {
        bg: 'bg-red-100',
        border: 'border-red-500',
        text: 'text-red-800',
        icon: 'text-red-500'
      },
      dark: {
        bg: 'dark:bg-red-800/40',
        border: 'dark:border-red-500',
        text: 'dark:text-red-100',
        icon: 'dark:text-red-400'
      }
    }
  };

  // Posición del alerta
  const positionClasses = {
    'top-center': 'fixed top-6 left-1/2 -translate-x-1/2 z-50',
    'top-right': 'fixed top-6 right-6 z-50'
  };

  // Animaciones según la posición
  const animationClasses = {
    'top-center': animateOut ? 'opacity-0 translate-y-[-20px]' : 'opacity-100 translate-y-0',
    'top-right': animateOut ? 'opacity-0 translate-x-20' : 'opacity-100 translate-x-0'
  };

  // Seleccionar el icono según el tipo
  const Icon = type === 'success' ? CheckCircle : AlertCircle;

  return (
    <div className={`${positionClasses[position]} ${animationClasses[position]} transition-all duration-500 ease-in-out transform ${className}`}>
      <div 
        className={`max-w-md rounded-lg shadow-xl border-l-4 
                    ${colors[type].light.border} ${colors[type].dark.border}
                    ${colors[type].light.bg} ${colors[type].dark.bg} 
                    flex items-start p-5 transition-all duration-300 transform
                    ${animateOut ? 'scale-95' : 'scale-100'} animate-slide-in-right`}
      >
        <Icon className={`h-6 w-6 mt-0.5 mr-4 flex-shrink-0 ${colors[type].light.icon} ${colors[type].dark.icon}`} />
        
        <div className="flex-grow">
          <p className={`text-base font-semibold ${colors[type].light.text} ${colors[type].dark.text}`}>
            {message}
          </p>
        </div>
        
        <button 
          onClick={() => setAnimateOut(true)}
          className="ml-4 flex-shrink-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

// Definir la animación si estamos en el cliente
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = 'text/css';
  styleSheet.innerText = `
    @keyframes slide-in-right {
      0% {
        transform: translateX(100%);
        opacity: 0;
      }
      100% {
        transform: translateX(0);
        opacity: 1;
      }
    }
    .animate-slide-in-right {
      animation: slide-in-right 0.4s ease-out forwards;
    }
  `;
  document.head.appendChild(styleSheet);
}