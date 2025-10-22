import React, { useState, useEffect } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Pencil } from 'lucide-react';
import Modal from '@/components/Modal';
import Form from '@/components/Form';
import { Grado, GradoFormData } from './types';

type EditModalProps = {
  grado: Grado;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  errors?: Record<string, string>;
  all_secciones?: Array<{ id: number; nombre: string }>;
  seccionId?: number | null;
};

type FieldConfig = {
  name: string;
  label: string;
  type: string;
  placeholder: string;
  required: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  options?: { value: string; label: string }[];
  disabled?: boolean;
};

export default function EditGrado({ grado, onSuccess, onError, errors = {}, all_secciones = [], seccionId = null }: EditModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use the proper GradoFormData type and correctly access subGrado with capital G
  const { data, setData, errors: formErrors, setError, clearErrors } = useForm<GradoFormData>({
    grado: grado.grado,
    subGrado: grado.subGrado || '', // Correct capitalization of subGrado
    estado: grado.estado,
    seccion_id: String(grado.seccion_id), // Convert to string as per GradoFormData type
  });

  // ✅ SOLUCION: Actualizar los datos del formulario cuando el prop grado cambie
  useEffect(() => {
    setData({
      grado: grado.grado,
      subGrado: grado.subGrado || '',
      estado: grado.estado,
      seccion_id: String(grado.seccion_id),
    });
  }, [grado, setData]);

  // ✅ SOLUCION: También actualizar cuando se abra el modal para asegurar datos frescos
  const handleOpenModal = () => {
    setData({
      grado: grado.grado,
      subGrado: grado.subGrado || '',
      estado: grado.estado,
      seccion_id: String(grado.seccion_id),
    });
    clearErrors();
    setIsOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const validFields: Array<keyof GradoFormData> = ['grado', 'subGrado', 'estado', 'seccion_id']; // Correct capitalization
    if (validFields.includes(name as keyof GradoFormData)) {
      // Convertir a mayúsculas automáticamente para el campo subGrado
      const processedValue = name === 'subGrado' ? value.toUpperCase() : value;
      setData(name as keyof GradoFormData, processedValue);
      console.log('Form data updated - Current state:', { ...data, [name]: processedValue });
    } else {
      console.error('Invalid field name:', name);
    }
  };

  // ✅ NUEVA FUNCIÓN: Obtener filtros actuales de la URL
  const getCurrentFilters = () => {
    const currentUrl = new URL(window.location.href);
    const filters = {
      search: currentUrl.searchParams.get('search') || '',
      grado_filter: currentUrl.searchParams.get('grado_filter') || '',
      estado: currentUrl.searchParams.get('estado') || '',
      seccion_filter: currentUrl.searchParams.get('seccion_filter') || '',
      sort_order: currentUrl.searchParams.get('sort_order') || 'asc',
      page: currentUrl.searchParams.get('page') || '1'
    };
    console.log('Current filters extracted:', filters);
    return filters;
  };

  const gradoFields: FieldConfig[] = [
    {
      name: 'grado',
      label: 'Grado',
      type: 'select',
      placeholder: 'Seleccione un grado',
      required: true,
      value: data.grado,
      onChange: handleChange,
      options: [
        { value: '', label: 'Seleccione un grado' },
        { value: 'PREESCOLAR', label: 'PREESCOLAR' },
        { value: 'PRIMERO', label: 'PRIMERO' },
        { value: 'SEGUNDO', label: 'SEGUNDO' },
        { value: 'TERCERO', label: 'TERCERO' },
        { value: 'CUARTO', label: 'CUARTO' },
        { value: 'QUINTO', label: 'QUINTO' },
        { value: 'SEXTO', label: 'SEXTO' },
        { value: 'SÉPTIMO', label: 'SÉPTIMO' },
        { value: 'OCTAVO', label: 'OCTAVO' },
        { value: 'NOVENO', label: 'NOVENO' },
        { value: 'DÉCIMO', label: 'DÉCIMO' },
        { value: 'ONCE', label: 'ONCE' },
      ],
    },
    {
      name: 'subGrado', // Correct capitalization of subGrado
      label: 'Sub Grado',
      type: 'text',
      placeholder: 'Ingrese el sub grado',
      required: false,
      value: data.subGrado || '', // Correct capitalization
      onChange: handleChange,
    },
    {
      name: 'estado',
      label: 'Estado',
      type: 'select',
      placeholder: 'Seleccione el estado',
      required: true,
      value: data.estado,
      onChange: handleChange,
      options: [
        { value: 'ACTIVO', label: 'Activo' },
        { value: 'INACTIVO', label: 'Inactivo' },
      ],
    },
    {
      name: 'seccion_id',
      label: 'Sección',
      type: 'select',
      placeholder: 'Seleccione una sección',
      required: true,
      value: data.seccion_id,
      onChange: handleChange,
      disabled: seccionId !== null,
      options: [
        { value: '', label: 'Seleccione una sección' },
        ...all_secciones.map(seccion => ({
          value: String(seccion.id),
          label: seccion.nombre
        }))
      ],
    },
  ];

  const handleSubmit = () => {
    clearErrors();
    setIsSubmitting(true);
    console.log('Submitting form with data:', data);
    
    // ✅ OBTENER FILTROS ACTUALES Y ENVIARLOS CON EL FORMULARIO
    const currentFilters = getCurrentFilters();
    
    // ✅ CREAR OBJETO COMPLETO CON DATOS Y FILTROS
    const completeFormData = {
      grado: data.grado,
      subGrado: data.subGrado,
      estado: data.estado,
      seccion_id: data.seccion_id,
      current_filters: currentFilters
    };
    
    console.log('Sending complete data:', completeFormData);
    
    // ✅ USAR ROUTER.PUT DIRECTAMENTE PARA MAYOR CONTROL
    router.put(`/grados/${grado.id}`, completeFormData, {
      preserveScroll: true,
      preserveState: false,
      onStart: () => {
        setIsSubmitting(true);
        console.log('Request started');
      },
      onSuccess: (page: any) => {
        console.log('Success response:', page);
        const successMessage = page.props.flash?.success || 'Grado actualizado exitosamente';
        onSuccess(successMessage);
        clearErrors();
        setIsOpen(false);
        setIsSubmitting(false);
      },
      onError: (errors: Record<string, string>) => {
        console.log('Error response:', errors);
        const hasFieldErrors = Object.keys(errors).some(key => ['grado', 'subGrado', 'estado', 'seccion_id'].includes(key));
        if (hasFieldErrors) {
          Object.keys(errors).forEach((key) => {
            setError(key as keyof GradoFormData, errors[key]);
          });
        } else {
          const errorMessage = errors.error || 'Ha ocurrido un error al actualizar el grado';
          onError(errorMessage);
        }
        setIsSubmitting(false);
      },
      onFinish: () => {
        console.log('Request finished');
        setIsSubmitting(false);
      },
    });
  };

  const modalFooter = (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(false)}
        className="px-5 py-2.5 text-sm font-medium rounded-lg shadow-sm
          bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 
          border border-gray-300 dark:border-gray-600
          hover:bg-gray-50 dark:hover:bg-gray-600
          focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
      >
        Cancelar
      </button>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="px-5 py-2.5 text-sm font-medium rounded-lg shadow-sm
          bg-blue-500 hover:bg-blue-600 text-white
          focus:outline-none focus:ring-2 focus:ring-blue-500
          disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {isSubmitting ? 'Actualizando...' : 'Actualizar'}
      </button>
    </>
  );

  return (
    <>
      <button
        onClick={handleOpenModal} // ✅ Usar la nueva función que actualiza los datos
        className="text-amber-500 hover:text-amber-600 focus:outline-none transition-colors duration-200"
      >
        <Pencil className="w-5 h-5" />
      </button>
      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Editar Grado"
        description="Modifique los campos para actualizar"
        footer={modalFooter}
      >
        <Form
          initialData={data}
          fields={gradoFields.map(field => ({
            ...field,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => 
              field.onChange(e as React.ChangeEvent<HTMLInputElement | HTMLSelectElement>)
          }))}
          errors={formErrors}
          submitUrl={`/grados/${grado.id}`}
          method="put"
          onCancel={() => setIsOpen(false)}
          onSuccess={handleSubmit}
          submitButtonText="Actualizar"
          isEditing={true}
          accentColor="blue"
          showButtons={false}
          id="edit-grado-form"
          processing={isSubmitting}
        />
      </Modal>
    </>
  );
}