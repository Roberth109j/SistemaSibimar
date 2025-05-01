import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { X as XMarkIcon, ArrowLeft } from 'lucide-react';
// Importando con rutas relativas para asegurar que funciona correctamente
import AppLayout from '../../layouts/app-layout';
import AutorForm from '../../components/Autor/AutorForm';

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
  const handleCancel = () => {
    router.visit('/autores');
  };

  // Contenido rediseñado
  const content = (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none fixed">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-amber-500/5 blur-3xl dark:bg-amber-600/10"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-amber-500/5 blur-3xl dark:bg-amber-600/10"></div>
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
          <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">
            Editar Autor
          </h1>
        </div>
        <Link
          href="/autores"
          className="bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 
                   p-2 rounded-full shadow-md transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
        >
          <XMarkIcon className="w-5 h-5" />
        </Link>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden relative z-10">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-5 text-white">
          <h2 className="text-xl font-semibold">Editar Autor</h2>
          <p className="text-white/70 text-sm mt-1">
            ID: {autor.id} - {autor.nombres} {autor.apellidos}
          </p>
        </div>
        
        <div className="p-6">
          <AutorForm 
            initialData={{ nombres: autor.nombres, apellidos: autor.apellidos }}
            errors={errors}
            submitUrl={`/autores/${autor.id}`}
            method="put"
            onCancel={handleCancel}
            submitButtonText="Actualizar"
            isEditing={true}
          />
        </div>
      </div>
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