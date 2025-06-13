import { X, CheckCircle, Book, User, Calendar, Clock, FileText, Loader2 } from 'lucide-react';
import { type Libro, type Ejemplar, type PrestamoForm } from '../types';

interface ResumenPrestamoProps {
  libro: Libro;
  ejemplar: Ejemplar;
  codigoEstudiante: string;
  formularioPrestamo: PrestamoForm;
  onConfirmar: () => void;
  onCancelar: () => void;
  cargando: boolean;
}

export function ResumenPrestamo({
  libro,
  ejemplar,
  codigoEstudiante,
  formularioPrestamo,
  onConfirmar,
  onCancelar,
  cargando
}: ResumenPrestamoProps) {
  // Formatear fecha para mostrar
  const formatearFecha = (fecha: string): string => {
    // Parsear la fecha con la hora fija a medianoche para evitar problemas de zona horaria
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
    // Parsear fechas con hora fija a medianoche
    const [añoInicio, mesInicio, diaInicio] = formularioPrestamo.fecha_prestamo.split('-').map(Number);
    const [añoFin, mesFin, diaFin] = formularioPrestamo.fecha_devolucion.split('-').map(Number);
    
    const inicio = new Date(añoInicio, mesInicio - 1, diaInicio, 0, 0, 0);
    const fin = new Date(añoFin, mesFin - 1, diaFin, 0, 0, 0);
    
    const diferencia = fin.getTime() - inicio.getTime();
    return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl shadow-2xl transform transition-all">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Confirmar Préstamo
              </h3>
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

        {/* Contenido */}
        <div className="p-4 space-y-5">
          {/* Resumen del préstamo */}
          <div className="bg-gray-50 dark:bg-gray-700/40 rounded-lg p-4 space-y-3.5">
            <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-3">Resumen del Préstamo</h4>
            
            {/* Libro */}
            <div className="flex items-start gap-2.5">
              <Book className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-600 dark:text-gray-300">Libro</p>
                <p className="font-medium text-gray-900 dark:text-white text-sm">{libro.titulo}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  ISBN: {libro.isbn}
                  {libro.autor && ` • Autor: ${libro.autor.nombres} ${libro.autor.apellidos}`}
                </p>
              </div>
            </div>

            {/* Ejemplar */}
            <div className="flex items-start gap-2.5">
              <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-600 dark:text-gray-300">Ejemplar</p>
                <p className="font-medium text-gray-900 dark:text-white text-sm">
                  Ejemplar #{ejemplar.numEjemplar}
                </p>
              </div>
            </div>

            {/* Estudiante */}
            <div className="flex items-start gap-2.5">
              <User className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-600 dark:text-gray-300">Código del Estudiante</p>
                <p className="font-medium text-gray-900 dark:text-white text-sm">{codigoEstudiante}</p>
              </div>
            </div>

            {/* Fechas */}
            <div className="grid md:grid-cols-2 gap-3">
              <div className="flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-gray-600 dark:text-gray-300">Fecha de Préstamo</p>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {formatearFecha(formularioPrestamo.fecha_prestamo)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-gray-600 dark:text-gray-300">Fecha de Devolución</p>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
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
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">Observaciones</p>
                <p className="text-gray-900 dark:text-white text-sm">{formularioPrestamo.observaciones}</p>
              </div>
            )}
          </div>

          {/* Mensaje informativo */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-lg p-3">
            <p className="text-xs text-blue-800 dark:text-blue-300">
              <strong>Importante:</strong> El estudiante debe devolver el libro en la fecha indicada. 
              Se aplicarán sanciones por retrasos en la devolución.
            </p>
          </div>
        </div>

        {/* Footer con acciones */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex justify-end gap-3">
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
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 dark:from-green-500 dark:to-green-600 text-white rounded-lg hover:from-green-700 hover:to-green-800 dark:hover:from-green-600 dark:hover:to-green-700 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {cargando ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Confirmar Préstamo</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}