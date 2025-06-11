import { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import AlertNotification from '@/components/AlertNotification';

// Constantes
const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Lectores',
    href: '/lectores',
  },
  {
    title: 'Editar Lector',
    href: '/lectores/edit',
  },
];

interface EditLectorProps {
  auth: any;
  lector: {
    id: number;
    nombre: string;
    codigo: string;
    tipo: string;
    grado_id: string;
    estado: string;
  };
  grados: Array<{
    id: number;
    grado: string;
    subGrado: string;
  }>;
  flash?: {
    success?: string;
    error?: string;
  };
}

export default function Edit({ auth, lector, grados, flash }: EditLectorProps) {
  const { data, setData, put, processing, errors } = useForm({
    nombre: lector.nombre,
    codigo: lector.codigo,
    tipo: lector.tipo,
    grado_id: lector.grado_id,
    estado: lector.estado
  });

  const [showAlert, setShowAlert] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({ show: false, type: 'success', message: '' });

  // Manejar flash messages al cargar
  useEffect(() => {
    if (flash?.success) {
      setShowAlert({
        show: true,
        type: 'success',
        message: flash.success
      });
    } else if (flash?.error) {
      setShowAlert({
        show: true,
        type: 'error',
        message: flash.error
      });
    }
  }, [flash]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    put(route('lectores.update', lector.id), {
      onSuccess: (page: any) => {
        const successMessage = page.props.flash?.success || 'Lector actualizado exitosamente';
        setShowAlert({
          show: true,
          type: 'success',
          message: successMessage
        });
        // Redirigir después de un breve delay
        setTimeout(() => {
          window.location.href = route('lectores.index');
        }, 2000);
      },
      onError: (errors: any) => {
        // Si hay errores de validación específicos, no mostrar alerta
        const hasFieldErrors = Object.keys(errors).some(key => 
          ['nombre', 'codigo', 'tipo', 'grado_id', 'estado'].includes(key)
        );
        
        if (!hasFieldErrors) {
          const errorMessage = errors.error || 'Ha ocurrido un error al actualizar el lector';
          setShowAlert({
            show: true,
            type: 'error',
            message: errorMessage
          });
        }
      }
    });
  };

  const hideAlert = () => {
    setShowAlert({ show: false, type: 'success', message: '' });
  };

  const renderFormField = (id: string, label: string, required: boolean = false, children: React.ReactNode, colSpan: string = "col-span-1") => (
    <div className={`${colSpan} group`}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {children}
        <div className="absolute inset-0 rounded-md ring-1 ring-transparent transition-all group-focus-within:ring-2 group-focus-within:ring-indigo-500/20 pointer-events-none" />
      </div>
      {errors[id as keyof typeof errors] && (
        <div className="flex items-center mt-1 text-sm text-red-600 dark:text-red-400 animate-pulse">
          <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {errors[id as keyof typeof errors]}
        </div>
      )}
    </div>
  );

  return (
    <AppLayout
      breadcrumbs={breadcrumbs}
      renderHeader={() => (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold leading-tight text-gray-900 dark:text-white">
                Editar Lector
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Actualiza la información del usuario en el sistema
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <span>Gestión de usuarios</span>
          </div>
        </div>
      )}
    >
      <Head title="Editar Lector" />

      {/* Alert Notification */}
      {showAlert.show && (
        <AlertNotification
          type={showAlert.type}
          message={showAlert.message}
          position="top-right"
          onClose={hideAlert}
          autoClose={showAlert.type === 'success'}
          duration={showAlert.type === 'success' ? 2000 : 5000}
        />
      )}

      <div className="py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Card principal con efectos modernos */}
          <div className="relative overflow-hidden bg-white dark:bg-gray-800 shadow-2xl rounded-2xl border border-gray-200 dark:border-gray-700 backdrop-blur-sm">
            {/* Efectos de fondo decorativos */}
            <div className="absolute top-0 right-0 w-32 h-32 -mt-16 -mr-16 bg-gradient-to-br from-indigo-400/20 to-purple-600/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 -mb-12 -ml-12 bg-gradient-to-tr from-indigo-400/20 to-cyan-400/20 rounded-full blur-2xl" />
            
            {/* Header del formulario mejorado */}
            <div className="relative bg-gradient-to-r from-indigo-50 via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-750 px-6 py-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Información del Lector
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Actualice los datos del lector en el sistema
                  </p>
                </div>
              </div>
            </div>

            {/* Contenido del formulario con espaciado mejorado */}
            <div className="relative p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Grid de campos con mejor espaciado */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {/* Código con icono */}
                  {renderFormField('codigo', 'Código de Identificación', true, 
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        id="codigo"
                        value={data.codigo}
                        onChange={(e) => setData('codigo', e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 text-sm transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
                        placeholder="Ej: EST001, DOC001"
                      />
                    </div>,
                    "col-span-1 md:col-span-1 xl:col-span-1"
                  )}

                  {/* Nombre con icono */}
                  {renderFormField('nombre', 'Nombre Completo', true, 
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        id="nombre"
                        value={data.nombre}
                        onChange={(e) => setData('nombre', e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 text-sm transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
                        placeholder="Ingrese el nombre completo del lector"
                      />
                    </div>,
                    "col-span-1 md:col-span-1 xl:col-span-2"
                  )}

                  {/* Tipo con icono */}
                  {renderFormField('tipo', 'Tipo de Lector', true, 
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h2zM8 5a1 1 0 011-1h2a1 1 0 011 1v1H8V5z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <select
                        id="tipo"
                        value={data.tipo}
                        onChange={(e) => setData('tipo', e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 text-sm transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
                      >
                        <option value="ESTUDIANTE">Estudiante</option>
                        <option value="DOCENTE">Docente</option>
                        <option value="OTRO">Otro</option>
                      </select>
                    </div>,
                    "col-span-1 md:col-span-1 xl:col-span-1"
                  )}

                  {/* Grado - Solo para estudiantes */}
                  {data.tipo === 'ESTUDIANTE' && renderFormField('grado_id', 'Grado Académico', true, 
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                        </svg>
                      </div>
                      <select
                        id="grado_id"
                        value={data.grado_id}
                        onChange={(e) => setData('grado_id', e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 text-sm transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
                      >
                        <option value="">Seleccione un grado</option>
                        {grados?.map((grado) => (
                          <option key={grado.id} value={grado.id}>
                            {grado.grado} - {grado.subGrado}
                          </option>
                        ))}
                      </select>
                    </div>,
                    "col-span-1 md:col-span-1 xl:col-span-1"
                  )}

                  {/* Estado con icono */}
                  {renderFormField('estado', 'Estado del Lector', true, 
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <select
                        id="estado"
                        value={data.estado}
                        onChange={(e) => setData('estado', e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 text-sm transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
                      >
                        <option value="ACTIVO">Activo</option>
                        <option value="INACTIVO">Inactivo</option>
                      </select>
                    </div>,
                    "col-span-1 md:col-span-1 xl:col-span-1"
                  )}
                </div>

                {/* Botones mejorados */}
                <div className="flex justify-between items-center pt-8 border-t border-gray-200 dark:border-gray-700">
                  <a
                    href={route('lectores.index')}
                    className="group flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 text-sm font-medium hover:shadow-md transform hover:-translate-y-0.5"
                  >
                    <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Cancelar
                  </a>
                  <button
                    type="submit"
                    disabled={processing}
                    className={`group flex items-center gap-2 px-8 py-3 rounded-xl transition-all duration-200 text-sm font-medium transform hover:-translate-y-0.5 ${
                      processing
                        ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                        : 'bg-gradient-to-r from-indigo-600 to-indigo-600 text-white hover:from-indigo-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {processing ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Actualizando...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        Actualizar Lector
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Información adicional mejorada */}
          <div className="mt-8 bg-gradient-to-r from-indigo-50 to-indigo-50 dark:from-indigo-900/20 dark:to-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-indigo-900 dark:text-indigo-200 mb-3">
                  Información importante
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-indigo-800 dark:text-indigo-300">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <span>El código debe ser único en el sistema</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <span>Los estudiantes deben tener un grado asignado</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Los lectores inactivos no podrán realizar préstamos</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}