import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Pencil } from 'lucide-react';
import Modal from '@/components/Modal';
import Form from '@/components/Form';
import { Estanteria } from './types';

type EditModalProps = {
  estanteria: Estanteria;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  errors?: Record<string, string>;
};

type FormData = {
  cod_estante: string;
  descripcion: string;
};

export default function EditEstanteria({ estanteria, onSuccess, onError, errors = {} }: EditModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { data, setData, put, processing, errors: formErrors, setError, clearErrors, reset } = useForm<FormData>({
    cod_estante: estanteria.cod_estante || '',
    descripcion: estanteria.descripcion || ''
  });

  // Sync form data with updated estanteria prop
  useEffect(() => {
    setData({
      cod_estante: estanteria.cod_estante || '',
      descripcion: estanteria.descripcion || ''
    });
    clearErrors();
  }, [estanteria, setData, clearErrors]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'cod_estante' || name === 'descripcion') {
      setData(name, value);
      console.log('Form data updated - Current state:', { ...data, [name]: value });
    } else {
      console.error('Invalid field name:', name);
    }
  };

  const estanteriaFields = [
    {
      name: 'cod_estante' as const,
      label: 'Código de estante',
      type: 'text',
      placeholder: 'Ingrese el código de estante',
      required: true,
      value: data.cod_estante,
      onChange: handleChange,
      labelClassName: 'text-left block w-full', // Clase para alinear a la izquierda
      inputClassName: 'text-left', // Clase para alinear a la izquierda
      containerClassName: 'text-left mb-4', // Clase para alinear el contenedor a la izquierda
    },
    {
      name: 'descripcion' as const,
      label: 'Descripción',
      type: 'text',
      placeholder: 'Ingrese la descripción (opcional)',
      required: false,
      value: data.descripcion,
      onChange: handleChange,
      labelClassName: 'text-left block w-full', // Clase para alinear a la izquierda
      inputClassName: 'text-left', // Clase para alinear a la izquierda
      containerClassName: 'text-left mb-4', // Clase para alinear el contenedor a la izquierda
    }
  ];

  const handleSubmit = () => {
    clearErrors();
    console.log('Submitting update with data:', data);
    put(`/estanterias/${estanteria.id}`, {
      preserveScroll: true,
      preserveState: true,
      onSuccess: (page: any) => {
        console.log('Success response:', page);
        const successMessage = page.props.flash?.success || 'Estantería actualizada exitosamente';
        onSuccess(successMessage);
        // Reset form with updated estanteria data
        setData({
          cod_estante: estanteria.cod_estante || '',
          descripcion: estanteria.descripcion || ''
        });
        clearErrors();
        setIsOpen(false);
      },
      onError: (errors: Record<string, string>) => {
        console.log('Error response:', errors);
        if (errors.cod_estante) {
          setError('cod_estante', errors.cod_estante);
        }
        if (errors.descripcion) {
          setError('descripcion', errors.descripcion);
        }
        
        if (!errors.cod_estante && !errors.descripcion && errors.error) {
          const errorMessage = errors.error || 'Ha ocurrido un error al actualizar la estantería';
          onError(errorMessage);
        }
      },
      onFinish: () => {
        console.log('Request finished');
      }
    });
  };

  const handleCancel = () => {
    reset();
    clearErrors();
    setIsOpen(false);
  };

  const modalFooter = (
    <>
      <button
        type="button"
        onClick={handleCancel}
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
        onClose={handleCancel}
        title="Editar Estantería"
        footer={modalFooter}
      >
        <div className="w-full text-left">
          <Form
            initialData={data}
            fields={estanteriaFields}
            errors={formErrors}
            submitUrl={`/estanterias/${estanteria.id}`}
            method="put"
            onCancel={handleCancel}
            onSuccess={handleSubmit}
            submitButtonText="Actualizar"
            isEditing={true}
            accentColor="amber"
            showButtons={false}
            id="edit-estanteria-form"
            processing={processing}
          />
        </div>
      </Modal>
    </>
  );
}