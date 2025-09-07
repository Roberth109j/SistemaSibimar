import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Download, 
  BookOpen, 
  TrendingUp, 
  Users, 
  Calendar,
  ArrowLeft,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { 
  type PrestamosRealizadosProps,
  type InformeEstadisticas, 
  type PrestamoDetalle 
} from './types';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Informes', href: '/informes' },
  { title: 'Préstamos Realizados', href: '#' },
];

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

// Función mejorada para formatear fechas
const formatearFecha = (fecha: string | null | undefined): string => {
  if (!fecha) return 'N/A';
  
  try {
    const fechaLimpia = fecha.split('T')[0];
    
    if (fechaLimpia.includes('-')) {
      const partes = fechaLimpia.split('-');
      if (partes.length === 3) {
        const [año, mes, dia] = partes;
        return `${dia}/${mes}/${año}`;
      }
    }
    
    if (fechaLimpia.includes('/')) {
      return fechaLimpia;
    }
    
    const fechaObj = new Date(fechaLimpia + 'T12:00:00.000Z');
    return fechaObj.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      timeZone: 'UTC'
    });
  } catch (error) {
    console.error('Error formateando fecha:', fecha, error);
    return fecha.toString();
  }
};

// Función para ordenar grados de manera lógica
const ordenarGrados = (grado: string): number => {
  const gradoLower = grado.toLowerCase();
  
  // Transición
  if (gradoLower.includes('transición') || gradoLower.includes('transicion')) {
    return 0;
  }
  
  // Primero
  if (gradoLower.includes('primero')) {
    return 1;
  }
  
  // Segundo
  if (gradoLower.includes('segundo')) {
    return 2;
  }
  
  // Tercero
  if (gradoLower.includes('tercero')) {
    return 3;
  }
  
  // Cuarto
  if (gradoLower.includes('cuarto')) {
    return 4;
  }
  
  // Quinto
  if (gradoLower.includes('quinto')) {
    return 5;
  }
  
  // Sexto
  if (gradoLower.includes('sexto')) {
    return 6;
  }
  
  // Séptimo
  if (gradoLower.includes('séptimo') || gradoLower.includes('septimo')) {
    return 7;
  }
  
  // Octavo
  if (gradoLower.includes('octavo')) {
    return 8;
  }
  
  // Noveno
  if (gradoLower.includes('noveno')) {
    return 9;
  }
  
  // Décimo
  if (gradoLower.includes('décimo') || gradoLower.includes('decimo')) {
    return 10;
  }
  
  // Once
  if (gradoLower.includes('once') || gradoLower.includes('11')) {
    return 11;
  }
  
  // Sin grado al final
  if (gradoLower.includes('sin grado')) {
    return 999;
  }
  
  // Por defecto
  return 500;
};

