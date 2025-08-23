import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, UserCheck, Calendar, Clock, AlertCircle, Info, BookOpen, Loader2, FileText } from 'lucide-react';
import { type Libro, type Ejemplar, type PrestamoForm, type Lector } from '../types';

interface PasoEscanearEstudianteProps {
  libro: Libro;
  ejemplar: Ejemplar;
  formularioPrestamo: PrestamoForm;
  onActualizarFormulario: (form: PrestamoForm) => void;
  onEscanear: (lector: Lector) => void; // CAMBIO: Ahora recibe un objeto Lector completo
  onVolver: () => void;
  error?: string;
}

const OPCIONES_DEVOLUCION = [
  { dias: 2, etiqueta: '2 días' },
  { dias: 7, etiqueta: '1 semana' },
  { dias: 15, etiqueta: '15 días' },
  { dias: 30, etiqueta: '1 mes' },
];

export function PasoEscanearEstudiante({ 
  libro, 
  ejemplar, 
  formularioPrestamo,
  onActualizarFormulario,
  onEscanear, 
  onVolver,
  error 
}: PasoEscanearEstudianteProps) {
  const [codigoEstudiante, setCodigoEstudiante] = useState('');
  const [verificandoEstudiante, setVerificandoEstudiante] = useState<boolean>(false);
  const [estudianteError, setEstudianteError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Inicializar las observaciones con las que ya tiene el ejemplar
  useEffect(() => {
    if (ejemplar.observaciones && !formularioPrestamo.observaciones) {
      onActualizarFormulario({
        ...formularioPrestamo,
        observaciones: ejemplar.observaciones
      });
    }
  }, [ejemplar.observaciones]);

  // Validar que sea un código de estudiante válido (solo números y letras)
  const esCodigoValido = (codigo: string): boolean => {
    // Permitir códigos alfanuméricos de al menos 3 caracteres
    return /^[A-Za-z0-9]{3,}$/.test(codigo.trim());
  };

  // CAMBIO: Función actualizada para verificar estudiante y obtener información completa
  const verificarEstudiante = (codigo: string) => {
    if (!codigo.trim()) return;
    
    setVerificandoEstudiante(true);
    setEstudianteError(null);
    
    // Usar fetch directamente para manejar cualquier tipo de respuesta
    fetch(`/lectores/buscar?codigo=${encodeURIComponent(codigo)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    })
    .then(response => {
      // Manejar códigos de estado HTTP
      if (!response.ok) {
        // Si es 404 o cualquier error, intentar leer el JSON para obtener el mensaje
        return response.json().then(data => {
          throw new Error(data.message || 'Estudiante no encontrado');
        }).catch(() => {
          throw new Error('Estudiante no encontrado');
        });
      }
      return response.json();
    })
    .then(data => {
      setVerificandoEstudiante(false);
      
      // CAMBIO: Si la respuesta es exitosa, pasar el objeto lector completo
      if (data.success === true && data.lector) {
        // Pasar el objeto lector completo que incluye id, nombre, codigo, etc.
        onEscanear(data.lector);
      } else {
        setEstudianteError('Error: respuesta del servidor no válida');
      }
    })
    .catch(error => {
      console.error('Error al verificar estudiante:', error);
      setVerificandoEstudiante(false);
      
      // Mostrar el mensaje específico del error
      if (error.message) {
        setEstudianteError(error.message);
      } else {
        setEstudianteError('Error al comunicarse con el servidor');
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!codigoEstudiante.trim()) {
      return;
    }
    
    // Validar formato del código
    if (!esCodigoValido(codigoEstudiante.trim())) {
      setEstudianteError('Por favor ingrese un código de estudiante válido');
      return;
    }
    
    // Limpiar error y verificar estudiante
    setEstudianteError(null);
    if (!verificandoEstudiante) {
      verificarEstudiante(codigoEstudiante.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // NO hacer nada al presionar Enter - completamente deshabilitado
      return;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setCodigoEstudiante(valor);
    
    // Limpiar mensajes de error cuando el usuario comienza a escribir
    if (estudianteError) {
      setEstudianteError(null);
    }
  };

  const calcularFechaDevolucion = (dias: number): string => {
    // Parsear la fecha de préstamo y crear una nueva fecha a medianoche
    const [año, mes, dia] = formularioPrestamo.fecha_prestamo.split('-').map(Number);
    const fecha = new Date(año, mes - 1, dia, 0, 0, 0);
    
    let diasAgregados = 0;
    while (diasAgregados < dias) {
      fecha.setDate(fecha.getDate() + 1);
      // Saltar fines de semana
      if (fecha.getDay() !== 0 && fecha.getDay() !== 6) {
        diasAgregados++;
      }
    }
    
    // Formatear fecha resultado (YYYY-MM-DD)
    const añoResultado = fecha.getFullYear();
    const mesResultado = String(fecha.getMonth() + 1).padStart(2, '0');
    const diaResultado = String(fecha.getDate()).padStart(2, '0');
    return `${añoResultado}-${mesResultado}-${diaResultado}`;
  };

  const handleOpcionRapida = (dias: number) => {
    const nuevaFecha = calcularFechaDevolucion(dias);
    onActualizarFormulario({
      ...formularioPrestamo,
      fecha_devolucion: nuevaFecha
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <button
          onClick={onVolver}
          className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-3 text-sm transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver a ejemplares</span>
        </button>
        
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Datos del Préstamo</h3>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{libro.titulo}</p>
              <p className="text-xs text-gray-600 dark:text-gray-300">Ejemplar #{ejemplar.numEjemplar}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="grid md:grid-cols-2 gap-5">
          {/* Columna izquierda - Código del estudiante */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="codigoEstudiante" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Código del lector
                </label>
                <div className="relative">
                  <input
                    ref={inputRef}
                    id="codigoEstudiante"
                    type="text"
                    value={codigoEstudiante}
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Escanee o ingrese el código"
                    className={`w-full px-4 py-2.5 pl-10 pr-4 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-base dark:bg-gray-700 dark:text-white ${
                      estudianteError || error
                        ? 'border-red-300 dark:border-red-600 focus:ring-red-500' 
                        : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                    }`}
                    autoComplete="off"
                    disabled={verificandoEstudiante}
                  />
                  <UserCheck className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
                
                {/* Error del backend (pasado como prop) */}
                {error && (
                  <div className="mt-2 flex items-start gap-1.5 text-red-600 dark:text-red-400">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p className="text-xs">{error}</p>
                  </div>
                )}
                
                {/* Error de validación local */}
                {estudianteError && (
                  <div className="mt-2 flex items-start gap-1.5 text-red-600 dark:text-red-400">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p className="text-xs">{estudianteError}</p>
                  </div>
                )}

                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Escanee o digite el código y configure las fechas antes de continuar
                </p>
              </div>

              <button
                type="submit"
                disabled={!codigoEstudiante.trim() || verificandoEstudiante}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-green-600 to-green-700 dark:from-green-500 dark:to-green-600 text-white rounded-lg text-sm font-medium hover:from-green-700 hover:to-green-800 dark:hover:from-green-600 dark:hover:to-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2"
              >
                {verificandoEstudiante ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verificando...</span>
                  </>
                ) : (
                  'Continuar con el préstamo'
                )}
              </button>
            </form>

            {/* Información adicional */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-800 dark:text-blue-300">
                  <p className="font-medium mb-1">Importante:</p>
                  <p>Use la pistola para escanear el código. Luego ajuste las fechas y haga clic en "Continuar" para proceder.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Columna derecha - Fechas */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Fecha de Préstamo</span>
              </div>
              <input
                type="date"
                value={formularioPrestamo.fecha_prestamo}
                readOnly
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 text-sm"
              />
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Fecha de Devolución</span>
              </div>
              <input
                type="date"
                value={formularioPrestamo.fecha_devolucion}
                onChange={(e) => onActualizarFormulario({
                  ...formularioPrestamo,
                  fecha_devolucion: e.target.value
                })}
                min={formularioPrestamo.fecha_prestamo}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm dark:bg-gray-700 dark:text-white"
              />
              
              {/* Opciones rápidas */}
              <div className="mt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">Selección rápida:</p>
                <div className="flex flex-wrap gap-1.5">
                  {OPCIONES_DEVOLUCION.map((opcion) => (
                    <button
                      key={opcion.dias}
                      type="button"
                      onClick={() => handleOpcionRapida(opcion.dias)}
                      className="px-2.5 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md transition-colors"
                    >
                      {opcion.etiqueta}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Observaciones del estado del ejemplar
              </label>
              <textarea
                value={formularioPrestamo.observaciones}
                onChange={(e) => onActualizarFormulario({
                  ...formularioPrestamo,
                  observaciones: e.target.value
                })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm dark:bg-gray-700 dark:text-white"
                placeholder="Registre el estado actual del ejemplar o agregue nuevas observaciones..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}