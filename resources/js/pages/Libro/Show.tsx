import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { LibroPageProps } from './types';
import AppLayout from '@/layouts/app-layout';
import { ArrowLeft } from 'lucide-react';

export default function Show({ auth, libro, temaDewey }: LibroPageProps) {
  return (
    <AppLayout
      title={`Libro - ${libro?.titulo}`}
      user={auth.user}>
      <Head title={`Libro - ${libro?.titulo}`} />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-300">{libro?.titulo}</h2>
              <Link
                href={route('libros.index')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Volver a la lista</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Información básica */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-300">Información Básica</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">ISBN:</p>
                    <p className="text-gray-900 dark:text-gray-400">{libro?.isbn}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">Autor:</p>
                    <p className="text-gray-900 dark:text-gray-400">{libro?.autor?.nombre} {libro?.autor?.apellidos}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">Editorial:</p>
                    <p className="text-gray-900 dark:text-gray-400">{libro?.editorial?.nombre}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">Año:</p>
                    <p className="text-gray-900 dark:text-gray-400">{libro?.anio}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">Clase:</p>
                    <p className="text-gray-900 dark:text-gray-400">{libro?.clase}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">Idioma:</p>
                    <p className="text-gray-900 dark:text-gray-400">{libro?.idioma}</p>
                  </div>
                </div>
              </div>

              {/* Detalles adicionales */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-300">Detalles Adicionales</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">Páginas:</p>
                    <p className="text-gray-900 dark:text-gray-400">{libro?.paginas}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">Tomo:</p>
                    <p className="text-gray-900 dark:text-gray-400">{libro?.tomo || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">Edición:</p>
                    <p className="text-gray-900 dark:text-gray-400">{libro?.edicion || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">Fecha de Ingreso:</p>
                    <p className="text-gray-900 dark:text-gray-400">{libro?.fecha_ingreso}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">Precio:</p>
                    <p className="text-gray-900 dark:text-gray-400">{libro?.precio ? `$${libro.precio}` : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">Edad Recomendada:</p>
                    <p className="text-gray-900 dark:text-gray-400">{libro?.edad_recomendada ? `${libro.edad_recomendada} años` : 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Clasificación Dewey */}
              <div className="space-y-4 md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-300">Clasificación Dewey</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">Categoría:</p>
                    <p className="text-gray-900 dark:text-gray-400">{temaDewey?.subcategoria?.categoria?.nombre}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">Subcategoría:</p>
                    <p className="text-gray-900 dark:text-gray-400">{temaDewey?.subcategoria?.nombre}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">Tema:</p>
                    <p className="text-gray-900 dark:text-gray-400">{temaDewey?.nombre}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">Signatura Topográfica:</p>
                    <p className="text-gray-900 dark:text-gray-400">{libro?.sign_top}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">Sección:</p>
                    <p className="text-gray-900 dark:text-gray-400">{libro?.seccion?.nombre}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">Estantería:</p>
                    <p className="text-gray-900 dark:text-gray-400">{libro?.estanteria?.nombre}</p>
                  </div>
                </div>
              </div>

              {/* Contenido */}
              {libro?.contenido && (
                <div className="md:col-span-2 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-300">Contenido</h3>
                  <p className="whitespace-pre-wrap text-gray-900 dark:text-gray-400">{libro.contenido}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}