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

// --- Componente TarjetaEstadistica ---
interface TarjetaEstadisticaProps {
  titulo: string;
  valor: number;
  icono: React.ReactNode;
  claseColor: string;
}

const TarjetaEstadistica: React.FC<TarjetaEstadisticaProps> = ({ titulo, valor, icono, claseColor }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-l-blue-500">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${claseColor}`}>
          {icono}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{titulo}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{valor}</p>
        </div>
      </div>
    </div>
  );
};

// --- Props del componente (SIN estanterías) ---
interface EncabezadoInventarioProps {
  totalLibros: number;
  totalEjemplares: number;
  totalDisponibles: number;
  totalPrestados: number;
  totalInactivos: number;
  terminoBusqueda: string;
  onBusquedaCambio: (valor: string) => void;
  mostrarFiltros: boolean;
  onToggleFiltros: () => void;
  filtrosSeleccionados: {
    clase: string;
    idioma: string;
    seccion: string;
    grado: string;
    estado: string;
  };
  onCambioFiltro: (tipoFiltro: string, valor: string) => void;
  onLimpiarFiltros: () => void;
  onExportarExcel: () => void;
  clases: string[];
  idiomas: string[];
  secciones: string[];
  grados: string[];
  exportandoExcel?: boolean;
}

const EncabezadoInventario: React.FC<EncabezadoInventarioProps> = ({
  totalLibros,
  totalEjemplares,
  totalDisponibles,
  totalPrestados,
  totalInactivos,
  terminoBusqueda,
  onBusquedaCambio,
  mostrarFiltros,
  onToggleFiltros,
  filtrosSeleccionados,
  onCambioFiltro,
  onLimpiarFiltros,
  onExportarExcel,
  clases,
  idiomas,
  secciones,
  grados,
  exportandoExcel = false
}) => {
  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Inventario de Biblioteca
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Gestión completa del inventario de libros y ejemplares de la biblioteca escolar
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <TarjetaEstadistica
          titulo="Total Libros"
          valor={totalLibros}
          icono={<BookOpen className="h-6 w-6 text-blue-600" />}
          claseColor="bg-blue-100 dark:bg-blue-900/20"
        />
        <TarjetaEstadistica
          titulo="Total Ejemplares"
          valor={totalEjemplares}
          icono={<FileText className="h-6 w-6 text-green-600" />}
          claseColor="bg-green-100 dark:bg-green-900/20"
        />
        <TarjetaEstadistica
          titulo="Disponibles"
          valor={totalDisponibles}
          icono={<CheckCircle className="h-6 w-6 text-emerald-600" />}
          claseColor="bg-emerald-100 dark:bg-emerald-900/20"
        />
        <TarjetaEstadistica
          titulo="Prestados"
          valor={totalPrestados}
          icono={<BarChart3 className="h-6 w-6 text-orange-600" />}
          claseColor="bg-orange-100 dark:bg-orange-900/20"
        />
      </div>

      {/* Panel de control */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Búsqueda */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por título, autor, ISBN..."
                value={terminoBusqueda}
                onChange={(e) => onBusquedaCambio(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Botones de acción */}
            <div className="flex items-center gap-3">
              <button
                onClick={onToggleFiltros}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </button>
              <button
                onClick={onExportarExcel}
                disabled={exportandoExcel}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                <Download className="h-4 w-4 mr-2" />
                {exportandoExcel ? 'Exportando...' : 'Exportar Excel'}
              </button>
              <Link
                href="/libros/create"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Nuevo Libro
              </Link>
            </div>
          </div>

          {/* Panel de filtros (SIN estanterías) */}
          {mostrarFiltros && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <select
                  value={filtrosSeleccionados.clase}
                  onChange={(e) => onCambioFiltro('clase', e.target.value)}
                  className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Todas las clases</option>
                  {clases.map((clase) => (
                    <option key={clase} value={clase}>{clase}</option>
                  ))}
                </select>

                <select
                  value={filtrosSeleccionados.idioma}
                  onChange={(e) => onCambioFiltro('idioma', e.target.value)}
                  className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Todos los idiomas</option>
                  {idiomas.map((idioma) => (
                    <option key={idioma} value={idioma}>{idioma}</option>
                  ))}
                </select>

                {/* REMOVIDO: Select de estanterías */}

                {secciones && secciones.length > 0 && (
                  <select
                    value={filtrosSeleccionados.seccion}
                    onChange={(e) => onCambioFiltro('seccion', e.target.value)}
                    className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Todas las secciones</option>
                    {secciones.map((seccion) => (
                      <option key={seccion} value={seccion}>{seccion}</option>
                    ))}
                  </select>
                )}

                {grados && grados.length > 0 && (
                  <select
                    value={filtrosSeleccionados.grado}
                    onChange={(e) => onCambioFiltro('grado', e.target.value)}
                    className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Todos los grados</option>
                    {grados.map((grado) => (
                      <option key={grado} value={grado}>{grado}</option>
                    ))}
                  </select>
                )}

                <button
                  onClick={onLimpiarFiltros}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-lg"
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