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
  BookOpen, 
  TrendingUp, 
  Users, 
  Calendar,
  ArrowLeft
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type InformeEstadisticas, type PrestamoDetalle } from './types';

interface PrestamosRealizadosProps {
  prestamos: PrestamoDetalle[];
  estadisticas: InformeEstadisticas;
  periodo: {
    inicio: string;
    fin: string;
    tipo: string;
  };
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Informes', href: '/informes' },
  { title: 'Préstamos Realizados', href: '#' },
];

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function PrestamosRealizados({ 
  prestamos, 
  estadisticas, 
  periodo 
}: PrestamosRealizadosProps) {
  
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

    router.post('/informes/prestamos-realizados', datos, {
      onError: (errors) => {
        console.error('Error descargando PDF:', errors);
      },
      onSuccess: () => {
        console.log('PDF generado exitosamente');
      }
    });
  };

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

          {/* Tabla de Préstamos Recientes */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Préstamos Recientes ({prestamos.length} registros)
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
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Devolución
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {prestamos.slice(0, 20).map((prestamo) => (
                    <tr key={prestamo.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {new Date(prestamo.fecha_prestamo).toLocaleDateString('es-ES')}
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
                          ? new Date(prestamo.fecha_devuelto).toLocaleDateString('es-ES')
                          : new Date(prestamo.fecha_devolucion).toLocaleDateString('es-ES')
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {prestamos.length > 20 && (
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Mostrando 20 de {prestamos.length} préstamos. Descargue el PDF para ver el informe completo.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}