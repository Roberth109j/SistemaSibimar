import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Pencil } from 'lucide-react';
import Modal from '@/components/Modal';
import Form from '@/components/Form'; // Usamos el Form original ya modificado
import { Estanteria } from './types';

type EditModalProps = {
  estanteria: Estanteria;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  errors?: Record<string, string>;
  all_secciones?: Array<{ id: number; nombre: string }>;
  seccionId?: number | null;
};

type FormData = {
  cod_estante: string;
  descripcion: string;
  seccion_id: number;
};

type FormField = {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  disabled?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  options?: { value: string; label: string }[];
  rows?: number;
  className?: string;
};

export default function EditEstanteria({ estanteria, onSuccess, onError, errors = {}, all_secciones = [], seccionId = null }: EditModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { data, setData, put, processing, errors: formErrors, setError, clearErrors, reset } = useForm<FormData>({
    cod_estante: estanteria.cod_estante || '',
    descripcion: estanteria.descripcion || '',
    seccion_id: estanteria.seccion_id || 0
  });

  // Sync form data with updated estanteria prop
  useEffect(() => {
    setData({
      cod_estante: estanteria.cod_estante || '',
      descripcion: estanteria.descripcion || '',
      seccion_id: estanteria.seccion_id || 0
    });
    clearErrors();
  }, [estanteria, setData, clearErrors]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'cod_estante' || name === 'descripcion' || name === 'seccion_id') {
      setData(name as keyof FormData, name === 'seccion_id' ? parseInt(value) : value);
      console.log('Form data updated - Current state:', { ...data, [name]: value });
    } else {
      console.error('Invalid field name:', name);
    }
  };

  // Función para manejar el evento de tecla
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !processing) {
      e.preventDefault();
      // Verificar si no excede el límite antes de enviar
      const descripcionLength = data.descripcion ? String(data.descripcion).length : 0;
      if (descripcionLength <= 255) {
        handleSubmit();
      }
    }
  };

  const estanteriaFields: FormField[] = [
    {
      name: 'cod_estante',
      label: 'Código de estante',
      type: 'text',
      placeholder: 'Ingrese el código de estante',
      required: true,
      value: data.cod_estante,
      onChange: handleChange,
    },
    {
      name: 'descripcion',
      label: 'Descripción',
      type: 'textarea', // Cambiado a textarea
      placeholder: 'Ingrese la descripción (opcional)',
      required: false,
      value: data.descripcion,
      onChange: handleChange,
      rows: 4,
      className: 'resize-y min-h-[100px] max-h-[300px]'
    },
    {
      name: 'seccion_id',
      label: 'Sección',
      type: 'select',
      required: true,
      value: data.seccion_id.toString(),
      onChange: handleChange,
      disabled: seccionId !== null,
      options: all_secciones.map(seccion => ({
        value: seccion.id.toString(),
        label: seccion.nombre
      }))
    }
  ];

  const handleSubmit = () => {
    clearErrors();
    
    // Validación de límite de caracteres
    const descripcionLength = data.descripcion ? String(data.descripcion).length : 0;
    if (descripcionLength > 255) {
      setError('descripcion', 'La descripción no puede exceder los 255 caracteres.');
      onError('La descripción excede el límite de 255 caracteres. Por favor, reduce el texto.');
      return;
    }
    
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
          descripcion: estanteria.descripcion || '',
          seccion_id: estanteria.seccion_id || 0
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
        if (errors.seccion_id) {
          setError('seccion_id', errors.seccion_id);
        }
        
        if (!errors.cod_estante && !errors.descripcion && !errors.seccion_id && errors.error) {
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
        disabled={processing || (data.descripcion ? String(data.descripcion).length > 255 : false)}
        className={`px-5 py-2.5 text-sm font-medium rounded-lg shadow-sm text-white
          focus:outline-none focus:ring-2 focus:ring-blue-500
          transition-all duration-200 ${
            processing || (data.descripcion ? String(data.descripcion).length > 255 : false)
              ? 'bg-gray-400 cursor-not-allowed opacity-50' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
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
        <div className="w-full text-left" onKeyDown={handleKeyPress}>
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
            accentColor="blue"
            showButtons={false}
            id="edit-estanteria-form"
            processing={processing}
          />
        </div>
      </Modal>
    </>
  );
}