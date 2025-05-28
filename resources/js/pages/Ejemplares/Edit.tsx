import React, { FormEvent, useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, EjemplarPageProps, TipoAdquisicion, Estado } from './types';

// Definir las migas de pan (breadcrumbs)
const getBreadcrumbs = (libroId: number, libroTitulo: string, ejemplarId: number): BreadcrumbItem[] => [
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
    title: `Ejemplar #${ejemplarId}`,
    href: `/libros/${libroId}/ejemplares/${ejemplarId}`,
  },
  {
    title: 'Editar',
    href: `/libros/${libroId}/ejemplares/${ejemplarId}/edit`,
  },
];

export default function Edit({ auth, libro, ejemplar, tiposAdquisicion, estados }: EjemplarPageProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  if (!ejemplar) {
    return <div>Cargando ejemplar...</div>;
  }

  const breadcrumbs = getBreadcrumbs(libro.id, libro.titulo, ejemplar.id);

  // Formulario con Inertia
  const form = useForm({
    numEjemplar: ejemplar.numEjemplar,
    tipo_adquisicion: ejemplar.tipo_adquisicion,
    estado: ejemplar.estado,
    observaciones: ejemplar.observaciones || '',
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
      alert('La numEjemplar debe ser un número positivo');
      return;
    }

    // Mostrar indicador de carga
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.setAttribute('disabled', 'true');
      submitButton.textContent = 'Guardando...';
    }

    form.patch(route('ejemplares.update', [libro.id, ejemplar.id]), {
      onSuccess: () => {
        // Redirigir a la vista de detalles
        router.visit(route('ejemplares.show', [libro.id, ejemplar.id]));
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
          submitButton.textContent = 'Guardar Cambios';
        }
      }
    });
  };

  const handleDelete = () => {
    setShowConfirmDialog(true);
  };

  const confirmDelete = () => {
    router.delete(route('ejemplares.destroy', [libro.id, ejemplar.id]), {
      onSuccess: () => {
        router.visit(route('ejemplares.index', libro.id));
      },
      onError: (errors) => {
        const errorMessages = Object.values(errors).join('\n');
        if (errorMessages) {
          alert('No se pudo eliminar el ejemplar:\n' + errorMessages);
        }
        setShowConfirmDialog(false);
      }
    });
  };

  const cancelDelete = () => {
    setShowConfirmDialog(false);
  };

  return (
    <AppLayout
      title="Editar Ejemplar"
      breadcrumbs={breadcrumbs}
      renderHeader={() => (
        <h2 className="text-xl font-semibold leading-tight text-gray-800">
          Editar Ejemplar #{ejemplar.id}
        </h2>
      )}
    >
      <Head title={`Editar Ejemplar #${ejemplar.id}`} />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="numEjemplar" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  numEjemplar
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
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Eliminar Ejemplar
                    </button>
                    <div className="flex items-center space-x-2">
                      <a
                        href={route('ejemplares.index', [libro.id, ejemplar.id])}
                        className="px-4 py-2 bg-gray-300 text-gray-800 dark:bg-gray-600 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                      >
                        Cancelar
                      </a>
                      <button
                        type="submit"
                        disabled={form.processing}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                      >
                        {form.processing ? 'Guardando...' : 'Guardar Cambios'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modal de confirmación */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Confirmar eliminación
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              ¿Está seguro que desea eliminar este ejemplar? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-300 text-gray-800 dark:bg-gray-600 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}