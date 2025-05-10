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
    title: 'Dashboard',
    href: '/dashboard',
  },
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
          setPrestamosFiltrados(prestamosActivos);

          if (prestamosActivos.length === 0) {
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
        <h2 className="text-xl font-semibold leading-tight text-gray-800">
          Devoluciones de Libros
        </h2>
      )}
    >
      <Head title="Devoluciones de Libros" />

      {/* Notificación */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 flex items-center justify-between min-w-72 p-4 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'
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
        {/* Buscador */}
        <div className="border-sidebar-border/70 dark:border-sidebar-border rounded-xl border bg-white dark:bg-gray-800 p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ingrese el código del estudiante"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              Buscar
            </button>
          </div>
        </div>

        {/* Lista de préstamos */}
        {prestamosFiltrados.length > 0 && (
          <div className="border-sidebar-border/70 dark:border-sidebar-border rounded-xl border bg-white dark:bg-gray-800 p-6">
            <h3 className="text-lg font-semibold mb-4">Préstamos Activos</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Libro</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ejemplar</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fecha Préstamo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fecha Devolución</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {prestamosFiltrados.map((prestamo) => (
                    <tr key={prestamo.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">{prestamo.ejemplar.libro.titulo}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">ISBN: {prestamo.ejemplar.libro.isbn}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">#{prestamo.ejemplar.numEjemplar}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{prestamo.ejemplar.codigo}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(prestamo.fecha_prestamo).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(prestamo.fecha_devolucion).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
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
      </div>
    </AppLayout>
  );
}