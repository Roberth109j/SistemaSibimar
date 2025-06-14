import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Search, CheckCircle, AlertCircle, X } from 'lucide-react';
import AppLayout from '../../layouts/app-layout';
import { type BreadcrumbItem } from './types';
import CreateEstanteria from './Create';
import EditEstanteria from './Edit';
import ShowEstanteria from './Show';
import Pagination from '../../components/Pagination';

type Estanteria = {
  id: number;
  cod_estante: string;
  descripcion: string | null;
  created_at?: string;
  updated_at?: string;
};

type FlashMessage = {
  success?: string;
  error?: string;
};

type IndexProps = {
  auth: {
    user: any;
  };
  estanterias: Estanteria[];
  flash?: FlashMessage;
  errors?: Record<string, string>;
};

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Estanterías', href: '/estanterias' },
];

// Función para truncar texto y agregar puntos suspensivos
const truncateText = (text: string | null, maxLength: number) => {
  if (!text) return '-';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

function AlertNotification({
  type,
  message,
  className = '',
  autoClose = true,
  duration = 4000,
}: {
  type: 'success' | 'error';
  message: string;
  className?: string;
  autoClose?: boolean;
  duration?: number;
}) {
  const [isVisible, setIsVisible] = useState(true);
  const [animateOut, setAnimateOut] = useState(false);

  useEffect(() => {
    if (autoClose && message) {
      const timer = setTimeout(() => {
        setAnimateOut(true);
        const hideTimer = setTimeout(() => {
          setIsVisible(false);
        }, 500);
        return () => clearTimeout(hideTimer);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, message]);

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
          onClick={() => setAnimateOut(true)}
          className="ml-4 flex-shrink-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

const Index = ({ auth, estanterias, flash, errors = {} }: IndexProps) => {
  const page = usePage();

  const [searchTerm, setSearchTerm] = useState('');

  const [alerts, setAlerts] = useState<{
    success: string | null;
    error: string | null;
    timestamp: number;
  }>({
    success: null,
    error: null,
    timestamp: 0
  });

  useEffect(() => {
    if (flash) {
      setAlerts({
        success: flash.success || null,
        error: flash.error || null,
        timestamp: Date.now()
      });
    }
  }, [flash, page.props.flash]);

  const filteredEstanterias = searchTerm
    ? estanterias.filter(
        estanteria =>
          estanteria.cod_estante.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (estanteria.descripcion && estanteria.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : estanterias;

  const showAlert = (type: 'success' | 'error', message: string) => {
    console.log(`Showing alert: ${type} - ${message}`);
    setAlerts(prev => ({
      ...prev,
      [type]: message,
      timestamp: Date.now()
    }));
  };

  const renderAlerts = () => {
    console.log('Rendering alerts:', alerts);
    return (
      <>
        {alerts.success && (
          <AlertNotification
            key={`success-${alerts.timestamp}`}
            type="success"
            message={alerts.success}
          />
        )}
        {alerts.error && (
          <AlertNotification
            key={`error-${alerts.timestamp}`}
            type="error"
            message={alerts.error}
          />
        )}
      </>
    );
  };

  const content = (
    <div className="relative py-8 px-6 bg-slate-50 dark:bg-black min-h-screen">
      {renderAlerts()}
      
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl dark:bg-blue-600/10"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-indigo-500/5 blur-3xl dark:bg-indigo-600/10"></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Gestión de Estanterías
          </h1>
          <div className="flex gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar estanterías..."
                className="w-64 pl-10 py-2.5 pr-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                          text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                          shadow-sm transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
            <CreateEstanteria
              onSuccess={(message) => showAlert('success', message)}
              onError={(message) => showAlert('error', message)}
              errors={errors}
            />
          </div>
        </div>
        
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl">
          <Pagination items={filteredEstanterias} itemsPerPage={10}>
            {(paginatedEstanterias) => (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] table-fixed">
                  <colgroup>
                    <col className="w-16" />
                    <col className="w-32" />
                    <col className="w-40" />
                    <col className="w-28" />
                  </colgroup>
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      <th className="px-3 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Código</th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Descripción</th>
                      <th className="px-4 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {paginatedEstanterias.length > 0 ? (
                      paginatedEstanterias.map((estanteria) => (
                        <tr key={estanteria.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="px-3 py-3 whitespace-nowrap text-center text-gray-600 dark:text-gray-400 text-sm font-medium">{estanteria.id}</td>
                          <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-sm max-w-xs">
                            <div className="truncate" title={estanteria.cod_estante}>
                              {estanteria.cod_estante}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-sm max-w-xs">
                            <div className="truncate" title={estanteria.descripcion || '-'}>
                              {truncateText(estanteria.descripcion, 40)}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex justify-center space-x-2">
                              <ShowEstanteria estanteria={estanteria} />
                              <EditEstanteria
                                estanteria={estanteria}
                                onSuccess={(message) => showAlert('success', message)}
                                onError={(message) => showAlert('error', message)}
                                errors={errors}
                              />
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                          No hay estanterías disponibles
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </Pagination>
        </div>
      </div>
    </div>
  );

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Gestión de Estanterías" />
      {content}
    </AppLayout>
  );
};

export default Index;