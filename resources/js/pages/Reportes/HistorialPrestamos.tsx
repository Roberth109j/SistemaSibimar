import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Search, Filter, Users, X, Download, Calendar, Book, CheckCircle, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
  },
  {
    title: 'Historial de Préstamos',
    href: '/reportes/historial-prestamos',
  },
];

// Definir tipos localmente actualizados para manejar ISBN/ISSN
interface Prestamo {
  id: number;
  ejemplar: {
    id: number;
    codigo?: string;
    numEjemplar: number;
    libro: {
      titulo: string;
      codigo_unico: string; // Cambio principal: de 'isbn' a 'codigo_unico'
      isbn?: string; // Mantener para compatibilidad
      clase: 'LIBRO' | 'REVISTA'; // Para determinar si es ISBN o ISSN
    };
  };
  lector: {
    id: number;
    nombre: string;
    codigo: string;
    subgrado?: string;
  };
  fecha_prestamo: string;
  fecha_devolucion: string;
  fecha_devuelto?: string;
  estado: string;
  observaciones?: string;
}

interface HistorialPrestamosProps {
  auth: any;
  prestamos: {
    data: Prestamo[];
    links: any[];
    total: number;
    current_page?: number;
    last_page?: number;
    per_page?: number;
    from?: number;
    to?: number;
    has_pages?: boolean;
  };
  subgrados: string[];
  anosDisponibles: number[];
  anoActual: number;
  flash?: {
    success?: string;
    error?: string;
  };
  filters?: {
    search?: string;
    estado?: string;
    subgrado?: string;
    fechaInicio?: string;
    fechaFin?: string;
    ano?: string;
  };
}

