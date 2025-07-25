import React, { useState, useEffect } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import { Users, CheckSquare, Square, ArrowRight, ArrowLeft, Save } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Lector, type Grado } from './types';
import AlertNotification from '@/components/AlertNotification';

interface AsignacionMasivaPageProps {
  auth: any;
  lectores: Lector[];
  grados: Grado[];
  flash?: {
    success?: string;
    error?: string;
  };
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Lectores', href: '/lectores' },
  { title: 'Edicion Masiva', href: '/lectores/asignacion-masiva' },
];

export default function AsignacionMasivaPage({ 
  auth, 
  lectores, 
  grados, 
  flash 
}: AsignacionMasivaPageProps) {
  const [filtroGradoActual, setFiltroGradoActual] = useState('');
  const [filtroSubgradoActual, setFiltroSubgradoActual] = useState('');
  const [nuevoGradoId, setNuevoGradoId] = useState('');
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [tipoAccion, setTipoAccion] = useState<'grado' | 'estado'>('grado');
  const [estudiantesSeleccionados, setEstudiantesSeleccionados] = useState<number[]>([]);
  const [procesando, setProcesando] = useState(false);

  const [showAlert, setShowAlert] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({ show: false, type: 'success', message: '' });

  // Manejar flash messages al cargar
  useEffect(() => {
    if (flash?.success) {
      setShowAlert({
        show: true,
        type: 'success',
        message: flash.success
      });
    } else if (flash?.error) {
      setShowAlert({
        show: true,
        type: 'error',
        message: flash.error
      });
    }
  }, [flash]);

  // Filtrar solo estudiantes activos (ya filtrados desde el backend)
  const estudiantes = lectores;

  // Obtener subgrados únicos del grado seleccionado
  const subgradosDisponibles = filtroGradoActual 
    ? [...new Set(estudiantes
        .filter(est => est.grado?.grado === filtroGradoActual)
        .map(est => est.grado?.subGrado)
        .filter(Boolean))]
    : [];

  // Filtrar estudiantes según criterios
  const estudiantesFiltrados = estudiantes.filter(estudiante => {
    if (filtroGradoActual && estudiante.grado?.grado !== filtroGradoActual) return false;
    if (filtroSubgradoActual && estudiante.grado?.subGrado !== filtroSubgradoActual) return false;
    return true;
  });

  // Limpiar selecciones cuando cambian los filtros
  useEffect(() => {
    setEstudiantesSeleccionados([]);
  }, [filtroGradoActual, filtroSubgradoActual]);

  // Limpiar subgrado cuando cambia el grado
  useEffect(() => {
    setFiltroSubgradoActual('');
  }, [filtroGradoActual]);

  const handleSelectAll = () => {
    if (estudiantesSeleccionados.length === estudiantesFiltrados.length) {
      setEstudiantesSeleccionados([]);
    } else {
      setEstudiantesSeleccionados(estudiantesFiltrados.map(est => est.id));
    }
  };

  const handleSelectEstudiante = (id: number) => {
    if (estudiantesSeleccionados.includes(id)) {
      setEstudiantesSeleccionados(prev => prev.filter(estId => estId !== id));
    } else {
      setEstudiantesSeleccionados(prev => [...prev, id]);
    }
  };

  const handleAsignar = () => {
    if (estudiantesSeleccionados.length === 0) {
      setShowAlert({
        show: true,
        type: 'error',
        message: 'Debe seleccionar al menos un estudiante'
      });
      return;
    }

    if (tipoAccion === 'grado' && !nuevoGradoId) {
      setShowAlert({
        show: true,
        type: 'error',
        message: 'Debe seleccionar un grado de destino'
      });
      return;
    }

    if (tipoAccion === 'estado' && !nuevoEstado) {
      setShowAlert({
        show: true,
        type: 'error',
        message: 'Debe seleccionar un estado'
      });
      return;
    }

    setProcesando(true);

    const url = tipoAccion === 'grado' 
      ? '/lectores/asignacion-masiva' 
      : '/lectores/cambio-estado-masivo';

    const data = tipoAccion === 'grado' 
      ? {
          lector_ids: estudiantesSeleccionados,
          nuevo_grado_id: nuevoGradoId
        }
      : {
          lector_ids: estudiantesSeleccionados,
          nuevo_estado: nuevoEstado
        };

    router.post(url, data, {
      onSuccess: () => {
        setProcesando(false);
      },
      onError: () => {
        setShowAlert({
          show: true,
          type: 'error',
          message: `Error al ${tipoAccion === 'grado' ? 'asignar grados' : 'cambiar estados'}`
        });
        setProcesando(false);
      }
    });
  };

  const gradosUnicos = [...new Set(estudiantes.map(est => est.grado?.grado).filter(Boolean))];
  const nuevoGradoSeleccionado = grados.find(g => g.id.toString() === nuevoGradoId);
  const estadosDisponibles = ['ACTIVO', 'INACTIVO'];

  const hideAlert = () => {
    setShowAlert({ show: false, type: 'success', message: '' });
  };

  return (
    <AppLayout
      breadcrumbs={breadcrumbs}
      renderHeader={() => (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold leading-tight text-gray-900 dark:text-white">
                Gestión Masiva de Estudiantes
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Cambia el grado o estado de múltiples estudiantes al mismo tiempo
              </p>
            </div>
          </div>
        </div>
      )}
    >
      <Head title="Asignación Masiva" />

      {/* Alert Notification */}
      {showAlert.show && (
        <AlertNotification
          type={showAlert.type}
          message={showAlert.message}
          position="top-right"
          onClose={hideAlert}
          autoClose={showAlert.type === 'success'}
          duration={showAlert.type === 'success' ? 3000 : 5000}
        />
      )}

      <div className="py-8 px-6 bg-slate-50 dark:bg-black min-h-screen">
        <div className="max-w-7xl mx-auto">
          
          {/* Card principal */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            
            {/* Filtros */}
            <div className="bg-gray-50 dark:bg-gray-700/50 p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Filtrar Estudiantes y Configurar Acción
              </h3>
              
              {/* Selector de tipo de acción */}
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Tipo de acción a realizar
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="tipoAccion"
                      value="grado"
                      checked={tipoAccion === 'grado'}
                      onChange={(e) => setTipoAccion(e.target.value as 'grado' | 'estado')}
                      className="mr-2 text-blue-600"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Cambiar Grado
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="tipoAccion"
                      value="estado"
                      checked={tipoAccion === 'estado'}
                      onChange={(e) => setTipoAccion(e.target.value as 'grado' | 'estado')}
                      className="mr-2 text-blue-600"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Cambiar Estado
                    </span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Grado actual
                  </label>
                  <select
                    value={filtroGradoActual}
                    onChange={(e) => setFiltroGradoActual(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Todos los grados</option>
                    {gradosUnicos.map(grado => (
                      <option key={grado} value={grado}>{grado}°</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subgrado actual
                  </label>
                  <select
                    value={filtroSubgradoActual}
                    onChange={(e) => setFiltroSubgradoActual(e.target.value)}
                    disabled={!filtroGradoActual}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  >
                    <option value="">Todos los subgrados</option>
                    {subgradosDisponibles.map(subgrado => (
                      <option key={subgrado} value={subgrado}>{subgrado}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {tipoAccion === 'grado' ? 'Nuevo grado' : 'Nuevo estado'}
                  </label>
                  {tipoAccion === 'grado' ? (
                    <select
                      value={nuevoGradoId}
                      onChange={(e) => setNuevoGradoId(e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Seleccione el nuevo grado</option>
                      {grados.map(grado => (
                        <option key={grado.id} value={grado.id}>
                          {grado.grado}° - {grado.subGrado}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <select
                      value={nuevoEstado}
                      onChange={(e) => setNuevoEstado(e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Seleccione el nuevo estado</option>
                      {estadosDisponibles.map(estado => (
                        <option key={estado} value={estado}>
                          {estado === 'ACTIVO' ? 'Activo' : 'Inactivo'}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setFiltroGradoActual('');
                      setFiltroSubgradoActual('');
                      setNuevoGradoId('');
                      setNuevoEstado('');
                      setEstudiantesSeleccionados([]);
                    }}
                    className="px-4 py-3 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Limpiar Filtros
                  </button>
                </div>
              </div>
            </div>

            {/* Resumen */}
            {estudiantesSeleccionados.length > 0 && (
              (tipoAccion === 'grado' && nuevoGradoSeleccionado) || 
              (tipoAccion === 'estado' && nuevoEstado)
            ) && (
              <div className="bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-green-800 dark:text-green-300">
                    <span className="font-semibold">{estudiantesSeleccionados.length} estudiantes seleccionados</span>
                    <ArrowRight className="w-4 h-4" />
                    <span className="font-semibold">
                      {tipoAccion === 'grado' 
                        ? `${nuevoGradoSeleccionado?.grado}° ${nuevoGradoSeleccionado?.subGrado}`
                        : `Estado: ${nuevoEstado === 'ACTIVO' ? 'Activo' : 'Inactivo'}`
                      }
                    </span>
                  </div>
                  <button
                    onClick={handleAsignar}
                    disabled={procesando}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {procesando ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {tipoAccion === 'grado' ? 'Asignando...' : 'Actualizando...'}
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        {tipoAccion === 'grado' ? 'Asignar Grados' : 'Cambiar Estados'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Lista de estudiantes */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Estudiantes ({estudiantesFiltrados.length})
                </h4>
                {estudiantesFiltrados.length > 0 && (
                  <button
                    onClick={handleSelectAll}
                    className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                  >
                    {estudiantesSeleccionados.length === estudiantesFiltrados.length ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                    {estudiantesSeleccionados.length === estudiantesFiltrados.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                  </button>
                )}
              </div>

              <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="max-h-96 overflow-y-auto">
                  {estudiantesFiltrados.length > 0 ? (
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                        <tr>
                          <th className="w-12 px-4 py-3 text-left">
                            <Square className="w-4 h-4 text-gray-400" />
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Código</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Nombre</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Grado Actual</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                        {estudiantesFiltrados.map(estudiante => (
                          <tr
                            key={estudiante.id}
                            className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${
                              estudiantesSeleccionados.includes(estudiante.id) ? 'bg-blue-50/60 dark:bg-blue-900/20' : ''
                            }`}
                            onClick={() => handleSelectEstudiante(estudiante.id)}
                          >
                            <td className="px-4 py-3">
                              {estudiantesSeleccionados.includes(estudiante.id) ? (
                                <CheckSquare className="w-4 h-4 text-blue-600" />
                              ) : (
                                <Square className="w-4 h-4 text-gray-400" />
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                {estudiante.codigo}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {estudiante.nombre}
                              </p>
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                                {estudiante.grado?.grado}° {estudiante.grado?.subGrado}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                estudiante.estado === 'ACTIVO' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                              }`}>
                                {estudiante.estado === 'ACTIVO' ? 'Activo' : 'Inactivo'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                      <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No hay estudiantes que coincidan con los filtros</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <Link
                  href={route('lectores.index')}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver a Lectores
                </Link>
                
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {estudiantesSeleccionados.length} de {estudiantesFiltrados.length} estudiantes seleccionados
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}