import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
  Pencil as PencilIcon,
  Plus as PlusIcon,
  Eye as EyeIcon,
  Trash as TrashIcon,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import CreateEstanteria from './Create';
import EditEstanteria from './Edit'; // Asegúrate de tener este componente preparado para modal

type Estanteria = {
  id: number;
  cod_estante: string;
  descripcion: string | null;
};

type EstanteriaIndexProps = {
  estanterias: Estanteria[];
  flash?: {
    success?: string;
    error?: string;
  };
};

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Estanterías', href: '/estanterias' },
];

export default function Index({ estanterias, flash }: EstanteriaIndexProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Para editar
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedEstanteria, setSelectedEstanteria] = useState<Estanteria | null>(null);

  // Filtrado simple
  const filteredEstanterias = searchTerm
    ? estanterias.filter(
        (estanteria) =>
          estanteria.cod_estante.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (estanteria.descripcion &&
            estanteria.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : estanterias;

  const handleShowEstanteria = (id: number) => {
    router.get(route('estanterias.show', id));
  };

  // Ahora abre modal y carga datos para editar
  const handleEditEstanteria = (estanteria: Estanteria) => {
    setSelectedEstanteria(estanteria);
    setEditModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Está seguro que desea eliminar esta estantería?')) {
      router.delete(route('estanterias.destroy', id));
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Gestión de Estanterías" />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-2xl font-semibold">Gestión de Estanterías</h2>
            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
              <input
                type="text"
                placeholder="Buscar estanterías..."
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                onClick={() => setCreateModalOpen(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Nueva Estantería</span>
              </button>
            </div>
          </div>

          {flash?.success && (
            <div className="p-4 bg-green-100 text-green-700 rounded-lg dark:bg-green-900 dark:text-green-100">
              {flash.success}
            </div>
          )}

          {flash?.error && (
            <div className="p-4 bg-red-100 text-red-700 rounded-lg dark:bg-red-900 dark:text-red-100">
              {flash.error}
            </div>
          )}

          <div className="overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-gray-800">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredEstanterias.length > 0 ? (
                    filteredEstanterias.map((estanteria) => (
                      <tr
                        key={estanteria.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">{estanteria.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {estanteria.cod_estante}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {estanteria.descripcion || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleShowEstanteria(estanteria.id)}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                              title="Ver detalles"
                            >
                              <EyeIcon className="w-5 h-5" />
                            </button>

                            <button
                              onClick={() => handleEditEstanteria(estanteria)}
                              className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-200"
                              title="Editar"
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>

                            <button
                              onClick={() => handleDelete(estanteria.id)}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                              title="Eliminar"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                      >
                        No hay estanterías disponibles
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para crear */}
      <CreateEstanteria
        isModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

      {/* Modal para editar */}
      {selectedEstanteria && (
        <EditEstanteria
          isModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          estanteria={selectedEstanteria}
        />
      )}
    </AppLayout>
  );
}
