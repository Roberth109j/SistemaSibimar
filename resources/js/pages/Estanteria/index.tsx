import { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import {
  Search as SearchIcon,
  Eye as EyeIcon,
  Pencil as PencilIcon,
  Plus as PlusIcon,
  CheckCircle,
  AlertCircle,
  X as XIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Estanteria, type EstanteriaIndexProps } from './types';
import CreateEstanteria from './Create';
import EditEstanteria from './Edit';
import ShowEstanteria from './Show';

// Componente AlertNotification
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
        const hideTimer = setTimeout(() => setIsVisible(false), 500);
        return () => clearTimeout(hideTimer);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, message]);

  if (!isVisible || !message) return null;

  const colors = {
    success: {
      light: { bg: 'bg-green-100', border: 'border-green-500', text: 'text-green-800', icon: 'text-green-500' },
      dark: { bg: 'dark:bg-green-800/40', border: 'dark:border-green-500', text: 'dark:text-green-100', icon: 'dark:text-green-400' },
    },
    error: {
      light: { bg: 'bg-red-100', border: 'border-red-500', text: 'text-red-800', icon: 'text-red-500' },
      dark: { bg: 'dark:bg-red-800/40', border: 'dark:border-red-500', text: 'dark:text-red-100', icon: 'dark:text-red-400' },
    },
  };

  const Icon = type === 'success' ? CheckCircle : AlertCircle;

  return (
    <div
      className={`fixed top-6 right-6 z-50 ${animateOut ? 'opacity-0 translate-x-20' : 'opacity-100 translate-x-0'} transition-all duration-500 ease-in-out transform ${className}`}
    >
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
          <XIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

// Componente de Paginación
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const displayPages = (): (number | 'ellipsis-start' | 'ellipsis-end')[] => {
    if (totalPages <= 7) return pages;

    const firstPage = 1;
    const lastPage = totalPages;
    let startPage = Math.max(2, currentPage - 2);
    let endPage = Math.min(totalPages - 1, startPage + 4);

    if (endPage - startPage < 4) {
      startPage = Math.max(2, endPage - 4);
    }

    const result: (number | 'ellipsis-start' | 'ellipsis-end')[] = [firstPage];
    if (startPage > 2) result.push('ellipsis-start');
    for (let i = startPage; i <= endPage; i++) result.push(i);
    if (endPage < totalPages - 1) result.push('ellipsis-end');
    if (totalPages > 1) result.push(lastPage);

    return result;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center py-6 space-x-1">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="inline-flex items-center justify-center w-9 h-9 rounded-md text-gray-500 dark:text-gray-400 
          bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
          hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Página anterior"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      {displayPages().map((page, index) =>
        typeof page === 'string' ? (
          <span
            key={`ellipsis-${index}`}
            className="inline-flex items-center justify-center w-9 h-9 text-gray-500 dark:text-gray-400"
          >
            ...
          </span>
        ) : (
          <button
            key={index}
            onClick={() => onPageChange(page)}
            className={`inline-flex items-center justify-center w-9 h-9 rounded-md font-medium
              ${currentPage === page
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md border-transparent'
                : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              } transition-colors transform hover:-translate-y-0.5 hover:shadow-md`}
            aria-label={`Ir a página ${page}`}
            aria-current={currentPage === page ? 'page' : undefined}
          >
            {page}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="inline-flex items-center justify-center w-9 h-9 rounded-md text-gray-500 dark:text-gray-400 
          bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
          hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Página siguiente"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Estanterías', href: '/estanterias' },
];

export default function Index({ estanterias, flash, errors }: EstanteriaIndexProps) {
  const page = usePage();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isShowModalOpen, setIsShowModalOpen] = useState(false);
  const [selectedEstanteria, setSelectedEstanteria] = useState<Estanteria | null>(null);
  const [alerts, setAlerts] = useState<{
    success: string | null;
    error: string | null;
    timestamp: number;
  }>({
    success: null,
    error: null,
    timestamp: 0,
  });

  // Manejo de flash messages
  useEffect(() => {
    if (flash) {
      setAlerts({
        success: flash.success || null,
        error: flash.error || null,
        timestamp: Date.now(),
      });
    }
  }, [flash, page.props.flash]);

  // Resetear página al cambiar búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Filtrado de estanterías
  const filteredEstanterias = searchTerm
    ? estanterias.filter(
        (estanteria) =>
          estanteria.cod_estante.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (estanteria.descripcion &&
            estanteria.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : estanterias;

  // Paginación
  const totalPages = Math.ceil(filteredEstanterias.length / itemsPerPage);
  const paginatedEstanterias = filteredEstanterias.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const openCreateModal = () => setIsCreateModalOpen(true);
  const openEditModal = (estanteria: Estanteria) => {
    setSelectedEstanteria(estanteria);
    setIsEditModalOpen(true);
  };
  const openShowModal = (estanteria: Estanteria) => {
    setSelectedEstanteria(estanteria);
    setIsShowModalOpen(true);
  };

  const closeAllModals = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsShowModalOpen(false);
    setSelectedEstanteria(null);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Gestión de Estanterías" />
      <div className="py-8 px-6 bg-slate-50 dark:bg-black min-h-screen">
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
        <div className="absolute inset-0 overflow-hidden pointer-events-none fixed">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl dark:bg-blue-600/10"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-indigo-500/5 blur-3xl dark:bg-indigo-600/10"></div>
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
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
                <SearchIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
              <button
                onClick={openCreateModal}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white 
                  px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg
                  transform hover:-translate-y-0.5"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Nueva Estantería</span>
              </button>
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                      ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                      Código
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                      Descripción
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedEstanterias.length > 0 ? (
                    paginatedEstanterias.map((estanteria) => (
                      <tr
                        key={estanteria.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300 font-medium">
                          {estanteria.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                          {estanteria.cod_estante}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                          {estanteria.descripcion || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex justify-center space-x-4">
                            <button
                              onClick={() => openShowModal(estanteria)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 
                                transition-colors p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800/40"
                              title="Ver detalles"
                            >
                              <EyeIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => openEditModal(estanteria)}
                              className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 
                                transition-colors p-1.5 bg-amber-50 dark:bg-amber-900/30 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-800/40"
                              title="Editar"
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                      >
                        No hay estanterías disponibles
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
        <CreateEstanteria
          isModal
          open={isCreateModalOpen}
          onClose={closeAllModals}
          errors={errors}
        />
        {selectedEstanteria && (
          <>
            <EditEstanteria
              isModal
              open={isEditModalOpen}
              onClose={closeAllModals}
              estanteria={selectedEstanteria}
              errors={errors}
            />
            <ShowEstanteria
              isModal
              open={isShowModalOpen}
              onClose={closeAllModals}
              estanteria={selectedEstanteria}
            />
          </>
        )}
      </div>
    </AppLayout>
  );
}