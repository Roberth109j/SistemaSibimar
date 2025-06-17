import { useState } from 'react';
import { ArrowLeft, CheckCircle, ChevronDown } from 'lucide-react';
import { type Libro, type Ejemplar } from '../types';

interface PasoSeleccionarEjemplarProps {
  libro: Libro;
  ejemplares: Ejemplar[];
  onSeleccionar: (ejemplar: Ejemplar) => void;
  onVolver: () => void;
  ejemplarSeleccionado: Ejemplar | null;
}

export function PasoSeleccionarEjemplar({ 
  libro, 
  ejemplares, 
  onSeleccionar, 
  onVolver,
  ejemplarSeleccionado 
}: PasoSeleccionarEjemplarProps) {
  // Filtramos ejemplares disponibles directamente
  const ejemplaresDisponibles = ejemplares.filter(ejemplar => ejemplar.estado === 'DISPONIBLE');
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <button
          onClick={onVolver}
          className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-3 text-sm transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver a búsqueda</span>
        </button>
        
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{libro.titulo}</h3>
          <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-600 dark:text-gray-300">
            <span>ISBN: {libro.isbn}</span>
            {libro.autor && (
              <span>Autor: {libro.autor.nombres} {libro.autor.apellidos}</span>
            )}
            {libro.editorial && (
              <span>Editorial: {libro.editorial.nombre}</span>
            )}
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Seleccionar ejemplar disponible
          </span>
          <span className="text-xs text-green-600 dark:text-green-400">
            {ejemplaresDisponibles.length} ejemplares disponibles
          </span>
        </div>
        
        {/* Selector de ejemplares */}
        <div className="relative mb-4">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg py-2.5 px-3 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            aria-haspopup="listbox"
            aria-expanded={dropdownOpen}
          >
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {ejemplarSeleccionado 
                ? `Ejemplar #${ejemplarSeleccionado.numEjemplar}` 
                : "Seleccione un ejemplar disponible"
              }
            </span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
          
          {/* Lista desplegable */}
          {dropdownOpen && (
            <div className="absolute inset-x-0 mt-1 w-full z-10">
              <div className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-md max-h-52 overflow-auto">
                <ul className="py-1" role="listbox">
                  {ejemplaresDisponibles.map((ejemplar) => (
                    <li 
                      key={ejemplar.id}
                      className={`px-3 py-2 flex items-center gap-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 ${
                        ejemplarSeleccionado?.id === ejemplar.id 
                          ? 'bg-blue-50 dark:bg-blue-900/20' 
                          : ''
                      }`}
                      onClick={() => {
                        onSeleccionar(ejemplar);
                        setDropdownOpen(false);
                      }}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          Ejemplar #{ejemplar.numEjemplar}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Ejemplar seleccionado (información) */}
        {ejemplarSeleccionado && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              <p className="text-green-800 dark:text-green-200 text-sm font-medium">
                Ejemplar #{ejemplarSeleccionado.numEjemplar} seleccionado
              </p>
            </div>
          </div>
        )}

        {/* Botón continuar */}
        {ejemplarSeleccionado && (
          <div className="mt-4">
            <button
              onClick={() => onSeleccionar(ejemplarSeleccionado)}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 transition-all duration-200 shadow-sm"
            >
              Continuar con este ejemplar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}