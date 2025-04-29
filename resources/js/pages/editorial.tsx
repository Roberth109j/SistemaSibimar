import { useState, useEffect } from 'react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, router } from '@inertiajs/react';
import { Pencil as PencilIcon, Plus as PlusIcon, Eye as EyeIcon, X as XMarkIcon } from 'lucide-react';

// Definición de tipos
type Editorial = {
  id: number;
  nombre: string;
  ciudad: string | null;
  pais: string | null;
  libros?: Libro[];
};

type Libro = {
  id: number;
  titulo: string;
};

type EditorialProps = {
  editoriales?: Editorial[];
  editorial?: Editorial;
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
    title: 'Editoriales',
    href: '/editoriales',
  },
];

export default function Editorial({ editoriales = [], editorial, errors = {}, flash }: EditorialProps) {
  // Estados locales para controlar la UI
  const [view, setView] = useState<'list' | 'create' | 'edit' | 'show'>('list');
  const [selectedEditorial, setSelectedEditorial] = useState<Editorial | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Formularios con Inertia
  const createForm = useForm({
    nombre: '',
    ciudad: '',
    pais: '',
  });

  const editForm = useForm({
    nombre: '',
    ciudad: '',
    pais: '',
  });

  // Efectos
  useEffect(() => {
    if (editorial) {
      setSelectedEditorial(editorial);
      if (view === 'edit') {
        editForm.setData({
          nombre: editorial.nombre,
          ciudad: editorial.ciudad || '',
          pais: editorial.pais || '',
        });
      }
    }
  }, [editorial]);

  useEffect(() => {
    if (flash?.success) {
      // Reset a vista de lista después de operaciones exitosas
      setView('list');
      createForm.reset();
      editForm.reset();
    }
  }, [flash]);

  // Función para recargar la lista de editoriales
  const refreshData = () => {
    router.reload({ only: ['editoriales'] });
  };

  // Funciones de manejo
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createForm.post(route('editoriales.store'), {
      onSuccess: () => {
        setView('list');
        createForm.reset();
        refreshData();
      },
    });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEditorial) {
      editForm.put(route('editoriales.update', selectedEditorial.id), {
        onSuccess: () => {
          setView('list');
          editForm.reset();
          refreshData();
        },
        onError: (errors) => {
          console.error('Errores en actualización:', errors);
        }
      });
    }
  };

  const handleShowEditorial = (editorial: Editorial) => {
    setSelectedEditorial(editorial);
    setView('show');
  };

  const handleEditEditorial = (editorial: Editorial) => {
    setSelectedEditorial(editorial);
    editForm.setData({
      nombre: editorial.nombre,
      ciudad: editorial.ciudad || '',
      pais: editorial.pais || '',
    });
    setView('edit');
  };

  const filteredEditoriales = searchTerm 
    ? editoriales.filter(
        editorial => 
          editorial.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
          (editorial.ciudad && editorial.ciudad.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (editorial.pais && editorial.pais.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : editoriales;

  // Componentes de vistas
  const renderListView = () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-semibold">Gestión de Editoriales</h2>
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Buscar editoriales..."
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            onClick={() => setView('create')}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Nueva Editorial</span>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ciudad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">País</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredEditoriales.length > 0 ? (
                filteredEditoriales.map((editorial) => (
                  <tr key={editorial.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">{editorial.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{editorial.nombre}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{editorial.ciudad || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{editorial.pais || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleShowEditorial(editorial)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                          title="Ver detalles"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEditEditorial(editorial)}
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
                    No hay editoriales disponibles
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
        <h2 className="text-2xl font-semibold">Crear Nueva Editorial</h2>
        <button
          onClick={() => setView('list')}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleCreate} className="space-y-6 max-w-xl">
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nombre
          </label>
          <input
            id="nombre"
            type="text"
            name="nombre"
            value={createForm.data.nombre}
            onChange={(e) => createForm.setData('nombre', e.target.value)}
            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
            required
          />
          {errors.nombre && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.nombre}</p>
          )}
        </div>

        <div>
          <label htmlFor="ciudad" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Ciudad
          </label>
          <input
            id="ciudad"
            type="text"
            name="ciudad"
            value={createForm.data.ciudad}
            onChange={(e) => createForm.setData('ciudad', e.target.value)}
            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
          />
          {errors.ciudad && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.ciudad}</p>
          )}
        </div>

        <div>
          <label htmlFor="pais" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            País
          </label>
          <input
            id="pais"
            type="text"
            name="pais"
            value={createForm.data.pais}
            onChange={(e) => createForm.setData('pais', e.target.value)}
            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
          />
          {errors.pais && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.pais}</p>
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
        <h2 className="text-2xl font-semibold">Editar Editorial</h2>
        <button
          onClick={() => setView('list')}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleUpdate} className="space-y-6 max-w-xl">
        <div>
          <label htmlFor="edit-nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nombre
          </label>
          <input
            id="edit-nombre"
            type="text"
            name="nombre"
            value={editForm.data.nombre}
            onChange={(e) => editForm.setData('nombre', e.target.value)}
            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
            required
          />
          {errors.nombre && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.nombre}</p>
          )}
        </div>

        <div>
          <label htmlFor="edit-ciudad" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Ciudad
          </label>
          <input
            id="edit-ciudad"
            type="text"
            name="ciudad"
            value={editForm.data.ciudad}
            onChange={(e) => editForm.setData('ciudad', e.target.value)}
            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
          />
          {errors.ciudad && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.ciudad}</p>
          )}
        </div>

        <div>
          <label htmlFor="edit-pais" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            País
          </label>
          <input
            id="edit-pais"
            type="text"
            name="pais"
            value={editForm.data.pais}
            onChange={(e) => editForm.setData('pais', e.target.value)}
            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
          />
          {errors.pais && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.pais}</p>
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
    if (!selectedEditorial) return null;
    
    return (
      <div className="border-sidebar-border/70 dark:border-sidebar-border rounded-xl border bg-white dark:bg-gray-800 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Detalles de la Editorial</h2>
          <div className="flex gap-2">
            <button
              onClick={() => handleEditEditorial(selectedEditorial)}
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
              <dd className="mt-1 text-lg text-gray-900 dark:text-gray-100">{selectedEditorial.id}</dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Nombre</dt>
              <dd className="mt-1 text-lg text-gray-900 dark:text-gray-100">{selectedEditorial.nombre}</dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Ciudad</dt>
              <dd className="mt-1 text-lg text-gray-900 dark:text-gray-100">{selectedEditorial.ciudad || '-'}</dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">País</dt>
              <dd className="mt-1 text-lg text-gray-900 dark:text-gray-100">{selectedEditorial.pais || '-'}</dd>
            </div>
          </dl>
        </div>

        {selectedEditorial.libros && selectedEditorial.libros.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-medium mb-4">Libros de la Editorial</h3>
            <ul className="list-disc pl-5 space-y-2">
              {selectedEditorial.libros.map((libro) => (
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
      <Head title="Gestión de Editoriales" />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        {view === 'list' && renderListView()}
        {view === 'create' && renderCreateView()}
        {view === 'edit' && renderEditView()}
        {view === 'show' && renderShowView()}
      </div>
    </AppLayout>
  );
}