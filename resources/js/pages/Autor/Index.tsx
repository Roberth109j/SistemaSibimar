import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Search, Eye, Pencil, Plus, Trash2, Book, CheckCircle, AlertCircle, X, ChevronLeft, ChevronRight } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

// Definición de tipos
type Libro = {
  id: number;
  titulo: string;
};

type Autor = {
  id: number;
  apellidos: string;
  nombres: string;
  libros?: Libro[];
};

type FlashMessage = {
  success?: string;
  error?: string;
};

type IndexProps = {
  auth: {
    user: any;
  };
  autores: Autor[];
  flash?: FlashMessage;
  errors?: Record<string, string>;
};

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Estanterías', href: '/estanterias' },
];

// COMPONENTE ALERT NOTIFICATION - MODIFICADO PARA APARECER EN UN LADO CON ANIMACIÓN
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

  // Seleccionar el icono según el tipo
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

// Componente de Paginación
function Pagination({
  currentPage,
  totalPages,
  onPageChange
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  // Mostrar 5 páginas a la vez con elipsis para páginas adicionales
  const displayPages = () => {
    if (totalPages <= 7) return pages;

    // Siempre mostrar la primera y última página
    const firstPage = 1;
    const lastPage = totalPages;

    // Determinar las páginas a mostrar alrededor de la página actual
    let startPage = Math.max(2, currentPage - 2);
    let endPage = Math.min(totalPages - 1, startPage + 4);

    // Ajustar startPage si endPage está demasiado cerca del final
    if (endPage - startPage < 4) {
      startPage = Math.max(2, endPage - 4);
    }

    // Construir el array de páginas con elipsis
    const result = [];
    result.push(firstPage);

    // Elipsis al inicio si es necesario
    if (startPage > 2) {
      result.push('ellipsis-start');
    }

    // Páginas intermedias
    for (let i = startPage; i <= endPage; i++) {
      result.push(i);
    }

    // Elipsis al final si es necesario
    if (endPage < totalPages - 1) {
      result.push('ellipsis-end');
    }

    // Última página
    if (totalPages > 1) {
      result.push(lastPage);
    }

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

      {displayPages().map((page, index) => (
        page === 'ellipsis-start' || page === 'ellipsis-end' ? (
          <span
            key={`ellipsis-${index}`}
            className="inline-flex items-center justify-center w-9 h-9 text-gray-500 dark:text-gray-400"
          >
            ...
          </span>
        ) : (
          <button
            key={index}
            onClick={() => onPageChange(Number(page))}
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
      ))}

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

// Componente Modal actualizado con nuevos colores
function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "md",
  variant = "default" // default or amber or blue
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "amber" | "blue";
}) {
  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl"
  };

  // Todos los modales usan azul como en las imágenes
  const headerColor = "bg-blue-600"; // Azul sólido para todos los modales

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-black/50 backdrop-blur-sm">
      <div className={`relative w-full ${maxWidthClasses[maxWidth]} mx-auto overflow-hidden rounded-lg shadow-2xl transform transition-all duration-300 animate-fade-in-up`}>
        {/* Encabezado azul para todos los modales */}
        <div className={`${headerColor} px-6 py-4 text-white`}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-full p-1 bg-white/20 hover:bg-white/30 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cuerpo del modal con soporte para modo claro/oscuro */}
        <div className="bg-white dark:bg-gray-800 p-6 text-gray-900 dark:text-gray-100">
          {children}
        </div>
      </div>
    </div>
  );
}
// Componente principal
const Index = ({ auth, autores, flash, errors = {} }: IndexProps) => {
  // Obtenemos la página actual para poder detectar cambios en las props
  const page = usePage();

  // Estados generales
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Estados para las alertas
  const [alerts, setAlerts] = useState<{
    success: string | null;
    error: string | null;
    timestamp: number;
  }>({
    success: null,
    error: null,
    timestamp: 0
  });

  // Estados para los modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentAutor, setCurrentAutor] = useState<Autor | null>(null);

  // Estados para el formulario
  const [isProcessing, setIsProcessing] = useState(false);
  const [formNombres, setFormNombres] = useState('');
  const [formApellidos, setFormApellidos] = useState('');

  // Efecto para manejar los mensajes flash al cargar o recibir nuevas props
  useEffect(() => {
    if (flash) {
      setAlerts({
        success: flash.success || null,
        error: flash.error || null,
        timestamp: Date.now()
      });
    }
  }, [flash, page.props.flash]);

  // Resetear a la primera página cuando cambia el término de búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Actualizar el formulario cuando se selecciona un autor para editar
  useEffect(() => {
    if (currentAutor && isEditModalOpen) {
      setFormNombres(currentAutor.nombres);
      setFormApellidos(currentAutor.apellidos);
    } else if (!isEditModalOpen) {
      setFormNombres('');
      setFormApellidos('');
    }
  }, [currentAutor, isEditModalOpen]);

  // Filtrar autores según el término de búsqueda
  const filteredAutores = searchTerm
    ? autores.filter(
      autor =>
        autor.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
        autor.nombres.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : autores;

  // Calcular total de páginas
  const totalPages = Math.ceil(filteredAutores.length / itemsPerPage);

  // Obtener los autores para la página actual
  const paginatedAutores = filteredAutores.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Cambiar de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Mostrar alerta personalizada
  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlerts(prev => ({
      ...prev,
      [type]: message,
      timestamp: Date.now()
    }));
  };

  // Funciones para abrir los diferentes modales
  const openCreateModal = () => {
    setCurrentAutor(null);
    setFormNombres('');
    setFormApellidos('');
    setIsCreateModalOpen(true);
  };

  const openEditModal = (autor: Autor) => {
    setCurrentAutor(autor);
    setFormNombres(autor.nombres);
    setFormApellidos(autor.apellidos);
    setIsEditModalOpen(true);
  };

  const openViewModal = (autor: Autor) => {
    setCurrentAutor(autor);
    setIsViewModalOpen(true);
  };

  const closeAllModals = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsViewModalOpen(false);
    setTimeout(() => {
      setCurrentAutor(null);
    }, 200);
  };

  // Manejar la creación de un nuevo autor
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    router.post('/autores', {
      nombres: formNombres,
      apellidos: formApellidos
    }, {
      onSuccess: () => {
        showAlert('success', 'Autor creado exitosamente');
        closeAllModals();
        setIsProcessing(false);
      },
      onError: () => {
        showAlert('error', 'Ha ocurrido un error al crear el autor');
        setIsProcessing(false);
      },
      preserveScroll: true
    });
  };

  // Manejar la actualización de un autor existente
  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAutor) return;

    setIsProcessing(true);

    router.put(`/autores/${currentAutor.id}`, {
      nombres: formNombres,
      apellidos: formApellidos
    }, {
      onSuccess: () => {
        showAlert('success', 'Autor actualizado exitosamente');
        closeAllModals();
        setIsProcessing(false);
      },
      onError: () => {
        showAlert('error', 'Ha ocurrido un error al actualizar el autor');
        setIsProcessing(false);
      },
      preserveScroll: true
    });
  };

  // Renderizado de alertas
  const renderAlerts = () => {
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

  // Contenido principal
  const content = (
    <div className="py-8 px-6 bg-slate-50 dark:bg-black min-h-screen">
      {/* Alertas */}
      {renderAlerts()}

      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none fixed">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl dark:bg-blue-600/10"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-indigo-500/5 blur-3xl dark:bg-indigo-600/10"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Gestión de Autores
          </h1>

          <div className="flex gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar autores..."
                className="w-64 pl-10 py-2.5 pr-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                          text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                          shadow-sm transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>

            <button
              onClick={openCreateModal}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white 
                        px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg
                        transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              <span>Nuevo Autor</span>
            </button>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Nombres</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Apellidos</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Nombre Completo</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedAutores.length > 0 ? (
                  paginatedAutores.map((autor) => (
                    <tr key={autor.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300 font-medium">{autor.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">{autor.nombres}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">{autor.apellidos}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300 font-medium">{`${autor.nombres} ${autor.apellidos}`}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-4">
                          <button
                            onClick={() => openViewModal(autor)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 
                                      transition-colors p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800/40"
                            title="Ver detalles"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => openEditModal(autor)}
                            className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 
                                      transition-colors p-1.5 bg-amber-50 dark:bg-amber-900/30 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-800/40"
                            title="Editar"
                          >
                            <Pencil className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      No hay autores disponibles
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>

        {/* Modal para crear autor */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={closeAllModals}
          title="Crear Nuevo Autor"
        >
          <form onSubmit={handleCreate} className="space-y-5">
            <div>
              <label htmlFor="create_nombres" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombres
              </label>
              <input
                id="create_nombres"
                type="text"
                name="nombres"
                value={formNombres}
                onChange={(e) => setFormNombres(e.target.value)}
                className="block w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                  border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                  placeholder-gray-400 focus:border-blue-500 transition-colors duration-200"
                required
                placeholder="Ingrese los nombres"
              />
              {errors.nombres && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.nombres}</p>
              )}
            </div>

            <div>
              <label htmlFor="create_apellidos" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Apellidos
              </label>
              <input
                id="create_apellidos"
                type="text"
                name="apellidos"
                value={formApellidos}
                onChange={(e) => setFormApellidos(e.target.value)}
                className="block w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                  border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                  placeholder-gray-400 focus:border-blue-500 transition-colors duration-200"
                required
                placeholder="Ingrese los apellidos"
              />
              {errors.apellidos && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.apellidos}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-5">
              <button
                type="button"
                onClick={closeAllModals}
                className="px-5 py-2.5 text-sm font-medium border rounded-lg shadow-sm
                  text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 
                  border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600
                  focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="px-5 py-2.5 text-sm font-medium text-white border border-transparent rounded-lg shadow-sm
                  bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isProcessing ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </Modal>

        
        {/* Modal para editar autor */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={closeAllModals}
          title="Editar Autor"
          variant="amber"
        >
          {currentAutor && (
            <form onSubmit={handleUpdate} className="space-y-5">
              <div>
                <label htmlFor="edit_nombres" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombres
                </label>
                <input
                  id="edit_nombres"
                  type="text"
                  name="nombres"
                  value={formNombres}
                  onChange={(e) => setFormNombres(e.target.value)}
                  className="block w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50
            border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
            placeholder-gray-400 focus:border-amber-500 transition-colors duration-200"
                  required
                />
                {errors.nombres && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.nombres}</p>
                )}
              </div>

              {/* Agregar el campo de apellidos que falta */}
              <div>
                <label htmlFor="edit_apellidos" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Apellidos
                </label>
                <input
                  id="edit_apellidos"
                  type="text"
                  name="apellidos"
                  value={formApellidos}
                  onChange={(e) => setFormApellidos(e.target.value)}
                  className="block w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50
            border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
            placeholder-gray-400 focus:border-amber-500 transition-colors duration-200"
                  required
                />
                {errors.apellidos && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.apellidos}</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-5">
                <button
                  type="button"
                  onClick={closeAllModals}
                  className="px-5 py-2.5 text-sm font-medium border rounded-lg shadow-sm
            text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 
            border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600
            focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2.5 text-sm font-medium text-white rounded-lg shadow-sm
            bg-blue-600 hover:bg-blue-700  
            focus:outline-none focus:ring-2 focus:ring-blue-500
            disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isProcessing ? 'Actualizando...' : 'Actualizar'}
                </button>
              </div>
            </form>
          )}
        </Modal>

        {/* Modal para ver detalles del autor */}
        <Modal
          isOpen={isViewModalOpen}
          onClose={closeAllModals}
          title="Detalles del Autor"
          maxWidth="md"
        >
          {currentAutor && (
            <div className="space-y-6">
              <div className="overflow-hidden bg-white dark:bg-gray-800 shadow-md rounded-lg">
                {/* Encabezado con ID */}
                <div className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 dark:from-blue-600/20 dark:to-indigo-600/20 px-6 py-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg">
                      <span className="text-xl font-bold">{currentAutor.id}</span>
                    </div>
                    <div className="ml-5">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {`${currentAutor.nombres} ${currentAutor.apellidos}`}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">ID: {currentAutor.id}</p>
                    </div>
                  </div>
                </div>

                {/* Detalles principales */}
                <div className="px-6 py-5">
                  <dl className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Nombres
                      </dt>
                      <dd className="mt-2 text-base text-gray-900 dark:text-white font-medium">
                        {currentAutor.nombres}
                      </dd>
                    </div>

                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Apellidos
                      </dt>
                      <dd className="mt-2 text-base text-gray-900 dark:text-white font-medium">
                        {currentAutor.apellidos}
                      </dd>
                    </div>

                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Nombre Completo
                      </dt>
                      <dd className="mt-2 text-base text-gray-900 dark:text-white font-medium border-t border-gray-100 dark:border-gray-700 pt-3">
                        {`${currentAutor.nombres} ${currentAutor.apellidos}`}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Libros del autor */}
                {currentAutor.libros && currentAutor.libros.length > 0 && (
                  <div className="border-t border-gray-200 dark:border-gray-700">
                    <div className="px-6 py-4 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 dark:from-blue-600/20 dark:to-indigo-600/20">
                      <div className="flex items-center gap-2">
                        <Book className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <h3 className="text-base font-medium text-gray-900 dark:text-white">
                          Libros del Autor ({currentAutor.libros.length})
                        </h3>
                      </div>
                    </div>
                    <div className="px-6 py-4">
                      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {currentAutor.libros.map((libro) => (
                          <li key={libro.id} className="py-3 flex items-center">
                            <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                              <span className="text-xs font-medium">{libro.id}</span>
                            </div>
                            <div className="ml-3 text-gray-700 dark:text-gray-300">
                              {libro.titulo}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Botón de cerrar */}
              <div className="flex justify-end mt-6">
                <button
                  onClick={closeAllModals}
                  className="px-5 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                      rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 
                      hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 
                      focus:ring-blue-500 transition-colors transform hover:-translate-y-0.5 hover:shadow-md"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Gestión de Autores" />
      {content}
    </AppLayout>
  );
};

// Solo un único export default en todo el archivo
export default Index;