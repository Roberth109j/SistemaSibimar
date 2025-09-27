import { useState, useRef, useEffect } from 'react';
import { Search, Book, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { type Libro } from '../types';

interface PasoBuscarLibroProps {
  onBuscar: (codigo: string) => void;
  cargando: boolean;
  libroSeleccionado: Libro | null;
}

export function PasoBuscarLibro({ onBuscar, cargando, libroSeleccionado }: PasoBuscarLibroProps) {
  const [codigoMaterial, setCodigoMaterial] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus al montar el componente
    inputRef.current?.focus();
  }, []);

  // Validar que sea un código válido (ISBN o ISSN)
  const esCodigoValido = (codigo: string): boolean => {
    // Eliminar guiones, espacios y otros caracteres no numéricos para validar
    const codigoLimpio = codigo.replace(/[-\s]/g, '');
    
    // Verificar que sea numérico y tenga longitud válida:
    // - ISBN-10: 10 dígitos
    // - ISBN-13: 13 dígitos  
    // - ISSN: 8 dígitos
    return /^\d{8}$/.test(codigoLimpio) || /^\d{10}$/.test(codigoLimpio) || /^\d{13}$/.test(codigoLimpio);
  };

  // Determinar el tipo de código basado en la longitud
  const determinarTipoCodigo = (codigo: string): string => {
    const codigoLimpio = codigo.replace(/[-\s]/g, '');
    
    if (/^\d{8}$/.test(codigoLimpio)) {
      return 'ISSN (Revista)';
    } else if (/^\d{10}$/.test(codigoLimpio)) {
      return 'ISBN-10 (Libro)';
    } else if (/^\d{13}$/.test(codigoLimpio)) {
      return 'ISBN-13 (Libro)';
    }
    return 'Código desconocido';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!codigoMaterial.trim()) {
      return;
    }
    
    // Validar que sea un código válido
    if (!esCodigoValido(codigoMaterial.trim())) {
      setError('Por favor ingrese un código válido: ISBN (10 o 13 dígitos) para libros o ISSN (8 dígitos) para revistas');
      return;
    }
    
    // Limpiar error y enviar búsqueda
    setError(null);
    onBuscar(codigoMaterial.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setCodigoMaterial(valor);
    
    // Limpiar mensaje de error cuando el usuario comienza a escribir de nuevo
    if (error) {
      setError(null);
    }
  };

  // Obtener información del código actual
  const codigoInfo = codigoMaterial.trim() ? determinarTipoCodigo(codigoMaterial.trim()) : null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
            <Book className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Buscar Material
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Escanee o ingrese el código ISBN (libros) o ISSN (revistas)
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="codigoMaterial" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Código del Material (ISBN/ISSN)
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                id="codigoMaterial"
                type="text"
                value={codigoMaterial}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                placeholder="Ej: 9783161484100 (ISBN) o 12345678 (ISSN)"
                className={`w-full px-4 py-2.5 pl-10 pr-4 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-base dark:bg-gray-700 dark:text-white ${
                  error 
                    ? 'border-red-300 dark:border-red-600 focus:ring-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                }`}
                disabled={cargando}
                autoComplete="off"
              />
              <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            
            {/* Indicador de tipo de código */}
            {codigoInfo && !error && (
              <div className="mt-2 flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                <CheckCircle className="w-4 h-4" />
                <p className="text-xs font-medium">{codigoInfo}</p>
              </div>
            )}
            
            {/* Mensajes de error de validación local */}
            {error && (
              <div className="mt-2 flex items-start gap-1.5 text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p className="text-xs">{error}</p>
              </div>
            )}
            
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Formatos válidos: ISBN (10-13 dígitos) para libros, ISSN (8 dígitos) para revistas
            </p>
          </div>

          <button
            type="submit"
            disabled={cargando || !codigoMaterial.trim()}
            className="w-full py-2.5 px-5 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
          >
            {cargando ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Buscando...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Buscar Material</span>
              </>
            )}
          </button>
        </form>

        {/* Información de tipos de código */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-lg">
          <div className="space-y-2">
            <p className="text-xs text-blue-800 dark:text-blue-300 font-medium">
              Tipos de código aceptados:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>ISBN:</strong> Libros (10 o 13 dígitos)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>ISSN:</strong> Revistas (8 dígitos)
                </span>
              </div>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
              <strong>Consejo:</strong> Use el lector de código de barras para mayor rapidez y precisión.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}