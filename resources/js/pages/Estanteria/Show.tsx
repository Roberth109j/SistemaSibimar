import { Head, router } from '@inertiajs/react';
import { Pencil as PencilIcon, X as XMarkIcon, Trash as TrashIcon } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

// Definición de tipos
type Estanteria = {
  id: number;
  cod_estante: string;
  descripcion: string | null;
};

type ShowEstanteriaProps = {
  estanteria: Estanteria;
};

// Constantes
const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
  },
  {
    title: 'Estanterías',
    href: '/estanterias',
  },
  {
    title: 'Ver Estantería',
    href: '#',
  },
];

export default function ShowEstanteria({ estanteria }: ShowEstanteriaProps) {
  const handleDelete = () => {
    if (confirm('¿Está seguro que desea eliminar esta estantería?')) {
      router.delete(route('estanterias.destroy', estanteria.id));
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Estantería: ${estanteria.cod_estante}`} />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        <div className="border-sidebar-border/70 dark:border-sidebar-border rounded-xl border bg-white dark:bg-gray-800 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Detalles de la Estantería</h2>
            <div className="flex gap-2">
              <a
                href={route('estanterias.edit', estanteria.id)}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
              >
                <PencilIcon className="w-5 h-5" />
              </a>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
              <a
                href={route('estanterias.index')}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <XMarkIcon className="w-6 h-6" />
              </a>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">ID</dt>
                <dd className="mt-1 text-lg text-gray-900 dark:text-gray-100">{estanteria.id}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Código de Estante</dt>
                <dd className="mt-1 text-lg text-gray-900 dark:text-gray-100">{estanteria.cod_estante}</dd>
              </div>
              
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Descripción</dt>
                <dd className="mt-1 text-lg text-gray-900 dark:text-gray-100">
                  {estanteria.descripcion || '—'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}