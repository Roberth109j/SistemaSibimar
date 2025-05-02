import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { CheckCircle, AlertCircle, InfoIcon, X } from 'lucide-react';

export type AlertType = 'success' | 'error' | 'info' | 'warning';
export type AlertPosition = 'top-center' | 'top-right' | 'bottom-right' | 'bottom-center';

export interface AlertProps {
  type: AlertType;
  message: string;
  title?: string;
  autoClose?: boolean;
  duration?: number;
  position?: AlertPosition;
  onClose?: () => void;
}

interface AlertContextType {
  showAlert: (props: AlertProps) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alert, setAlert] = useState<AlertProps | null>(null);

  const showAlert = (props: AlertProps) => {
    // Clear the current alert and show the new one after a slight delay
    setAlert(null);
    setTimeout(() => {
      setAlert(props);
    }, 100); // 100ms delay to ensure the UI updates
  };

  const hideAlert = () => {
    setAlert(null);
  };

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      {alert && <AlertNotification {...alert} />}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert debe ser usado dentro de un AlertProvider');
  }
  return context;
}

export default function AlertNotification({
  type = 'info',
  message,
  title,
  autoClose = true,
  duration = 4000,
  position = 'top-right',
  onClose
}: AlertProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [animateOut, setAnimateOut] = useState(false);
  const animationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !document.getElementById('alert-animations')) {
      const styleSheet = document.createElement("style");
      styleSheet.id = 'alert-animations';
      styleSheet.type = 'text/css';
      styleSheet.innerText = `
        @keyframes slide-in-right {
          0% { transform: translateX(100%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes slide-in-top {
          0% { transform: translateY(-100%); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes slide-in-bottom {
          0% { transform: translateY(100%); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .alert-slide-in-right { animation: slide-in-right 0.4s ease-out forwards; }
        .alert-slide-in-top { animation: slide-in-top 0.4s ease-out forwards; }
        .alert-slide-in-bottom { animation: slide-in-bottom 0.4s ease-out forwards; }
      `;
      document.head.appendChild(styleSheet);
    }
  }, []);

  useEffect(() => {
    if (autoClose && message) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, message]);

  const handleClose = () => {
    setAnimateOut(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 500);
  };

  if (!isVisible || !message) return null;

  const alertStyles = {
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
    },
    info: {
      light: {
        bg: 'bg-blue-100',
        border: 'border-blue-500',
        text: 'text-blue-800',
        icon: 'text-blue-500'
      },
      dark: {
        bg: 'dark:bg-blue-800/40',
        border: 'dark:border-blue-500',
        text: 'dark:text-blue-100',
        icon: 'dark:text-blue-400'
      }
    },
    warning: {
      light: {
        bg: 'bg-amber-100',
        border: 'border-amber-500',
        text: 'text-amber-800',
        icon: 'text-amber-500'
      },
      dark: {
        bg: 'dark:bg-amber-800/40',
        border: 'dark:border-amber-500',
        text: 'dark:text-amber-100',
        icon: 'dark:text-amber-400'
      }
    }
  };

  const positionClasses = {
    'top-center': 'fixed top-6 left-1/2 -translate-x-1/2 z-50',
    'top-right': 'fixed top-6 right-6 z-50',
    'bottom-right': 'fixed bottom-6 right-6 z-50',
    'bottom-center': 'fixed bottom-6 left-1/2 -translate-x-1/2 z-50'
  };

  const animationClasses = {
    'top-center': {
      enter: 'alert-slide-in-top',
      exit: animateOut ? 'opacity-0 translate-y-[-20px]' : 'opacity-100 translate-y-0'
    },
    'top-right': {
      enter: 'alert-slide-in-right',
      exit: animateOut ? 'opacity-0 translate-x-20' : 'opacity-100 translate-x-0'
    },
    'bottom-right': {
      enter: 'alert-slide-in-right',
      exit: animateOut ? 'opacity-0 translate-x-20' : 'opacity-100 translate-x-0'
    },
    'bottom-center': {
      enter: 'alert-slide-in-bottom',
      exit: animateOut ? 'opacity-0 translate-y-20' : 'opacity-100 translate-y-0'
    }
  };

  const IconMap = {
    'success': CheckCircle,
    'error': AlertCircle,
    'info': InfoIcon,
    'warning': AlertCircle
  };
  
  const Icon = IconMap[type];
  const styles = alertStyles[type];

  return (
    <div 
      ref={animationRef}
      className={`${positionClasses[position]} ${animationClasses[position].exit} ${animationClasses[position].enter} transition-all duration-500 ease-in-out transform`}
    >
      <div 
        className={`max-w-md rounded-lg shadow-xl border-l-4 
                    ${styles.light.border} ${styles.dark.border}
                    ${styles.light.bg} ${styles.dark.bg} 
                    flex items-start p-5 transition-all duration-300 transform
                    ${animateOut ? 'scale-95' : 'scale-100'}`}
      >
        <Icon className={`h-6 w-6 mt-0.5 mr-4 flex-shrink-0 ${styles.light.icon} ${styles.dark.icon}`} />
        <div className="flex-grow">
          {title && (
            <h4 className={`text-base font-bold mb-1 ${styles.light.text} ${styles.dark.text}`}>
              {title}
            </h4>
          )}
          <p className={`text-base ${title ? '' : 'font-semibold'} ${styles.light.text} ${styles.dark.text}`}>
            {message}
          </p>
        </div>
        <button 
          onClick={handleClose}
          className="ml-4 flex-shrink-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
          aria-label="Cerrar notificación"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}