import React from 'react';
import { Head } from '@inertiajs/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Download, 
  AlertTriangle, 
  BookX,
  ArrowLeft,
  Calendar,
  BookOpen,
  TrendingDown
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

// Interfaces
interface EstadisticasLibrosPerdidos {
  total_perdidos: number;
  libros_afectados: number;
  valor_estimado: number;
  por_mes: PerdidosPorMes[];
  perdidas_año_actual: number;
}

interface PerdidosPorMes {
  mes: string;
  cantidad: number;
}

interface EjemplarPerdido {
  id: number;
  numEjemplar: number;
  estado: string;
  observaciones?: string;
  updated_at: string;
  fecha_perdida: string;
  fecha_perdida_formateada: string;
  libro: {
    id: number;
    titulo: string;
    isbn?: string;
    autor: {
      nombres: string;
      apellidos: string;
    };
  };
}

interface LibrosPerdidosProps {
  ejemplares_perdidos: EjemplarPerdido[];
  estadisticas: EstadisticasLibrosPerdidos;
  periodo: {
    inicio: string;
    fin: string;
    tipo: string;
  };
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Informes', href: '/informes' },
  { title: 'Libros Perdidos', href: '#' },
];

// Función para formatear fechas
const formatearFecha = (fecha: string | null | undefined): string => {
  if (!fecha) return 'N/A';
  
  try {
    const fechaLimpia = fecha.toString().split('T')[0];
    
    if (fechaLimpia.includes('-')) {
      const partes = fechaLimpia.split('-');
      if (partes.length === 3) {
        const [año, mes, dia] = partes;
        return `${dia.padStart(2, '0')}/${mes.padStart(2, '0')}/${año}`;
      }
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

export default function LibrosPerdidos({ 
  ejemplares_perdidos, 
  estadisticas, 
  periodo
}: LibrosPerdidosProps) {
  
  // CORREGIDO: Usar la estadística que viene del backend en lugar de calcular aquí
  const añoActual = new Date().getFullYear();
  const perdidasAñoActual = estadisticas.perdidas_año_actual || 0;

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

    const url = `/informes/descargar-libros-perdidos?${params}`;
    window.open(url, '_blank');
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Libros Perdidos - ${periodo.inicio} a ${periodo.fin}`} />

      <div className="py-8 px-6 bg-slate-50 dark:bg-black min-h-screen">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Reporte de Libros Perdidos
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Período: {periodo.inicio} - {periodo.fin} • Total: {estadisticas.total_perdidos} ejemplares perdidos
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
          {estadisticas.total_perdidos > 0 && (
            <div className="mb-8 p-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                    Registro de Pérdidas
                  </h3>
                  <p className="text-red-700 dark:text-red-300">
                    Se registraron <strong>{estadisticas.total_perdidos}</strong> ejemplares como perdidos en el período seleccionado, 
                    afectando <strong>{estadisticas.libros_afectados}</strong> títulos diferentes.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Estadísticas Principales - CORREGIDA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-lg">
                  <BookX className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Ejemplares Perdidos</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{estadisticas.total_perdidos}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">En período seleccionado</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                  <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Libros Afectados</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{estadisticas.libros_afectados}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Títulos únicos</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-lg">
                  <Calendar className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Promedio Mensual</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {estadisticas.por_mes.length > 0 
                      ? Math.round(estadisticas.total_perdidos / estadisticas.por_mes.length) 
                      : 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">En período</p>
                </div>
              </div>
            </div>

            {/* CORREGIDA: Pérdidas del Año Actual - Ahora usa datos del backend */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                  <TrendingDown className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pérdidas en {añoActual}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {perdidasAñoActual}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total del año</p>
                </div>
              </div>
            </div>
          </div>

          {/* Gráfico por Mes */}
          {estadisticas.por_mes.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Pérdidas por Mes (Período Seleccionado)
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={estadisticas.por_mes}>
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
                  <Bar dataKey="cantidad" fill="#DC2626" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Tabla Detallada */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Detalle de Ejemplares Perdidos ({ejemplares_perdidos.length} registros)
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Ordenados por fecha de pérdida (más recientes primero)
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Título del Libro
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Autor
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Ejemplar #
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Fecha Perdida
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Observaciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {ejemplares_perdidos.map((ejemplar) => (
                    <tr key={ejemplar.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white max-w-xs">
                          {ejemplar.libro.titulo}
                        </div>
                        {ejemplar.libro.isbn && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            ISBN: {ejemplar.libro.isbn}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {ejemplar.libro.autor.nombres} {ejemplar.libro.autor.apellidos}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200">
                          #{ejemplar.numEjemplar}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 dark:text-white">
                        {ejemplar.fecha_perdida_formateada}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400 max-w-xs">
                          {ejemplar.observaciones || 'Sin observaciones'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {ejemplares_perdidos.length === 0 && (
                <div className="px-6 py-12 text-center">
                  <BookX className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No se encontraron libros perdidos en el período seleccionado
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