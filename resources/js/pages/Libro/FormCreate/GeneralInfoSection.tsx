// components/libros/GeneralInfoSection.tsx
import React from 'react';
import { BookOpen, X } from 'lucide-react';
import { router } from '@inertiajs/react';

interface GeneralInfoSectionProps {
  form: any;
  autores: any[];
  editoriales: any[];
  secciones: any[];
  clases: string[];
  idiomas: string[];
  estanterias: any[];
  seccionId?: number | null;
  onNext: () => void;
}

export default function GeneralInfoSection({
  form,
  autores,
  editoriales,
  secciones,
  clases,
  idiomas,
  estanterias,
  seccionId = null,
  onNext
}: GeneralInfoSectionProps) {
  
  // Función para validar campos obligatorios de esta sección
  const validateSection = () => {
    const requiredFields = {
      isbn: 'ISBN',
      titulo: 'Título',
      autor_id: 'Autor Principal',
      editorial_id: 'Editorial',
      seccion_id: 'Sección',
      clase: 'Clase',
      idioma: 'Idioma'
    };

    const errors = [];
    
    for (const [field, label] of Object.entries(requiredFields)) {
      if (!form.data[field] || form.data[field] === '') {
        errors.push(label);
      }
    }

    // Validación específica para ISBN (debe tener 13 dígitos)
    if (form.data.isbn && !/^\d{13}$/.test(form.data.isbn.replace(/[^0-9]/g, ''))) {
      errors.push('ISBN debe tener exactamente 13 dígitos');
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

  // NUEVA FUNCIÓN: Manejo específico para estantería
  const handleEstanteriaChange = (value: string) => {
    // Si es string vacío, convertir a null
    const processedValue = value === '' ? '' : value;
    form.setData('estanteria_id', processedValue);
  };

  const renderFormField = (id: string, label: string, required: boolean = false, children: React.ReactNode, colSpan: string = "col-span-1") => (
    <div className={colSpan}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {form.errors[id] && (
        <p className="mt-1 text-sm text-red-600">{form.errors[id]}</p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center">
          <BookOpen className="w-5 h-5 mr-2" />
          Información General del Libro
        </h2>
        <p className="text-sm text-blue-600 dark:text-blue-400">
          Proporcione los datos básicos del libro como título, autor y editorial.
        </p>
      </div>
      
      {/* Grid mejorado con mejor distribución */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* ISBN - Ancho completo en móvil, medio en tablet, tercio en desktop */}
        {renderFormField('isbn', 'ISBN', true, 
          <div className="relative rounded-md shadow-sm">
            <input
              type="text"
              id="isbn"
              value={form.data.isbn}
              onChange={e => form.setData('isbn', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 px-3 py-2 text-sm"
              placeholder="9780123456789"
              maxLength={13}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-400 text-xs">
                13 dígitos
              </span>
            </div>
          </div>,
          "col-span-1 md:col-span-1 xl:col-span-1"
        )}
        
        {/* Título - Span de 2 columnas en desktop para darle más espacio */}
        {renderFormField('titulo', 'Título', true, 
          <input
            type="text"
            id="titulo"
            value={form.data.titulo}
            onChange={e => form.setData('titulo', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 px-3 py-2 text-sm"
            placeholder="Ingrese el título del libro"
          />,
          "col-span-1 md:col-span-1 xl:col-span-2"
        )}
        
        {/* Segunda fila - 3 campos con mejor distribución */}
        {/* Autor Principal */}
        {renderFormField('autor_id', 'Autor Principal', true, 
          <select
            id="autor_id"
            value={form.data.autor_id}
            onChange={e => form.setData('autor_id', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 px-3 py-2 text-sm"
          >
            <option value="">Seleccione un autor</option>
            {autores.map(autor => (
              <option key={autor.id} value={autor.id}>
                {`${autor.nombres} ${autor.apellidos}`}
              </option>
            ))}
          </select>,
          "col-span-1 md:col-span-1 xl:col-span-1"
        )}
        
        {/* Editorial */}
        {renderFormField('editorial_id', 'Editorial', true, 
          <select
            id="editorial_id"
            value={form.data.editorial_id}
            onChange={e => form.setData('editorial_id', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 px-3 py-2 text-sm"
          >
            <option value="">Seleccione una editorial</option>
            {editoriales.map(editorial => (
              <option key={editorial.id} value={editorial.id}>
                {editorial.nombre}
              </option>
            ))}
          </select>,
          "col-span-1 md:col-span-1 xl:col-span-1"
        )}
        
        {/* Sección - Automática según el rol del usuario */}
        {renderFormField('seccion_id', 'Sección', true, 
          <select
            id="seccion_id"
            value={form.data.seccion_id}
            onChange={e => form.setData('seccion_id', e.target.value)}
            className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 px-3 py-2 text-sm ${
              seccionId !== null ? 'bg-gray-100 dark:bg-gray-800' : ''
            }`}
            disabled={seccionId !== null}
          >
            <option value="">{seccionId !== null ? 'Sección asignada automáticamente' : 'Seleccione una sección'}</option>
            {secciones.map(seccion => (
              <option key={seccion.id} value={seccion.id}>
                {seccion.nombre}
              </option>
            ))}
          </select>,
          "col-span-1 md:col-span-1 xl:col-span-1"
        )}
        
        {/* Tercera fila - 3 campos */}
        {/* Clase */}
        {renderFormField('clase', 'Clase', true, 
          <select
            id="clase"
            value={form.data.clase}
            onChange={e => form.setData('clase', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 px-3 py-2 text-sm"
          >
            <option value="">Seleccione una clase</option>
            {clases.map(clase => (
              <option key={clase} value={clase}>
                {clase}
              </option>
            ))}
          </select>,
          "col-span-1 md:col-span-1 xl:col-span-1"
        )}
        
        {/* Idioma */}
        {renderFormField('idioma', 'Idioma', true, 
          <select
            id="idioma"
            value={form.data.idioma}
            onChange={e => form.setData('idioma', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 px-3 py-2 text-sm"
          >
            <option value="">Seleccione un idioma</option>
            {idiomas.map(idioma => (
              <option key={idioma} value={idioma}>
                {idioma}
              </option>
            ))}
          </select>,
          "col-span-1 md:col-span-1 xl:col-span-1"
        )}
        
        {/* Estantería - Campo opcional */}
        {renderFormField('estanteria_id', 'Estantería', false, 
          <select
            id="estanteria_id"
            value={form.data.estanteria_id || ''} // Asegurar que nunca sea undefined
            onChange={e => handleEstanteriaChange(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 px-3 py-2 text-sm"
          >
            <option value="">Seleccione una estantería (opcional)</option>
            {estanterias.map(estanteria => (
              <option key={estanteria.id} value={estanteria.id}>
                {estanteria.cod_estante}
              </option>
            ))}
          </select>,
          "col-span-1 md:col-span-1 xl:col-span-1"
        )}
      </div>

      {/* Contenido - Campo de texto amplio que ocupa todo el ancho */}
      <div className="mt-6">
        <label htmlFor="contenido" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Contenido
        </label>
        <textarea
          id="contenido"
          value={form.data.contenido || ''} // Asegurar que nunca sea undefined
          onChange={e => form.setData('contenido', e.target.value)}
          rows={4}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 px-3 py-2 text-sm"
          placeholder="Describa el contenido del libro..."
        />
        {form.errors.contenido && (
          <p className="mt-1 text-sm text-red-600">{form.errors.contenido}</p>
        )}
      </div>
      
      <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
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
          onClick={handleNext}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          Siguiente: Clasificación
        </button>
      </div>
    </div>
  );
}
