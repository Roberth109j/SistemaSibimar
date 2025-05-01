import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Pencil as PencilIcon, ArrowLeft, BookOpen } from 'lucide-react';
// Importando componentes reutilizables
import AppLayout from '../../layouts/app-layout';
import Modal from '../../components/Modal';
import Form from '../../components/Form';
import AlertNotification from '../../components/AlertNotification';

type Libro = {
  id: number;
  titulo: string;
};

type Autor = {
  id: number;
  apellidos: string;
  nombres: string;
  libros?: Libro[];
};

type ShowProps = {
  auth: {
    user: any;
  };
  autor: Autor;
  errors?: Record<string, string>;
};

export default function Show({ auth, autor, errors = {} }: ShowProps) {
  // Estados para manejar el modal y las alertas
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  // Abrir el modal de edición
  const openEditModal = () => {
    setIsModalOpen(true);
  };

  // Cerrar el modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Manejar la actualización del autor
  const handleUpdate = (formData: any) => {
    router.put(`/autores/${autor.id}`, formData, {
      onSuccess: () => {
        setIsModalOpen(false);
        setAlert({
          type: 'success',
          message: 'Autor actualizado correctamente'
        });
        
        // Recargar la página después de mostrar la alerta
        setTimeout(() => {
          window.location.reload();
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

  // Cancelar y cerrar el modal
  const handleCancel = () => {
    closeModal();
  };

  // Botones para el footer del modal
  const modalFooter = (
    <>
      <button
        type="button"
        onClick={closeModal}
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
        Actualizar
      </button>
    </>
  );

  // Contenido principal
  const content = (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
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

      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none fixed">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl dark:bg-blue-600/10"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-indigo-500/5 blur-3xl dark:bg-indigo-600/10"></div>
      </div>
      
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
            Detalles del Autor
          </h1>
        </div>
        <button
          onClick={openEditModal}
          className="p-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg 
                    hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          title="Editar autor"
        >
          <PencilIcon className="w-5 h-5" />
        </button>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden relative z-10">
        {/* Header con gradiente y avatar */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-white">
          <div className="flex items-center">
            <div className="flex-shrink-0 mr-5">
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold">
                {autor.nombres.charAt(0)}{autor.apellidos.charAt(0)}
              </div>
            </div>
            <div>
              <p className="text-white/70 text-sm">Autor ID: {autor.id}</p>
              <h2 className="text-2xl font-bold">{`${autor.nombres} ${autor.apellidos}`}</h2>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Nombres</dt>
              <dd className="mt-2 text-lg text-gray-900 dark:text-white font-medium">{autor.nombres}</dd>
            </div>
            
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Apellidos</dt>
              <dd className="mt-2 text-lg text-gray-900 dark:text-white font-medium">{autor.apellidos}</dd>
            </div>
            
            <div className="sm:col-span-2 border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Nombre Completo</dt>
              <dd className="mt-2 text-lg text-gray-900 dark:text-white font-medium">{`${autor.nombres} ${autor.apellidos}`}</dd>
            </div>
          </dl>
        </div>

        {autor.libros && autor.libros.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700">
            <div className="bg-gray-50 dark:bg-gray-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Libros del Autor ({autor.libros.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {autor.libros.map((libro) => (
                  <div 
                    key={libro.id} 
                    className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700
                              hover:shadow-md transition-shadow duration-200 flex items-center gap-3 transform hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 
                                  flex items-center justify-center text-white font-semibold shadow">
                      {libro.id}
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {libro.titulo}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal para editar autor */}
      <Modal
        open={isModalOpen}
        onClose={closeModal}
        title="Editar Autor"
        description={`ID: ${autor.id} - ${autor.nombres} ${autor.apellidos}`}
        titleGradient={true}
        footer={modalFooter}
      >
        <div id="modalForm">
          <Form
            id="modalForm"
            initialData={initialData}
            fields={autorFields}
            errors={errors}
            submitUrl={`/autores/${autor.id}`}
            method="put"
            onCancel={handleCancel}
            onSuccess={handleUpdate}
            submitButtonText="Actualizar"
            isEditing={true}
            accentColor="amber"
            showButtons={false} // No mostrar botones en el formulario porque ya están en el modal
          />
        </div>
      </Modal>
    </div>
  );

  return (
    <AppLayout>
      <Head title={`Autor: ${autor.nombres} ${autor.apellidos}`} />
      <div className="bg-slate-50 dark:bg-gray-900 min-h-screen">
        {content}
      </div>
    </AppLayout>
  );
}