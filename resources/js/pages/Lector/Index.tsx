import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Link } from '@inertiajs/react';

import {
  Search,
  PlusCircle,
  Eye,
  Edit,
  Filter,
  Users,
  CheckCircle,
  AlertCircle,
  X,
  GraduationCap,
  UserCheck
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type LectorPageProps, type Lector } from './types';

// Constantes
const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
  },
  {
    title: 'Lectores',
    href: '/lectores',
  },
];

export default function Index({
  auth,
  lectores,
  filters = {},
  grados = [],
}: LectorPageProps) {
  const { errors = {}, flash = {} } = usePage().props as any;
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    tipo: '',
    grado: '',
    estado: ''
  });
  const [selectedLector, setSelectedLector] = useState<Lector | null>(null);
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

  // Aplicar filtros a los lectores
  const filteredLectores = lectores.data.filter((lector: Lector) => {
    const matchesSearch = !searchTerm ||
      lector.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lector.codigo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTipo = !selectedFilters.tipo || lector.tipo === selectedFilters.tipo;
    const matchesGrado = !selectedFilters.grado || 
      (lector.grado && lector.grado.id.toString() === selectedFilters.grado);
    const matchesEstado = !selectedFilters.estado || lector.estado === selectedFilters.estado;

    return matchesSearch && matchesTipo && matchesGrado && matchesEstado;
  });

  // Funciones de acción
  const handleShowLector = (lector: Lector) => {
    setSelectedLector(lector);
    setView('show');
  };

  const handleEditLector = (lector: Lector) => {
    router.get(route('lectores.edit', lector.id));
  };

  const resetFilters = () => {
    setSelectedFilters({
      tipo: '',
      grado: '',
      estado: ''
    });
  };

  return (
    <AppLayout
      title="Gestión de Lectores"
      breadcrumbs={breadcrumbs}
      renderHeader={() => (
        <h2 className="text-xl font-semibold leading-tight text-gray-800">
          Gestión de Lectores
        </h2>
      )}
    >
      <Head title="Gestión de Lectores" />

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
        {view === 'show' && selectedLector && (
          <div className="border-sidebar-border/70 dark:border-sidebar-border rounded-xl border bg-white dark:bg-gray-800 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Detalles del Lector</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditLector(selectedLector)}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setView('list')}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">codigo</dt>
                  <dd className="mt-1 text-lg text-gray-900 dark:text-gray-100">{selectedLector.codigo}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Nombre Completo</dt>
                  <dd className="mt-1 text-lg text-gray-900 dark:text-gray-100">
                    {` ${selectedLector.nombre}`}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Tipo</dt>
                  <dd className="mt-1 text-lg text-gray-900 dark:text-gray-100">{selectedLector.tipo}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Grado</dt>
                  <dd className="mt-1 text-lg text-gray-900 dark:text-gray-100">
                    {selectedLector.grado ? selectedLector.grado.grado : '—'}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Estado</dt>
                  <dd className="mt-1 text-lg text-gray-900 dark:text-gray-100">{selectedLector.estado}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Email</dt>
                  <dd className="mt-1 text-lg text-gray-900 dark:text-gray-100">
                    {selectedLector.email || '—'}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Teléfono</dt>
                  <dd className="mt-1 text-lg text-gray-900 dark:text-gray-100">
                    {selectedLector.telefono || '—'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {/* Cabecera */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-xl shadow-lg">
          <div className="flex items-center gap-3">
            <Users className="h-10 w-10 text-white" />
            <h1 className="text-3xl font-bold text-white">
              Gestión de Lectores
            </h1>
          </div>

          <div className="flex flex-col md:flex-row gap-3 w-full lg:w-auto">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Buscar por nombre o codigo..."
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
              onClick={() => router.get(route('lectores.create'))}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition shadow-md"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Nuevo Lector</span>
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tipo</label>
                <select
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  value={selectedFilters.tipo}
                  onChange={(e) => setSelectedFilters({ ...selectedFilters, tipo: e.target.value })}
                >
                  <option value="">Todos los tipos</option>
                  <option value="ESTUDIANTE">Estudiante</option>
                  <option value="DOCENTE">Docente</option>
                  <option value="OTRO">Otro</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Grado</label>
                <select
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  value={selectedFilters.grado}
                  onChange={(e) => setSelectedFilters({ ...selectedFilters, grado: e.target.value })}
                >
                  <option value="">Todos los grados</option>
                  {grados.map((grado: any) => (
                    <option key={grado.id} value={grado.id}>{grado.grado}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Estado</label>
                <select
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  value={selectedFilters.estado}
                  onChange={(e) => setSelectedFilters({ ...selectedFilters, estado: e.target.value })}
                >
                  <option value="">Todos los estados</option>
                  <option value="ACTIVO">Activo</option>
                  <option value="INACTIVO">Inactivo</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Tabla de lectores */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Codigo</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nombre</th>

                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Grado</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredLectores.length > 0 ? (
                  filteredLectores.map((lector: Lector) => (
                    <tr key={lector.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{lector.codigo}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {lector.nombre}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          lector.tipo === 'ESTUDIANTE' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          lector.tipo === 'DOCENTE' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                        }`}>
                          {lector.tipo === 'ESTUDIANTE' && <GraduationCap className="w-4 h-4 mr-1" />}
                          {lector.tipo === 'DOCENTE' && <UserCheck className="w-4 h-4 mr-1" />}
                          {lector.tipo}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {lector.grado ? lector.grado.grado : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          lector.estado === 'ACTIVO' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          lector.estado === 'INACTIVO' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {lector.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleShowLector(lector)}
                            className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <Link
                            href={route('lectores.edit', lector.id)}
                            className="p-1.5 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-colors dark:bg-yellow-900/30 dark:text-yellow-400 dark:hover:bg-yellow-900/50"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      No se encontraron lectores
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}