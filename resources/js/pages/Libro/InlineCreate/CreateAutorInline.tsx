import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import Modal from '@/components/Modal';
import Form from '@/components/Form';
import { useAlert } from '@/components/AlertNotification';
import axios from 'axios';

type CreateAutorInlineProps = {
  onAutorCreated: (autor: any) => void;
};

export default function CreateAutorInline({ onAutorCreated }: CreateAutorInlineProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showAlert } = useAlert();

  const { data, setData, reset, errors, setError, clearErrors } = useForm({
    nombres: '',
    apellidos: ''
  });

  // Función para limpiar y cerrar modal
  const handleCloseModal = () => {
    reset();
    clearErrors();
    setIsOpen(false);
  };

  // Función para abrir modal
  const handleOpenModal = () => {
    reset();
    clearErrors();
    setIsOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const validFields: Array<keyof typeof data> = ['nombres', 'apellidos'];
    
    if (validFields.includes(name as keyof typeof data)) {
      setData(name as keyof typeof data, value);
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

  const handleSubmit = async () => {
    clearErrors();
    
    // Validaciones básicas del frontend
    if (!data.nombres.trim()) {
      setError('nombres', 'Los nombres son obligatorios');
      return;
    }
    
    if (!data.apellidos.trim()) {
      setError('apellidos', 'Los apellidos son obligatorios');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post('/api/inline-create/autor', {
        nombres: data.nombres.trim(),
        apellidos: data.apellidos.trim()
      });

      if (response.data.success) {
        showAlert({
          type: 'success',
          title: 'Autor creado',
          message: `${response.data.autor.nombres} ${response.data.autor.apellidos} ha sido agregado correctamente`,
          duration: 4000
        });
        
        // Llamar callback para actualizar el selector
        onAutorCreated(response.data.autor);
        
        // Cerrar modal
        handleCloseModal();
      }
    } catch (error: any) {
      console.error('Error al crear autor:', error);
      
      if (error.response?.status === 409) {
        // Error de duplicado
        showAlert({
          type: 'warning',
          title: 'Autor existente',
          message: error.response.data.message || 'Ya existe un autor con el mismo nombre y apellidos',
          duration: 5000
        });
      } else if (error.response?.status === 422) {
        // Errores de validación
        const validationErrors = error.response.data.errors;
        Object.keys(validationErrors).forEach((key) => {
          if (['nombres', 'apellidos'].includes(key)) {
            setError(key as keyof typeof data, validationErrors[key][0]);
          }
        });
        
        showAlert({
          type: 'error',
          title: 'Error de validación',
          message: 'Por favor, corrija los errores en el formulario',
          duration: 5000
        });
      } else {
        showAlert({
          type: 'error',
          title: 'Error',
          message: error.response?.data?.message || 'Ha ocurrido un error al crear el autor',
          duration: 5000
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalFooter = (
    <>
      <button
        type="button"
        onClick={handleCloseModal}
        disabled={isSubmitting}
        className="px-5 py-2.5 text-sm font-medium rounded-lg shadow-sm
          bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 
          border border-gray-300 dark:border-gray-600
          hover:bg-gray-50 dark:hover:bg-gray-600
          focus:outline-none focus:ring-2 focus:ring-gray-500 
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-200"
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
        {isSubmitting ? 'Guardando...' : 'Guardar Autor'}
      </button>
    </>
  );

  return (
    <>
      <button
        type="button"
        onClick={handleOpenModal}
        className="ml-2 p-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 
                   bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-800/40 
                   rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        title="Agregar nuevo autor"
      >
        <Plus className="w-4 h-4" />
      </button>

      <Modal
        open={isOpen}
        onClose={handleCloseModal}
        title="Agregar Nuevo Autor"
        description="Complete los campos para agregar un nuevo autor"
        footer={modalFooter}
      >
        <Form
          initialData={data}
          fields={autorFields as any}
          errors={errors}
          onCancel={handleCloseModal}
          onSuccess={handleSubmit}
          submitButtonText="Guardar Autor"
          isEditing={false}
          accentColor="blue"
          showButtons={false}
          id="create-autor-inline-form"
          processing={isSubmitting}
        />
      </Modal>
    </>
  );
}