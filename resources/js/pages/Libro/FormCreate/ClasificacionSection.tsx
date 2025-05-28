import { useState, useEffect } from 'react';
import { BookmarkIcon, X } from 'lucide-react';
import { router } from '@inertiajs/react';

interface ClasificacionSectionProps {
  form: any;
  categoriasDewey: any[];
  onPrev: () => void;
  onNext: () => void;
  // Nuevos props para mantener estado
  initialCategoriaId?: number | null;
  initialSubcategoriaId?: number | null;
  initialSubcategorias?: any[];
  initialTemas?: any[];
  onStateChange?: (state: {
    categoriaId: number | null;
    subcategoriaId: number | null;
    subcategorias: any[];
    temas: any[];
  }) => void;
}

export default function ClasificacionSection({
  form,
  categoriasDewey,
  onPrev,
  onNext,
  initialCategoriaId = null,
  initialSubcategoriaId = null,
  initialSubcategorias = [],
  initialTemas = [],
  onStateChange
}: ClasificacionSectionProps) {
  const [selectedCategoriaId, setSelectedCategoriaId] = useState<number | null>(initialCategoriaId);
  const [selectedSubcategoriaId, setSelectedSubcategoriaId] = useState<number | null>(initialSubcategoriaId);
  const [loadedSubcategorias, setLoadedSubcategorias] = useState(initialSubcategorias);
  const [loadedTemas, setLoadedTemas] = useState(initialTemas);

  // Efecto para restaurar el estado cuando hay datos iniciales
  useEffect(() => {
    if (initialCategoriaId && initialSubcategorias.length === 0) {
      loadSubcategorias(initialCategoriaId);
    }
    if (initialSubcategoriaId && initialTemas.length === 0) {
      loadTemas(initialSubcategoriaId);
    }
  }, [initialCategoriaId, initialSubcategoriaId]);

  // Efecto para comunicar cambios de estado al componente padre
  useEffect(() => {
    if (onStateChange) {
      onStateChange({
        categoriaId: selectedCategoriaId,
        subcategoriaId: selectedSubcategoriaId,
        subcategorias: loadedSubcategorias,
        temas: loadedTemas
      });
    }
  }, [selectedCategoriaId, selectedSubcategoriaId, loadedSubcategorias, loadedTemas]);

  // Función para validar campos obligatorios de esta sección
  const validateSection = () => {
    const errors = [];
    
    if (!form.data.tema_id || form.data.tema_id === '') {
      errors.push('Debe seleccionar un tema Dewey completo (Categoría → Subcategoría → Tema)');
    }

    return errors;
  };

  // Función para manejar el clic en "Siguiente"
  const handleNext = () => {
    const validationErrors = validateSection();
    
    if (validationErrors.length > 0) {
      const errorMessage = `Por favor complete los siguientes campos obligatorios:\n• ${validationErrors.join('\n• ')}`;
      alert(errorMessage);
      return;
    }
    
    onNext();
  };

  // Función para cancelar y volver al índice
  const handleCancel = () => {
    if (confirm('¿Está seguro que desea cancelar? Se perderán todos los datos ingresados.')) {
      router.visit(route('libros.index'));
    }
  };

  const loadSubcategorias = async (categoriaId: number) => {
    try {
      const response = await fetch(`/api/categorias/${categoriaId}/subcategorias`);
      const data = await response.json();
      setLoadedSubcategorias(data);
      
      // Solo resetear subcategoría si no coincide con la actual
      if (selectedSubcategoriaId && !data.find((sub: any) => sub.id === selectedSubcategoriaId)) {
        setSelectedSubcategoriaId(null);
        setLoadedTemas([]);
        form.setData('tema_id', '');
      }
    } catch (error) {
      console.error('Error al cargar subcategorías:', error);
      alert('Error al cargar las subcategorías. Por favor, intente nuevamente.');
    }
  };

  const loadTemas = async (subcategoriaId: number) => {
    try {
      const response = await fetch(`/api/subcategorias/${subcategoriaId}/temas`);
      const data = await response.json();
      setLoadedTemas(data);
      
      // Solo resetear tema si no coincide con el actual
      if (form.data.tema_id && !data.find((tema: any) => tema.id === parseInt(form.data.tema_id))) {
        form.setData('tema_id', '');
      }
    } catch (error) {
      console.error('Error al cargar temas:', error);
      alert('Error al cargar los temas. Por favor, intente nuevamente.');
    }
  };

  const handleCategoriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoriaId = parseInt(e.target.value);
    setSelectedCategoriaId(categoriaId || null);

    if (categoriaId) {
      loadSubcategorias(categoriaId);
    } else {
      setLoadedSubcategorias([]);
      setSelectedSubcategoriaId(null);
      setLoadedTemas([]);
      form.setData('tema_id', '');
    }
  };

  const handleSubcategoriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const subcategoriaId = parseInt(e.target.value);
    setSelectedSubcategoriaId(subcategoriaId || null);

    if (subcategoriaId) {
      loadTemas(subcategoriaId);
    } else {
      setLoadedTemas([]);
      form.setData('tema_id', '');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold text-purple-800 dark:text-purple-300 mb-2 flex items-center">
          <BookmarkIcon className="w-5 h-5 mr-2" />
          Sistema de Clasificación Dewey
        </h2>
        <p className="text-sm text-purple-600 dark:text-purple-400">
          Seleccione la categoría, subcategoría y tema según el Sistema Decimal Dewey para clasificar el libro correctamente.
        </p>
      </div>
      
      {/* Grid mejorado para mejor distribución */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Categoría Dewey */}
        <div className="space-y-2">
          <label htmlFor="categoria" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            Categoría Dewey <span className="text-red-500">*</span>
          </label>
          <select
            id="categoria"
            value={selectedCategoriaId || ''}
            onChange={handleCategoriaChange}
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 px-3 py-2 text-sm"
          >
            <option value="">Seleccione una categoría</option>
            {categoriasDewey.map(categoria => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nombre}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Clasificación principal del sistema Dewey
          </p>
        </div>

        {/* Subcategoría Dewey */}
        <div className="space-y-2">
          <label htmlFor="subcategoria" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            Subcategoría Dewey <span className="text-red-500">*</span>
          </label>
          <select
            id="subcategoria"
            value={selectedSubcategoriaId || ''}
            onChange={handleSubcategoriaChange}
            disabled={!selectedCategoriaId}
            className={`block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 px-3 py-2 text-sm ${
              !selectedCategoriaId ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-600' : ''
            }`}
          >
            <option value="">Seleccione una subcategoría</option>
            {loadedSubcategorias.map(subcategoria => (
              <option key={subcategoria.id} value={subcategoria.id}>
                {subcategoria.nombre}
              </option>
            ))}
          </select>
          {!selectedCategoriaId ? (
            <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center">
              <span className="inline-block w-1.5 h-1.5 bg-amber-500 rounded-full mr-1"></span>
              Primero seleccione una categoría
            </p>
          ) : (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Subdivisión específica de la categoría
            </p>
          )}
        </div>

        {/* Tema Dewey */}
        <div className="space-y-2">
          <label htmlFor="tema_id" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            Tema Dewey <span className="text-red-500">*</span>
          </label>
          <select
            id="tema_id"
            value={form.data.tema_id}
            onChange={e => form.setData('tema_id', e.target.value)}
            disabled={!selectedSubcategoriaId}
            className={`block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 px-3 py-2 text-sm ${
              !selectedSubcategoriaId ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-600' : ''
            }`}
          >
            <option value="">Seleccione un tema</option>
            {loadedTemas.map(tema => (
              <option key={tema.id} value={tema.id}>
                {tema.nombre}
              </option>
            ))}
          </select>
          {!selectedSubcategoriaId ? (
            <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center">
              <span className="inline-block w-1.5 h-1.5 bg-amber-500 rounded-full mr-1"></span>
              Primero seleccione una subcategoría
            </p>
          ) : (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Tema específico para la clasificación
            </p>
          )}
          {form.errors.tema_id && (
            <p className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded-md border-l-2 border-red-500">
              {form.errors.tema_id}
            </p>
          )}
        </div>
      </div>

      {/* Visualización de la selección mejorada */}
      {selectedCategoriaId && selectedSubcategoriaId && form.data.tema_id && (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
            <BookmarkIcon className="w-4 h-4 mr-2 text-green-600" />
            Clasificación Seleccionada
          </h3>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full text-xs font-medium">
              <span className="inline-block w-1.5 h-1.5 bg-purple-500 rounded-full mr-1"></span>
              {categoriasDewey.find(c => c.id === selectedCategoriaId)?.nombre}
            </div>
            <span className="flex items-center text-gray-400 text-xs">→</span>
            <div className="flex items-center px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 rounded-full text-xs font-medium">
              <span className="inline-block w-1.5 h-1.5 bg-indigo-500 rounded-full mr-1"></span>
              {loadedSubcategorias.find(s => s.id === selectedSubcategoriaId)?.nombre}
            </div>
            <span className="flex items-center text-gray-400 text-xs">→</span>
            <div className="flex items-center px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-medium">
              <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full mr-1"></span>
              {loadedTemas.find(t => t.id === parseInt(form.data.tema_id))?.nombre}
            </div>
          </div>
          <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded border-l-2 border-green-500">
            <p className="text-xs text-green-800 dark:text-green-200">
              ✓ Clasificación Dewey completa y válida
            </p>
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm"
          >
            <X className="w-4 h-4" />
            Cancelar
          </button>
          
          <button
            type="button"
            onClick={onPrev}
            className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
          >
            ← Anterior: Información General
          </button>
        </div>
        
        <button
          type="button"
          onClick={handleNext}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          Siguiente: Detalles →
        </button>
      </div>
    </div>
  );
}