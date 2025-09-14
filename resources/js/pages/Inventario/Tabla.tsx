import React from 'react';
import { Link } from '@inertiajs/react';
import { BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';

// Interfaces
interface Libro {
  id: number;
  codigo_unico: string;
  isbn?: string;
  titulo: string;
  contenido?: string;
  area?: string;
  clase?: string;
  idioma?: string;
  autor?: {
    nombres: string;
    apellidos: string;
  };
  editorial?: {
    nombre: string;
  };
  seccion?: {
    id: number;
    nombre: string;
  };
  estanteria?: {
    id: number;
    cod_estante: string;
  };
  ejemplares_count: number;
  ejemplares_disponibles_count: number;
  ejemplares_prestados_count: number;
  ejemplares_dados_baja_count: number;
  ejemplares_perdidos_count: number;
}

interface PaginationData {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
  has_pages: boolean;
}

interface LibrosData {
  data: Libro[];
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  from?: number | null;
  to?: number | null;
  links?: any[];
}

interface BadgeEstadoProps {
  tipo: 'disponibles' | 'prestados' | 'dados_baja' | 'perdidos';
  cantidad: number;
}

// Componente Badge Estado
const BadgeEstado: React.FC<BadgeEstadoProps> = ({ tipo, cantidad }) => {
  const estilos = {
    disponibles: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
    prestados: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100',
    dados_baja: 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100',
    perdidos: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estilos[tipo]}`}>
      {cantidad}
    </span>
  );
};

// Componente simplificado para mostrar solo clase y área
const InfoLibroAdicional: React.FC<{ libro: Libro }> = ({ libro }) => {
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {libro.clase && (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-100">
          {libro.clase}
        </span>
      )}
      {libro.area && (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100">
          {libro.area}
        </span>
      )}
    </div>
  );
};

// Props del componente principal
interface TablaInventarioProps {
  libros: LibrosData;
  pagination?: PaginationData;
}

const TablaInventario: React.FC<TablaInventarioProps> = ({ libros, pagination }) => {
  console.log('🔍 DEBUG - TablaInventario recibió:', { 
    libros: {
      data_length: libros.data.length,
      current_page: libros.current_page,
      total: libros.total,
      per_page: libros.per_page,
      last_page: libros.last_page
    }, 
    pagination 
  });

  // Intentar obtener datos de paginación del objeto pagination o del objeto libros directamente
  const paginationData: PaginationData = pagination || {
    current_page: libros.current_page || 1,
    last_page: libros.last_page || 1,
    per_page: libros.per_page || 15,
    total: libros.total || 0,
    from: libros.from || (libros.data.length > 0 ? 1 : null),
    to: libros.to || libros.data.length || null,
    has_pages: (libros.total || 0) > (libros.per_page || 15)
  };

  console.log('📊 Pagination data final:', paginationData);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Información de resultados */}
      {paginationData.total > 0 && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Mostrando {paginationData.from || 1} a {paginationData.to || libros.data.length} de {paginationData.total} resultados
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-16">
                #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Información del Libro
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Autor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Editorial
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Disponibles
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Prestados
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Dados de Baja
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Perdidos               
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Total Activos
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {libros.data.map((libro, index) => {
              // Calcular el número de fila considerando la paginación
              const numeroFila = (paginationData.current_page - 1) * paginationData.per_page + index + 1;
              // Calcular total en circulación
              const totalEnCirculacion = libro.ejemplares_disponibles_count + libro.ejemplares_prestados_count;
              
              // Obtener el código (prioridad a codigo_unico, fallback a isbn)
              const codigoLibro = libro.codigo_unico || libro.isbn || 'N/A';
              
              return (
                <tr key={libro.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-sm font-medium">
                      {numeroFila}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {libro.titulo}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Código: {codigoLibro}
                      </div>
                      {/* Solo mostrar clase y área */}
                      <InfoLibroAdicional libro={libro} />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {libro.autor ? `${libro.autor.nombres} ${libro.autor.apellidos}` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {libro.editorial?.nombre || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <BadgeEstado tipo="disponibles" cantidad={libro.ejemplares_disponibles_count} />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <BadgeEstado tipo="prestados" cantidad={libro.ejemplares_prestados_count} />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <BadgeEstado tipo="dados_baja" cantidad={libro.ejemplares_dados_baja_count} />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <BadgeEstado tipo="perdidos" cantidad={libro.ejemplares_perdidos_count} />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                      {totalEnCirculacion}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Estado vacío */}
      {libros.data.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No se encontraron libros
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Intenta ajustar los filtros de búsqueda.
          </p>
        </div>
      )}

      {/* Paginación */}
      {paginationData.has_pages && paginationData.last_page > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Página {paginationData.current_page} de {paginationData.last_page}
            </div>

            <div className="flex items-center space-x-2">
              {/* Botón Anterior */}
              <Link
                href={paginationData.current_page > 1 ? 
                  `${window.location.pathname}?${new URLSearchParams({
                    ...Object.fromEntries(new URLSearchParams(window.location.search)),
                    page: String(paginationData.current_page - 1)
                  })}` : '#'}
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                  paginationData.current_page > 1
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50'
                }`}
                onClick={(e) => {
                  if (paginationData.current_page <= 1) e.preventDefault();
                }}
                preserveState
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>

              {/* Números de página */}
              {[...Array(paginationData.last_page)].map((_, index) => {
                const pageNum = index + 1;
                const maxVisiblePages = 5;
                const currentPage = paginationData.current_page;
                const halfVisible = Math.floor(maxVisiblePages / 2);

                let showPage = false;
                if (paginationData.last_page <= maxVisiblePages) {
                  showPage = true;
                } else if (
                  pageNum === 1 ||
                  pageNum === paginationData.last_page ||
                  (pageNum >= currentPage - halfVisible && pageNum <= currentPage + halfVisible)
                ) {
                  showPage = true;
                }

                if (showPage) {
                  return (
                    <Link
                      key={pageNum}
                      href={`${window.location.pathname}?${new URLSearchParams({
                        ...Object.fromEntries(new URLSearchParams(window.location.search)),
                        page: String(pageNum)
                      })}`}
                      className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                      }`}
                      preserveState
                    >
                      {pageNum}
                    </Link>
                  );
                } else if (
                  (pageNum === 2 && currentPage > halfVisible + 1) ||
                  (pageNum === paginationData.last_page - 1 && currentPage < paginationData.last_page - halfVisible)
                ) {
                  return (
                    <span key={pageNum} className="flex items-center justify-center w-10 h-10 text-sm font-medium text-gray-500 dark:text-gray-400">
                      ...
                    </span>
                  );
                }
                return null;
              })}

              {/* Botón Siguiente */}
              <Link
                href={paginationData.current_page < paginationData.last_page ? 
                  `${window.location.pathname}?${new URLSearchParams({
                    ...Object.fromEntries(new URLSearchParams(window.location.search)),
                    page: String(paginationData.current_page + 1)
                  })}` : '#'}
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                  paginationData.current_page < paginationData.last_page
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50'
                }`}
                onClick={(e) => {
                  if (paginationData.current_page >= paginationData.last_page) e.preventDefault();
                }}
                preserveState
              >
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TablaInventario;