export default function PrestamosRealizados({ 
  prestamos, 
  estadisticas, 
  periodo,
  pagination
}: PrestamosRealizadosProps) {
  
  const descargarPDF = () => {
    const convertirFecha = (fechaStr: string) => {
      const partes = fechaStr.split('/');
      return `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
    };

    const params = new URLSearchParams({
      fecha_inicio: convertirFecha(periodo.inicio),
      fecha_fin: convertirFecha(periodo.fin),
      ...(periodo.tipo !== 'personalizado' && { periodo: periodo.tipo })
    });

    const url = `/informes/descargar-prestamos?${params}`;
    console.log('Descargando PDF desde vista previa:', url);
    window.open(url, '_blank');
  };

  // Función para construir URL con parámetros de página
  const buildPageUrl = (page: number) => {
    const currentUrl = new URL(window.location.href);
    const params = new URLSearchParams(currentUrl.search);
    params.set('page', page.toString());
    return `${currentUrl.pathname}?${params.toString()}`;
  };

  // Ordenar préstamos por grado y luego por fecha
  const prestamosOrdenados = [...prestamos].sort((a, b) => {
    const gradoA = a.lector?.grado?.subGrado || 'Sin grado';
    const gradoB = b.lector?.grado?.subGrado || 'Sin grado';
    
    const ordenA = ordenarGrados(gradoA);
    const ordenB = ordenarGrados(gradoB);
    
    // Primero ordenar por grado
    if (ordenA !== ordenB) {
      return ordenA - ordenB;
    }
    
    // Si el grado es igual, ordenar por fecha (más reciente primero)
    return new Date(b.fecha_prestamo).getTime() - new Date(a.fecha_prestamo).getTime();
  });

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Informe de Préstamos - ${periodo.inicio} a ${periodo.fin}`} />

      <div className="py-8 px-6 bg-slate-50 dark:bg-black min-h-screen">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Informe de Préstamos Realizados
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Período: {periodo.inicio} - {periodo.fin} • Total: {estadisticas.total_prestamos} préstamos
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors flex items-center space-x-2"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Volver</span>
              </button>
              
              <button
                onClick={descargarPDF}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2"
              >
                <Download className="w-5 h-5" />
                <span>Descargar PDF</span>
              </button>
            </div>
          </div>

          {/* Estadísticas Principales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                  <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Préstamos</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{estadisticas.total_prestamos}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Devueltos</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{estadisticas.prestamos_devueltos}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg">
                  <Calendar className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Activos</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{estadisticas.prestamos_activos}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-lg">
                  <Users className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Vencidos</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{estadisticas.prestamos_vencidos}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            
            {/* Gráfico de Barras - Préstamos por Mes */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Préstamos por Mes
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={estadisticas.prestamos_por_mes}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="mes" 
                    tick={{ fontSize: 12 }}
                    className="text-gray-600 dark:text-gray-400"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    className="text-gray-600 dark:text-gray-400"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                  />
                  <Bar dataKey="cantidad" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Gráfico de Torta - Estados */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Distribución por Estado
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={estadisticas.prestamos_por_estado}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ estado, porcentaje }) => `${estado}: ${porcentaje}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="cantidad"
                  >
                    {estadisticas.prestamos_por_estado.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Libros Más Prestados */}
          {estadisticas.libros_mas_prestados.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Libros Más Prestados
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Posición
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Título
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Autor
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Préstamos
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {estadisticas.libros_mas_prestados.slice(0, 10).map((libro, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                              index === 0 ? 'bg-yellow-500' : 
                              index === 1 ? 'bg-gray-400' : 
                              index === 2 ? 'bg-amber-600' : 'bg-blue-500'
                            }`}>
                              {index + 1}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {libro.titulo}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {libro.autor}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            {libro.cantidad}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Información de paginación */}
          {pagination && pagination.total > 0 && (
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Mostrando {pagination.from || 1} a {pagination.to || prestamos.length} de {pagination.total} préstamos
            </div>
          )}

          {/* Tabla de Préstamos Recientes - CON ORDENAMIENTO POR GRADO */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Préstamos del Período ({pagination ? pagination.total : prestamos.length} registros)
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Lector
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Libro
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Ejemplar
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Devolución
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {prestamosOrdenados.map((prestamo) => (
                    <tr key={prestamo.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatearFecha(prestamo.fecha_prestamo)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {prestamo.lector.nombre}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {prestamo.lector.grado?.subGrado || 'Sin grado'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                          {prestamo.ejemplar.libro.titulo}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-mono text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          {prestamo.ejemplar.numEjemplar}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          prestamo.estado === 'DEVUELTO' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : prestamo.estado === 'ACTIVO'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                          {prestamo.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {prestamo.fecha_devuelto 
                          ? formatearFecha(prestamo.fecha_devuelto)
                          : formatearFecha(prestamo.fecha_devolucion)
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Paginación */}
          {pagination && pagination.has_pages && pagination.last_page > 1 && (
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              {/* Información de paginación */}
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Página {pagination.current_page} de {pagination.last_page}
              </div>

              {/* Controles de paginación */}
              <div className="flex items-center space-x-2">
                {/* Botón anterior */}
                <Link
                  href={pagination.current_page > 1 ? buildPageUrl(pagination.current_page - 1) : '#'}
                  className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                    pagination.current_page > 1
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50'
                  }`}
                  onClick={(e) => {
                    if (pagination.current_page <= 1) e.preventDefault();
                  }}
                  preserveState
                >
                  <ChevronLeft className="w-5 h-5" />
                </Link>

                {/* Números de página */}
                {[...Array(pagination.last_page)].map((_, index) => {
                  const pageNum = index + 1;
                  const maxVisiblePages = 5;
                  const currentPage = pagination.current_page;
                  const halfVisible = Math.floor(maxVisiblePages / 2);

                  let showPage = false;
                  if (pagination.last_page <= maxVisiblePages) {
                    showPage = true;
                  } else if (
                    pageNum === 1 ||
                    pageNum === pagination.last_page ||
                    (pageNum >= currentPage - halfVisible && pageNum <= currentPage + halfVisible)
                  ) {
                    showPage = true;
                  }

                  if (showPage) {
                    return (
                      <Link
                        key={pageNum}
                        href={buildPageUrl(pageNum)}
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
                    (pageNum === pagination.last_page - 1 && currentPage < pagination.last_page - halfVisible)
                  ) {
                    return (
                      <span key={pageNum} className="flex items-center justify-center w-10 h-10 text-sm font-medium text-gray-500 dark:text-gray-400">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}

                {/* Botón siguiente */}
                <Link
                  href={pagination.current_page < pagination.last_page ? buildPageUrl(pagination.current_page + 1) : '#'}
                  className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                    pagination.current_page < pagination.last_page
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50'
                  }`}
                  onClick={(e) => {
                    if (pagination.current_page >= pagination.last_page) e.preventDefault();
                  }}
                  preserveState
                >
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}