import React from 'react';
import { Head } from '@inertiajs/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Download, 
  AlertTriangle, 
  BookX,
  ArrowLeft,
  TrendingUp
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { 
  type LibrosNoDevueltosProps,
  type EstadisticasNoDevueltos,
  type PrestamoDetalle 
} from './types';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Informes', href: '/informes' },
  { title: 'Libros No Devueltos', href: '#' },
];

// COLORES CONSISTENTES CON PRÉSTAMOS REALIZADOS
const COLORS_SEVERIDAD = {
  critico: '#EF4444',    // Rojo (como vencidos en préstamos)
  alto: '#F59E0B',       // Amarillo (como activos en préstamos) 
  medio: '#3B82F6',      // Azul (como total en préstamos)
  bajo: '#10B981'        // Verde (como devueltos en préstamos)
};

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
    
    if (fechaLimpia.includes('/') && fechaLimpia.length <= 10) {
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

// Función para formatear días - CORREGIDA PARA ASEGURAR VALORES POSITIVOS
const formatearDias = (dias: number): string => {
  const diasEnteros = Math.abs(Math.floor(Number(dias) || 0)); // Asegurar valor positivo
  return diasEnteros.toString();
};

// Función para ordenar grados de manera lógica
const ordenarGrados = (grado: string): number => {
  const gradoLower = grado.toLowerCase();

  // PREESCOLAR (PREJARDIN, etc.) - SIEMPRE PRIMERO
  if (gradoLower.includes('preescolar') || gradoLower.includes('prejardin') || gradoLower.includes('pre jardin')) {
    // Ordenar por número dentro de prejardín
    if (gradoLower.includes('uno') || gradoLower.includes('1')) {
      return -2;
    }
    if (gradoLower.includes('dos') || gradoLower.includes('2')) {
      return -1;
    }
    return -3; // Otros preescolares
  }

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

  // Sin grado / DOCENTES al final
  if (gradoLower.includes('docentes') || gradoLower.includes('sin grado')) {
    return 999;
  }

  // Por defecto
  return 500;
};

export default function LibrosNoDevueltos({ 
  prestamos_no_devueltos, 
  estadisticas, 
  periodo
}: LibrosNoDevueltosProps) {
  
  const descargarPDF = () => {
  const convertirFecha = (fechaStr: string) => {
    const partes = fechaStr.split('/');
    return `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
  };

  // Crear un formulario temporal para hacer POST
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = '/informes/libros-no-devueltos';
  form.target = '_blank';

  // Agregar token CSRF
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  if (csrfToken) {
    const csrfInput = document.createElement('input');
    csrfInput.type = 'hidden';
    csrfInput.name = '_token';
    csrfInput.value = csrfToken;
    form.appendChild(csrfInput);
  }

  // Agregar campos del formulario
  const fields = {
    fecha_inicio: convertirFecha(periodo.inicio),
    fecha_fin: convertirFecha(periodo.fin),
    formato: 'pdf',
    ...(periodo.tipo !== 'personalizado' && { periodo: periodo.tipo })
  };

  Object.entries(fields).forEach(([key, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = value as string;
    form.appendChild(input);
  });

  // Agregar al DOM, enviar y remover
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
};

  // COLORES CONSISTENTES para severidad - CORREGIDO PARA VALORES POSITIVOS
  const getSeveridadColor = (dias: number) => {
    const diasEnteros = Math.abs(Math.floor(Number(dias) || 0)); // Asegurar valor positivo
    if (diasEnteros >= 30) return 'bg-red-500 text-white';         // Rojo para crítico
    if (diasEnteros >= 15) return 'bg-yellow-500 text-white';      // Amarillo para alto
    if (diasEnteros >= 7) return 'bg-blue-500 text-white';        // Azul para medio
    if (diasEnteros > 0) return 'bg-green-500 text-white';        // Verde para bajo
    return 'bg-gray-500 text-white';
  };

  const getSeveridadLabel = (dias: number) => {
    const diasEnteros = Math.abs(Math.floor(Number(dias) || 0)); // Asegurar valor positivo
    if (diasEnteros >= 30) return 'Crítico';
    if (diasEnteros >= 15) return 'Alto';
    if (diasEnteros >= 7) return 'Medio';
    if (diasEnteros > 0) return 'Bajo';
    return 'Sin retraso';
  };

  // Preparar datos para gráfico de severidad - COLORES CONSISTENTES
  const datosSeveridad = [
    { name: 'Crítico (30+ días)', value: estadisticas.por_severidad.critico, color: COLORS_SEVERIDAD.critico },
    { name: 'Alto (15-29 días)', value: estadisticas.por_severidad.alto, color: COLORS_SEVERIDAD.alto },
    { name: 'Medio (7-14 días)', value: estadisticas.por_severidad.medio, color: COLORS_SEVERIDAD.medio },
    { name: 'Bajo (1-6 días)', value: estadisticas.por_severidad.bajo, color: COLORS_SEVERIDAD.bajo }
  ].filter(item => item.value > 0);

  // Ordenar préstamos por grado y luego por días de retraso
  const prestamosOrdenados = [...prestamos_no_devueltos].sort((a, b) => {
    const gradoA = a.lector?.grado?.subGrado || 'Sin grado';
    const gradoB = b.lector?.grado?.subGrado || 'Sin grado';
    
    const ordenA = ordenarGrados(gradoA);
    const ordenB = ordenarGrados(gradoB);
    
    // Primero ordenar por grado
    if (ordenA !== ordenB) {
      return ordenA - ordenB;
    }
    
    // Si el grado es igual, ordenar por días de retraso (mayor retraso primero)
    const diasA = Math.abs(Math.floor(Number(a.dias_retraso) || 0));
    const diasB = Math.abs(Math.floor(Number(b.dias_retraso) || 0));
    return diasB - diasA;
  });

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Libros No Devueltos - ${periodo.inicio} a ${periodo.fin}`} />

      <div className="py-8 px-6 bg-slate-50 dark:bg-black min-h-screen">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Prestamos Vencidos
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Período: {periodo.inicio} - {periodo.fin} • Total: {estadisticas.total_no_devueltos} libros vencidos
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

          {/* Alerta Principal - COLORES CONSISTENTES */}
          {estadisticas.total_no_devueltos > 0 && (
            <div className="mb-8 p-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                    Atención Requerida
                  </h3>
                  <p className="text-red-700 dark:text-red-300">
                    Se encontraron <strong>{estadisticas.total_no_devueltos}</strong> libros vencidos no devueltos que requieren seguimiento.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Estadísticas Principales - COLORES CONSISTENTES CON PRÉSTAMOS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                  <BookX className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Vencidos</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{estadisticas.total_no_devueltos}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-lg">
                  <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Críticos (30+ días)</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{estadisticas.por_severidad.critico}</p>
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
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{Math.abs(Math.floor(estadisticas.promedio_dias_retraso || 0))}</p>
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
                  Análisis por Severidad de Retraso
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
                  Vencidos por Grado
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
                    <Bar dataKey="cantidad" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Tabla de Severidad - COLORES CONSISTENTES */}
          {estadisticas.total_no_devueltos > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Análisis por Severidad de Retraso
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-700">
                <div className="p-6 text-center bg-red-50 dark:bg-red-900/20">
                  <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {estadisticas.por_severidad.critico}
                  </div>
                  <div className="text-sm font-medium text-red-700 dark:text-red-300 mt-1">
                    Crítico (30+ días)
                  </div>
                </div>
                <div className="p-6 text-center bg-yellow-50 dark:bg-yellow-900/20">
                  <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                    {estadisticas.por_severidad.alto}
                  </div>
                  <div className="text-sm font-medium text-yellow-700 dark:text-yellow-300 mt-1">
                    Alto (15-29 días)
                  </div>
                </div>
                <div className="p-6 text-center bg-blue-50 dark:bg-blue-900/20">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {estadisticas.por_severidad.medio}
                  </div>
                  <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mt-1">
                    Medio (7-14 días)
                  </div>
                </div>
                <div className="p-6 text-center bg-green-50 dark:bg-green-900/20">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {estadisticas.por_severidad.bajo}
                  </div>
                  <div className="text-sm font-medium text-green-700 dark:text-green-300 mt-1">
                    Bajo (1-6 días)
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tabla Detallada - CON ORDENAMIENTO POR GRADO */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Detalle de Libros Vencidos No Devueltos ({prestamos_no_devueltos.length} registros)
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Grado
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Estudiante
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
                      Severidad
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {prestamosOrdenados
                    .map((prestamo) => {
                      const diasEnteros = Math.abs(Math.floor(Number(prestamo.dias_retraso) || 0)); // Asegurar valor positivo
                      return (
                        <tr key={prestamo.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {prestamo.lector.grado?.subGrado || 'N/A'}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {prestamo.lector.nombre}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {prestamo.lector.codigo}
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
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 dark:text-white">
                            {formatearFecha(prestamo.fecha_devolucion)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSeveridadColor(diasEnteros)}`}>
                              {formatearDias(diasEnteros)} días
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeveridadColor(diasEnteros)}`}>
                              {getSeveridadLabel(diasEnteros)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recomendaciones - COLORES MEJORADOS */}
          {estadisticas.total_no_devueltos > 0 && (
            <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-4">
                📋 Recomendaciones de Acción
              </h3>
              <div className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
                {estadisticas.por_severidad.critico > 0 && (
                  <div className="flex items-start space-x-2">
                    <span className="text-red-600 font-bold">🔴</span>
                    <span><strong>Acción Prioritaria:</strong> {estadisticas.por_severidad.critico} préstamos con más de 30 días requieren contacto inmediato.</span>
                  </div>
                )}
                
                {estadisticas.por_severidad.alto > 0 && (
                  <div className="flex items-start space-x-2">
                    <span className="text-yellow-600 font-bold">🟡</span>
                    <span><strong>Seguimiento Urgente:</strong> {estadisticas.por_severidad.alto} préstamos con 15-29 días necesitan seguimiento telefónico.</span>
                  </div>
                )}
                
                {estadisticas.por_severidad.medio > 0 && (
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-600 font-bold">🔵</span>
                    <span><strong>Recordatorio:</strong> {estadisticas.por_severidad.medio} préstamos con 7-14 días requieren envío de recordatorios.</span>
                  </div>
                )}
                
                {estadisticas.por_severidad.bajo > 0 && (
                  <div className="flex items-start space-x-2">
                    <span className="text-green-600 font-bold">🟢</span>
                    <span><strong>Seguimiento Leve:</strong> {estadisticas.por_severidad.bajo} préstamos con 1-6 días requieren seguimiento preventivo.</span>
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