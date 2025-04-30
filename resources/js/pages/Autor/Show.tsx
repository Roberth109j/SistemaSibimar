// Show.tsx
import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Pencil as PencilIcon, X as XMarkIcon } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

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
};

export default function Show({ auth, autor }: ShowProps) {
  // Contenido original
  const content = (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Detalles del Autor</h1>
        <div className="flex gap-2">
          <Link
            href={`/autores/${autor.id}/edit`}
            className="p-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
          >
            <PencilIcon className="w-5 h-5" />
          </Link>
          <Link
            href="/autores"
            className="text-gray-400 hover:text-white"
          >
            <XMarkIcon className="w-6 h-6" />
          </Link>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="bg-gray-700 rounded-lg p-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-400">ID</dt>
              <dd className="mt-1 text-lg text-white">{autor.id}</dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-400">Apellidos</dt>
              <dd className="mt-1 text-lg text-white">{autor.apellidos}</dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-400">Nombres</dt>
              <dd className="mt-1 text-lg text-white">{autor.nombres}</dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-400">Nombre Completo</dt>
              <dd className="mt-1 text-lg text-white">{`${autor.apellidos}, ${autor.nombres}`}</dd>
            </div>
          </dl>
        </div>

        {autor.libros && autor.libros.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-medium text-white mb-4">Libros del Autor</h3>
            <ul className="list-disc pl-5 space-y-2">
              {autor.libros.map((libro) => (
                <li key={libro.id} className="text-gray-300">
                  {libro.titulo}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );

  // Corregido: eliminando el prop user
  return (
    <AppLayout>
      <Head title={`Autor: ${autor.apellidos}, ${autor.nombres}`} />
      {content}
    </AppLayout>
  );
}