import React, { useEffect, useState, useMemo } from 'react';
import { CheckCircle, X, Loader2, Book, Calendar, Package, AlertTriangle, FileText, MessageSquare, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { Prestamo, LIMITES_DEVOLUCION_MULTIPLE } from './types';

interface ConfirmacionModalMultipleProps {
  isOpen: boolean;
  onClose: () => void;
  prestamosSeleccionados: Prestamo[];
  fechaDevuelto: string;
  setFechaDevuelto: (fecha: string) => void;
  observacionesGlobales: string;
  setObservacionesGlobales: (observaciones: string) => void;
  observacionesIndividuales: Map<number, string>;
  setObservacionesIndividuales: React.Dispatch<React.SetStateAction<Map<number, string>>>;
  procesandoDevolucion: boolean;
  onConfirmar: () => void;
  prestamosConObservacionesExpandidas: Set<number>;
  setPrestamosConObservacionesExpandidas: React.Dispatch<React.SetStateAction<Set<number>>>;
  mostrarObservacionesGlobales: boolean;
  setMostrarObservacionesGlobales: (mostrar: boolean) => void;
}

export default function ConfirmacionModalMultiple({
  isOpen,
  onClose,
  prestamosSeleccionados,
  fechaDevuelto,
  setFechaDevuelto,
  observacionesGlobales,
  setObservacionesGlobales,
  observacionesIndividuales,
  setObservacionesIndividuales,
  procesandoDevolucion,
  onConfirmar,
  prestamosConObservacionesExpandidas,
  setPrestamosConObservacionesExpandidas,
  mostrarObservacionesGlobales,
  setMostrarObservacionesGlobales
}: ConfirmacionModalMultipleProps) {
  
  const [paginaModal, setPaginaModal] = useState<number>(1);
  const itemsPorPaginaModal = 10;

  // Función para obtener fecha actual sin problemas de zona horaria
  const obtenerFechaActualLocal = (): string => {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
  };

  // Establecer la fecha actual cuando se abre el modal
  useEffect(() => {
    if (isOpen && prestamosSeleccionados.length > 0) {
      const fechaActual = obtenerFechaActualLocal();
      setFechaDevuelto(fechaActual);
      setPaginaModal(1); // Resetear paginación del modal
    }
  }, [isOpen, prestamosSeleccionados.length, setFechaDevuelto]);

  // Calcular estadísticas mejoradas
  const estadisticas = useMemo(() => {
    const totalPrestamos = prestamosSeleccionados.length;
    const prestamosVencidos = prestamosSeleccionados.filter((p: Prestamo) => {
      const fechaDevolucion = new Date(p.fecha_devolucion);
      const hoy = new Date();
      return fechaDevolucion < hoy;
    }).length;

    const prestamosConObservacionesIndividuales = Array.from(observacionesIndividuales.entries()).filter(([id, obs]: [number, string]) => {
      return prestamosSeleccionados.some((p: Prestamo) => p.id === id) && obs.trim().length > 0;
    }).length;

    const prestamosQueUsaranObservacionesGlobales = prestamosSeleccionados.filter((p: Prestamo) => {
      const tieneObservacionIndividual = observacionesIndividuales.has(p.id) && 
        observacionesIndividuales.get(p.id)!.trim().length > 0;
      return !tieneObservacionIndividual && observacionesGlobales.trim().length > 0;
    }).length;

    return {
      totalPrestamos,
      prestamosVencidos,
      prestamosActivos: totalPrestamos - prestamosVencidos,
      prestamosConObservacionesIndividuales,
      prestamosQueUsaranObservacionesGlobales,
      prestamosSinObservaciones: totalPrestamos - prestamosConObservacionesIndividuales - prestamosQueUsaranObservacionesGlobales
    };
  }, [prestamosSeleccionados, observacionesIndividuales, observacionesGlobales]);

  // Paginación para listas grandes
  const prestamosEnPaginaModal = useMemo(() => {
    const inicio = (paginaModal - 1) * itemsPorPaginaModal;
    const fin = inicio + itemsPorPaginaModal;
    return prestamosSeleccionados.slice(inicio, fin);
  }, [prestamosSeleccionados, paginaModal]);

  const totalPaginasModal = useMemo(() => {
    return Math.ceil(prestamosSeleccionados.length / itemsPorPaginaModal);
  }, [prestamosSeleccionados.length]);

  const mostrarPaginacionModal = prestamosSeleccionados.length > itemsPorPaginaModal;

  // Toggle observaciones específicas en el modal
  const toggleObservacionesEspecificas = (prestamoId: number): void => {
    setPrestamosConObservacionesExpandidas((prev: Set<number>) => {
      const nuevas = new Set(prev);
      if (nuevas.has(prestamoId)) {
        nuevas.delete(prestamoId);
        // Limpiar observación individual al colapsar
        setObservacionesIndividuales((prevObs: Map<number, string>) => {
          const nuevasObs = new Map(prevObs);
          nuevasObs.delete(prestamoId);
          return nuevasObs;
        });
      } else {
        nuevas.add(prestamoId);
      }
      return nuevas;
    });
  };

  if (!isOpen || prestamosSeleccionados.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-6xl shadow-2xl transform transition-all max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Confirmar Devolución Múltiple
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {estadisticas.totalPrestamos} préstamo(s) seleccionado(s)
                  {estadisticas.prestamosVencidos > 0 && (
                    <span className="text-red-600 dark:text-red-400 font-medium ml-2">
                      • {estadisticas.prestamosVencidos} vencido(s)
                    </span>
                  )}
                  {estadisticas.totalPrestamos > 50 && (
                    <span className="text-blue-600 dark:text-blue-400 font-medium ml-2">
                      • Lote grande detectado
                    </span>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={procesandoDevolucion}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 
                         hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-2 transition-all 
                         disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6">
          {/* Información de devolución y estadísticas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fecha de devolución */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Fecha de devolución
              </label>
              <input
                type="date"
                value={fechaDevuelto}
                readOnly
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 
                           bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white
                           cursor-not-allowed opacity-75 transition-all duration-200"
              />
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Se establece automáticamente con la fecha actual
              </div>
            </div>

            {/* Estadísticas detalladas */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Resumen detallado
              </label>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Total:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{estadisticas.totalPrestamos}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Vencidos:</span>
                    <span className={`font-semibold ${estadisticas.prestamosVencidos > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                      {estadisticas.prestamosVencidos}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Con obs. específicas:</span>
                    <span className="font-semibold text-purple-600 dark:text-purple-400">
                      {estadisticas.prestamosConObservacionesIndividuales}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Con obs. globales:</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {estadisticas.prestamosQueUsaranObservacionesGlobales}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          

          {/* Lista de préstamos con paginación mejorada */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Book className="w-4 h-4" />
                Préstamos a devolver
                {mostrarPaginacionModal && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    (Página {paginaModal} de {totalPaginasModal})
                  </span>
                )}
              </h4>
              
              {mostrarPaginacionModal && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPaginaModal((prev: number) => Math.max(1, prev - 1))}
                    disabled={paginaModal === 1}
                    className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 
                               text-gray-700 dark:text-gray-300 px-2 py-1 rounded transition-all duration-200
                               disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {paginaModal}/{totalPaginasModal}
                  </span>
                  <button
                    onClick={() => setPaginaModal((prev: number) => Math.min(totalPaginasModal, prev + 1))}
                    disabled={paginaModal === totalPaginasModal}
                    className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 
                               text-gray-700 dark:text-gray-300 px-2 py-1 rounded transition-all duration-200
                               disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </div>
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="max-h-60 overflow-y-auto">
                {prestamosEnPaginaModal.map((prestamo: Prestamo, index: number) => {
                  const fechaDevolucion = new Date(prestamo.fecha_devolucion);
                  const hoy = new Date();
                  const estaVencido = fechaDevolucion < hoy;
                  // Prefill with DB observation from ejemplar if present; empty if null
                  const observacionIndividual = (observacionesIndividuales.get(prestamo.id) ?? prestamo.ejemplar.observaciones ?? '').toString();
                  const tieneObservacionExpandida = prestamosConObservacionesExpandidas.has(prestamo.id);
                  const usaraObservacionGlobal = !observacionIndividual.trim() && observacionesGlobales.trim();

                  return (
                    <div 
                      key={prestamo.id} 
                      className={`p-4 ${index < prestamosEnPaginaModal.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''} 
                                  ${estaVencido ? 'bg-red-50 dark:bg-red-900/20' : 'bg-white dark:bg-gray-800'}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-3">
                            <div className={`p-1.5 rounded ${estaVencido ? 'bg-red-100 dark:bg-red-800/50' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                              <Package className={`w-4 h-4 ${estaVencido ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`} />
                            </div>
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                                {prestamo.ejemplar.libro.titulo}
                              </h5>
                              <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-600 dark:text-gray-400">
                                <span>Ejemplar #{prestamo.ejemplar.numEjemplar}</span>
                                <span>Código: {prestamo.ejemplar.libro.codigo_unico}</span>
                                {estaVencido && (
                                  <span className="text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    VENCIDO
                                  </span>
                                )}
                                {usaraObservacionGlobal && (
                                  <span className="text-blue-600 dark:text-blue-400 font-medium">
                                    Obs. global
                                  </span>
                                )}
                                {observacionIndividual.trim() && (
                                  <span className="text-purple-600 dark:text-purple-400 font-medium">
                                    Obs. específica
                                  </span>
                                )}
                              </div>
                              
                              {/* Botón para observaciones específicas */}
                              <div className="mt-2">
                                <button
                                  onClick={() => toggleObservacionesEspecificas(prestamo.id)}
                                  className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium transition-all duration-200 ${
                                    tieneObservacionExpandida
                                      ? 'bg-purple-100 text-purple-800 border border-purple-300 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-700'
                                      : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
                                  }`}
                                >
                                  <MessageSquare className="w-3 h-3 mr-1" />
                                  {tieneObservacionExpandida ? 'Ocultar obs. específica' : 'Agregar obs. específica'}
                                </button>
                              </div>

                              {/* Campo de observaciones específicas */}
                              {tieneObservacionExpandida && (
                                <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded border border-purple-200 dark:border-purple-700">
                                  <label className="block text-xs font-medium text-purple-800 dark:text-purple-300 mb-1">
                                    Observaciones específicas para #{prestamo.ejemplar.numEjemplar}:
                                  </label>
                                  <textarea
                                    value={observacionIndividual}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                                      setObservacionesIndividuales((prev: Map<number, string>) => {
                                        const nuevas = new Map(prev);
                                        if (e.target.value.trim()) {
                                          nuevas.set(prestamo.id, e.target.value);
                                        } else {
                                          nuevas.delete(prestamo.id);
                                        }
                                        return nuevas;
                                      });
                                    }}
                                    placeholder="Estado específico, daños, notas importantes..."
                                    className="w-full text-xs p-2 border border-purple-300 dark:border-purple-600 rounded 
                                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                               focus:ring-1 focus:ring-purple-500 focus:border-purple-500 resize-none
                                               placeholder-gray-400 dark:placeholder-gray-500"
                                    rows={2}
                                    maxLength={LIMITES_DEVOLUCION_MULTIPLE.MAX_OBSERVACIONES_INDIVIDUALES}
                                  />
                                  <div className="flex justify-between items-center text-xs text-purple-600 dark:text-purple-400 mt-1">
                                    <span>Prevalece sobre observaciones globales</span>
                                    <span>{observacionIndividual.length}/{LIMITES_DEVOLUCION_MULTIPLE.MAX_OBSERVACIONES_INDIVIDUALES}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Advertencias y información importante */}
          <div className="space-y-4">
            {/* Advertencia si hay préstamos vencidos */}
            {estadisticas.prestamosVencidos > 0 && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                      Préstamos vencidos detectados
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                      {estadisticas.prestamosVencidos} de los {estadisticas.totalPrestamos} préstamos seleccionados están vencidos. 
                      Verifique el estado de los ejemplares antes de confirmar la devolución.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Información para lotes grandes */}
            {estadisticas.totalPrestamos > 50 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                      Procesamiento de lote grande
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                      <strong>Procesando {estadisticas.totalPrestamos} préstamos.</strong> El proceso puede tomar unos momentos. 
                      Para lotes grandes como este, recomendamos usar observaciones globales en lugar de específicas para mayor eficiencia.
                    </p>
                  </div>
                </div>
              </div>
            )}
        </div>
        </div>

        {/* Footer con acciones */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-end gap-4">
            <button
              onClick={onClose}
              disabled={procesandoDevolucion}
              className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 
                         rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 
                         font-medium disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirmar}
              disabled={!fechaDevuelto || procesandoDevolucion || prestamosSeleccionados.length === 0}
              className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 dark:from-green-500 dark:to-green-600 
                         text-white rounded-lg hover:from-green-700 hover:to-green-800 dark:hover:from-green-600 dark:hover:to-green-700 
                         transition-all duration-200 font-medium shadow-sm hover:shadow-md flex items-center gap-2 
                         disabled:opacity-50 disabled:from-gray-400 disabled:to-gray-500"
            >
              {procesandoDevolucion ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Procesando {prestamosSeleccionados.length} devolución(es)...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Confirmar Devolución ({prestamosSeleccionados.length})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}