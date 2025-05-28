import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

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
}

export default function Edit({ auth, lector, grados }: EditLectorProps) {
  const { data, setData, put, processing, errors } = useForm({
    nombre: lector.nombre,
    codigo: lector.codigo,
    tipo: lector.tipo,
    grado_id: lector.grado_id,
    estado: lector.estado
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('lectores.update', lector.id));
  };

  return (
    <AppLayout
      title="Editar Lector"
      breadcrumbs={breadcrumbs}
      renderHeader={() => (
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold leading-tight text-gray-900 dark:text-white">
            Editar Lector
          </h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <span>Gestión de usuarios</span>
          </div>
        </div>
      )}
    >
      <Head title="Editar Lector" />

      <div className="py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Card principal con mejor diseño */}
          <div className="overflow-hidden bg-white dark:bg-gray-800 shadow-xl rounded-xl border border-gray-200 dark:border-gray-700">
            {/* Header del formulario */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-750 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                  <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
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

            {/* Contenido del formulario */}
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Grid de campos principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nombre */}
                  <div className="col-span-1 md:col-span-2">
                    <label htmlFor="nombre" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        Nombre Completo
                        <span className="text-red-500 ml-1">*</span>
                      </span>
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      value={data.nombre}
                      onChange={(e) => setData('nombre', e.target.value)}
                      placeholder="Ingrese el nombre completo del lector"
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 
                        ${errors.nombre 
                          ? 'border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-800' 
                          : 'border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-200 dark:focus:ring-indigo-800'
                        } 
                        bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                        focus:outline-none focus:ring-4`}
                    />
                    {errors.nombre && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.nombre}
                      </p>
                    )}
                  </div>

                  {/* Código */}
                  <div>
                    <label htmlFor="codigo" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                        Código de Identificación
                        <span className="text-red-500 ml-1">*</span>
                      </span>
                    </label>
                    <input
                      type="text"
                      id="codigo"
                      value={data.codigo}
                      onChange={(e) => setData('codigo', e.target.value)}
                      placeholder="Ej: EST001, DOC001"
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 
                        ${errors.codigo 
                          ? 'border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-800' 
                          : 'border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-200 dark:focus:ring-indigo-800'
                        } 
                        bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                        focus:outline-none focus:ring-4`}
                    />
                    {errors.codigo && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.codigo}
                      </p>
                    )}
                  </div>

                  {/* Tipo */}
                  <div>
                    <label htmlFor="tipo" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Tipo de Lector
                        <span className="text-red-500 ml-1">*</span>
                      </span>
                    </label>
                    <select
                      id="tipo"
                      value={data.tipo}
                      onChange={(e) => setData('tipo', e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 
                        ${errors.tipo 
                          ? 'border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-800' 
                          : 'border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-200 dark:focus:ring-indigo-800'
                        } 
                        bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                        focus:outline-none focus:ring-4`}
                    >
                      <option value="ESTUDIANTE">👨‍🎓 Estudiante</option>
                      <option value="DOCENTE">👨‍🏫 Docente</option>
                      <option value="OTRO">👤 Otro</option>
                    </select>
                    {errors.tipo && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.tipo}
                      </p>
                    )}
                  </div>
                </div>

                {/* Grado (solo para estudiantes) con animación */}
                <div className={`transition-all duration-300 ease-in-out ${data.tipo === 'ESTUDIANTE' ? 'opacity-100 max-h-32 transform translate-y-0' : 'opacity-0 max-h-0 transform -translate-y-4 overflow-hidden'}`}>
                  {data.tipo === 'ESTUDIANTE' && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                      <label htmlFor="grado_id" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                          </svg>
                          Grado Académico
                          <span className="text-red-500 ml-1">*</span>
                        </span>
                      </label>
                      <select
                        id="grado_id"
                        value={data.grado_id}
                        onChange={(e) => setData('grado_id', e.target.value)}
                        className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 
                          ${errors.grado_id 
                            ? 'border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-800' 
                            : 'border-blue-300 dark:border-blue-600 focus:border-blue-500 focus:ring-blue-200 dark:focus:ring-blue-800'
                          } 
                          bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                          focus:outline-none focus:ring-4`}
                      >
                        <option value="">📚 Seleccione un grado</option>
                        {grados?.map((grado) => (
                          <option key={grado.id} value={grado.id}>
                            {grado.grado} - {grado.subGrado}
                          </option>
                        ))}
                      </select>
                      {errors.grado_id && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {errors.grado_id}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Estado */}
                <div>
                  <label htmlFor="estado" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Estado del Lector
                    </span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className={`relative flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${data.estado === 'ACTIVO' ? 'border-green-400 bg-green-50 dark:bg-green-900/20 dark:border-green-600' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-green-300 dark:hover:border-green-600'}`}>
                      <input
                        type="radio"
                        name="estado"
                        value="ACTIVO"
                        checked={data.estado === 'ACTIVO'}
                        onChange={(e) => setData('estado', e.target.value)}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${data.estado === 'ACTIVO' ? 'border-green-500 bg-green-500' : 'border-gray-400 dark:border-gray-500'}`}>
                        {data.estado === 'ACTIVO' && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">✅ Activo</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">El lector puede usar el sistema</p>
                      </div>
                    </label>
                    <label className={`relative flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${data.estado === 'INACTIVO' ? 'border-red-400 bg-red-50 dark:bg-red-900/20 dark:border-red-600' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-red-300 dark:hover:border-red-600'}`}>
                      <input
                        type="radio"
                        name="estado"
                        value="INACTIVO"
                        checked={data.estado === 'INACTIVO'}
                        onChange={(e) => setData('estado', e.target.value)}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${data.estado === 'INACTIVO' ? 'border-red-500 bg-red-500' : 'border-gray-400 dark:border-gray-500'}`}>
                        {data.estado === 'INACTIVO' && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">❌ Inactivo</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">El lector no puede usar el sistema</p>
                      </div>
                    </label>
                  </div>
                  {errors.estado && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.estado}
                    </p>
                  )}
                </div>

                {/* Botones mejorados */}
                <div className="flex flex-col sm:flex-row sm:justify-end sm:space-x-4 space-y-3 sm:space-y-0 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <a
                    href={route('lectores.index')}
                    className="inline-flex items-center justify-center px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800 transition-all duration-200 transform hover:scale-105"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Cancelar
                  </a>
                  <button
                    type="submit"
                    disabled={processing}
                    className={`inline-flex items-center justify-center px-6 py-3 border-2 border-transparent text-sm font-medium rounded-lg text-white transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 ${processing ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:ring-indigo-200 dark:focus:ring-indigo-800 shadow-lg hover:shadow-xl'}`}
                  >
                    {processing ? (
                      <>
                        <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Actualizar Lector
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Información adicional */}
          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Información importante
                </h3>
                <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                  <ul className="list-disc list-inside space-y-1">
                    <li>El código debe ser único en el sistema</li>
                    <li>Los estudiantes deben tener un grado asignado</li>
                    <li>Los lectores inactivos no podrán realizar préstamos</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}