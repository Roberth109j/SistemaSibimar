import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Search, CheckCircle, AlertCircle, X } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

// Tipos
type Prestamo = {
  id: number;
  ejemplar: {
    id: number;
    codigo: string;
    numEjemplar: number;
    libro: {
      id: number;
      titulo: string;
      isbn: string;
    };
  };
  fecha_prestamo: string;
  fecha_devolucion: string;
  estado: string;
};

type DevolucionesPageProps = {
  auth: any;
  prestamos?: Prestamo[];
  flash?: {
    success?: string;
    error?: string;
  };
};

// Constantes
const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Préstamos',
    href: '/prestamos',
  },
  {
    title: 'Devoluciones',
    href: '/prestamos/devoluciones',
  },
];

export default function Devoluciones({
  auth,
  prestamos = [],
  flash = {},
}: DevolucionesPageProps) {
  const { errors = {} } = usePage().props as any;
  const [searchTerm, setSearchTerm] = useState('');
  const [prestamosFiltrados, setPrestamosFiltrados] = useState<Prestamo[]>([]);
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

    const timer = setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);

    return () => clearTimeout(timer);
  }, [flash]);

  // Buscar préstamos por código de estudiante
  const handleSearch = () => {
    if (!searchTerm.trim()) return;

    router.get(
      route('prestamos.buscar'),
      { codigo_estudiante: searchTerm },
      {
        preserveState: true,
        onSuccess: (page) => {
          const prestamosActivos = page.props.prestamos || [];
          setPrestamosFiltrados(prestamosActivos as Prestamo[]);

          if (!Array.isArray(prestamosActivos) || prestamosActivos.length === 0) {
            setNotification({
              show: true,
              type: 'error',
              message: 'No se encontraron préstamos activos para este estudiante'
            });
          }
        },
        onError: () => {
          setNotification({
            show: true,
            type: 'error',
            message: 'Error al buscar los préstamos'
          });
        }
      }
    );
  };

  // Manejar la tecla Enter en el campo de búsqueda
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <AppLayout
      title="Devoluciones de Libros"
      breadcrumbs={breadcrumbs}
      renderHeader={() => (
        <h2 className="text-xl font-semibold leading-tight text-gray-900 dark:text-gray-100">
          Devoluciones de Libros
        </h2>
      )}
    >
      <Head title="Devoluciones de Libros" />

      {/* Notificación */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 flex items-center justify-between min-w-72 p-4 rounded-xl shadow-lg backdrop-blur-sm border transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-emerald-50/95 dark:bg-emerald-900/80 border-emerald-200 dark:border-emerald-700' 
            : 'bg-red-50/95 dark:bg-red-900/80 border-red-200 dark:border-red-700'
        }`}>
          <div className="flex items-center">
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mr-3" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3" />
            )}
            <p className={`font-medium ${notification.type === 'success' 
              ? 'text-emerald-800 dark:text-emerald-200' 
              : 'text-red-800 dark:text-red-200'}`}>
              {notification.message}
            </p>
          </div>
          <button
            onClick={() => setNotification(prev => ({ ...prev, show: false }))}
            className="ml-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col gap-6">
        {/* Buscador */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 p-6 shadow-sm">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ingrese el código del estudiante"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                         placeholder-gray-500 dark:placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 
                         focus:border-transparent transition-all duration-200"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={!searchTerm.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 
                       disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed
                       text-white font-medium rounded-lg transition-all duration-200 
                       flex items-center gap-2 shadow-sm hover:shadow-md"
            >
              <Search className="w-5 h-5" />
              Buscar
            </button>
          </div>
        </div>

        {/* Lista de préstamos */}
        {prestamosFiltrados.length > 0 && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Préstamos Activos
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {prestamosFiltrados.length} préstamo{prestamosFiltrados.length !== 1 ? 's' : ''} encontrado{prestamosFiltrados.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Libro
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Ejemplar
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Fecha Préstamo
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Fecha Devolución
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {prestamosFiltrados.map((prestamo) => (
                    <tr key={prestamo.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                            {prestamo.ejemplar.libro.titulo}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            ISBN: {prestamo.ejemplar.libro.isbn}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          #{prestamo.ejemplar.numEjemplar}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {prestamo.ejemplar.codigo}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {new Date(prestamo.fecha_prestamo).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {new Date(prestamo.fecha_devolucion).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${
                          prestamo.estado.toLowerCase() === 'activo'
                            ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200'
                            : prestamo.estado.toLowerCase() === 'vencido'
                            ? 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                        }`}>
                          {prestamo.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Estado vacío cuando no hay resultados */}
        {searchTerm && prestamosFiltrados.length === 0 && !notification.show && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 p-12 text-center shadow-sm">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No se encontraron préstamos
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              No hay préstamos activos para el código de estudiante ingresado.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}