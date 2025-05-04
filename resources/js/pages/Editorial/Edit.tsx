import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Pencil } from 'lucide-react';
import Modal from '@/components/Modal';
import Form from '@/components/Form';
import { Editorial } from './types';

type EditModalProps = {
  editorial: Editorial;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  errors?: Record<string, string>;
};

export default function EditEditorial({ editorial, onSuccess, onError, errors = {} }: EditModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { data, setData, put, processing, reset, errors: formErrors, setError, clearErrors } = useForm({
    nombre: editorial.nombre,
    ciudad: editorial.ciudad || '',
    pais: editorial.pais || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const validFields: Array<keyof typeof data> = ['nombre', 'ciudad', 'pais'];
    if (validFields.includes(name as keyof typeof data)) {
      setData(name as keyof typeof data, value);
      console.log('Form data updated - Current state:', { ...data, [name]: value });
    } else {
      console.error('Invalid field name:', name);
    }
  };

  const editorialFields = [
    {
      name: 'nombre',
      label: 'Nombre',
      type: 'text',
      placeholder: 'Ingrese el nombre',
      required: true,
      value: data.nombre,
      onChange: handleChange
    },
    {
      name: 'ciudad',
      label: 'Ciudad',
      type: 'text',
      placeholder: 'Ingrese la ciudad',
      required: false,
      value: data.ciudad,
      onChange: handleChange
    },
    {
      name: 'pais',
      label: 'País',
      type: 'text',
      placeholder: 'Ingrese el país',
      required: false,
      value: data.pais,
      onChange: handleChange
    }
  ];

  const handleSubmit = () => {
    clearErrors();
    console.log('Submitting update with data:', data);
    put(`/editoriales/${editorial.id}`, {
      preserveScroll: true,
      preserveState: true,
      onSuccess: (page: any) => {
        console.log('Success response:', page);
        const successMessage = page.props.flash?.success || 'Editorial actualizada exitosamente';
        onSuccess(successMessage);
        reset();
        clearErrors();
        setIsOpen(false);
      },
      onError: (errors: Record<string, string>) => {
        console.log('Error response:', errors);
        const hasFieldErrors = Object.keys(errors).some(key => ['nombre', 'ciudad', 'pais'].includes(key));
        if (hasFieldErrors) {
          Object.keys(errors).forEach((key) => {
            setError(key as keyof typeof data, errors[key]);
          });
        } else {
          const errorMessage = errors.error || 'Ha ocurrido un error al actualizar la editorial';
          onError(errorMessage);
        }
      },
      onFinish: () => {
        console.log('Request finished');
      }
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
          bg-blue-600 hover:bg-blue-700 text-white
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
        className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 
                  transition-colors p-1.5 bg-amber-50 dark:bg-amber-900/30 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-800/40"
        title="Editar"
      >
        <Pencil className="w-5 h-5" />
      </button>
      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Editar Editorial"
        footer={modalFooter}
      >
        <Form
          initialData={data}
          fields={editorialFields}
          errors={formErrors}
          submitUrl={`/editoriales/${editorial.id}`}
          method="put"
          onCancel={() => setIsOpen(false)}
          onSuccess={handleSubmit}
          submitButtonText="Actualizar"
          isEditing={true}
          accentColor="blue"
          showButtons={false}
          id="edit-editorial-form"
          processing={processing}
        />
      </Modal>
    </>
  );
}