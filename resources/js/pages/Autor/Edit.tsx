import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { X as XMarkIcon, ArrowLeft, Edit as EditIcon } from 'lucide-react';
import AppLayout from '../../layouts/app-layout';

// Importar nuestros componentes reutilizables
import Modal from '../../components/Modal';
import Form from '../../components/Form';
import AlertNotification from '../../components/AlertNotification';

type Autor = {
  id: number;
  apellidos: string;
  nombres: string;
  libros?: { id: number; titulo: string }[];
};

type EditProps = {
  auth: {
    user: any;
  };
  autor: Autor;
  errors?: Record<string, string>;
};

export default function Edit({ auth, autor, errors = {} }: EditProps) {
  // Estados para controlar modal y alertas
  const [showModal, setShowModal] = useState(false);
  const [alert, setAlert] = useState<{type: 'success' | 'error', message: string} | null>(null);
  
  // Datos iniciales para el formulario
  const initialData = {
    nombres: autor.nombres,
    apellidos: autor.apellidos
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
    router.put(`/autores/${autor.id}`, formData, {
      onSuccess: () => {
        setAlert({
          type: 'success',
          message: 'Autor actualizado correctamente'
        });
        
        // Redirigir después de mostrar la alerta
        setTimeout(() => {
          router.visit('/autores');
        }, 2000);
      },
      onError: () => {
        setAlert({
          type: 'error',
          message: 'Hubo un error al actualizar el autor'
        });
      }
    });
  };

  // Función específica para manejar la actualización desde el modal
  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Obtener los datos del formulario directamente del DOM
    const form = document.getElementById('modalForm') as HTMLFormElement;
    const formData = new FormData(form);
    const data = {
      nombres: formData.get('nombres') as string,
      apellidos: formData.get('apellidos') as string
    };
    
    // Enviar la solicitud con los datos obtenidos
    router.put(`/autores/${autor.id}`, data, {
      onSuccess: () => {
        setShowModal(false);
        setAlert({
          type: 'success',
          message: 'Autor actualizado correctamente'
        });
        
        setTimeout(() => {
          router.visit('/autores');
        }, 2000);
      },
      onError: () => {
        setAlert({
          type: 'error',
          message: 'Hubo un error al actualizar el autor'
        });
      }
    });
  };

  // Cancelar y volver a la lista
  const handleCancel = () => {
    router.visit('/autores');
  };

  // Contenido rediseñado con nuevos colores y efectos
  const content = (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none fixed">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-amber-500/5 blur-3xl dark:bg-amber-600/10"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-amber-500/5 blur-3xl dark:bg-amber-600/10"></div>
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
          <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">
            Editar Autor
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white
                     px-4 py-2 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2"
          >
            <EditIcon className="w-4 h-4" />
            <span>Editar en Modal</span>
          </button>
          <Link
            href="/autores"
            className="bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200
                      p-2 rounded-full shadow-md transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <XMarkIcon className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Tarjeta principal con formulario */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden relative z-10">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-5 text-white">
          <h2 className="text-xl font-semibold">Editar Autor</h2>
          <p className="text-white/70 text-sm mt-1">
            ID: {autor.id} - {autor.nombres} {autor.apellidos}
          </p>
        </div>
        
        <div className="p-6">
          {/* Usamos nuestro componente Form reutilizable para la página principal */}
          <Form
            initialData={initialData}
            fields={autorFields}
            errors={errors}
            submitUrl={`/autores/${autor.id}`}
            method="put"
            onCancel={handleCancel}
            onSuccess={handleSubmit}
            submitButtonText="Actualizar"
            isEditing={true}
            accentColor="amber"
          />
        </div>
      </div>

      {/* Modal con formulario directo para asegurar que se muestren todos los campos */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Editar Autor"
      >
        <form id="modalForm" onSubmit={handleModalSubmit} className="space-y-4">
          {/* Campo Nombres */}
          <div>
            <label 
              htmlFor="modal-nombres" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Nombres
            </label>
            <input
              id="modal-nombres"
              name="nombres"
              type="text"
              defaultValue={initialData.nombres}
              required
              className="block w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            {errors.nombres && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.nombres}</p>
            )}
          </div>

          {/* Campo Apellidos - IMPORTANTE: SIEMPRE INCLUIR ESTE CAMPO */}
          <div>
            <label 
              htmlFor="modal-apellidos" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Apellidos
            </label>
            <input
              id="modal-apellidos"
              name="apellidos"
              type="text"
              defaultValue={initialData.apellidos}
              required
              className="block w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            {errors.apellidos && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.apellidos}</p>
            )}
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
            >
              Actualizar
            </button>
          </div>
        </form>
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
      <Head title={`Editar Autor: ${autor.nombres} ${autor.apellidos}`} />
      <div className="bg-slate-50 dark:bg-gray-900 min-h-screen">
        {content}
      </div>
    </AppLayout>
  );
}