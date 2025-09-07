import React from 'react';
import { Link } from '@inertiajs/react';
import {
  Search,
  Filter,
  Download,
  PlusCircle,
  FileText,
  BookOpen,
  CheckCircle,
  BarChart3
} from 'lucide-react';

// --- Componente TarjetaEstadistica Optimizada ---
interface TarjetaEstadisticaProps {
  titulo: string;
  valor: number;
  icono: React.ReactNode;
  claseColor: string;
}

const TarjetaEstadistica: React.FC<TarjetaEstadisticaProps> = ({ titulo, valor, icono, claseColor }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">{titulo}</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{valor.toLocaleString()}</p>
        </div>
        <div className={`p-2 rounded-md ${claseColor} flex-shrink-0 ml-2`}>
          <div className="h-4 w-4">
            {icono}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Props del componente SIMPLIFICADO ---
interface EncabezadoInventarioProps {
  totalLibros: number;
  totalEjemplares: number;
  totalDisponibles: number;
  totalPrestados: number;
  totalDadosBaja: number;
  totalPerdidos: number;
  totalEnCirculacion: number;
  terminoBusqueda: string;
  onBusquedaCambio: (valor: string) => void;
  mostrarFiltros: boolean;
  onToggleFiltros: () => void;
  filtrosSeleccionados: {
    clase: string;
    area: string;
    estado: string;
    seccion?: string; // Solo para administradores
  };
  onCambioFiltro: (tipoFiltro: string, valor: string) => void;
  onLimpiarFiltros: () => void;
  onExportarExcel: () => void;
  clases: string[];
  areas: string[];
  secciones?: string[]; // Solo para administradores
  esAdmin?: boolean; // Para mostrar filtro de sección
  exportandoExcel?: boolean;
}

const EncabezadoInventario: React.FC<EncabezadoInventarioProps> = ({
  totalLibros,
  totalEjemplares,
  totalDisponibles,
  totalPrestados,
  totalDadosBaja,
  totalPerdidos,
  totalEnCirculacion,
  terminoBusqueda,
  onBusquedaCambio,
  mostrarFiltros,
  onToggleFiltros,
  filtrosSeleccionados,
  onCambioFiltro,
  onLimpiarFiltros,
  onExportarExcel,
  clases,
  areas,
  secciones = [],
  esAdmin = false,
  exportandoExcel = false
}) => {
  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Inventario de Biblioteca
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
          Gestión completa del inventario de libros y ejemplares de la biblioteca escolar
        </p>
      </div>

      {/* Estadísticas Optimizadas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        <TarjetaEstadistica
          titulo="Total Libros"
          valor={totalLibros}
          icono={<BookOpen className="text-blue-600" />}
          claseColor="bg-blue-50 dark:bg-blue-900/20"
        />
        <TarjetaEstadistica
          titulo="Ejemplares"
          valor={totalEjemplares}
          icono={<FileText className="text-green-600" />}
          claseColor="bg-green-50 dark:bg-green-900/20"
        />
        <TarjetaEstadistica
          titulo="Disponibles"
          valor={totalDisponibles}
          icono={<CheckCircle className="text-emerald-600" />}
          claseColor="bg-emerald-50 dark:bg-emerald-900/20"
        />
        <TarjetaEstadistica
          titulo="Prestados"
          valor={totalPrestados}
          icono={<BarChart3 className="text-orange-600" />}
          claseColor="bg-orange-50 dark:bg-orange-900/20"
        />
        <TarjetaEstadistica
          titulo="En Circulación"
          valor={totalEnCirculacion}
          icono={<BarChart3 className="text-purple-600" />}
          claseColor="bg-purple-50 dark:bg-purple-900/20"
        />
        <TarjetaEstadistica
          titulo="Dados de Baja"
          valor={totalDadosBaja}
          icono={<FileText className="text-yellow-600" />}
          claseColor="bg-yellow-50 dark:bg-yellow-900/20"
        />
        <TarjetaEstadistica
          titulo="Perdidos"
          valor={totalPerdidos}
          icono={<FileText className="text-red-600" />}
          claseColor="bg-red-50 dark:bg-red-900/20"
        />
      </div>

      {/* Panel de control */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
        <div className="p-4 md:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Búsqueda */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por título, autor, código único, contenido..."
                value={terminoBusqueda}
                onChange={(e) => onBusquedaCambio(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
              />
            </div>

            {/* Botones de acción */}
            <div className="flex items-center gap-2">
              <button
                onClick={onToggleFiltros}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <Filter className="h-4 w-4 mr-1" />
                Filtros
              </button>
              <button
                onClick={onExportarExcel}
                disabled={exportandoExcel}
                className="inline-flex items-center px-3 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <Download className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">{exportandoExcel ? 'Exportando...' : 'Exportar Excel'}</span>
                <span className="sm:hidden">Excel</span>
              </button>
              <Link
                href="/libros/create"
                className="inline-flex items-center px-3 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Nuevo Libro</span>
                <span className="sm:hidden">Nuevo</span>
              </Link>
            </div>
          </div>

          {/* Panel de filtros SIMPLIFICADO */}
          {mostrarFiltros && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ${esAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} xl:grid-cols-${esAdmin ? '5' : '4'} gap-3`}>
                
                {/* Filtro por Clase */}
                <select
                  value={filtrosSeleccionados.clase}
                  onChange={(e) => onCambioFiltro('clase', e.target.value)}
                  className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todas las clases</option>
                  {clases.map((clase) => (
                    <option key={clase} value={clase}>{clase}</option>
                  ))}
                </select>

                {/* Filtro por Área */}
                <select
                  value={filtrosSeleccionados.area}
                  onChange={(e) => onCambioFiltro('area', e.target.value)}
                  className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todas las áreas</option>
                  {areas.map((area) => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>

                {/* Filtro por Estado */}
                <select
                  value={filtrosSeleccionados.estado}
                  onChange={(e) => onCambioFiltro('estado', e.target.value)}
                  className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos los estados</option>
                  <option value="disponibles">Disponibles</option>
                  <option value="prestados">Prestados</option>
                  <option value="dados_baja">Dados de baja</option>
                  <option value="perdidos">Perdidos</option>
                  <option value="en_circulacion">En circulación</option>
                </select>

                {/* Filtro por Sección - SOLO PARA ADMINISTRADORES */}
                {esAdmin && secciones && secciones.length > 0 && (
                  <select
                    value={filtrosSeleccionados.seccion || ''}
                    onChange={(e) => onCambioFiltro('seccion', e.target.value)}
                    className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Todas las secciones</option>
                    {secciones.map((seccion) => (
                      <option key={seccion} value={seccion}>{seccion}</option>
                    ))}
                  </select>
                )}

                {/* Botón Limpiar filtros */}
                <button
                  onClick={onLimpiarFiltros}
                  className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-lg transition-colors"
                >
                  Limpiar filtros
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default EncabezadoInventario;