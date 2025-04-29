import { useState, useEffect, Fragment } from 'react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, router } from '@inertiajs/react';
import { Pencil as PencilIcon, Plus as PlusIcon, Eye as EyeIcon, X as XMarkIcon } from 'lucide-react';

// Definición de tipos
type Autor = {
  id: number;
  apellidos: string;
  nombres: string;
  libros?: Libro[];
};

type Libro = {
  id: number;
  titulo: string;
};

type AutorProps = {
  autores?: Autor[];
  autor?: Autor;
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
    title: 'Autores',
    href: '/autores',
  },
];

export default function Autor({ autores = [], autor, errors = {}, flash }: AutorProps) {
  // Estados locales para controlar la UI
  const [view, setView] = useState<'list' | 'create' | 'edit' | 'show'>('list');
  const [selectedAutor, setSelectedAutor] = useState<Autor | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Formularios con Inertia
  const createForm = useForm({
    apellidos: '',
    nombres: '',
  });

  const editForm = useForm({
    apellidos: '',
    nombres: '',
  });

  // Efectos
  useEffect(() => {
    if (autor) {
      setSelectedAutor(autor);
      if (view === 'edit') {
        editForm.setData({
          apellidos: autor.apellidos,
          nombres: autor.nombres,
        });
      }
    }
  }, [autor]);

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
    createForm.post(route('autores.store'), {
      onSuccess: () => {
        setView('list');
        createForm.reset();
      },
    });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAutor) {
      editForm.patch(route('autores.update', selectedAutor.id), {
        onSuccess: () => {
          setView('list');
          editForm.reset();
        },
      });
    }
  };

  const handleShowAutor = (autor: Autor) => {
    setSelectedAutor(autor);
    setView('show');
  };

  const handleEditAutor = (autor: Autor) => {
    setSelectedAutor(autor);
    editForm.setData({
      apellidos: autor.apellidos,
      nombres: autor.nombres,
    });
    setView('edit');
  };

  const filteredAutores = searchTerm 
    ? autores.filter(
        autor => 
          autor.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) || 
          autor.nombres.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : autores;

  // Componentes de vistas
  const renderListView = () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-semibold">Gestión de Autores</h2>
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Buscar autores..."
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            onClick={() => setView('create')}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Nuevo Autor</span>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Apellidos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nombres</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nombre Completo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAutores.length > 0 ? (
                filteredAutores.map((autor) => (
                  <tr key={autor.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">{autor.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{autor.apellidos}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{autor.nombres}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{`${autor.apellidos}, ${autor.nombres}`}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleShowAutor(autor)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                          title="Ver detalles"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEditAutor(autor)}
                          className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-200"
                          title="Editar"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No hay autores disponibles
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
        <h2 className="text-2xl font-semibold">Crear Nuevo Autor</h2>
        <button
          onClick={() => setView('list')}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleCreate} className="space-y-6 max-w-xl">
        <div>
          <label htmlFor="apellidos" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Apellidos
          </label>
          <input
            id="apellidos"
            type="text"
            name="apellidos"
            value={createForm.data.apellidos}
            onChange={(e) => createForm.setData('apellidos', e.target.value)}
            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
            required
          />
          {errors.apellidos && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.apellidos}</p>
          )}
        </div>

        <div>
          <label htmlFor="nombres" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nombres
          </label>
          <input
            id="nombres"
            type="text"
            name="nombres"
            value={createForm.data.nombres}
            onChange={(e) => createForm.setData('nombres', e.target.value)}
            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
            required
          />
          {errors.nombres && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.nombres}</p>
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
        <h2 className="text-2xl font-semibold">Editar Autor</h2>
        <button
          onClick={() => setView('list')}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleUpdate} className="space-y-6 max-w-xl">
        <div>
          <label htmlFor="edit-apellidos" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Apellidos
          </label>
          <input
            id="edit-apellidos"
            type="text"
            name="apellidos"
            value={editForm.data.apellidos}
            onChange={(e) => editForm.setData('apellidos', e.target.value)}
            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
            required
          />
          {errors.apellidos && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.apellidos}</p>
          )}
        </div>

        <div>
          <label htmlFor="edit-nombres" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nombres
          </label>
          <input
            id="edit-nombres"
            type="text"
            name="nombres"
            value={editForm.data.nombres}
            onChange={(e) => editForm.setData('nombres', e.target.value)}
            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
            required
          />
          {errors.nombres && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.nombres}</p>
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
    if (!selectedAutor) return null;
    
    return (
      <div className="border-sidebar-border/70 dark:border-sidebar-border rounded-xl border bg-white dark:bg-gray-800 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Detalles del Autor</h2>
          <div className="flex gap-2">
            <button
              onClick={() => handleEditAutor(selectedAutor)}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
            >
              <PencilIcon className="w-5 h-5" />
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
              <dd className="mt-1 text-lg text-gray-900 dark:text-gray-100">{selectedAutor.id}</dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Apellidos</dt>
              <dd className="mt-1 text-lg text-gray-900 dark:text-gray-100">{selectedAutor.apellidos}</dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Nombres</dt>
              <dd className="mt-1 text-lg text-gray-900 dark:text-gray-100">{selectedAutor.nombres}</dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Nombre Completo</dt>
              <dd className="mt-1 text-lg text-gray-900 dark:text-gray-100">{`${selectedAutor.apellidos}, ${selectedAutor.nombres}`}</dd>
            </div>
          </dl>
        </div>

        {selectedAutor.libros && selectedAutor.libros.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-medium mb-4">Libros del Autor</h3>
            <ul className="list-disc pl-5 space-y-2">
              {selectedAutor.libros.map((libro) => (
                <li key={libro.id} className="text-gray-900 dark:text-gray-100">{libro.titulo}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  // Renderizado principal
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Gestión de Autores" />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        {view === 'list' && renderListView()}
        {view === 'create' && renderCreateView()}
        {view === 'edit' && renderEditView()}
        {view === 'show' && renderShowView()}
      </div>
    </AppLayout>
  );
}