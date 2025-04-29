import { useState, useEffect, Fragment } from 'react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, router } from '@inertiajs/react';
import { Pencil as PencilIcon, Plus as PlusIcon, Eye as EyeIcon, X as XMarkIcon, Trash as TrashIcon } from 'lucide-react';

// Definición de tipos
type Estanteria = {
  id: number;
  cod_estante: string;
  descripcion: string | null;
};

type EstanteriaProps = {
  estanterias?: Estanteria[];
  estanteria?: Estanteria;
  errors?: Record<string, string>;
  flash?: {
    success?: string;
    error?: string;
  };
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
];

export default function Estanteria({ estanterias = [], estanteria, errors = {}, flash }: EstanteriaProps) {
  // Estados locales para controlar la UI
  const [view, setView] = useState<'list' | 'create' | 'edit' | 'show'>('list');
  const [selectedEstanteria, setSelectedEstanteria] = useState<Estanteria | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Formularios con Inertia
  const createForm = useForm({
    cod_estante: '',
    descripcion: '',
  });

  const editForm = useForm({
    cod_estante: '',
    descripcion: '',
  });

  // Efectos
  useEffect(() => {
    if (estanteria) {
      setSelectedEstanteria(estanteria);
      if (view === 'edit') {
        editForm.setData({
          cod_estante: estanteria.cod_estante,
          descripcion: estanteria.descripcion || '',
        });
      }
    }
  }, [estanteria]);

  useEffect(() => {
    if (flash?.success) {
      // Reset a vista de lista después de operaciones exitosas
      setView('list');
      createForm.reset();
      editForm.reset();
    }
  }, [flash]);

  // Funciones de manejo
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createForm.post(route('estanterias.store'), {
      onSuccess: () => {
        setView('list');
        createForm.reset();
      },
    });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEstanteria) {
      editForm.patch(route('estanterias.update', selectedEstanteria.id), {
        onSuccess: () => {
          setView('list');
          editForm.reset();
        },
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Está seguro que desea eliminar esta estantería?')) {
      router.delete(route('estanterias.destroy', id));
    }
  };

  const handleShowEstanteria = (estanteria: Estanteria) => {
    setSelectedEstanteria(estanteria);
    setView('show');
  };

  const handleEditEstanteria = (estanteria: Estanteria) => {
    setSelectedEstanteria(estanteria);
    editForm.setData({
      cod_estante: estanteria.cod_estante,
      descripcion: estanteria.descripcion || '',
    });
    setView('edit');
  };

  const filteredEstanterias = searchTerm 
    ? estanterias.filter(
        estanteria => 
          estanteria.cod_estante.toLowerCase().includes(searchTerm.toLowerCase()) || 
          (estanteria.descripcion && estanteria.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : estanterias;

  // Componentes de vistas
  const renderListView = () => (
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
            onClick={() => setView('create')}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Código</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Descripción</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredEstanterias.length > 0 ? (
                filteredEstanterias.map((estanteria) => (
                  <tr key={estanteria.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">{estanteria.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{estanteria.cod_estante}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{estanteria.descripcion || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleShowEstanteria(estanteria)}
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
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No hay estanterías disponibles
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCreateView = () => (
    <div className="border-sidebar-border/70 dark:border-sidebar-border rounded-xl border bg-white dark:bg-gray-800 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Crear Nueva Estantería</h2>
        <button
          onClick={() => setView('list')}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleCreate} className="space-y-6 max-w-xl">
        <div>
          <label htmlFor="cod_estante" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Código de Estante
          </label>
          <input
            id="cod_estante"
            type="text"
            name="cod_estante"
            value={createForm.data.cod_estante}
            onChange={(e) => createForm.setData('cod_estante', e.target.value)}
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
            value={createForm.data.descripcion}
            onChange={(e) => createForm.setData('descripcion', e.target.value)}
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
            onClick={() => setView('list')}
            className="mr-3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={createForm.processing}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  );

  const renderEditView = () => (
    <div className="border-sidebar-border/70 dark:border-sidebar-border rounded-xl border bg-white dark:bg-gray-800 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Editar Estantería</h2>
        <button
          onClick={() => setView('list')}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleUpdate} className="space-y-6 max-w-xl">
        <div>
          <label htmlFor="edit-cod_estante" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Código de Estante
          </label>
          <input
            id="edit-cod_estante"
            type="text"
            name="cod_estante"
            value={editForm.data.cod_estante}
            onChange={(e) => editForm.setData('cod_estante', e.target.value)}
            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
            placeholder="Ej: A1, B2, etc."
            required
          />
          {errors.cod_estante && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.cod_estante}</p>
          )}
        </div>

        <div>
          <label htmlFor="edit-descripcion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Descripción
          </label>
          <textarea
            id="edit-descripcion"
            name="descripcion"
            value={editForm.data.descripcion}
            onChange={(e) => editForm.setData('descripcion', e.target.value)}
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
            onClick={() => setView('list')}
            className="mr-3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={editForm.processing}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            Actualizar
          </button>
        </div>
      </form>
    </div>
  );

  const renderShowView = () => {
    if (!selectedEstanteria) return null;
    
    return (
      <div className="border-sidebar-border/70 dark:border-sidebar-border rounded-xl border bg-white dark:bg-gray-800 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Detalles de la Estantería</h2>
          <div className="flex gap-2">
            <button
              onClick={() => handleEditEstanteria(selectedEstanteria)}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
            >
              <PencilIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleDelete(selectedEstanteria.id)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setView('list')}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">ID</dt>
              <dd className="mt-1 text-lg text-gray-900 dark:text-gray-100">{selectedEstanteria.id}</dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Código de Estante</dt>
              <dd className="mt-1 text-lg text-gray-900 dark:text-gray-100">{selectedEstanteria.cod_estante}</dd>
            </div>
            
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Descripción</dt>
              <dd className="mt-1 text-lg text-gray-900 dark:text-gray-100">
                {selectedEstanteria.descripcion || '—'}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    );
  };

  // Renderizado principal
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Gestión de Estanterías" />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        {view === 'list' && renderListView()}
        {view === 'create' && renderCreateView()}
        {view === 'edit' && renderEditView()}
        {view === 'show' && renderShowView()}
      </div>
    </AppLayout>
  );
}