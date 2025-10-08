import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import Modal from '@/components/Modal';
import Form from '@/components/Form';
import { useAlert } from '@/components/AlertNotification';
import axios from 'axios';

type CreateEditorialInlineProps = {
  onEditorialCreated: (editorial: any) => void;
};

export default function CreateEditorialInline({ onEditorialCreated }: CreateEditorialInlineProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showAlert } = useAlert();

  const { data, setData, reset, errors, setError, clearErrors } = useForm({
    nombre: '',
    pais: '',
    ciudad: ''
  });

  const handleCloseModal = () => {
    reset();
    clearErrors();
    setIsOpen(false);
  };

  const handleOpenModal = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // ✅ PREVENIR SUBMIT
    e.stopPropagation(); // ✅ EVITAR PROPAGACIÓN
    reset();
    clearErrors();
    setIsOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const validFields: Array<keyof typeof data> = ['nombre', 'pais', 'ciudad'];
    
    if (validFields.includes(name as keyof typeof data)) {
      setData(name as keyof typeof data, value);
    }
  };

  const editorialFields = [
    {
      name: 'nombre',
      label: 'Nombre',
      type: 'text',
      placeholder: 'Ingrese el nombre de la editorial',
      required: true,
      value: data.nombre,
      onChange: handleChange
    },
    {
      name: 'pais',
      label: 'País',
      type: 'text',
      placeholder: 'Ingrese el país (opcional)',
      required: false,
      value: data.pais,
      onChange: handleChange
    },
    {
      name: 'ciudad',
      label: 'Ciudad',
      type: 'text',
      placeholder: 'Ingrese la ciudad (opcional)',
      required: false,
      value: data.ciudad,
      onChange: handleChange
    }
  ];

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault(); // ✅ PREVENIR SUBMIT
      e.stopPropagation(); // ✅ EVITAR PROPAGACIÓN
    }
    
    clearErrors();
    
    if (!data.nombre.trim()) {
      setError('nombre', 'El nombre de la editorial es obligatorio');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post('/api/inline-create/editorial', {
        nombre: data.nombre.trim(),
        pais: data.pais.trim() || null,
        ciudad: data.ciudad.trim() || null
      });

      if (response.data.success) {
        showAlert({
          type: 'success',
          title: 'Editorial creada',
          message: `${response.data.editorial.nombre} ha sido agregada correctamente`,
          duration: 4000
        });
        
        onEditorialCreated(response.data.editorial);
        handleCloseModal();
      }
    } catch (error: any) {
      console.error('Error al crear editorial:', error);
      
      if (error.response?.status === 409) {
        showAlert({
          type: 'warning',
          title: 'Editorial existente',
          message: error.response.data.message || 'Ya existe una editorial con el mismo nombre',
          duration: 5000
        });
      } else if (error.response?.status === 422) {
        const validationErrors = error.response.data.errors;
        Object.keys(validationErrors).forEach((key) => {
          if (['nombre', 'pais', 'ciudad'].includes(key)) {
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
          message: error.response?.data?.message || 'Ha ocurrido un error al crear la editorial',
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
        type="button" // ✅ EXPLÍCITO
        onClick={(e) => {
          e.preventDefault(); // ✅ PREVENIR SUBMIT
          e.stopPropagation();
          handleCloseModal();
        }}
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
        type="button" // ✅ EXPLÍCITO
        onClick={(e) => {
          e.preventDefault(); // ✅ PREVENIR SUBMIT
          e.stopPropagation();
          handleSubmit(e);
        }}
        disabled={isSubmitting}
        className="px-5 py-2.5 text-sm font-medium rounded-lg shadow-sm
          bg-blue-500 hover:bg-blue-600 text-white
          focus:outline-none focus:ring-2 focus:ring-blue-500
          disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {isSubmitting ? 'Guardando...' : 'Guardar Editorial'}
      </button>
    </>
  );

  return (
    <>
      <button
        type="button" // ✅ EXPLÍCITO
        onClick={handleOpenModal}
        className="ml-2 p-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 
                   bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-800/40 
                   rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        title="Agregar nueva editorial"
      >
        <Plus className="w-4 h-4" />
      </button>

      <Modal
        open={isOpen}
        onClose={handleCloseModal}
        title="Agregar Nueva Editorial"
        description="Complete los campos para agregar una nueva editorial"
        footer={modalFooter}
      >
        <Form
          initialData={data}
          fields={editorialFields as any}
          errors={errors}
          onCancel={handleCloseModal}
          onSuccess={handleSubmit}
          submitButtonText="Guardar Editorial"
          isEditing={false}
          accentColor="blue"
          showButtons={false}
          id="create-editorial-inline-form"
          processing={isSubmitting}
        />
      </Modal>
    </>
  );
}