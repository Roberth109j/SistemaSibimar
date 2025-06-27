import React from 'react';
import { Head, router } from '@inertiajs/react';
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
  AlertTriangle, 
  Clock, 
  Users, 
  BookX,
  ArrowLeft,
  TrendingUp
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type EstadisticasNoDevueltos, type PrestamoDetalle } from './types';

interface LibrosNoDevueltosProps {
  prestamos_no_devueltos: (PrestamoDetalle & { dias_retraso: number })[];
  estadisticas: EstadisticasNoDevueltos;
  periodo: {
    inicio: string;
    fin: string;
    tipo: string;
  };
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Informes', href: '/informes' },
  { title: 'Libros No Devueltos', href: '#' },
];

const COLORS_SEVERIDAD = {
  critico: '#DC2626',
  alto: '#EA580C', 
  medio: '#D97706',
  bajo: '#CA8A04',
  activos: '#3B82F6'
};

export default function LibrosNoDevueltos({ 
  prestamos_no_devueltos, 
  estadisticas, 
  periodo 
}: LibrosNoDevueltosProps) {
  
  const descargarPDF = () => {
    // Convertir fechas del formato d/m/Y a Y-m-d
    const convertirFecha = (fechaStr: string) => {
      const partes = fechaStr.split('/');
      return `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
    };

    const datos = {
      fecha_inicio: convertirFecha(periodo.inicio),
      fecha_fin: convertirFecha(periodo.fin),
      periodo: periodo.tipo !== 'personalizado' ? periodo.tipo : null,
      formato: 'pdf'
    };

    router.post('/informes/libros-no-devueltos', datos, {
      onError: (errors) => {
        console.error('Error descargando PDF:', errors);
      },
      onSuccess: () => {
        console.log('PDF generado exitosamente');
      }
    });
  };

  const getSeveridadColor = (dias: number) => {
    if (dias >= 30) return 'bg-red-600 text-white';
    if (dias >= 15) return 'bg-orange-500 text-white';
    if (dias >= 7) return 'bg-yellow-500 text-black';
    if (dias > 0) return 'bg-yellow-400 text-black';
    return 'bg-blue-500 text-white';
  };

  const getSeveridadLabel = (dias: number) => {
    if (dias >= 30) return 'Crítico';
    if (dias >= 15) return 'Alto';
    if (dias >= 7) return 'Medio';
    if (dias > 0) return 'Bajo';
    return 'En Tiempo';
  };

  // Preparar datos para gráfico de severidad
  const datosSeveridad = [
    { name: 'Crítico (30+ días)', value: estadisticas.por_severidad.critico, color: COLORS_SEVERIDAD.critico },
    { name: 'Alto (15-29 días)', value: estadisticas.por_severidad.alto, color: COLORS_SEVERIDAD.alto },
    { name: 'Medio (7-14 días)', value: estadisticas.por_severidad.medio, color: COLORS_SEVERIDAD.medio },
    { name: 'Bajo (1-6 días)', value: estadisticas.por_severidad.bajo, color: COLORS_SEVERIDAD.bajo },
    { name: 'En Tiempo', value: estadisticas.por_severidad.activos, color: COLORS_SEVERIDAD.activos }
  ].filter(item => item.value > 0);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Libros No Devueltos - ${periodo.inicio} a ${periodo.fin}`} />

      <div className="py-8 px-6 bg-slate-50 dark:bg-black min-h-screen">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                Libros No Devueltos
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Período: {periodo.inicio} - {periodo.fin} • Total: {estadisticas.total_no_devueltos} libros pendientes
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

          {/* Alerta Principal */}
          {estadisticas.total_no_devueltos > 0 && (
            <div className="mb-8 p-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                    ⚠️ Atención Requerida
                  </h3>
                  <p className="text-red-700 dark:text-red-300">
                    Se encontraron <strong>{estadisticas.total_no_devueltos}</strong> libros pendientes de devolución que requieren seguimiento inmediato.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Estadísticas Principales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-lg">
                  <BookX className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total No Devueltos</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{estadisticas.total_no_devueltos}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                  <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">En Tiempo</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{estadisticas.activos}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                  <AlertTriangle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Vencidos</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{estadisticas.vencidos}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Días Prom. Retraso</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{Math.round(estadisticas.promedio_dias_retraso || 0)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            
            {/* Gráfico de Severidad */}
            {datosSeveridad.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Análisis por Severidad
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={datosSeveridad}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {datosSeveridad.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Gráfico por Grado */}
            {estadisticas.por_grado.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  No Devueltos por Grado
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={estadisticas.por_grado.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="grado" 
                      tick={{ fontSize: 12 }}
                      className="text-gray-600 dark:text-gray-400"
                      angle={-45}
                      textAnchor="end"
                      height={80}
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
                    <Bar dataKey="cantidad" fill="#DC2626" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="vencidos" fill="#EA580C" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Tabla de Severidad */}
          {estadisticas.vencidos > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Análisis por Severidad de Retraso
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-700">
                <div className="p-6 text-center bg-red-50 dark:bg-red-900/20">
                  <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {estadisticas.por_severidad.critico}
                  </div>
                  <div className="text-sm font-medium text-red-700 dark:text-red-300 mt-1">
                    Crítico (30+ días)
                  </div>
                </div>
                <div className="p-6 text-center bg-orange-50 dark:bg-orange-900/20">
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                    {estadisticas.por_severidad.alto}
                  </div>
                  <div className="text-sm font-medium text-orange-700 dark:text-orange-300 mt-1">
                    Alto (15-29 días)
                  </div>
                </div>
                <div className="p-6 text-center bg-yellow-50 dark:bg-yellow-900/20">
                  <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-500">
                    {estadisticas.por_severidad.medio}
                  </div>
                  <div className="text-sm font-medium text-yellow-700 dark:text-yellow-400 mt-1">
                    Medio (7-14 días)
                  </div>
                </div>
                <div className="p-6 text-center bg-yellow-50 dark:bg-yellow-900/20">
                  <div className="text-3xl font-bold text-yellow-500 dark:text-yellow-400">
                    {estadisticas.por_severidad.bajo}
                  </div>
                  <div className="text-sm font-medium text-yellow-600 dark:text-yellow-400 mt-1">
                    Bajo (1-6 días)
                  </div>
                </div>
                <div className="p-6 text-center bg-blue-50 dark:bg-blue-900/20">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {estadisticas.por_severidad.activos}
                  </div>
                  <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mt-1">
                    En Tiempo
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tabla Detallada */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Detalle de Libros No Devueltos ({prestamos_no_devueltos.length} registros)
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Estudiante
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Grado
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Libro
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Ejemplar
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      F. Vencimiento
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Días Retraso
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {prestamos_no_devueltos
                    .sort((a, b) => b.dias_retraso - a.dias_retraso)
                    .slice(0, 30)
                    .map((prestamo) => (
                    <tr key={prestamo.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {prestamo.lector.nombre}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {prestamo.lector.codigo}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {prestamo.lector.grado?.subGrado || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                          {prestamo.ejemplar.libro.titulo}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-mono text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          #{prestamo.ejemplar.numEjemplar}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 dark:text-white">
                        {new Date(prestamo.fecha_devolucion).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSeveridadColor(prestamo.dias_retraso)}`}>
                          {prestamo.dias_retraso > 0 ? `${prestamo.dias_retraso} días` : 'En tiempo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          prestamo.estado === 'ACTIVO'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                          {prestamo.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {prestamos_no_devueltos.length > 30 && (
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Mostrando 30 de {prestamos_no_devueltos.length} libros no devueltos. Descargue el PDF para ver el informe completo.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Recomendaciones */}
          {estadisticas.total_no_devueltos > 0 && (
            <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-4">
                📋 Recomendaciones de Acción
              </h3>
              <div className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
                {estadisticas.por_severidad.critico > 0 && (
                  <div className="flex items-start space-x-2">
                    <span className="text-red-600 font-bold">🔴</span>
                    <span><strong>Acción Inmediata:</strong> {estadisticas.por_severidad.critico} préstamos con más de 30 días requieren contacto inmediato y posible aplicación de sanciones.</span>
                  </div>
                )}
                
                {estadisticas.por_severidad.alto > 0 && (
                  <div className="flex items-start space-x-2">
                    <span className="text-orange-600 font-bold">🟠</span>
                    <span><strong>Seguimiento Urgente:</strong> {estadisticas.por_severidad.alto} préstamos con 15-29 días necesitan seguimiento telefónico o citación.</span>
                  </div>
                )}
                
                {estadisticas.por_severidad.medio > 0 && (
                  <div className="flex items-start space-x-2">
                    <span className="text-yellow-600 font-bold">🟡</span>
                    <span><strong>Recordatorio:</strong> {estadisticas.por_severidad.medio} préstamos con 7-14 días requieren envío de recordatorios.</span>
                  </div>
                )}
                
                {estadisticas.activos > 0 && (
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-600 font-bold">🔵</span>
                    <span><strong>Preventivo:</strong> {estadisticas.activos} préstamos activos próximos a vencer requieren recordatorio preventivo.</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}