type FlashMessage = {
  success?: string;
  error?: string;
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

export default function HistorialPrestamos({ 
  auth, 
  prestamos = { data: [], links: [], total: 0 }, 
  subgrados = [], 
  anosDisponibles = [], 
  anoActual = new Date().getFullYear(), 
  flash = {} 
}: HistorialPrestamosProps) {
  const page = usePage();

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    estado: '',
    subgrado: '',
    fechaInicio: '',
    fechaFin: '',
    ano: anoActual.toString(),
  });

  const [alerts, setAlerts] = useState<{
    success: string | null;
    error: string | null;
    timestamp: number;
  }>({
    success: null,
    error: null,
    timestamp: 0
  });

  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Función auxiliar para obtener el label correcto del código
  const getCodigoLabel = (clase: 'LIBRO' | 'REVISTA'): string => {
    if (clase === 'LIBRO') {
      return 'ISBN';
    } else if (clase === 'REVISTA') {
      return 'ISSN';
    }
    return 'Código';
  };

  // Función auxiliar para obtener el código único del libro con fallback
  const getCodigoUnico = (libro: Prestamo['ejemplar']['libro']): string => {
    return libro.codigo_unico || libro.isbn || 'N/A';
  };

  // Actualizar filtros cuando cambia el año actual desde el backend
  useEffect(() => {
    setSelectedFilters(prev => ({
      ...prev,
      ano: anoActual.toString()
    }));
  }, [anoActual]);

  useEffect(() => {
    if (flash) {
      setAlerts({
        success: flash.success || null,
        error: flash.error || null,
        timestamp: Date.now()
      });
    }
  }, [flash, page.props.flash]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    const timeout = setTimeout(() => {
      router.get(
        '/reportes/historial-prestamos',
        { search: value, ...selectedFilters },
        { preserveState: true, preserveScroll: true }
      );
    }, 300);
    setSearchTimeout(timeout);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    const newFilters = { ...selectedFilters, [name]: value };
    setSelectedFilters(newFilters);

    // Si cambia el año, aplicar filtro inmediatamente
    if (name === 'ano') {
      router.get(
        '/reportes/historial-prestamos',
        { search: searchTerm, ...newFilters },
        { preserveState: true, preserveScroll: true }
      );
    }
  };

  const applyFilters = () => {
    router.get(
      '/reportes/historial-prestamos',
      { search: searchTerm, ...selectedFilters },
      { preserveState: true, preserveScroll: true }
    );
    setShowFilters(false);
  };

  const clearFilters = () => {
    const currentYear = new Date().getFullYear().toString();
    setSelectedFilters({
      estado: '',
      subgrado: '',
      fechaInicio: '',
      fechaFin: '',
      ano: currentYear,
    });
    setSearchTerm('');
    router.get('/reportes/historial-prestamos', { ano: currentYear }, { preserveState: true, preserveScroll: true });
    setShowFilters(false);
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'DEVUELTO':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'ACTIVO':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'VENCIDO':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

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

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Historial de Préstamos" />

      <div className="py-8 px-6 bg-slate-50 dark:bg-black min-h-screen">
        {renderAlerts()}

        {/* Fondo decorativo */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-500/5 filter blur-3xl dark:bg-blue-600/10"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-indigo-500/5 filter blur-3xl dark:bg-indigo-600/10"></div>
        </div>

        <div className="max-w-full mx-auto relative z-10 px-2 sm:px-4 lg:px-6">
          {/* Header */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Historial de Préstamos
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Registro histórico de préstamos de libros y revistas - Año {anoActual}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* Selector de año prominente en el header */}
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <select
                  name="ano"
                  value={selectedFilters.ano}
                  onChange={handleFilterChange}
                  className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                            text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                            shadow-sm transition-all duration-200 rounded-lg font-medium"
                >
                  {anosDisponibles.map((ano) => (
                    <option key={ano} value={ano}>
                      {ano}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar por código, nombre, subgrado o título del material..."
                  className="w-full sm:w-80 pl-10 py-2.5 pr-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                            text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                            shadow-sm transition-all duration-200"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm border border-gray-300 dark:border-gray-700"
              >
                <Filter className="w-5 h-5" />
                <span>Filtros</span>
              </button>
            </div>
          </div>

          {/* Panel de filtros */}
          {showFilters && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border border-gray-100 dark:border-gray-700 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Filtros avanzados</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Restablecer filtros
                </button>
              </div>

              {/* Grid de 5 columnas para incluir el año */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Año también en filtros avanzados */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Año</label>
                  <select
                    name="ano"
                    value={selectedFilters.ano}
                    onChange={handleFilterChange}
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {anosDisponibles.map((ano) => (
                      <option key={ano} value={ano}>
                        {ano}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Estado</label>
                  <select
                    name="estado"
                    value={selectedFilters.estado}
                    onChange={handleFilterChange}
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Todos los estados</option>
                    <option value="ACTIVO">Activo</option>
                    <option value="DEVUELTO">Devuelto</option>
                    <option value="VENCIDO">Vencido</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Subgrado</label>
                  <select
                    name="subgrado"
                    value={selectedFilters.subgrado}
                    onChange={handleFilterChange}
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Todos los subgrados</option>
                    {subgrados.map((subgrado) => (
                      <option key={subgrado} value={subgrado}>
                        {subgrado}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Fecha Inicio</label>
                  <input
                    type="date"
                    name="fechaInicio"
                    value={selectedFilters.fechaInicio}
                    onChange={handleFilterChange}
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Fecha Fin</label>
                  <input
                    type="date"
                    name="fechaFin"
                    value={selectedFilters.fechaFin}
                    onChange={handleFilterChange}
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Limpiar
                </button>
                <button
                  onClick={applyFilters}
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Aplicar
                </button>
              </div>
            </div>
          )}

          {/* Información de resultados */}
          {prestamos.total && prestamos.total > 0 && (
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Mostrando {prestamos.data.length} de {prestamos.total} resultados
            </div>
          )}

          {/* Tabla actualizada con mejor manejo de códigos */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="overflow-hidden">
              <table className="w-full table-fixed">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="w-1/5 px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                      Lector
                    </th>
                    <th className="w-1/5 px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                      Material
                    </th>
                    <th className="w-20 px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                      Ejemplar
                    </th>
                    <th className="w-24 px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                      Fecha Préstamo
                    </th>
                    <th className="w-24 px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                      Fecha Devolución
                    </th>
                    <th className="w-24 px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                      Fecha Devuelto
                    </th>
                    <th className="w-24 px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {prestamos.data.length > 0 ? (
                    prestamos.data.map((prestamo) => (
                      <tr key={prestamo.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-3">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100 break-words">
                                {prestamo.lector.nombre}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 break-words mt-0.5 space-y-0.5">
                                <div>Código: {prestamo.lector.codigo}</div>
                                {prestamo.lector.subgrado && (
                                  <div>Subgrado: {prestamo.lector.subgrado}</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                              <Book className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100 break-words">
                                {prestamo.ejemplar?.libro?.titulo}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400 break-words">
                                {/* Mostrar el label correcto según la clase */}
                                {getCodigoLabel(prestamo.ejemplar?.libro?.clase)}: {getCodigoUnico(prestamo.ejemplar?.libro)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <span className="text-sm font-mono text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            #{prestamo.ejemplar?.numEjemplar}
                          </span>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300 font-medium text-sm">
                          {format(new Date(prestamo.fecha_prestamo), 'dd/MM/yyyy', { locale: es })}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300 font-medium text-sm">
                          {format(new Date(prestamo.fecha_devolucion), 'dd/MM/yyyy', { locale: es })}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300 font-medium text-sm">
                          {prestamo.fecha_devuelto
                            ? format(new Date(prestamo.fecha_devuelto), 'dd/MM/yyyy', { locale: es })
                            : '—'}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(prestamo.estado)}`}>
                            {prestamo.estado}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        No hay préstamos registrados para el año {anoActual}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* PAGINACIÓN usando los links de Laravel */}
          {prestamos.links && prestamos.links.length > 3 && (
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              {/* Información de paginación */}
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {prestamos.total && `Total: ${prestamos.total} resultados`}
              </div>

              {/* Controles de paginación */}
              <div className="flex items-center space-x-2">
                {prestamos.links.map((link: any, index: number) => {
                  // Botón anterior
                  if (link.label.includes('Previous') || link.label.includes('Anterior') ||
                      link.label === '&laquo;' || link.label.includes('pagination.previous') ||
                      link.label.includes('pagination.prev')) {
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          if (link.url) {
                            const url = new URL(link.url);
                            const params = new URLSearchParams(window.location.search);
                            params.set('page', url.searchParams.get('page') || '1');
                            router.get(`${window.location.pathname}?${params}`, {}, { preserveState: true });
                          }
                        }}
                        disabled={!link.url}
                        className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${link.url
                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50'
                          }`}
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                    );
                  }

                  // Botón siguiente
                  if (link.label.includes('Next') || link.label.includes('Siguiente') ||
                      link.label === '&raquo;' || link.label.includes('pagination.next')) {
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          if (link.url) {
                            const url = new URL(link.url);
                            const params = new URLSearchParams(window.location.search);
                            params.set('page', url.searchParams.get('page') || '1');
                            router.get(`${window.location.pathname}?${params}`, {}, { preserveState: true });
                          }
                        }}
                        disabled={!link.url}
                        className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${link.url
                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50'
                          }`}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    );
                  }

                  // Números de página y puntos suspensivos
                  if (!link.label.includes('Previous') && !link.label.includes('Next') &&
                    !link.label.includes('Anterior') && !link.label.includes('Siguiente') &&
                    !link.label.includes('pagination.previous') && !link.label.includes('pagination.prev') &&
                    !link.label.includes('pagination.next') &&
                    link.label !== '&laquo;' && link.label !== '&raquo;') {

                    // Si es "..." 
                    if (link.label === '...') {
                      return (
                        <span key={index} className="flex items-center justify-center w-10 h-10 text-sm font-medium text-gray-500 dark:text-gray-400">
                          ...
                        </span>
                      );
                    }

                    // Número de página
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          if (link.url) {
                            const url = new URL(link.url);
                            const params = new URLSearchParams(window.location.search);
                            params.set('page', url.searchParams.get('page') || '1');
                            router.get(`${window.location.pathname}?${params}`, {}, { preserveState: true });
                          }
                        }}
                        className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-colors ${link.active
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                          }`}
                      >
                        {link.label}
                      </button>
                    );
                  }

                  return null;
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}