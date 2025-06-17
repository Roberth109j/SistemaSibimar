import React, { FormEvent } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { BookOpen, Save, ArrowLeft, FileText, Tag, Package, MessageSquare } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, EjemplarPageProps, TipoAdquisicion, Estado } from './types';

// Definir las migas de pan (breadcrumbs)
const getBreadcrumbs = (libroId: number, libroTitulo: string): BreadcrumbItem[] => [
  {
    title: 'Dashboard',
    href: '/dashboard',
  },
  {
    title: 'Libros',
    href: '/libros',
  },
  {
    title: libroTitulo,
    href: `/libros/${libroId}`,
  },
  {
    title: 'Ejemplares',
    href: `/libros/${libroId}/ejemplares`,
  },
  {
    title: 'Crear Ejemplar',
    href: `/libros/${libroId}/ejemplares/create`,
  },
];

export default function Create({ auth, libro, tiposAdquisicion, estados }: EjemplarPageProps) {
  const breadcrumbs = getBreadcrumbs(libro.id, libro.titulo);

  // Formulario con Inertia
  const form = useForm({
    numEjemplar: 1,
    tipo_adquisicion: tiposAdquisicion[0] || 'COMPRA',
    estado: estados[0] || 'DISPONIBLE',
    observaciones: '',
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Validar campos requeridos
    const camposRequeridos = {
      numEjemplar: 'numEjemplar',
      tipo_adquisicion: 'Tipo de Adquisición',
      estado: 'Estado',
    };

    const camposFaltantes = Object.entries(camposRequeridos)
      .filter(([key]) => !form.data[key as keyof typeof form.data])
      .map(([, label]) => label);

    if (camposFaltantes.length > 0) {
      const mensaje = `Por favor, complete los siguientes campos obligatorios:\n- ${camposFaltantes.join('\n- ')}`;
      alert(mensaje);
      return;
    }

    // Validar que la numEjemplar sea un número positivo
    if (form.data.numEjemplar <= 0) {
      alert('El numero de ejemplar debe ser un número positivo');
      return;
    }

    // Mostrar indicador de carga
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.setAttribute('disabled', 'true');
      submitButton.textContent = 'Guardando...';
    }

    form.post(route('ejemplares.store', libro.id), {
      onSuccess: () => {
        // Redirigir a la lista de ejemplares
        router.visit(route('ejemplares.index', libro.id));
      },
      onError: (errors) => {
        // Mostrar errores específicos del servidor
        const errorMessages = Object.values(errors).join('\n');
        if (errorMessages) {
          alert('Se encontraron los siguientes errores:\n' + errorMessages);
        }

        // Restaurar el botón
        if (submitButton) {
          submitButton.removeAttribute('disabled');
          submitButton.textContent = 'Guardar';
        }
      }
    });
  };

  return (
    <AppLayout
      breadcrumbs={breadcrumbs}
      renderHeader={() => (
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Registrar Nuevo Ejemplar
          </h2>
        </div>
      )}
    >
      <Head title="Registrar Ejemplar" />

      <div className="py-8 px-6 bg-slate-50 dark:bg-black min-h-screen">
        {/* Efectos de fondo decorativos */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-500/5 filter blur-3xl dark:bg-blue-600/10"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-indigo-500/5 filter blur-3xl dark:bg-indigo-600/10"></div>
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          {/* Header del libro */}
          <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {libro.titulo}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Creando ejemplar para este libro
                </p>
              </div>
            </div>
          </div>

          {/* Formulario principal */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Número de Ejemplar */}
                  <div className="space-y-2">
                    <label htmlFor="numEjemplar" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Número del Ejemplar <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="numEjemplar"
                      min="1"
                      value={form.data.numEjemplar}
                      onChange={e => form.setData('numEjemplar', parseInt(e.target.value))}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 px-3 py-2 text-sm"
                      placeholder="Ingrese el número del ejemplar"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Número único del ejemplar
                    </p>
                    {form.errors.numEjemplar && (
                      <p className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded-md border-l-2 border-red-500">
                        {form.errors.numEjemplar}
                      </p>
                    )}
                  </div>

                  {/* Tipo de Adquisición */}
                  <div className="space-y-2">
                    <label htmlFor="tipo_adquisicion" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Tipo de Adquisición <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="tipo_adquisicion"
                      value={form.data.tipo_adquisicion}
                      onChange={e => form.setData('tipo_adquisicion', e.target.value as TipoAdquisicion)}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 px-3 py-2 text-sm"
                    >
                      {tiposAdquisicion.map(tipo => (
                        <option key={tipo} value={tipo}>
                          {tipo}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Forma en que se obtuvo el ejemplar
                    </p>
                    {form.errors.tipo_adquisicion && (
                      <p className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded-md border-l-2 border-red-500">
                        {form.errors.tipo_adquisicion}
                      </p>
                    )}
                  </div>

                  {/* Estado */}
                  <div className="space-y-2">
                    <label htmlFor="estado" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Estado <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="estado"
                      value={form.data.estado}
                      onChange={e => form.setData('estado', e.target.value as Estado)}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 px-3 py-2 text-sm"
                    >
                      {estados.map(estado => (
                        <option key={estado} value={estado}>
                          {estado}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Estado actual del ejemplar
                    </p>
                    {form.errors.estado && (
                      <p className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded-md border-l-2 border-red-500">
                        {form.errors.estado}
                      </p>
                    )}
                  </div>
                </div>

                {/* Observaciones - Ocupa toda la fila */}
                <div className="space-y-2">
                  <label htmlFor="observaciones" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Observaciones
                  </label>
                  <textarea
                    id="observaciones"
                    rows={3}
                    value={form.data.observaciones}
                    onChange={e => form.setData('observaciones', e.target.value)}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 px-3 py-2 text-sm resize-none"
                    placeholder="Agregue observaciones adicionales (opcional)"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Información adicional sobre el ejemplar
                  </p>
                  {form.errors.observaciones && (
                    <p className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded-md border-l-2 border-red-500">
                      {form.errors.observaciones}
                    </p>
                  )}
                </div>

                {/* Botones de acción */}
                <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
                  <a
                    href={route('ejemplares.index', libro.id)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Volver a Ejemplares
                  </a>
                  
                  <button
                    type="submit"
                    disabled={form.processing}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      <span>{form.processing ? 'Guardando...' : 'Guardar Ejemplar'}</span>
                    </div>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Información adicional */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start space-x-3">
              <div className="p-1 bg-blue-100 dark:bg-blue-800/50 rounded">
                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                  Información importante
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                  Los campos marcados con <span className="text-red-500">*</span> son obligatorios. 
                  El número de ejemplar debe ser único dentro de este libro.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}