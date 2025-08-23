import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import Modal from '@/components/Modal';
import Form from '@/components/Form';

type CreateModalProps = {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  errors?: Record<string, string>;
  secciones?: Array<{ id: number; nombre: string }>;
  seccionId?: number | null;
};

export default function CreateGrado({ onSuccess, onError, errors = {}, secciones = [], seccionId = null }: CreateModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { data, setData, post, processing, reset, errors: formErrors, setError, clearErrors } = useForm({
    grado: '',
    subGrado: '',
    estado: 'ACTIVO',
    seccion_id: seccionId ? String(seccionId) : '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const validFields: Array<keyof typeof data> = ['grado', 'subGrado', 'estado', 'seccion_id'];
    if (validFields.includes(name as keyof typeof data)) {
      setData(name as keyof typeof data, value);
      console.log('Form data updated - Current state:', { ...data, [name]: value });
    } else {
      console.error('Invalid field name:', name);
    }
  };

  const gradoFields = [
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
      name: 'subGrado',
      label: 'Sub Grado',
      type: 'text',
      placeholder: 'Ingrese el sub grado',
      required: false,
      value: data.subGrado,
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
      disabled: true, // Bloquear la edición de la sección
      options: [
        { value: '', label: 'Seleccione una sección' },
        ...secciones.map(seccion => ({
          value: String(seccion.id),
          label: seccion.nombre
        }))
      ],
    },
  ];

  const handleSubmit = () => {
    clearErrors();
    console.log('Submitting form with data:', data);
    post('/grados', {
      preserveScroll: true,
      onSuccess: (page: any) => {
        console.log('Success response:', page);
        const successMessage = page.props.flash?.success || 'Grado creado exitosamente';
        onSuccess(successMessage);
        reset();
        clearErrors();
        setIsOpen(false);
      },
      onError: (errors: Record<string, string>) => {
        console.log('Error response:', errors);
        const hasFieldErrors = Object.keys(errors).some(key => ['grado', 'subGrado', 'estado', 'seccion_id'].includes(key));
        if (hasFieldErrors) {
          Object.keys(errors).forEach((key) => {
            setError(key as keyof typeof data, errors[key]);
          });
        } else {
          const errorMessage = errors.error || 'Ha ocurrido un error al crear el grado';
          onError(errorMessage);
        }
      },
      onFinish: () => {
        console.log('Request finished');
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
        disabled={processing}
        className="px-5 py-2.5 text-sm font-medium rounded-lg shadow-sm
          bg-blue-500 hover:bg-blue-600 text-white
          focus:outline-none focus:ring-2 focus:ring-blue-500
          disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {processing ? 'Guardando...' : 'Guardar'}
      </button>
    </>
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white 
                  px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg
                  transform hover:-translate-y-0.5"
      >
        <Plus className="w-5 h-5" />
        <span>Nuevo Grado</span>
      </button>
      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Crear Nuevo Grado"
        description="Complete los campos para continuar"
        footer={modalFooter}
      >
        <Form
          initialData={data}
          fields={gradoFields.map(field => ({
            ...field,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => 
              handleChange(e as React.ChangeEvent<HTMLInputElement | HTMLSelectElement>)
          }))}
          errors={formErrors}
          submitUrl="/grados"
          method="post"
          onCancel={() => setIsOpen(false)}
          onSuccess={handleSubmit}
          submitButtonText="Guardar"
          isEditing={false}
          accentColor="blue"
          showButtons={false}
          id="create-grado-form"
          processing={processing}
        />
      </Modal>
    </>
  );
}