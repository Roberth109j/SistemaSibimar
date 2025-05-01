import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Pencil as PencilIcon, ArrowLeft, BookOpen } from 'lucide-react';
// Importando con rutas relativas para asegurar que funciona correctamente
import AppLayout from '../../layouts/app-layout';
import AutorModal from '../../components/Autor/AutorModal';

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
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openEditModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Contenido rediseñado con nuevos colores y efectos
  const content = (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
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
      <AutorModal
        isOpen={isModalOpen}
        onClose={closeModal}
        initialData={{ nombres: autor.nombres, apellidos: autor.apellidos }}
        autor={autor}
        isEditing={true}
        errors={errors}
      />
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