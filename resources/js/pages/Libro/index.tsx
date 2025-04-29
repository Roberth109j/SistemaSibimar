import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Link } from '@inertiajs/react';

import {
  Search,
  PlusCircle,
  Eye,
  Edit,
  Trash2,
  Filter,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  X,
  PencilIcon,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type LibroPageProps, type Libro } from './types';

// Constantes
const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
  },
  {
    title: 'Libros',
    href: '/libros',
  },
];

export default function Index({
  auth,
  libros,
  clases,
  idiomas,
  filters = {},
  autores = [],
  editoriales = [],
  estanterias = [],
  secciones = [],
  categoriasDewey = [],
}: LibroPageProps) {
  const { errors = {}, flash = {} } = usePage().props as any;
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    clase: '',
    idioma: '',
    editorial: '',
    estanteria: ''
  });
  const [selectedLibro, setSelectedLibro] = useState(null);
  const [view, setView] = useState('list');
  const [notification, setNotification] = useState({
    show: false,
    type: '',
    message: ''
  });

  // Mostrar notificaciones de flash
  useEffect(() => {
    if (flash?.success) {
      setNotification({
        show: true,
        type: 'success',
        message: flash.success
      });
    } else if (flash?.error) {
      setNotification({
        show: true,
        type: 'error',
        message: flash.error
      });
    }

    // Auto-ocultar después de 5 segundos
    const timer = setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);

    return () => clearTimeout(timer);
  }, [flash]);

  // Aplicar filtros a los libros
  const filteredLibros = libros.data.filter(libro => {
    const matchesSearch = !searchTerm ||
      libro.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      libro.isbn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (libro.autor?.apellidos && libro.autor.apellidos.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (libro.autor?.nombre && libro.autor.nombre.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesClase = !selectedFilters.clase || libro.clase === selectedFilters.clase;
    const matchesIdioma = !selectedFilters.idioma || libro.idioma === selectedFilters.idioma;
    const matchesEditorial = !selectedFilters.editorial ||
      (libro.editorial && libro.editorial.id.toString() === selectedFilters.editorial);
    const matchesEstanteria = !selectedFilters.estanteria ||
      (libro.estanteria && libro.estanteria.id.toString() === selectedFilters.estanteria);

    return matchesSearch && matchesClase && matchesIdioma && matchesEditorial && matchesEstanteria;
  });

  // Funciones de acción
  const handleShowLibro = (libro: Libro) => {
    setSelectedLibro(libro);
    setView('show');
  };

  const handleEditLibro = (libro: Libro) => {
    router.get(route('libros.edit', libro.id));
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Está seguro que desea eliminar este libro?')) {
      router.delete(route('libros.destroy', id));
    }
  };

  const resetFilters = () => {
    setSelectedFilters({
      clase: '',
      idioma: '',
      editorial: '',
      estanteria: ''
    });
  };

  return (
    <AppLayout
      title="Gestión de Libros"
      breadcrumbs={breadcrumbs}
      renderHeader={() => (
        <h2 className="text-xl font-semibold leading-tight text-gray-800">
          Gestión de Libros
        </h2>
      )}
    >
      <Head title="Gestión de Libros" />

      {/* Notificación */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 flex items-center justify-between min-w-72 p-4 rounded-lg shadow-lg ${notification.type === 'success' ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'
          }`}>
          <div className="flex items-center">
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
            )}
            <p className={notification.type === 'success' ? 'text-green-700' : 'text-red-700'}>
              {notification.message}
            </p>
          </div>
          <button
            onClick={() => setNotification(prev => ({ ...prev, show: false }))}
            className="ml-4 text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col gap-6">
        {/* Vista de detalles */}
        {view === 'show' && selectedLibro && (
          <div className="border-sidebar-border/70 dark:border-sidebar-border rounded-xl border bg-white dark:bg-gray-800 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Detalles del Libro</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditLibro(selectedLibro)}
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
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">ISBN</dt>
                  <dd className="mt-1 text-lg text-gray-900 dark:text-gray-100">{selectedLibro.isbn}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Título</dt>
                  <dd className="mt-1 text-lg text-gray-900 dark:text-gray-100">{selectedLibro.titulo}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Autor</dt>
                  <dd className="mt-1 text-lg text-gray-900 dark:text-gray-100">
                    {selectedLibro.autor ? `${selectedLibro.autor.apellidos}, ${selectedLibro.autor.nombre}` : '—'}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Editorial</dt>
                  <dd className="mt-1 text-lg text-gray-900 dark:text-gray-100">
                    {selectedLibro.editorial ? selectedLibro.editorial.nombre : '—'}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Clase</dt>
                  <dd className="mt-1 text-lg text-gray-900 dark:text-gray-100">{selectedLibro.clase}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Idioma</dt>
                  <dd className="mt-1 text-lg text-gray-900 dark:text-gray-100">{selectedLibro.idioma}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Páginas</dt>
                  <dd className="mt-1 text-lg text-gray-900 dark:text-gray-100">{selectedLibro.paginas}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Signatura Topográfica</dt>
                  <dd className="mt-1 text-lg text-gray-900 dark:text-gray-100">{selectedLibro.sign_top}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Estantería</dt>
                  <dd className="mt-1 text-lg text-gray-900 dark:text-gray-100">
                    {selectedLibro.estanteria ? selectedLibro.estanteria.nombre : '—'}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Sección</dt>
                  <dd className="mt-1 text-lg text-gray-900 dark:text-gray-100">
                    {selectedLibro.seccion ? selectedLibro.seccion.nombre : '—'}
                  </dd>
                </div>
              </dl>
            </div>

            {selectedLibro.contenido && (
              <div className="mt-8">
                <h3 className="text-xl font-medium mb-4">Contenido del Libro</h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{selectedLibro.contenido}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Cabecera */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-xl shadow-lg">
          <div className="flex items-center gap-3">
            <BookOpen className="h-10 w-10 text-white" />
            <h1 className="text-3xl font-bold text-white">
              Gestión de Libros
            </h1>
          </div>

          <div className="flex flex-col md:flex-row gap-3 w-full lg:w-auto">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Buscar por título, ISBN o autor..."
                className="w-full pl-10 pr-4 py-2.5 text-gray-700 bg-white rounded-lg border-none focus:ring-2 focus:ring-indigo-300 shadow-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-indigo-600 font-medium rounded-lg hover:bg-gray-50 transition shadow-md"
            >
              <Filter className="w-5 h-5" />
              <span>Filtros</span>
            </button>

            <button
              onClick={() => router.get(route('libros.create'))}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition shadow-md"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Nuevo Libro</span>
            </button>
          </div>
        </div>

        {/* Panel de filtros */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Filtros avanzados</h3>
              <button
                onClick={resetFilters}
                className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
              >
                Restablecer filtros
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Clase</label>
                <select
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  value={selectedFilters.clase}
                  onChange={(e) => setSelectedFilters({ ...selectedFilters, clase: e.target.value })}
                >
                  <option value="">Todas las clases</option>
                  {clases.map((clase: string) => (
                    <option key={clase} value={clase}>{clase}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Idioma</label>
                <select
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  value={selectedFilters.idioma}
                  onChange={(e) => setSelectedFilters({ ...selectedFilters, idioma: e.target.value })}
                >
                  <option value="">Todos los idiomas</option>
                  {idiomas.map((idioma: string) => (
                    <option key={idioma} value={idioma}>{idioma}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Editorial</label>
                <select
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  value={selectedFilters.editorial}
                  onChange={(e) => setSelectedFilters({ ...selectedFilters, editorial: e.target.value })}
                >
                  <option value="">Todas las editoriales</option>
                  {editoriales.map((editorial: any) => (
                    <option key={editorial.id} value={editorial.id}>{editorial.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Estantería</label>
                <select
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  value={selectedFilters.estanteria}
                  onChange={(e) => setSelectedFilters({ ...selectedFilters, estanteria: e.target.value })}
                >
                  <option value="">Todas las estanterías</option>
                  {estanterias.map((estanteria: any) => (
                    <option key={estanteria.id} value={estanteria.id}>{estanteria.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Tabla de libros */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">ISBN</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Título</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Autor</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Editorial</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Clase</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Idioma</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Páginas</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Sign. Top.</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estantería</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredLibros.length > 0 ? (
                  filteredLibros.map((libro) => (
                    <tr key={libro.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{libro.isbn}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {libro.titulo}
                        {libro.tomo && <span className="ml-1 text-gray-500 dark:text-gray-400"> (Tomo {libro.tomo})</span>}
                        {libro.edicion && <span className="ml-1 text-gray-500 dark:text-gray-400"> (Ed. {libro.edicion})</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {libro.autor ? `${libro.autor.apellidos}, ${libro.autor.nombre}` : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {libro.editorial ? libro.editorial.nombre : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{libro.clase}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{libro.idioma}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{libro.paginas}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{libro.sign_top}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {libro.estanteria ? libro.estanteria.nombre : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <Link
                            as="button"
                            href={route('libros.show', libro.id)}
                            className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-800/50"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          <button
                            onClick={() => handleEditLibro(libro)}
                            className="p-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-800/50"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(libro.id)}
                            className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-800/50"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="px-6 py-10 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Search className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                        <p className="text-gray-600 dark:text-gray-400">No se encontraron libros con los criterios de búsqueda.</p>
                        {(Object.values(selectedFilters).some(v => v !== '') || searchTerm) && (
                          <button
                            onClick={() => {
                              setSearchTerm('');
                              resetFilters();
                            }}
                            className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 font-medium"
                          >
                            Limpiar búsqueda y filtros
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {libros.links && libros.links.length > 3 && (
            <div className="px-6 py-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap justify-center gap-2">
                {libros.links.map((link: any, i: number) => {
                  // Personalizamos algunos botones de paginación
                  let content = link.label;
                  if (link.label.includes('Previous')) {
                    content = <ChevronLeft className="w-4 h-4" />;
                  } else if (link.label.includes('Next')) {
                    content = <ChevronRight className="w-4 h-4" />;
                  }

                  return (
                    <button
                      key={i}
                      className={`flex items-center justify-center w-10 h-10 rounded-lg ${link.active
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600'
                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                      onClick={() => link.url && router.visit(link.url)}
                      disabled={!link.url}
                      title={link.label.replace(/&laquo;|&raquo;/g, '')}
                    >
                      {typeof content === 'string' ? (
                        <span dangerouslySetInnerHTML={{ __html: content }} />
                      ) : content}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
                Mostrando {libros.from || 0} a {libros.to || 0} de {libros.total} registros
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}