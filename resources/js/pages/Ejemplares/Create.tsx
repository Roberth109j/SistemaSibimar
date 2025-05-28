import React, { FormEvent } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
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
        <h2 className="text-xl font-semibold leading-tight text-gray-800">
          Registrar Ejemplar
        </h2>
      )}
    >
      <Head title="Registrar Ejemplar" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="numEjemplar" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Numero del ejemplar
                  </label>
                  <input
                    type="number"
                    id="numEjemplar"
                    min="1"
                    value={form.data.numEjemplar}
                    onChange={e => form.setData('numEjemplar', parseInt(e.target.value))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                  {form.errors.numEjemplar && (
                    <p className="mt-1 text-sm text-red-600">{form.errors.numEjemplar}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="tipo_adquisicion" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tipo de Adquisición
                  </label>
                  <select
                    id="tipo_adquisicion"
                    value={form.data.tipo_adquisicion}
                    onChange={e => form.setData('tipo_adquisicion', e.target.value as TipoAdquisicion)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                  >
                    {tiposAdquisicion.map(tipo => (
                      <option key={tipo} value={tipo}>
                        {tipo}
                      </option>
                    ))}
                  </select>
                  {form.errors.tipo_adquisicion && (
                    <p className="mt-1 text-sm text-red-600">{form.errors.tipo_adquisicion}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="estado" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Estado
                  </label>
                  <select
                    id="estado"
                    value={form.data.estado}
                    onChange={e => form.setData('estado', e.target.value as Estado)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                  >
                    {estados.map(estado => (
                      <option key={estado} value={estado}>
                        {estado}
                      </option>
                    ))}
                  </select>
                  {form.errors.estado && (
                    <p className="mt-1 text-sm text-red-600">{form.errors.estado}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Observaciones
                  </label>
                  <textarea
                    id="observaciones"
                    rows={4}
                    value={form.data.observaciones}
                    onChange={e => form.setData('observaciones', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                  {form.errors.observaciones && (
                    <p className="mt-1 text-sm text-red-600">{form.errors.observaciones}</p>
                  )}
                </div>

                <div className="col-span-2">
                  <div className="flex items-center justify-between">
                    <a
                      href={route('ejemplares.index', libro.id)}
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      ← Volver a Ejemplares
                    </a>
                    <button
                      type="submit"
                      disabled={form.processing}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled biopacidad-50"
                    >
                      {form.processing ? 'Guardando...' : 'Guardar Ejemplar'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}