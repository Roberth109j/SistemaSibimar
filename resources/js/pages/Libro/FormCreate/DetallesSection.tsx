import { Info, Save, Calendar, X, DollarSign, Clock, BookOpen, Hash } from 'lucide-react';
import { router } from '@inertiajs/react';

interface DetallesSectionProps {
  form: any;
  onPrev: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function DetallesSection({
  form,
  onPrev,
  onSubmit
}: DetallesSectionProps) {
  
  // Función para validar campos obligatorios de esta sección
  const validateSection = () => {
    const requiredFields = {
      fecha_ingreso: 'Fecha de Ingreso'
    };

    const errors = [];
    
    for (const [field, label] of Object.entries(requiredFields)) {
      if (!form.data[field] || form.data[field] === '') {
        errors.push(label);
      }
    }

    // Validaciones específicas
    if (form.data.fecha_ingreso && new Date(form.data.fecha_ingreso) > new Date()) {
      errors.push('La fecha de ingreso no puede ser futura');
    }

    if (form.data.paginas && parseInt(form.data.paginas) <= 0) {
      errors.push('El número de páginas debe ser mayor a 0');
    }

    if (form.data.precio && parseFloat(form.data.precio) < 0) {
      errors.push('El precio no puede ser negativo');
    }

    if (form.data.edad_recomendada && parseInt(form.data.edad_recomendada) < 0) {
      errors.push('La edad recomendada no puede ser negativa');
    }

    if (form.data.anio && (parseInt(form.data.anio) < 1000 || parseInt(form.data.anio) > new Date().getFullYear())) {
      errors.push(`El año debe estar entre 1000 y ${new Date().getFullYear()}`);
    }

    return errors;
  };

  // Función para manejar el envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateSection();
    
    if (validationErrors.length > 0) {
      const errorMessage = `Por favor corrija los siguientes errores:\n• ${validationErrors.join('\n• ')}`;
      alert(errorMessage);
      return;
    }
    
    onSubmit(e);
  };

  // Función para cancelar y volver al índice
  const handleCancel = () => {
    if (confirm('¿Está seguro que desea cancelar? Se perderán todos los datos ingresados.')) {
      router.visit(route('libros.index'));
    }
  };
  
