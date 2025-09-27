import { X, CheckCircle, Book, User, Calendar, Clock, FileText, Loader2, Users, BookOpen } from 'lucide-react';
import { type Libro, type Ejemplar, type PrestamoForm, type Lector } from '../types';

interface ResumenPrestamoProps {
  libro: Libro;
  ejemplar: Ejemplar;
  lector: Lector;
  formularioPrestamo: PrestamoForm;
  onConfirmar: () => void;
  onCancelar: () => void;
  cargando: boolean;
  // NUEVAS PROPS OPCIONALES para préstamos masivos
  tipoPrestamo?: 'individual' | 'masivo';
  ejemplaresSeleccionados?: Ejemplar[];
}

export function ResumenPrestamo({
  libro,
  ejemplar,
  lector,
  formularioPrestamo,
  onConfirmar,
  onCancelar,
  cargando,
  tipoPrestamo = 'individual',
  ejemplaresSeleccionados = []
}: ResumenPrestamoProps) {
  // Para préstamos masivos, usar los ejemplares seleccionados; para individual, usar el ejemplar único
  const ejemplares = tipoPrestamo === 'masivo' ? ejemplaresSeleccionados : [ejemplar];
  const esPrestamoMasivo = tipoPrestamo === 'masivo' && ejemplares.length > 1;

  // Formatear fecha para mostrar
  const formatearFecha = (fecha: string): string => {
    const [año, mes, dia] = fecha.split('-').map(Number);
    const fechaObj = new Date(año, mes - 1, dia, 0, 0, 0);
    
    const opciones: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return fechaObj.toLocaleDateString('es-ES', opciones);
  };

  // Calcular días de préstamo
  const calcularDiasPrestamo = (): number => {
    const [añoInicio, mesInicio, diaInicio] = formularioPrestamo.fecha_prestamo.split('-').map(Number);
    const [añoFin, mesFin, diaFin] = formularioPrestamo.fecha_devolucion.split('-').map(Number);
    
    const inicio = new Date(añoInicio, mesInicio - 1, diaInicio, 0, 0, 0);
    const fin = new Date(añoFin, mesFin - 1, diaFin, 0, 0, 0);
    
    const diferencia = fin.getTime() - inicio.getTime();
    return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`bg-white dark:bg-gray-800 rounded-xl w-full ${
        esPrestamoMasivo ? 'max-w-4xl' : 'max-w-2xl'
      } max-h-[90vh] shadow-2xl transform transition-all overflow-hidden flex flex-col`}>
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-4 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                {esPrestamoMasivo ? (
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Confirmar Préstamo{esPrestamoMasivo ? ' Masivo' : ''}
              </h3>
              {esPrestamoMasivo && (
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                  {ejemplares.length} ejemplares
                </span>
              )}
            </div>
            <button
              onClick={onCancelar}
              disabled={cargando}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-1.5 transition-all disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Contenido con scroll */}
        <div className="p-4 space-y-5 overflow-y-auto flex-1">
          {/* Resumen del préstamo */}
          <div className="bg-gray-50 dark:bg-gray-700/40 rounded-lg p-4 space-y-3.5">
            <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-3">
              Resumen del Préstamo{esPrestamoMasivo ? ' Masivo' : ''}
            </h4>
            
            {/* Libro */}
            <div className="flex items-start gap-2.5">
              <Book className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-600 dark:text-gray-300">Libro</p>
                <p className="font-medium text-gray-900 dark:text-white text-sm break-words">{libro.titulo}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 break-words">
                  ISBN: {libro.isbn}
                  {libro.autor && ` • Autor: ${libro.autor.nombres} ${libro.autor.apellidos}`}
                </p>
              </div>
            </div>

            {/* Ejemplar(es) */}
            <div className="flex items-start gap-2.5">
              <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  {esPrestamoMasivo ? 'Ejemplares' : 'Ejemplar'}
                </p>
                {esPrestamoMasivo ? (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {ejemplares.map((ej) => (
                      <span key={ej.id} className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
                        #{ej.numEjemplar}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    Ejemplar #{ejemplar.numEjemplar}
                  </p>
                )}
              </div>
            </div>

            {/* Lector */}
            <div className="flex items-start gap-2.5">
              <User className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-600 dark:text-gray-300">Lector</p>
                <p className="font-medium text-gray-900 dark:text-white text-sm break-words">{lector.nombre}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Código: {lector.codigo}
                  </p>
                  {lector.grado?.subGrado && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200">
                      {lector.grado.subGrado}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Fechas */}
            <div className="grid md:grid-cols-2 gap-3">
              <div className="flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-600 dark:text-gray-300">Fecha de Préstamo</p>
                  <p className="font-medium text-gray-900 dark:text-white text-sm break-words">
                    {formatearFecha(formularioPrestamo.fecha_prestamo)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-600 dark:text-gray-300">Fecha de Devolución</p>
                  <p className="font-medium text-gray-900 dark:text-white text-sm break-words">
                    {formatearFecha(formularioPrestamo.fecha_devolucion)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    ({calcularDiasPrestamo()} días de préstamo)
                  </p>
                </div>
              </div>
            </div>

            {/* Observaciones */}
            {formularioPrestamo.observaciones && (
              <div className="pt-2 border-t border-gray-200 dark:border-gray-600 mt-2">
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">
                  Observaciones{esPrestamoMasivo ? ' (aplicadas a todos)' : ''}
                </p>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md p-3 max-h-24 overflow-y-auto">
                  <p className="text-gray-900 dark:text-white text-sm whitespace-pre-wrap break-words leading-relaxed">
                    {formularioPrestamo.observaciones}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Lista detallada de ejemplares para préstamos masivos */}
          {esPrestamoMasivo && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600">
                <h4 className="font-medium text-gray-900 dark:text-white text-sm flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Ejemplares a Prestar ({ejemplares.length})
                </h4>
              </div>
              
              <div className="max-h-48 overflow-y-auto">
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {ejemplares.map((ejemplarItem, index) => (
                    <div key={ejemplarItem.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            Ejemplar #{ejemplarItem.numEjemplar}
                          </span>
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
                            {ejemplarItem.estado}
                          </span>
                        </div>
                        {ejemplarItem.observaciones && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                            {ejemplarItem.observaciones}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Mensaje informativo */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/50 border rounded-lg p-3">
            <p className="text-xs text-blue-800 dark:text-blue-300 break-words">
              <strong>Importante:</strong> {
                esPrestamoMasivo 
                  ? `Se crearán ${ejemplares.length} préstamos individuales con las mismas fechas. Todos los ejemplares cambiarán su estado a "PRESTADO".`
                  : 'El estudiante debe devolver el libro en la fecha indicada. Se aplicarán sanciones por retrasos en la devolución.'
              }
            </p>
          </div>
        </div>

        {/* Footer con acciones */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex-shrink-0">
          <div className="flex justify-between items-center">
            {/* Resumen rápido */}
            {esPrestamoMasivo && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">{ejemplares.length} préstamos</span> para <span className="font-medium">{lector.nombre}</span>
              </div>
            )}
            
            {/* Botones de acción */}
            <div className={`flex justify-end gap-3 ${esPrestamoMasivo ? 'flex-1' : 'w-full'}`}>
              <button
                onClick={onCancelar}
                disabled={cargando}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 text-sm font-medium disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirmar}
                disabled={cargando}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white rounded-lg transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                {cargando ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Procesando{esPrestamoMasivo ? ` ${ejemplares.length} préstamos...` : '...'}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Confirmar {esPrestamoMasivo ? `${ejemplares.length} Préstamos` : 'Préstamo'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}