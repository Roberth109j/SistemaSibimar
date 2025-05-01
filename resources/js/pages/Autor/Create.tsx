import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { X as XMarkIcon, ArrowLeft, Plus } from 'lucide-react';
import AppLayout from '../../layouts/app-layout';

// Importar nuestros componentes reutilizables
import Modal from '../../components/Modal';
import Form from '../../components/Form';
import AlertNotification from '../../components/AlertNotification';

type CreateProps = {
  auth: {
    user: any;
  };
  errors?: Record<string, string>;
};

export default function Create({ auth, errors = {} }: CreateProps) {
  // Estados para controlar modal y alertas
  const [showModal, setShowModal] = useState(false);
  const [alert, setAlert] = useState<{type: 'success' | 'error', message: string} | null>(null);
  
  // Datos iniciales para el formulario
  const initialData = {
    nombres: '',
    apellidos: ''
  };

  // Campos para el formulario de autores
  const autorFields = [
    {
      name: 'nombres',
      label: 'Nombres',
      type: 'text',
      placeholder: 'Ingrese los nombres',
      required: true
    },
    {
      name: 'apellidos',
      label: 'Apellidos',
      type: 'text',
      placeholder: 'Ingrese los apellidos',
      required: true
    }
  ];

  // Manejador para enviar el formulario en la página
  const handleSubmit = (formData: any) => {
    router.post('/autores', formData, {
      onSuccess: () => {
        setAlert({
          type: 'success',
          message: 'Autor creado correctamente'
        });
        
        // Redirigir después de mostrar la alerta
        setTimeout(() => {
          router.visit('/autores');
        }, 2000);
      },
      onError: () => {
        setAlert({
          type: 'error',
          message: 'Hubo un error al crear el autor'
        });
      }
    });
  };

  // Manejador para enviar el formulario desde el modal
  const handleModalSubmit = (formData: any) => {
    router.post('/autores', formData, {
      onSuccess: () => {
        setShowModal(false);
        setAlert({
          type: 'success',
          message: 'Autor creado correctamente desde el modal'
        });
        
        // Redirigir después de mostrar la alerta
        setTimeout(() => {
          router.visit('/autores');
        }, 2000);
      },
      onError: () => {
        setAlert({
          type: 'error',
          message: 'Hubo un error al crear el autor'
        });
      }
    });
  };

  // Cancelar y volver a la lista
  const handleCancel = () => {
    router.visit('/autores');
  };

  // Botones de footer para el modal
  const modalFooter = (
    <>
      <button
        type="button"
        onClick={() => setShowModal(false)}
        className="px-5 py-2.5 text-sm font-medium rounded-lg shadow-sm
          bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 
          border border-gray-300 dark:border-gray-600
          hover:bg-gray-50 dark:hover:bg-gray-600
          focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
      >
        Cancelar
      </button>
      <button
        type="submit"
        form="modalForm"
        className="px-5 py-2.5 text-sm font-medium rounded-lg shadow-sm
          bg-blue-600 hover:bg-blue-700 text-white
          focus:outline-none focus:ring-2 focus:ring-blue-500
          disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        Guardar
      </button>
    </>
  );

  // Contenido rediseñado con nuevos colores y efectos
  const content = (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none fixed">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl dark:bg-blue-600/10"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-indigo-500/5 blur-3xl dark:bg-indigo-600/10"></div>
      </div>
      
      {/* Header con título y botones */}
      <div className="flex justify-between items-center mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <Link
            href="/autores"
            className="bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200
                      p-2 rounded-full shadow-md transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Crear Nuevo Autor
          </h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white
                   px-4 py-2 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Usar Modal</span>
        </button>
      </div>

      {/* Tarjeta principal con formulario */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden relative z-10">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white">
          <h2 className="text-xl font-semibold">Información del Autor</h2>
          <p className="text-white/70 text-sm">Complete los campos para crear un nuevo autor</p>
        </div>
        
        <div className="p-6">
          {/* Usamos nuestro componente Form reutilizable */}
          <Form
            initialData={initialData}
            fields={autorFields}
            errors={errors}
            submitUrl="/autores"
            method="post"
            onCancel={handleCancel}
            onSuccess={handleSubmit}
            submitButtonText="Guardar"
            isEditing={false}
            accentColor="blue"
          />
        </div>
      </div>

      {/* Modal reutilizable con formulario */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Crear Nuevo Autor"
        description="Complete los campos para continuar"
        titleGradient={true}
        footer={modalFooter}
      >
        <div id="modalForm">
          <Form
            initialData={initialData}
            fields={autorFields}
            errors={errors}
            submitUrl="/autores"
            method="post"
            onCancel={() => setShowModal(false)}
            onSuccess={handleModalSubmit}
            submitButtonText="Guardar"
            isEditing={false}
            accentColor="indigo"
            showButtons={false} // No mostrar botones en el formulario porque ya están en el modal
          />
        </div>
      </Modal>

      {/* Alerta de notificación */}
      {alert && (
        <AlertNotification
          type={alert.type}
          message={alert.message}
          position="top-right"
          autoClose={true}
          duration={4000}
          onClose={() => setAlert(null)}
        />
      )}
    </div>
  );

  return (
    <AppLayout>
      <Head title="Crear Autor" />
      <div className="bg-slate-50 dark:bg-gray-900 min-h-screen">
        {content}
      </div>
    </AppLayout>
  );
}