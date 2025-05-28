// components/libros/DetallesSection.tsx
import { Info, Save, Calendar, X } from 'lucide-react';
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
  
  const renderFormField = (id: string, label: string, required: boolean = false, children: React.ReactNode) => (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {form.errors[id] && (
        <p className="text-sm text-red-600">{form.errors[id]}</p>
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Tomo */}
        {renderFormField('tomo', 'Tomo', false, 
          <input
            type="number"
            id="tomo"
            min="1"
            value={form.data.tomo}
            onChange={e => form.setData('tomo', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
            placeholder="Número de tomo"
          />
        )}
        
        {/* Edición */}
        {renderFormField('edicion', 'Edición', false, 
          <input
            type="text"
            id="edicion"
            value={form.data.edicion}
            onChange={e => form.setData('edicion', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
            placeholder="Ej: Primera edición"
          />
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
              placeholder="Ej: 2023"
              className="block w-full pr-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        )}
        
        {/* Fecha de Ingreso */}
        {renderFormField('fecha_ingreso', 'Fecha de Ingreso', true, 
          <input
            type="date"
            id="fecha_ingreso"
            value={form.data.fecha_ingreso}
            onChange={e => form.setData('fecha_ingreso', e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
          />
        )}
        
        {/* Precio */}
        {renderFormField('precio', 'Precio', false, 
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 text-sm">$</span>
            </div>
            <input
              type="number"
              id="precio"
              step="0.01"
              min="0"
              value={form.data.precio}
              onChange={e => form.setData('precio', e.target.value)}
              className="block w-full pl-8 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
              placeholder="0.00"
            />
          </div>
        )}
        
        {/* Edad Recomendada */}
        {renderFormField('edad_recomendada', 'Edad Recomendada', false, 
          <div className="flex">
            <input
              type="number"
              id="edad_recomendada"
              min="0"
              value={form.data.edad_recomendada}
              onChange={e => form.setData('edad_recomendada', e.target.value)}
              className="flex-1 rounded-l-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
              placeholder="Ej: 12"
            />
            <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm dark:bg-gray-600 dark:border-gray-600 dark:text-gray-300">
              años
            </span>
          </div>
        )}
        
        {/* Número de Páginas */}
        {renderFormField('paginas', 'Número de Páginas', false, 
          <div className="flex">
            <input
              type="number"
              id="paginas"
              min="1"
              value={form.data.paginas}
              onChange={e => form.setData('paginas', e.target.value)}
              className="flex-1 rounded-l-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
              placeholder="Número de páginas"
            />
            <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm dark:bg-gray-600 dark:border-gray-600 dark:text-gray-300">
              págs.
            </span>
          </div>
        )}
      </div>

      {/* Nota informativa sobre campos opcionales */}
      <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
        <div className="flex">
          <Info className="h-5 w-5 text-gray-400 mt-0.5" />
          <div className="ml-3">
            <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200">
              Campos opcionales
            </h4>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Todos los campos en esta sección son opcionales excepto la <strong>Fecha de Ingreso</strong>. 
              Puede completarlos ahora o editarlos más tarde según sea necesario.
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancelar
          </button>
          
          <button
            type="button"
            onClick={onPrev}
            className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Anterior: Clasificación
          </button>
        </div>
        
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={form.processing}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <Save className="w-5 h-5" />
          {form.processing ? 'Guardando...' : 'Guardar Libro'}
        </button>
      </div>
    </div>
  );
}