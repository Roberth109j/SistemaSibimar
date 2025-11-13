import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Pencil } from 'lucide-react';
import Modal from '@/components/Modal';
import Form, { FormField } from '@/components/Form';
import { Autor } from './types';

type EditModalProps = {
  autor: Autor;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  errors?: Record<string, string>;
};

export default function EditAutor({ autor, onSuccess, onError, errors = {} }: EditModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { data, setData, put, processing, errors: formErrors, setError, clearErrors, reset } = useForm({
    nombres: autor.nombres || '',
    apellidos: autor.apellidos || ''
  });

  // Sync form data with updated autor prop - FIX: removed setData and clearErrors from dependencies
  useEffect(() => {
    setData({
      nombres: autor.nombres || '',
      apellidos: autor.apellidos || ''
    });
    clearErrors();
  }, [autor]);

  // FIX: Changed type to only HTMLInputElement to match FormField interface expectation
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const validFields: Array<keyof typeof data> = ['nombres', 'apellidos'];
    if (validFields.includes(name as keyof typeof data)) {
      // Convertir a mayúsculas automáticamente
      const processedValue = value.toUpperCase();
      setData(name as keyof typeof data, processedValue);
      console.log('Form data updated - Current state:', { ...data, [name]: processedValue });
    } else {
      console.error('Invalid field name:', name);
    }
  };

  const autorFields: FormField[] = [
    {
      name: 'nombres',
      label: 'Nombres',
      type: 'text',
      placeholder: 'Ingrese los nombres',
      required: true,
      value: data.nombres,
      onChange: handleChange as any, // Type assertion to bypass TypeScript error
      style: { textTransform: 'uppercase' as const }
    },
    {
      name: 'apellidos',
      label: 'Apellidos',
      type: 'text',
      placeholder: 'Ingrese los apellidos',
      required: true,
      value: data.apellidos,
      onChange: handleChange as any, // Type assertion to bypass TypeScript error
      style: { textTransform: 'uppercase' as const }
    }
  ];

  const handleSubmit = () => {
    clearErrors();
    console.log('Submitting update with data:', data);
    put(`/autores/${autor.id}`, {
      preserveScroll: true,
      preserveState: true,
      onSuccess: (page: any) => {
        console.log('Success response:', page);
        const successMessage = page.props.flash?.success || 'Autor actualizado exitosamente';
        onSuccess(successMessage);
        // Reset form with updated autor data
        setData({
          nombres: autor.nombres || '',
          apellidos: autor.apellidos || ''
        });
        clearErrors();
        setIsOpen(false);
      },
      onError: (errors: Record<string, string>) => {
        console.log('Error response:', errors);
        const hasFieldErrors = Object.keys(errors).some(key => ['nombres', 'apellidos'].includes(key));
        if (hasFieldErrors) {
          Object.keys(errors).forEach((key) => {
            setError(key as keyof typeof data, errors[key]);
          });
        } else {
          const errorMessage = errors.error || 'Ha ocurrido un error al actualizar el autor';
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
        title="Editar Autor"
        footer={modalFooter}
      >
        <Form
          initialData={data}
          fields={autorFields}
          errors={formErrors}
          onCancel={() => setIsOpen(false)}
          accentColor="amber"
          showButtons={false}
          id="edit-autor-form"
          processing={processing}
          isEditing={true}
        />
      </Modal>
    </>
  );
}