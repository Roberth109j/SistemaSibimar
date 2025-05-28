import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Eye, X, Edit, PlusCircle, Library } from 'lucide-react';

type Libro = {
  id: number;
  isbn: string;
  titulo: string;
  autor?: {
    id: number;
    nombres: string;
    apellidos: string;
  };
  editorial?: {
    id: number;
    nombre: string;
  };
  clase?: string;
  idioma?: string;
  paginas?: number;
  sign_top?: string;
  estanteria?: {
    id: number;
    nombre: string;
    cod_estante: string;
  };
  seccion?: {
    id: number;
    nombre: string;
  };
  contenido?: string;
  tomo?: string;
  edicion?: string;
  ejemplares_count?: number;
};

export default function ShowLibro({ libro }: { libro: Libro }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-800/50"
      >
        <Eye className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm transition-opacity"
              onClick={() => setIsOpen(false)}
            ></div>

            {/* Modal */}
            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full p-6 overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Detalles del Libro</h2>
                <div className="flex gap-2">
                  <Link
                    href={route('libros.edit', libro.id)}
                    className="p-1.5 bg-yellow-50 text-yellow-600 rounded-md hover:bg-yellow-100 transition-colors dark:bg-yellow-900/30 dark:text-yellow-400 dark:hover:bg-yellow-800/50"
                  >
                    <Edit className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">ISBN</dt>
                    <dd className="mt-1 text-lg text-gray-900 dark:text-gray-100">{libro.isbn}</dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Título</dt>
                    <dd className="mt-1 text-lg text-gray-900 dark:text-gray-100">
                      {libro.titulo}
                      {libro.tomo && <span className="ml-1 text-gray-500 dark:text-gray-400"> (Tomo {libro.tomo})</span>}
                      {libro.edicion && <span className="ml-1 text-gray-500 dark:text-gray-400"> (Ed. {libro.edicion})</span>}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Autor</dt>
                    <dd className="mt-1 text-lg text-gray-900 dark:text-gray-100">
                      {libro.autor ? `${libro.autor.apellidos}, ${libro.autor.nombres}` : '—'}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Editorial</dt>
                    <dd className="mt-1 text-lg text-gray-900 dark:text-gray-100">
                      {libro.editorial ? libro.editorial.nombre : '—'}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Clase</dt>
                    <dd className="mt-1 text-lg text-gray-900 dark:text-gray-100">{libro.clase || '—'}</dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Idioma</dt>
                    <dd className="mt-1 text-lg text-gray-900 dark:text-gray-100">{libro.idioma || '—'}</dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Páginas</dt>
                    <dd className="mt-1 text-lg text-gray-900 dark:text-gray-100">{libro.paginas || '—'}</dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Signatura Topográfica</dt>
                    <dd className="mt-1 text-lg text-gray-900 dark:text-gray-100">{libro.sign_top || '—'}</dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Estantería</dt>
                    <dd className="mt-1 text-lg text-gray-900 dark:text-gray-100">
                      {libro.estanteria ? libro.estanteria.nombre || libro.estanteria.cod_estante : '—'}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Sección</dt>
                    <dd className="mt-1 text-lg text-gray-900 dark:text-gray-100">
                      {libro.seccion ? libro.seccion.nombre : '—'}
                    </dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Ejemplares</dt>
                    <dd className="mt-1 text-lg text-gray-900 dark:text-gray-100">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                        {libro.ejemplares_count || 0}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>

              {libro.contenido && (
                <div className="mt-8">
                  <h3 className="text-xl font-medium mb-4 text-gray-900 dark:text-white">Contenido del Libro</h3>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{libro.contenido}</p>
                  </div>
                </div>
              )}

              {/* Botones para gestionar ejemplares */}
              <div className="mt-8">
                <h3 className="text-xl font-medium mb-4 text-gray-900 dark:text-white">Gestión de Ejemplares</h3>
                <div className="flex space-x-3">
                  <Link
                    href={route('ejemplares.index', libro.id)}
                    className="flex items-center gap-2 px-4 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
                  >
                    <Library className="w-5 h-5" />
                    <span>Ver Ejemplares</span>
                  </Link>
                  <Link
                    href={route('ejemplares.create', libro.id)}
                    className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-md"
                  >
                    <PlusCircle className="w-5 h-5" />
                    <span>Añadir Ejemplar</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}