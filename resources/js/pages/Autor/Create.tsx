import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import Modal from '@/components/Modal';
import Form from '@/components/Form';

type CreateModalProps = {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  errors?: Record<string, string>;
};

export default function CreateAutor({ onSuccess, onError, errors = {} }: CreateModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { data, setData, post, processing, reset, errors: formErrors, setError, clearErrors } = useForm({
    nombres: '',
    apellidos: ''
  });

  // Función para limpiar y cerrar modal
  const handleCloseModal = () => {
    reset(); // Limpiar los datos del formulario
    clearErrors(); // Limpiar errores
    setIsOpen(false);
  };

  // Función para abrir modal
  const handleOpenModal = () => {
    reset(); // Limpiar datos al abrir
    clearErrors(); // Limpiar errores al abrir
    setIsOpen(true);
  };

  // Solución: Actualizar handleChange para manejar tanto input como select
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const validFields: Array<keyof typeof data> = ['nombres', 'apellidos'];
    
    if (validFields.includes(name as keyof typeof data)) {
      setData(name as keyof typeof data, value);
      console.log('Form data updated - Current state:', { ...data, [name]: value });
    } else {
      console.error('Invalid field name:', name);
    }
  };

  const autorFields = [
    {
      name: 'nombres',
      label: 'Nombres',
      type: 'text',
      placeholder: 'Ingrese los nombres',
      required: true,
      value: data.nombres,
      onChange: handleChange
    },
    {
      name: 'apellidos',
      label: 'Apellidos',
      type: 'text',
      placeholder: 'Ingrese los apellidos',
      required: true,
      value: data.apellidos,
      onChange: handleChange
    }
  ];

  const handleSubmit = () => {
    clearErrors();
    console.log('Submitting form with data:', data);
    post('/autores', {
      preserveScroll: true,
      onSuccess: (page: any) => {
        console.log('Success response:', page);
        const successMessage = page.props.flash?.success || 'Autor creado exitosamente';
        onSuccess(successMessage);
        reset();
        clearErrors();
        setIsOpen(false);
      },
      onError: (errors: Record<string, string>) => {
        console.log('Error response:', errors);
        
        // Verificar si hay errores específicos de duplicado
        if (errors.duplicate || errors.autor_exists) {
          const duplicateMessage = errors.duplicate || errors.autor_exists || 'Este autor ya existe en el sistema';
          // Limpiar formulario y cerrar modal incluso con error de duplicado
          setTimeout(() => {
            reset();
            clearErrors();
            setIsOpen(false);
            onError(duplicateMessage);
          }, 100);
          return;
        }
        
        // Verificar si hay errores de validación de campos
        const hasFieldErrors = Object.keys(errors).some(key => ['nombres', 'apellidos'].includes(key));
        if (hasFieldErrors) {
          Object.keys(errors).forEach((key) => {
            if (['nombres', 'apellidos'].includes(key)) {
              setError(key as keyof typeof data, errors[key]);
            }
          });
        } else {
          // Error genérico
          const errorMessage = errors.error || 'Ha ocurrido un error al crear el autor';
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
        onClick={handleCloseModal}
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
        onClick={handleOpenModal}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white 
                  px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg
                  transform hover:-translate-y-0.5"
      >
        <Plus className="w-5 h-5" />
        <span>Nuevo Autor</span>
      </button>
      <Modal
        open={isOpen}
        onClose={handleCloseModal}
        title="Crear Nuevo Autor"
        description="Complete los campos para continuar"
        footer={modalFooter}
      >
        <Form
          initialData={data}
          fields={autorFields}
          errors={formErrors}
          submitUrl="/autores"
          method="post"
          onCancel={handleCloseModal}
          onSuccess={handleSubmit}
          submitButtonText="Guardar"
          isEditing={false}
          accentColor="blue"
          showButtons={false}
          id="create-autor-form"
          processing={processing}
        />
      </Modal>
    </>
  );
}