
import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Pencil } from 'lucide-react';
import Modal from '@/components/Modal';
import Form from '@/components/Form';
import { Grado, GradoFormData } from './types';

type EditModalProps = {
  grado: Grado;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  errors?: Record<string, string>;
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
};

export default function EditGrado({ grado, onSuccess, onError, errors = {} }: EditModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Use the proper GradoFormData type and correctly access subGrado with capital G
  const { data, setData, put, processing, reset, errors: formErrors, setError, clearErrors } = useForm<GradoFormData>({
    grado: grado.grado,
    subGrado: grado.subGrado || '', // Correct capitalization of subGrado
    estado: grado.estado,
    seccion_id: String(grado.seccion_id), // Convert to string as per GradoFormData type
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const validFields: Array<keyof GradoFormData> = ['grado', 'subGrado', 'estado', 'seccion_id']; // Correct capitalization
    if (validFields.includes(name as keyof GradoFormData)) {
      setData(name as keyof GradoFormData, value);
      console.log('Form data updated - Current state:', { ...data, [name]: value });
    } else {
      console.error('Invalid field name:', name);
    }
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
        { value: 'Prescolar', label: 'Prescolar' },
        { value: 'Primero', label: 'Primero' },
        { value: 'Segundo', label: 'Segundo' },
        { value: 'Tercero', label: 'Tercero' },
        { value: 'Cuarto', label: 'Cuarto' },
        { value: 'Quinto', label: 'Quinto' },
        { value: 'Sexto', label: 'Sexto' },
        { value: 'Séptimo', label: 'Séptimo' },
        { value: 'Octavo', label: 'Octavo' },
        { value: 'Noveno', label: 'Noveno' },
        { value: 'Décimo', label: 'Décimo' },
        { value: 'Once', label: 'Once' },
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
      options: [
        { value: '', label: 'Seleccione una sección' },
        { value: '1', label: 'Primaria' },
        { value: '2', label: 'Bachillerato' },
      ],
    },
  ];

  const handleSubmit = () => {
    clearErrors();
    console.log('Submitting form with data:', data);
    put(`/grados/${grado.id}`, {
      preserveScroll: true,
      onSuccess: (page: any) => {
        console.log('Success response:', page);
        const successMessage = page.props.flash?.success || 'Grado actualizado exitosamente';
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
            setError(key as keyof GradoFormData, errors[key]);
          });
        } else {
          const errorMessage = errors.error || 'Ha ocurrido un error al actualizar el grado';
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
        {processing ? 'Actualizando...' : 'Actualizar'}
      </button>
    </>
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
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
          fields={gradoFields}
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
          processing={processing}
        />
      </Modal>
    </>
  );
}