import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { Search, CheckCircle, AlertCircle, X } from 'lucide-react';
import AppLayout from '../../layouts/app-layout';
import { BreadcrumbItem, Grado, FlashMessage } from './types';
import CreateGrado from './Create';
import EditGrado from './Edit';
import ShowGrado from './Show';
import Pagination from '../../components/Pagination';

type IndexProps = {
  auth: {
    user: any;
  };
  grados: Grado[] | null; // Allow null to handle loading/error states
  flash?: FlashMessage;
  errors?: Record<string, string>;
};

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Grados', href: '/grados' },
];

// Hardcoded sections (ideally should come from backend)
const secciones = [
  { id: 1, nombre: 'Primaria' },
  { id: 2, nombre: 'Bachillerato' },
];

// AlertNotification component (same as Autor's)
function AlertNotification({
  type,
  message,
  className = '',
  autoClose = true,
  duration = 4000,
  onClose,
}: {
  type: 'success' | 'error';
  message: string;
  className?: string;
  autoClose?: boolean;
  duration?: number;
  onClose: () => void;
}) {
  const [isVisible, setIsVisible] = useState(true);
  const [animateOut, setAnimateOut] = useState(false);

  useEffect(() => {
    if (autoClose && message) {
      const timer = setTimeout(() => {
        setAnimateOut(true);
        const hideTimer = setTimeout(() => {
          setIsVisible(false);
          onClose();
        }, 500);
        return () => clearTimeout(hideTimer);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, message, onClose]);

  if (!isVisible || !message) return null;

  const colors = {
    success: {
      light: { bg: 'bg-green-100', border: 'border-green-500', text: 'text-green-800', icon: 'text-green-500' },
      dark: { bg: 'dark:bg-green-800/40', border: 'dark:border-green-500', text: 'dark:text-green-100', icon: 'dark:text-green-400' }
    },
    error: {
      light: { bg: 'bg-red-100', border: 'border-red-500', text: 'text-red-800', icon: 'text-red-500' },
      dark: { bg: 'dark:bg-red-800/40', border: 'dark:border-red-500', text: 'dark:text-red-100', icon: 'dark:text-red-400' }
    }
  };

  const Icon = type === 'success' ? CheckCircle : AlertCircle;

  return (
    <div className={`fixed top-6 right-6 z-50 ${animateOut ? 'opacity-0 translate-x-20' : 'opacity-100 translate-x-0'} transition-all duration-500 ease-in-out transform ${className}`}>
      <div
        className={`max-w-md rounded-lg shadow-xl border-l-4 
                    ${colors[type].light.border} ${colors[type].dark.border}
                    ${colors[type].light.bg} ${colors[type].dark.bg} 
                    flex items-start p-5 transition-all duration-300 animate-slide-in-right`}
      >
        <Icon className={`h-6 w-6 mt-0.5 mr-4 flex-shrink-0 ${colors[type].light.icon} ${colors[type].dark.icon}`} />
        <div className="flex-grow">
          <p className={`text-base font-semibold ${colors[type].light.text} ${colors[type].dark.text}`}>
            {message}
          </p>
        </div>
        <button
          onClick={() => {
            setAnimateOut(true);
            setTimeout(() => {
              setIsVisible(false);
              onClose();
            }, 500);
          }}
          className="ml-4 flex-shrink-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

const Index = ({ auth, grados, flash, errors = {} }: IndexProps) => {
  const page = usePage<IndexProps>();
  const [searchTerm, setSearchTerm] = useState('');
  const [alerts, setAlerts] = useState<{
    success: string | null;
    error: string | null;
    timestamp: number;
  }>({
    success: null,
    error: null,
    timestamp: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Normalize and validate grados data
  const normalizedGrados = useMemo(() => {
    if (!Array.isArray(grados)) {
      console.error('Grados is not an array:', grados);
      return [];
    }
    return grados.map((grado) => ({
      ...grado,
      seccion_id: Number(grado.seccion_id), // Ensure seccion_id is a number
      subGrado: grado.subGrado || undefined, // Normalize optional field
    }));
  }, [grados]);

  // Filter grados based on search term
  const filteredGrados = useMemo(() => {
    if (!searchTerm.trim()) return normalizedGrados;
    const lowerSearchTerm = searchTerm.toLowerCase().trim();
    return normalizedGrados.filter((grado) =>
      grado.grado.toLowerCase().includes(lowerSearchTerm) ||
      (grado.subGrado && grado.subGrado.toLowerCase().includes(lowerSearchTerm))
    );
  }, [normalizedGrados, searchTerm]);

  // Handle alerts with debouncing to prevent rapid stacking
  const showAlert = useCallback((type: 'success' | 'error', message: string) => {
    console.log(`Showing alert: ${type} - ${message}`);
    setAlerts((prev) => ({
      ...prev,
      [type]: message,
      timestamp: Date.now(),
    }));
  }, []);

  // Clear specific alert
  const clearAlert = useCallback((type: 'success' | 'error') => {
    setAlerts((prev) => ({
      ...prev,
      [type]: null,
      timestamp: Date.now(),
    }));
  }, []);

  // Handle flash messages
  useEffect(() => {
    if (flash?.success) {
      showAlert('success', flash.success);
    }
    if (flash?.error) {
      showAlert('error', flash.error);
    }
  }, [flash, showAlert]);

  // Simulate loading state (remove if backend handles this)
  useEffect(() => {
    if (grados !== null) {
      setIsLoading(false);
    }
  }, [grados]);

  // Render alerts
  const renderAlerts = () => {
    return (
      <>
        {alerts.success && (
          <AlertNotification
            key={`success-${alerts.timestamp}`}
            type="success"
            message={alerts.success}
            onClose={() => clearAlert('success')}
          />
        )}
        {alerts.error && (
          <AlertNotification
            key={`error-${alerts.timestamp}`}
            type="error"
            message={alerts.error}
            onClose={() => clearAlert('error')}
          />
        )}
      </>
    );
  };

  // Get section name with validation
  const getSeccionNombre = useCallback((seccion_id: number) => {
    const seccion = secciones.find((s) => s.id === seccion_id);
    if (!seccion) {
      console.warn(`Sección not found for seccion_id: ${seccion_id}`);
      return 'Desconocida';
    }
    return seccion.nombre;
  }, []);

  const content = (
    <div className="py-8 px-6 bg-slate-50 dark:bg-black min-h-screen">
      {renderAlerts()}
      <div className="absolute inset-0 overflow-hidden pointer-events-none fixed">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl dark:bg-blue-600/10"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-indigo-500/5 blur-3xl dark:bg-indigo-600/10"></div>
      </div>
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Gestión de Grados
          </h1>
          <div className="flex gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar grados..."
                className="w-64 pl-10 py-2.5 pr-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                          text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                          shadow-sm transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
            <CreateGrado
              onSuccess={(message) => showAlert('success', message)}
              onError={(message) => showAlert('error', message)}
              errors={errors}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="ml-3 text-gray-700 dark:text-gray-300">Cargando...</span>
          </div>
        ) : normalizedGrados.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl">
            <p className="text-gray-500 dark:text-gray-400">No hay grados disponibles</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl">
            <Pagination items={filteredGrados} itemsPerPage={10}>
              {(paginatedGrados: Grado[]) => (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-700">
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">ID</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Grado</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Subgrado</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Sección</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Estado</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {paginatedGrados.map((grado) => (
                        <tr key={grado.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300 font-medium">{grado.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300 font-medium">{grado.grado}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300 font-medium">{grado.subGrado || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300 font-medium">{getSeccionNombre(grado.seccion_id)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">{grado.estado}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex space-x-4">
                              <ShowGrado grado={grado} />
                              <EditGrado
                                grado={grado}
                                onSuccess={(message) => showAlert('success', message)}
                                onError={(message) => showAlert('error', message)}
                                errors={errors}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Gestión de Grados" />
      {content}
    </AppLayout>
  );
};

export default Index;