  const renderFormField = (
    id: string, 
    label: string, 
    required: boolean = false, 
    children: React.ReactNode, 
    colSpan: string = "col-span-1",
    icon?: React.ReactNode,
    helpText?: string
  ) => (
    <div className={colSpan}>
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
        <div className="flex items-center gap-2">
          {icon}
          {label} {required && <span className="text-red-500">*</span>}
        </div>
      </label>
      {children}
      {helpText && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{helpText}</p>
      )}
      {form.errors[id] && (
        <p className="mt-1 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded border-l-2 border-red-500">
          {form.errors[id]}
        </p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-2 flex items-center">
          <Info className="w-5 h-5 mr-2" />
          Detalles Adicionales
        </h2>
        <p className="text-sm text-green-600 dark:text-green-400">
          Complete la información adicional sobre el libro como año de publicación, precios y características físicas.
        </p>
      </div>
      
      {/* Sección de Información de Publicación */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center border-b border-gray-200 dark:border-gray-700 pb-2">
          <BookOpen className="w-4 h-4 mr-2 text-blue-600" />
          Información de Publicación
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Tomo */}
          {renderFormField('tomo', 'Tomo', false, 
            <input
              type="number"
              id="tomo"
              min="1"
              value={form.data.tomo}
              onChange={e => form.setData('tomo', e.target.value)}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 px-3 py-2 text-sm"
              placeholder="Ej: 1, 2, 3"
            />,
            "col-span-1",
            <Hash className="w-4 h-4 text-gray-500" />,
            "Número de tomo si aplica"
          )}
          
          {/* Edición */}
          {renderFormField('edicion', 'Edición', false, 
            <input
              type="text"
              id="edicion"
              value={form.data.edicion}
              onChange={e => form.setData('edicion', e.target.value)}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 px-3 py-2 text-sm"
              placeholder="Ej: Primera edición"
            />,
            "col-span-1",
            <BookOpen className="w-4 h-4 text-gray-500" />,
            "Especifique la edición"
          )}
          
          {/* Año de Publicación */}
          {renderFormField('anio', 'Año de Publicación', false, 
            <div className="relative">
              <input
                type="number"
                id="anio"
                min="1000"
                max={new Date().getFullYear()}
                value={form.data.anio}
                onChange={e => form.setData('anio', e.target.value)}
                placeholder={`Ej: ${new Date().getFullYear()}`}
                className="block w-full pr-10 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 px-3 py-2 text-sm"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Calendar className="h-4 w-4 text-gray-400" />
              </div>
            </div>,
            "col-span-1",
            <Calendar className="w-4 h-4 text-gray-500" />,
            `Entre 1000 y ${new Date().getFullYear()}`
          )}
          
          {/* Fecha de Ingreso */}
          {renderFormField('fecha_ingreso', 'Fecha de Ingreso', true, 
            <input
              type="date"
              id="fecha_ingreso"
              value={form.data.fecha_ingreso}
              onChange={e => form.setData('fecha_ingreso', e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 px-3 py-2 text-sm"
            />,
            "col-span-1",
            <Clock className="w-4 h-4 text-gray-500" />,
            "Fecha de ingreso al sistema"
          )}
        </div>
      </div>

      {/* Sección de Detalles Físicos y Comerciales */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center border-b border-gray-200 dark:border-gray-700 pb-2">
          <DollarSign className="w-4 h-4 mr-2 text-green-600" />
          Detalles Físicos y Comerciales
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* Precio */}
          {renderFormField('precio', 'Precio', false, 
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 text-sm font-medium">$</span>
              </div>
              <input
                type="number"
                id="precio"
                step="0.01"
                min="0"
                value={form.data.precio}
                onChange={e => form.setData('precio', e.target.value)}
                className="block w-full pl-8 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 px-3 py-2 text-sm"
                placeholder="0.00"
              />
            </div>,
            "col-span-1",
            <DollarSign className="w-4 h-4 text-gray-500" />,
            "Precio en moneda local"
          )}
          
          {/* Edad Recomendada */}
          {renderFormField('edad_recomendada', 'Edad Recomendada', false, 
            <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
              <input
                type="number"
                id="edad_recomendada"
                min="0"
                value={form.data.edad_recomendada}
                onChange={e => form.setData('edad_recomendada', e.target.value)}
                className="flex-1 border-0 focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 px-3 py-2 text-sm"
                placeholder="Ej: 12"
              />
              <span className="inline-flex items-center px-3 bg-gray-50 text-gray-500 text-sm dark:bg-gray-600 dark:text-gray-300">
                años
              </span>
            </div>,
            "col-span-1",
            <Clock className="w-4 h-4 text-gray-500" />,
            "Edad mínima recomendada"
          )}
          
          {/* Número de Páginas */}
          {renderFormField('paginas', 'Número de Páginas', false, 
            <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
              <input
                type="number"
                id="paginas"
                min="1"
                value={form.data.paginas}
                onChange={e => form.setData('paginas', e.target.value)}
                className="flex-1 border-0 focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 px-3 py-2 text-sm"
                placeholder="Ej: 250"
              />
              <span className="inline-flex items-center px-3 bg-gray-50 text-gray-500 text-sm dark:bg-gray-600 dark:text-gray-300">
                págs.
              </span>
            </div>,
            "col-span-1",
            <BookOpen className="w-4 h-4 text-gray-500" />,
            "Total de páginas del libro"
          )}
        </div>
      </div>

      {/* Nota informativa mejorada */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Info className="h-5 w-5 text-blue-500 mt-1" />
          </div>
          <div className="ml-3">
            <h4 className="text-base font-semibold text-blue-800 dark:text-blue-200 mb-2">
              Información sobre campos opcionales
            </h4>
            <div className="text-blue-700 dark:text-blue-300 space-y-2">
              <p className="text-sm">
                Todos los campos en esta sección son <strong>opcionales</strong> excepto la <strong className="text-blue-900 dark:text-blue-100">Fecha de Ingreso</strong>.
              </p>
              <p className="text-sm">
                Puede completarlos ahora o editarlos más tarde según sea necesario para enriquecer la información del libro.
              </p>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  <span>Datos de publicación</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  <span>Información comercial</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                  <span>Características físicas</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                  <span>Clasificación por edad</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
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
            ← Anterior: Clasificación
          </button>
        </div>
        
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={form.processing}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
        >
          <Save className="w-4 h-4" />
          {form.processing ? 'Guardando...' : 'Guardar Libro'}
        </button>
      </div>
    </div>
  );
}
    