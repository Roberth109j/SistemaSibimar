import { useState, useRef, useEffect } from 'react';
import { Search, Book, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { type Libro } from '../types';

interface PasoBuscarLibroProps {
  onBuscar: (codigo: string) => void;
  cargando: boolean;
  libroSeleccionado: Libro | null;
}

export function PasoBuscarLibro({ onBuscar, cargando, libroSeleccionado }: PasoBuscarLibroProps) {
  const [codigoLibro, setCodigoLibro] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus al montar el componente
    inputRef.current?.focus();
  }, []);

  // Validar que sea un ISBN válido (solo dígitos y guiones)
  const esISBNValido = (isbn: string): boolean => {
    // Eliminar guiones y espacios para validar
    const isbnLimpio = isbn.replace(/[-\s]/g, '');
    
    // Verificar que sea numérico y tenga entre 10 y 13 dígitos (ISBN-10 o ISBN-13)
    return /^\d{10,13}$/.test(isbnLimpio);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!codigoLibro.trim()) {
      return;
    }
    
    // Validar que sea un ISBN válido
    if (!esISBNValido(codigoLibro.trim())) {
      setError('Por favor ingrese un ISBN válido (10 o 13 dígitos)');
      return;
    }
    
    // Limpiar error y enviar búsqueda
    setError(null);
    onBuscar(codigoLibro.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setCodigoLibro(valor);
    
    // Limpiar mensaje de error cuando el usuario comienza a escribir de nuevo
    if (error) {
      setError(null);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
            <Book className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Buscar Libro
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Escanee o ingrese el código ISBN del libro
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="codigoLibro" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Código del Libro (ISBN)
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                id="codigoLibro"
                type="text"
                value={codigoLibro}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                placeholder="Ej: 9783161484100"
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
            
            {/* Mensajes de error de validación local */}
            {error && (
              <div className="mt-2 flex items-start gap-1.5 text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p className="text-xs">{error}</p>
              </div>
            )}
            
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Ingrese únicamente el código ISBN (10 o 13 dígitos)
            </p>
          </div>

          <button
            type="submit"
            disabled={cargando || !codigoLibro.trim()}
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
                <span>Buscar Libro</span>
              </>
            )}
          </button>
        </form>

        {/* Sugerencias */}
        <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-lg">
          <p className="text-xs text-blue-800 dark:text-blue-300">
            <strong>Consejo:</strong> Para mayor rapidez, use el lector de código de barras para escanear el ISBN del libro.
          </p>
        </div>
      </div>
    </div>
  );
}