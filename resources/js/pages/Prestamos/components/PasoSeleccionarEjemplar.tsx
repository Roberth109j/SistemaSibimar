import { useState } from 'react';
import { ArrowLeft, CheckCircle, ChevronDown, Square, CheckSquare, Users, Hash } from 'lucide-react';
import { type Libro, type Ejemplar, obtenerTipoCodigo, obtenerCodigoPrincipal } from '../types';

interface PasoSeleccionarEjemplarProps {
  libro: Libro;
  ejemplares: Ejemplar[];
  onSeleccionar: (ejemplar: Ejemplar | Ejemplar[]) => void;
  onVolver: () => void;
  ejemplarSeleccionado: Ejemplar | null;
  // PROPS para préstamos masivos
  tipoPrestamo?: 'individual' | 'masivo';
  ejemplaresSeleccionados?: Ejemplar[];
}

export function PasoSeleccionarEjemplar({ 
  libro, 
  ejemplares, 
  onSeleccionar, 
  onVolver,
  ejemplarSeleccionado,
  tipoPrestamo = 'individual',
  ejemplaresSeleccionados = []
}: PasoSeleccionarEjemplarProps) {
  // Filtramos ejemplares disponibles directamente
  const ejemplaresDisponibles = ejemplares.filter(ejemplar => ejemplar.estado === 'DISPONIBLE');
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  
  // Estado local para préstamos masivos
  const [ejemplaresSeleccionadosLocal, setEjemplaresSeleccionadosLocal] = useState<Ejemplar[]>(ejemplaresSeleccionados);
  
  // Estado para la cantidad a prestar
  const [cantidadAPrestar, setCantidadAPrestar] = useState<string>('');
  const [modoSeleccion, setModoSeleccion] = useState<'manual' | 'cantidad'>('manual');

  // Obtener información del código del libro
  const tipoCodigo = obtenerTipoCodigo(libro);
  const codigoPrincipal = obtenerCodigoPrincipal(libro);

  // Función para manejar selección individual en préstamo masivo
  const handleToggleEjemplarMasivo = (ejemplar: Ejemplar) => {
    setEjemplaresSeleccionadosLocal(prev => {
      const yaSeleccionado = prev.some(e => e.id === ejemplar.id);
      if (yaSeleccionado) {
        return prev.filter(e => e.id !== ejemplar.id);
      } else {
        return [...prev, ejemplar];
      }
    });
  };

  // Seleccionar todos los ejemplares
  const handleSeleccionarTodos = () => {
    setEjemplaresSeleccionadosLocal(ejemplaresDisponibles);
  };

  // Deseleccionar todos los ejemplares
  const handleDeseleccionarTodos = () => {
    setEjemplaresSeleccionadosLocal([]);
  };

  // Manejar cambio en el campo de cantidad
  const handleCantidadChange = (value: string) => {
    setCantidadAPrestar(value);
    // Si el valor es válido, seleccionar automáticamente
    const cantidad = parseInt(value);
    if (cantidad > 0 && cantidad <= ejemplaresDisponibles.length) {
      const ejemplaresASeleccionar = ejemplaresDisponibles.slice(0, cantidad);
      setEjemplaresSeleccionadosLocal(ejemplaresASeleccionar);
    } else if (value === '') {
      setEjemplaresSeleccionadosLocal([]);
    }
  };

  // Verificar si un ejemplar está seleccionado
  const estaSeleccionado = (ejemplar: Ejemplar): boolean => {
    return ejemplaresSeleccionadosLocal.some(e => e.id === ejemplar.id);
  };

  // Continuar con préstamo masivo
  const handleContinuarMasivo = () => {
    if (ejemplaresSeleccionadosLocal.length > 0) {
      onSeleccionar(ejemplaresSeleccionadosLocal);
    }
  };

  // SI ES PRÉSTAMO MASIVO
  if (tipoPrestamo === 'masivo') {
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
              <span>{tipoCodigo}: {codigoPrincipal}</span>
              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                {libro.clase}
              </span>
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
          {/* Información y controles principales */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Selección Masiva de Ejemplares
                </span>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-xs text-blue-600 dark:text-blue-400">
                    {ejemplaresDisponibles.length} disponibles
                  </span>
                  <span className="text-xs text-blue-600 dark:text-blue-400">
                    {ejemplaresSeleccionadosLocal.length} seleccionados
                  </span>
                </div>
              </div>
            </div>

            {/* Selector de modo */}
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setModoSeleccion('manual')}
                className={`px-3 py-2 text-xs rounded-md font-medium transition-all duration-200 ${
                  modoSeleccion === 'manual'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Manual
              </button>
              <button
                onClick={() => setModoSeleccion('cantidad')}
                className={`px-3 py-2 text-xs rounded-md font-medium transition-all duration-200 ${
                  modoSeleccion === 'cantidad'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Por Cantidad
              </button>
            </div>
          </div>

          {/* Campo de cantidad (cuando modo es 'cantidad') */}
          {modoSeleccion === 'cantidad' && (
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                  <Hash className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                    ¿Cuántos ejemplares desea prestar?
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max={ejemplaresDisponibles.length}
                      value={cantidadAPrestar}
                      onChange={(e) => handleCantidadChange(e.target.value)}
                      placeholder="Ingrese cantidad"
                      className="w-32 px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                    <span className="text-sm text-blue-600 dark:text-blue-400">
                      de {ejemplaresDisponibles.length} disponibles
                    </span>
                  </div>
                  {cantidadAPrestar && parseInt(cantidadAPrestar) > ejemplaresDisponibles.length && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      La cantidad no puede ser mayor a los ejemplares disponibles
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Controles de selección masiva (solo en modo manual) */}
          {modoSeleccion === 'manual' && (
            <div className="flex items-center justify-end gap-2 mb-4">
              <button
                onClick={handleSeleccionarTodos}
                disabled={ejemplaresSeleccionadosLocal.length === ejemplaresDisponibles.length}
                className="px-3 py-2 text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors duration-200"
              >
                Seleccionar todos
              </button>
              
              <button
                onClick={handleDeseleccionarTodos}
                disabled={ejemplaresSeleccionadosLocal.length === 0}
                className="px-3 py-2 text-xs bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors duration-200"
              >
                Deseleccionar todos
              </button>
            </div>
          )}

          {/* Lista de ejemplares */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="max-h-96 overflow-y-auto">
              {ejemplaresDisponibles.length > 0 ? (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {ejemplaresDisponibles.map((ejemplar, index) => {
                    const seleccionado = estaSeleccionado(ejemplar);
                    const esSeleccionadoPorCantidad = modoSeleccion === 'cantidad' && 
                      parseInt(cantidadAPrestar) > 0 && 
                      index < parseInt(cantidadAPrestar);
                    
                    return (
                      <div
                        key={ejemplar.id}
                        className={`flex items-center gap-3 p-3 transition-all duration-200 ${
                          seleccionado 
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        } ${modoSeleccion === 'manual' ? 'cursor-pointer' : ''}`}
                        onClick={modoSeleccion === 'manual' ? () => handleToggleEjemplarMasivo(ejemplar) : undefined}
                      >
                        {/* Checkbox personalizado */}
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                          seleccionado
                            ? 'bg-blue-600 border-blue-600'
                            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                        }`}>
                          {seleccionado ? (
                            <CheckSquare className="w-3 h-3 text-white" />
                          ) : (
                            <Square className="w-3 h-3 text-transparent" />
                          )}
                        </div>

                        {/* Información del ejemplar */}
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              Ejemplar #{ejemplar.numEjemplar}
                            </span>
                            {ejemplar.observaciones && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                                {ejemplar.observaciones}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                              {ejemplar.estado}
                            </div>
                            {modoSeleccion === 'cantidad' && esSeleccionadoPorCantidad && (
                              <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">
                                #{index + 1}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-600 dark:text-gray-300 font-medium">
                    No hay ejemplares disponibles
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Resumen de selección */}
          {ejemplaresSeleccionadosLocal.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-blue-800 dark:text-blue-200 font-medium text-sm">
                    {ejemplaresSeleccionadosLocal.length} ejemplares seleccionados
                  </span>
                  {modoSeleccion === 'cantidad' && (
                    <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">
                      por cantidad
                    </span>
                  )}
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  {ejemplaresSeleccionadosLocal.map(e => `#${e.numEjemplar}`).join(', ')}
                </div>
              </div>
            </div>
          )}

          {/* Botón continuar */}
          {ejemplaresSeleccionadosLocal.length > 0 && (
            <div className="mt-4">
              <button
                onClick={handleContinuarMasivo}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 transition-all duration-200 shadow-sm flex items-center justify-center gap-2"
              >
                <Users className="w-4 h-4" />
                <span>Continuar con {ejemplaresSeleccionadosLocal.length} ejemplares</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // FLUJO ORIGINAL PARA PRÉSTAMO INDIVIDUAL
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
            <span>{tipoCodigo}: {codigoPrincipal}</span>
            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
              {libro.clase}
            </span>
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
          <span className="text-xs text-blue-600 dark:text-blue-400">
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
                        <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-blue-600 dark:text-blue-400" />
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
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <p className="text-blue-800 dark:text-blue-200 text-sm font-medium">
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