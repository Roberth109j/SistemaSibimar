import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import Modal from '@/components/Modal';
import Form from '@/components/Form'; // Usamos el Form original ya modificado

type CreateModalProps = {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  errors?: Record<string, string>;
};

export default function CreateEstanteria({ onSuccess, onError, errors = {} }: CreateModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { data, setData, post, processing, reset, errors: formErrors, setError, clearErrors } = useForm({
    cod_estante: '',
    descripcion: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const validFields: Array<keyof typeof data> = ['cod_estante', 'descripcion'];
    if (validFields.includes(name as keyof typeof data)) {
      setData(name as keyof typeof data, value);
      console.log('Form data updated - Current state:', { ...data, [name]: value });
    } else {
      console.error('Invalid field name:', name);
    }
  };

  const handleSubmit = () => {
    clearErrors();
    
    // Validación de límite de caracteres
    const descripcionLength = data.descripcion ? String(data.descripcion).length : 0;
    if (descripcionLength > 255) {
      setError('descripcion', 'La descripción no puede exceder los 255 caracteres.');
      onError('La descripción excede el límite de 255 caracteres. Por favor, reduce el texto.');
      return;
    }
    
    console.log('Submitting form with data:', data);
    post('/estanterias', {
      preserveScroll: true,
      onSuccess: (page: any) => {
        console.log('Success response:', page);
        const successMessage = page.props.flash?.success || 'Estantería creada exitosamente';
        onSuccess(successMessage);
        reset();
        clearErrors();
        setIsOpen(false);
      },
      onError: (errors: Record<string, string>) => {
        console.log('Error response:', errors);
        const hasFieldErrors = Object.keys(errors).some(key => ['cod_estante', 'descripcion'].includes(key));
        if (hasFieldErrors) {
          Object.keys(errors).forEach((key) => {
            setError(key as keyof typeof data, errors[key]);
          });
        } else {
          const errorMessage = errors.error || 'Ha ocurrido un error al crear la estantería';
          onError(errorMessage);
        }
      },
      onFinish: () => {
        console.log('Request finished');
      }
    });
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

  const estanteriaFields = [
    {
      name: 'cod_estante',
      label: 'Código de estante',
      type: 'text',
      placeholder: 'Ingrese el código de estante',
      required: true,
      value: data.cod_estante,
      onChange: handleChange
    },
    {
      name: 'descripcion',
      label: 'Descripción',
      type: 'textarea', // Ahora como textarea
      placeholder: 'Ingrese la descripción (opcional)',
      required: false,
      value: data.descripcion,
      onChange: handleChange,
      rows: 4,
      className: 'resize-y min-h-[100px] max-h-[300px]'
    }
  ];

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
        disabled={processing || (data.descripcion ? String(data.descripcion).length > 255 : false)}
        className={`px-5 py-2.5 text-sm font-medium rounded-lg shadow-sm text-white
          focus:outline-none focus:ring-2 focus:ring-blue-500
          transition-all duration-200 ${
            processing || (data.descripcion ? String(data.descripcion).length > 255 : false)
              ? 'bg-gray-400 cursor-not-allowed opacity-50' 
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
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
        <span>Nueva Estantería</span>
      </button>
      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Crear Nueva Estantería"
        description="Complete los campos para continuar"
        footer={modalFooter}
      >
        <div onKeyDown={handleKeyPress}>
          <Form
            initialData={data}
            fields={estanteriaFields}
            errors={formErrors}
            submitUrl="/estanterias"
            method="post"
            onCancel={() => setIsOpen(false)}
            onSuccess={handleSubmit}
            submitButtonText="Guardar"
            isEditing={false}
            accentColor="blue"
            showButtons={false}
            id="create-estanteria-form"
            processing={processing}
          />
        </div>
      </Modal>
    </>
  );
}