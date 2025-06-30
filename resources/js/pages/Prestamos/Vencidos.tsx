import { useState, useEffect, useCallback } from 'react';
import { Head, router, usePage } from '@inertiajs/react'; // Asegúrate de que usePage esté importado
import { Search, Calendar, BookX, Filter, X, CheckCircle, Clock, User, Book, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
// @ts-ignore
import debounce from 'lodash/debounce';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Préstamos',
    href: '/prestamos',
  },
  {
    title: 'Vencidos',
    href: '/prestamos/vencidos',
  },
];

interface Prestamo {
  id: number;
  ejemplar: {
    id: number;
    codigo: string;
    libro: {
      titulo: string;
    };
  };
  lector: {
    id: number;
    nombre: string;
    codigo: string;
  };
  fecha_prestamo: string;
  fecha_devolucion: string;
  estado: string;
}

interface PaginationLinks {
  url: string | null;
  label: string;
  active: boolean;
}

interface Props {
  prestamos: {
    data: Prestamo[];
    current_page: number;
    per_page: number;
    last_page: number;
    total: number;
    from: number;
    to: number;
    links: PaginationLinks[];
  };
  filters?: {
    search?: string;
    dias_vencido?: string;
  };
}

export default function Vencidos({ prestamos, filters }: Props) {
  // --- INICIO DE HOOKS Y ESTADOS DENTRO DEL COMPONENTE ---
  // Ahora usePage() se llama dentro del cuerpo de la función del componente
  const { props: pageProps } = usePage(); // Obtener las props de la página
  const currentFilters = (pageProps.filters as Props['filters']) || {};

  const [searchTerm, setSearchTerm] = useState(currentFilters.search || '');
  const [diasVencido, setDiasVencido] = useState(currentFilters.dias_vencido || '');
  const [isSearching, setIsSearching] = useState(false);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [prestamoSeleccionado, setPrestamoSeleccionado] = useState<number | null>(null);
  const [fechaDevuelto, setFechaDevuelto] = useState('');
  const [observaciones, setObservaciones] = useState('');

  // Función para realizar búsqueda en el servidor
  const performServerSearch = useCallback((search: string, dias: string, page: number = 1) => {
    setIsSearching(true);

    const params: any = {};
    const searchValue = search.trim();
    const diasValue = dias;

    if (searchValue) {
      params.search = searchValue;
    }
    if (diasValue) {
      params.dias_vencido = diasValue;
    }
    if (page) {
      params.page = page;
    }

    router.visit('/prestamos/vencidos', {
      data: params,
      preserveState: true,
      preserveScroll: false,
      replace: true,
      onSuccess: () => {
        setIsSearching(false);
      },
      onError: () => {
        setIsSearching(false);
      }
    });
  }, []);

  // Debounced search para búsquedas automáticas
  const debouncedSearch = useCallback(
    debounce((term: string, dias: string) => {
      performServerSearch(term, dias, 1);
    }, 500),
    [performServerSearch]
  );

  // Sincronizar con filtros del servidor cuando cambien
  // Este useEffect sigue siendo importante para actualizar el estado local
  // cuando la URL cambia por navegación o paginación.
  useEffect(() => {
    // Usamos 'filters' prop directamente aquí, ya que es la que se pasa al componente
    // No usamos usePage() de nuevo aquí, ya que 'filters' ya viene de ahí.
    setSearchTerm(filters?.search || '');
    setDiasVencido(filters?.dias_vencido || '');
  }, [filters]); // Depende de la prop 'filters'


  const handleDevolucion = (prestamoId: number) => {
    setPrestamoSeleccionado(prestamoId);
    setFechaDevuelto(new Date().toISOString().split('T')[0]);
    setObservaciones('');
    setModalAbierto(true);
  };

  const confirmarDevolucion = () => {
    if (!prestamoSeleccionado || !fechaDevuelto) return;

    const currentParams = {
      search: searchTerm,
      dias_vencido: diasVencido,
      page: prestamos.current_page
    };

    router.post(`/prestamos/${prestamoSeleccionado}/devolver`, {
      fecha_devuelto: fechaDevuelto,
      observaciones: observaciones,
      ...currentParams
    }, {
      onSuccess: () => {
        setModalAbierto(false);
      },
      onError: (errors) => {
        console.error("Error al devolver el préstamo:", errors);
        alert('Hubo un error al devolver el préstamo. Por favor, intente de nuevo.');
        setModalAbierto(false);
      }
    });
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setPrestamoSeleccionado(null);
    setFechaDevuelto('');
    setObservaciones('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value, diasVencido);
  };

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    debouncedSearch.cancel();
    performServerSearch(searchTerm, diasVencido, 1);
  };

  const handleFilterChange = (dias: string) => {
    setDiasVencido(dias);
    debouncedSearch.cancel();
    performServerSearch(searchTerm, dias, 1);
  };

  const clearSearch = () => {
    setSearchTerm('');
    debouncedSearch.cancel();
    performServerSearch('', diasVencido, 1);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setDiasVencido('');
    debouncedSearch.cancel();

    router.visit('/prestamos/vencidos', {
      data: {},
      preserveState: false,
      replace: true,
      preserveScroll: false,
    });
  };

  const calcularDiasVencido = (fechaDevolucion: string) => {
    if (!fechaDevolucion) return 0;

    try {
      const devDate = new Date(fechaDevolucion + 'T00:00:00Z');
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      const dias = differenceInDays(today, devDate);
      return dias > 0 ? dias : 0;
    } catch (error) {
      console.error('Error calculando días vencidos:', error);
      return 0;
    }
  };

  const getSeverityColor = (dias: number) => {
    if (dias >= 30) return 'bg-red-600 text-white';
    if (dias >= 15) return 'bg-orange-500 text-white';
    if (dias >= 7) return 'bg-yellow-500 text-black';
    return 'bg-red-500 text-white';
  };

  const goToPage = (url: string | null) => {
    if (!url) return;

    const urlObj = new URL(url, window.location.origin);
    const page = urlObj.searchParams.get('page');

    performServerSearch(searchTerm, diasVencido, page ? parseInt(page) : 1);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Préstamos Vencidos" />

      <div className="min-h-screen bg-white dark:bg-black p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-2">
                Préstamos Vencidos
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Gestión de préstamos con fechas de devolución vencidas
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span className="text-red-700 dark:text-red-300 font-medium">
                {prestamos.total} vencidos
              </span>
            </div>
          </div>

          {/* Filtros y búsqueda */}
          <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 rounded-xl p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row gap-4">
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    isSearching ? 'text-blue-500 animate-spin' : 'text-gray-400'
                  }`} />
                  <input
                    type="search"
                    className="w-full pl-10 pr-10 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600/50 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                    placeholder="Buscar por nombre del lector, código o título del libro..."
                    value={searchTerm}
                    onChange={handleInputChange}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(e); }}
                    disabled={isSearching}
                  />
                  {searchTerm?.trim() && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      disabled={isSearching}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </form>

              <div className="lg:w-64">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600/50 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 appearance-none"
                    value={diasVencido}
                    onChange={(e) => handleFilterChange(e.target.value)}
                    disabled={isSearching}
                  >
                    <option value="">Todos los vencidos</option>
                    <option value="7">7 días o más</option>
                    <option value="15">15 días o más</option>
                    <option value="30">30 días o más</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSearch}
                disabled={isSearching}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
              >
                <Search className={`w-4 h-4 ${isSearching ? 'animate-spin' : ''}`} />
                {isSearching ? 'Buscando...' : 'Buscar'}
              </button>
            </div>

            {/* Indicadores de filtros activos */}
            {(searchTerm?.trim() || diasVencido) && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700/50">
                <div className="flex flex-wrap gap-2 items-center">
                  {searchTerm?.trim() && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-600/20 text-blue-800 dark:text-blue-300 text-sm rounded-full">
                      Búsqueda: "{searchTerm}"
                      <button
                        type="button"
                        onClick={clearSearch}
                        className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-600/30 rounded-full p-0.5"
                        disabled={isSearching}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {diasVencido && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-600/20 text-orange-800 dark:text-orange-300 text-sm rounded-full">
                      {diasVencido} días o más
                      <button
                        type="button"
                        onClick={() => handleFilterChange('')}
                        className="ml-1 hover:bg-orange-200 dark:hover:bg-orange-600/30 rounded-full p-0.5"
                        disabled={isSearching}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {/* Botón para limpiar todos los filtros */}
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full transition-colors duration-200"
                    disabled={isSearching}
                  >
                    Limpiar todo
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lista de préstamos */}
        <div className="space-y-4">
          {prestamos.data.length > 0 ? (
            prestamos.data.map((prestamo) => {
              const diasVencidos = calcularDiasVencido(prestamo?.fecha_devolucion || '');
              return (
                <div
                  key={prestamo?.id || Math.random()}
                  className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 rounded-xl p-6 hover:bg-gray-50 dark:hover:bg-gray-900/70 transition-all duration-200 shadow-sm"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Información del préstamo */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Lector */}
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-gray-900 dark:text-white font-medium truncate">
                            {prestamo?.lector?.nombre || 'Sin nombre'}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Código: {prestamo?.lector?.codigo || 'Sin código'}
                          </p>
                        </div>
                      </div>

                      {/* Libro */}
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <Book className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-gray-900 dark:text-white font-medium line-clamp-2">
                            {prestamo?.ejemplar?.libro?.titulo || 'Sin título'}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Ejemplar #{prestamo?.ejemplar?.id || 'Sin ID'}
                          </p>
                        </div>
                      </div>

                      {/* Fechas */}
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-gray-900 dark:text-white font-medium">
                            {prestamo?.fecha_prestamo ? format(new Date(prestamo.fecha_prestamo + 'T00:00:00Z'), 'dd/MM/yyyy', { locale: es }) : 'Sin fecha'}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Vencía: {prestamo?.fecha_devolucion ? format(new Date(prestamo.fecha_devolucion + 'T00:00:00Z'), 'dd/MM/yyyy', { locale: es }) : 'Sin fecha'}
                          </p>
                        </div>
                      </div>

                      {/* Estado */}
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-red-100 dark:bg-red-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <Clock className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="min-w-0">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(diasVencidos)}`}>
                            {diasVencidos} días
                          </span>
                          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                            de retraso
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-3 lg:flex-col lg:items-end">
                      <button
                        onClick={() => handleDevolucion(prestamo?.id || 0)}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                        disabled={!prestamo?.id}
                      >
                        <CheckCircle className="w-4 h-4" />
                        Devolver
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 rounded-xl p-12 text-center shadow-sm">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookX className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                No hay préstamos vencidos
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm?.trim()
                  ? `No se encontraron préstamos que coincidan con "${searchTerm}".`
                  : diasVencido
                    ? 'No se encontraron préstamos vencidos con los filtros actuales.'
                    : 'No se encontraron préstamos vencidos.'
                }
              </p>
              {(searchTerm?.trim() || diasVencido) && (
                <button
                  onClick={clearAllFilters}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          )}
        </div>

        {/* Paginación mejorada */}
        {prestamos.total > 0 && (
          <div className="mt-8">
            {/* Información de resultados */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Mostrando {prestamos.from || 0} a {prestamos.to || 0} de {prestamos.total} préstamos vencidos
                {(searchTerm?.trim() || diasVencido) && (
                  <span className="ml-1">
                    {searchTerm?.trim() && `(filtrado por "${searchTerm}")`}
                    {searchTerm?.trim() && diasVencido && ' y '}
                    {diasVencido && `(${diasVencido}+ días)`}
                  </span>
                )}
              </div>

              {/* Controles de paginación */}
              <div className="flex items-center gap-2">
                {/* Botón Anterior */}
                <button
                  onClick={() => {
                    const prevLink = prestamos.links.find(link => link.label === '&laquo; Previous');
                    if (prevLink?.url) {
                      goToPage(prevLink.url);
                    }
                  }}
                  disabled={prestamos.current_page === 1 || isSearching}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </button>

                {/* Números de página */}
                <div className="flex items-center gap-1">
                  {prestamos.links
                    .filter(link => link.label !== '&laquo; Previous' && link.label !== 'Next &raquo;')
                    .map((link, index) => (
                      <button
                        key={index}
                        onClick={() => goToPage(link.url)}
                        disabled={!link.url || isSearching}
                        className={`min-w-[40px] h-10 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                          link.active
                            ? 'bg-blue-600 text-white'
                            : link.url
                            ? 'bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                            : 'text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {link.label === '...' ? '...' : link.label}
                      </button>
                    ))}
                </div>

                {/* Botón Siguiente */}
                <button
                  onClick={() => {
                    const nextUrl = prestamos.links.find(link => link.label === 'Next &raquo;')?.url || null;
                    goToPage(nextUrl);
                  }}
                  disabled={prestamos.current_page === prestamos.last_page || isSearching}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Devolución */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={cerrarModal} />
          <div className="relative w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Confirmar Devolución
                </h3>
                <button
                  onClick={cerrarModal}
                  className="w-8 h-8 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors duration-200"
                >
                  <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fecha de Devolución
                  </label>
                  <input
                    type="date"
                    value={fechaDevuelto}
                    onChange={(e) => setFechaDevuelto(e.target.value)}
                    className="w-full px-3 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Observaciones
                  </label>
                  <textarea
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Agregar observaciones (opcional)..."
                    className="w-full px-3 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={cerrarModal}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarDevolucion}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Confirmar Devolución
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}