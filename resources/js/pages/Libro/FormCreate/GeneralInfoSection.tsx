// components/libros/GeneralInfoSection.tsx
import React, { useState, useEffect } from 'react';
import { BookOpen, X } from 'lucide-react';
import { router } from '@inertiajs/react';
import CreateAutorInline from '../InlineCreate/CreateAutorInline';
import CreateEditorialInline from '../InlineCreate/CreateEditorialInline';
import CreateEstanteriaInline from '../InlineCreate/CreateEstanteriaInline';
import { AlertProvider } from '@/components/AlertNotification';

interface GeneralInfoSectionProps {
  form: any;
  autores: any[];
  editoriales: any[];
  secciones: any[];
  clases: string[];
  areas: string[]; // Nuevo prop
  idiomas: string[];
  estanterias: any[];
  onNext: () => void;
}

export default function GeneralInfoSection({
  form,
  autores: initialAutores,
  editoriales: initialEditoriales,
  secciones,
  clases,
  areas, // Nuevo prop
  idiomas,
  estanterias: initialEstanterias,
  onNext
}: GeneralInfoSectionProps) {
  
  // Estados locales para manejar las listas actualizables
  const [autores, setAutores] = useState(initialAutores);
  const [editoriales, setEditoriales] = useState(initialEditoriales);
  const [estanterias, setEstanterias] = useState(initialEstanterias);
  
  // Estado para manejar el tipo de código según la clase seleccionada
  const [codigoTipo, setCodigoTipo] = useState<'ISBN' | 'ISSN' | null>(null);

  // Efecto para determinar el tipo de código según la clase
  useEffect(() => {
    if (form.data.clase === 'LIBRO') {
      setCodigoTipo('ISBN');
    } else if (form.data.clase === 'REVISTA') {
      setCodigoTipo('ISSN');
    } else {
      setCodigoTipo(null);
    }
  }, [form.data.clase]);

  // Función para validar campos obligatorios de esta sección
  const validateSection = () => {
    const requiredFields = {
      codigo_unico: 'Código único',
      titulo: 'Título',
      autor_id: 'Autor Principal',
      editorial_id: 'Editorial',
      seccion_id: 'Sección',
      area: 'Área',
      clase: 'Clase',
      idioma: 'Idioma'
    };

    const errors = [];
    
    for (const [field, label] of Object.entries(requiredFields)) {
      if (!form.data[field] || form.data[field] === '') {
        errors.push(label);
      }
    }

    // Validación específica para código único según la clase
    if (form.data.codigo_unico) {
      if (form.data.clase === 'LIBRO') {
        // ISBN debe tener 13 dígitos
        if (!/^\d{13}$/.test(form.data.codigo_unico.replace(/[^0-9]/g, ''))) {
          errors.push('ISBN debe tener exactamente 13 dígitos');
        }
      } else if (form.data.clase === 'REVISTA') {
        // ISSN debe tener 8 dígitos
        if (!/^\d{8}$/.test(form.data.codigo_unico.replace(/[^0-9]/g, ''))) {
          errors.push('ISSN debe tener exactamente 8 dígitos');
        }
      }
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

  // Función para manejar cambio de clase
  const handleClaseChange = (value: string) => {
    form.setData('clase', value);
    // Limpiar el código único cuando cambie la clase
    form.setData('codigo_unico', '');
  };

  // Función para manejar el cambio de código único
  const handleCodigoChange = (value: string) => {
    // Permitir solo números
    const numericValue = value.replace(/[^0-9]/g, '');
    form.setData('codigo_unico', numericValue);
  };

  // Función para obtener el placeholder del código según la clase
  const getCodigoPlaceholder = () => {
    if (form.data.clase === 'LIBRO') {
      return '9780123456789 (13 dígitos)';
    } else if (form.data.clase === 'REVISTA') {
      return '12345678 (8 dígitos)';
    }
    return 'Seleccione primero una clase';
  };

  // Función para obtener el label del código según la clase
  const getCodigoLabel = () => {
    if (form.data.clase === 'LIBRO') {
      return 'ISBN';
    } else if (form.data.clase === 'REVISTA') {
      return 'ISSN';
    }
    return 'Código Único';
  };

  // NUEVA FUNCIÓN: Manejo específico para estantería
  const handleEstanteriaChange = (value: string) => {
    // Si es string vacío, convertir a null
    const processedValue = value === '' ? '' : value;
    form.setData('estanteria_id', processedValue);
  };

  // Callbacks para actualizar las listas cuando se creen nuevos elementos
  const handleAutorCreated = (newAutor: any) => {
    setAutores(prevAutores => [...prevAutores, newAutor]);
    // Seleccionar automáticamente el nuevo autor
    form.setData('autor_id', newAutor.id.toString());
  };

  const handleEditorialCreated = (newEditorial: any) => {
    setEditoriales(prevEditoriales => [...prevEditoriales, newEditorial]);
    // Seleccionar automáticamente la nueva editorial
    form.setData('editorial_id', newEditorial.id.toString());
  };

  const handleEstanteriaCreated = (newEstanteria: any) => {
    setEstanterias(prevEstanterias => [...prevEstanterias, newEstanteria]);
    // Seleccionar automáticamente la nueva estantería
    form.setData('estanteria_id', newEstanteria.id.toString());
  };

  // Determinar la sección predeterminada para estanterías
  const seccionIdForEstanteria = form.data.seccion_id ? parseInt(form.data.seccion_id) : null;

  // Clases CSS reutilizables para evitar duplicación
  const selectClasses = "block w-full px-3 py-2 text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white";
  const inputClasses = "block w-full px-3 py-2 text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white";
  const flexSelectClasses = "flex-1 px-3 py-2 text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white";
  const disabledSelectClasses = "block w-full px-3 py-2 text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-100 dark:bg-gray-800 dark:border-gray-600 dark:text-white";

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
    <AlertProvider>
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
          {/* Clase - Primero para determinar el tipo de código */}
          {renderFormField('clase', 'Tipo de Material', true, 
            <select
              id="clase"
              value={form.data.clase}
              onChange={e => handleClaseChange(e.target.value)}
              className={selectClasses}
            >
              <option value="">Seleccione el tipo</option>
              {clases.map(clase => (
                <option key={clase} value={clase}>
                  {clase}
                </option>
              ))}
            </select>,
            "col-span-1 md:col-span-1 xl:col-span-1"
          )}

          {/* Código Único - Dinámico según la clase */}
          {renderFormField('codigo_unico', getCodigoLabel(), true, 
            <div className="relative rounded-md shadow-sm">
              <input
                type="text"
                id="codigo_unico"
                value={form.data.codigo_unico}
                onChange={e => handleCodigoChange(e.target.value)}
                disabled={!form.data.clase}
                maxLength={form.data.clase === 'LIBRO' ? 13 : form.data.clase === 'REVISTA' ? 8 : undefined}
                className={`${inputClasses} ${!form.data.clase ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed' : ''}`}
                placeholder={getCodigoPlaceholder()}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-400 text-xs">
                  {form.data.clase === 'LIBRO' ? '13 dígitos' : form.data.clase === 'REVISTA' ? '8 dígitos' : ''}
                </span>
              </div>
              {!form.data.clase && (
                <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                  Primero seleccione el tipo de material
                </p>
              )}
            </div>,
            "col-span-1 md:col-span-1 xl:col-span-1"
          )}
          
          {/* Título - Span de 1 columna */}
          {renderFormField('titulo', 'Título', true, 
            <input
              type="text"
              id="titulo"
              value={form.data.titulo}
              onChange={e => form.setData('titulo', e.target.value)}
              className={inputClasses}
              placeholder="Ingrese el título del libro"
            />,
            "col-span-1 md:col-span-1 xl:col-span-1"
          )}
          
          {/* Segunda fila - 3 campos con mejor distribución */}
          {/* Autor Principal */}
          {renderFormField('autor_id', 'Autor Principal', true, 
            <div className="flex items-center">
              <select
                id="autor_id"
                value={form.data.autor_id}
                onChange={e => form.setData('autor_id', e.target.value)}
                className={flexSelectClasses}
              >
                <option value="">Seleccione un autor</option>
                {autores.map(autor => (
                  <option key={autor.id} value={autor.id}>
                    {`${autor.nombres} ${autor.apellidos}`}
                  </option>
                ))}
              </select>
              <CreateAutorInline onAutorCreated={handleAutorCreated} />
            </div>,
            "col-span-1 md:col-span-1 xl:col-span-1"
          )}
          
          {/* Editorial */}
          {renderFormField('editorial_id', 'Editorial', true, 
            <div className="flex items-center">
              <select
                id="editorial_id"
                value={form.data.editorial_id}
                onChange={e => form.setData('editorial_id', e.target.value)}
                className={flexSelectClasses}
              >
                <option value="">Seleccione una editorial</option>
                {editoriales.map(editorial => (
                  <option key={editorial.id} value={editorial.id}>
                    {editorial.nombre}
                  </option>
                ))}
              </select>
              <CreateEditorialInline onEditorialCreated={handleEditorialCreated} />
            </div>,
            "col-span-1 md:col-span-1 xl:col-span-1"
          )}
          
          {/* Sección - Automática según el rol del usuario */}
          {renderFormField('seccion_id', 'Sección', true, 
            <select
              id="seccion_id"
              value={form.data.seccion_id}
              onChange={e => form.setData('seccion_id', e.target.value)}
              className={disabledSelectClasses}
              disabled={true}
            >
              <option value="">Sección asignada automáticamente</option>
              {secciones.map(seccion => (
                <option key={seccion.id} value={seccion.id}>
                  {seccion.nombre}
                </option>
              ))}
            </select>,
            "col-span-1 md:col-span-1 xl:col-span-1"
          )}
          
          {/* Tercera fila - 3 campos */}
          {/* Área - Nuevo campo */}
          {renderFormField('area', 'Área', true, 
            <select
              id="area"
              value={form.data.area}
              onChange={e => form.setData('area', e.target.value)}
              className={selectClasses}
            >
              <option value="">Seleccione un área</option>
              {areas.map(area => (
                <option key={area} value={area}>
                  {area}
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
              className={selectClasses}
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
            <div className="flex items-center">
              <select
                id="estanteria_id"
                value={form.data.estanteria_id || ''} // Asegurar que nunca sea undefined
                onChange={e => handleEstanteriaChange(e.target.value)}
                className={flexSelectClasses}
              >
                <option value="">Seleccione una estantería (opcional)</option>
                {estanterias.map(estanteria => (
                  <option key={estanteria.id} value={estanteria.id}>
                    {estanteria.cod_estante}
                  </option>
                ))}
              </select>
              <CreateEstanteriaInline 
                onEstanteriaCreated={handleEstanteriaCreated}
                secciones={secciones}
                seccionId={seccionIdForEstanteria}
              />
            </div>,
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
            className="block w-full px-3 py-2 text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Describa el contenido del libro..."
          />
          {form.errors.contenido && (
            <p className="mt-1 text-sm text-red-600">{form.errors.contenido}</p>
          )}
        </div>

        {/* Información sobre el código único */}
        {form.data.clase && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">
                    {form.data.clase === 'LIBRO' ? 'ISBN' : 'ISSN'}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <h4 className="text-base font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  {form.data.clase === 'LIBRO' ? 'ISBN (International Standard Book Number)' : 'ISSN (International Standard Serial Number)'}
                </h4>
                <div className="text-blue-700 dark:text-blue-300 space-y-2">
                  <p className="text-sm">
                    {form.data.clase === 'LIBRO' 
                      ? 'Identificador único de 13 dígitos para libros'
                      : 'Identificador único de 8 dígitos para publicaciones periódicas como revistas'
                    }
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                      <span>Solo números permitidos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                      <span>{form.data.clase === 'LIBRO' ? '13 dígitos exactos' : '8 dígitos exactos'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                      <span>Debe ser único en el sistema</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                      <span>Requerido para registro</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
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
    </AlertProvider>
  );
}