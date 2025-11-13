import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import Modal from '@/components/Modal';
import Form from '@/components/Form';
import { useAlert } from '@/components/AlertNotification';
import axios from 'axios';

type CreateEstanteriaInlineProps = {
  onEstanteriaCreated: (estanteria: any) => void;
  secciones: Array<{ id: number; nombre: string }>;
  seccionId?: number | null;
};

export default function CreateEstanteriaInline({
  onEstanteriaCreated,
  secciones = [],
  seccionId = null
}: CreateEstanteriaInlineProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showAlert } = useAlert();

  const { data, setData, reset, errors, setError, clearErrors } = useForm({
    cod_estante: '',
    descripcion: '',
    seccion_id: seccionId || ''
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
    setData({
      cod_estante: '',
      descripcion: '',
      seccion_id: seccionId || ''
    });
    setIsOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const validFields: Array<keyof typeof data> = ['cod_estante', 'descripcion', 'seccion_id'];

    if (validFields.includes(name as keyof typeof data)) {
      // Convertir a mayúsculas para cod_estante y descripcion
      const processedValue = (name === 'cod_estante' || name === 'descripcion') ? value.toUpperCase() : value;
      setData(name as keyof typeof data, processedValue);
    }
  };

  const estanteriaFields = [
    {
      name: 'cod_estante',
      label: 'Código de estante',
      type: 'text',
      placeholder: 'Ingrese el código de estante',
      required: true,
      value: data.cod_estante,
      onChange: handleChange,
      style: { textTransform: 'uppercase' as const }
    },
    {
      name: 'descripcion',
      label: 'Descripción',
      type: 'textarea',
      placeholder: 'Ingrese la descripción (opcional)',
      required: false,
      value: data.descripcion,
      onChange: handleChange,
      rows: 3,
      className: 'resize-y min-h-[80px] max-h-[200px]',
      style: { textTransform: 'uppercase' as const }
    },
    {
      name: 'seccion_id',
      label: 'Sección',
      type: 'select',
      required: true,
      value: data.seccion_id,
      onChange: handleChange,
      disabled: seccionId !== null,
      options: secciones.map(seccion => ({
        value: seccion.id.toString(),
        label: seccion.nombre
      }))
    }
  ];

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault(); // ✅ PREVENIR SUBMIT
      e.stopPropagation(); // ✅ EVITAR PROPAGACIÓN
    }

    clearErrors();

    if (!data.cod_estante.trim()) {
      setError('cod_estante', 'El código de estante es obligatorio');
      return;
    }

    if (!data.seccion_id) {
      setError('seccion_id', 'La sección es obligatoria');
      return;
    }

    if (data.descripcion && data.descripcion.length > 255) {
      setError('descripcion', 'La descripción no puede exceder los 255 caracteres');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post('/api/inline-create/estanteria', {
        cod_estante: data.cod_estante.trim(),
        descripcion: data.descripcion.trim() || null,
        seccion_id: parseInt(data.seccion_id as string)
      });

      if (response.data.success) {
        showAlert({
          type: 'success',
          title: 'Estantería creada',
          message: `Estantería ${response.data.estanteria.cod_estante} ha sido agregada correctamente`,
          duration: 4000
        });

        onEstanteriaCreated(response.data.estanteria);
        handleCloseModal();
      }
    } catch (error: any) {
      console.error('Error al crear estantería:', error);

      if (error.response?.status === 409) {
        showAlert({
          type: 'warning',
          title: 'Estantería existente',
          message: error.response.data.message || 'Ya existe una estantería con el mismo código',
          duration: 5000
        });
      } else if (error.response?.status === 403) {
        showAlert({
          type: 'error',
          title: 'Sin permisos',
          message: error.response.data.message || 'No tienes permisos para crear estanterías en esta sección',
          duration: 5000
        });
      } else if (error.response?.status === 422) {
        const validationErrors = error.response.data.errors;
        Object.keys(validationErrors).forEach((key) => {
          if (['cod_estante', 'descripcion', 'seccion_id'].includes(key)) {
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
          message: error.response?.data?.message || 'Ha ocurrido un error al crear la estantería',
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
        {isSubmitting ? 'Guardando...' : 'Guardar Estantería'}
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
        title="Agregar nueva estantería"
      >
        <Plus className="w-4 h-4" />
      </button>

      <Modal
        open={isOpen}
        onClose={handleCloseModal}
        title="Agregar Nueva Estantería"
        description="Complete los campos para agregar una nueva estantería"
        footer={modalFooter}
      >
        <Form
          initialData={data}
          fields={estanteriaFields as any[]}
          errors={errors}
          onCancel={handleCloseModal}
          onSuccess={handleSubmit}
          submitButtonText="Guardar Estantería"
          isEditing={false}
          accentColor="blue"
          showButtons={false}
          id="create-estanteria-inline-form"
          processing={isSubmitting}
        />
      </Modal>
    </>
  );
}