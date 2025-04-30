import { useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { X as XMarkIcon } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import Modal from '@/components/Modal'; // Importa tu Modal
import { type BreadcrumbItem } from '@/types';

type Estanteria = {
  id: number;
  cod_estante: string;
  descripcion: string | null;
};

type EditEstanteriaProps = {
  estanteria: Estanteria;
  errors?: Record<string, string>;
  isModal?: boolean;
  open?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
};

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Estanterías', href: '/estanterias' },
  { title: 'Editar Estantería', href: '#' },
];

export default function EditEstanteria({
  estanteria,
  errors = {},
  isModal = false,
  open = false,
  onClose,
  onSuccess,
}: EditEstanteriaProps) {
  const form = useForm({
    cod_estante: estanteria.cod_estante,
    descripcion: estanteria.descripcion || '',
  });

  useEffect(() => {
    form.setData({
      cod_estante: estanteria.cod_estante,
      descripcion: estanteria.descripcion || '',
    });
  }, [estanteria]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.patch(route('estanterias.update', estanteria.id), {
      onSuccess: () => {
        onSuccess?.();
        if (isModal && onClose) onClose();
      },
    });
  };

  const FormContent = (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Editar Estantería</h2>
        {!isModal && (
          <a
            href={route('estanterias.index')}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <XMarkIcon className="w-6 h-6" />
          </a>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
        <div>
          <label htmlFor="cod_estante" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Código de Estante
          </label>
          <input
            id="cod_estante"
            type="text"
            name="cod_estante"
            value={form.data.cod_estante}
            onChange={(e) => form.setData('cod_estante', e.target.value)}
            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
            placeholder="Ej: A1, B2, etc."
            required
          />
          {errors.cod_estante && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.cod_estante}</p>
          )}
        </div>

        <div>
          <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Descripción
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={form.data.descripcion}
            onChange={(e) => form.setData('descripcion', e.target.value)}
            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
            placeholder="Descripción opcional de la estantería"
            rows={3}
          />
          {errors.descripcion && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.descripcion}</p>
          )}
        </div>

        <div className="flex justify-end pt-5">
          <button
            type="button"
            onClick={
              isModal && onClose
                ? onClose
                : () => (window.location.href = route('estanterias.index'))
            }
            className="mr-3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={form.processing}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            Actualizar
          </button>
        </div>
      </form>
    </>
  );

  if (isModal) {
    return (
      <Modal open={!!open} onClose={onClose!}>
        {FormContent}
      </Modal>
    );
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Editar Estantería ${estanteria.cod_estante}`} />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        <div className="border-sidebar-border/70 dark:border-sidebar-border rounded-xl border bg-white dark:bg-gray-800 p-6">
          {FormContent}
        </div>
      </div>
    </AppLayout>
  );
}
