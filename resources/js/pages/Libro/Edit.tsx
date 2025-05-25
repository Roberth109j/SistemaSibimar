
import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { 
  Save, 
  ArrowLeft, 
  BookOpen, 
  CheckCircle, 
  AlertCircle, 
  X,
  User,
  Building,
  MapPin,
  Tags,
  Hash
} from 'lucide-react';
import { Libro, EditLibroPageProps, PageProps } from './types';

// --- Componente AlertNotification ---
interface AlertNotificationProps {
  type: 'success' | 'error';
  message: string;
  className?: string;
  autoClose?: boolean;
  duration?: number;
}

function AlertNotification({
  type,
  message,
  className = '',
  autoClose = true,
  duration = 4000,
}: AlertNotificationProps) {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [animateOut, setAnimateOut] = useState<boolean>(false);

  useEffect(() => {
    if (autoClose && message) {
      const timer = setTimeout(() => {
        setAnimateOut(true);
        const hideTimer = setTimeout(() => {
          setIsVisible(false);
        }, 500);
        return () => clearTimeout(hideTimer);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, message]);

  if (!isVisible || !message) return null;

  const colors = {
    success: {
      light: { bg: 'bg-green-100', border: 'border-green-500', text: 'text-green-800', icon: 'text-green-500' },
      dark: { bg: 'dark:bg-green-800/40', border: 'dark:border-green-500', text: 'dark:text-green-100', icon: 'dark:text-green-400' }
    },
    error: {
      light: { bg: 'bg-red-100', border: 'border-red-500', text: 'text-red-800', icon: 'text-red-500' },
      dark: { bg: 'dark:bg-red-800/40', border: 'dark:border-red-500', text: 'dark:text-red-100', icon: 'dark:text-red-400' }
    }
  };

  const Icon = type === 'success' ? CheckCircle : AlertCircle;

  return (
    <div className={`fixed top-6 right-6 z-50 ${animateOut ? 'opacity-0 translate-x-20' : 'opacity-100 translate-x-0'} transition-all duration-500 ease-in-out transform ${className}`}>
      <div
        className={`max-w-md rounded-lg shadow-xl border-l-4
                    ${colors[type].light.border} ${colors[type].dark.border}
                    ${colors[type].light.bg} ${colors[type].dark.bg}
                    flex items-start p-5 transition-all duration-300 animate-slide-in-right`}
      >
        <Icon className={`h-6 w-6 mt-0.5 mr-4 flex-shrink-0 ${colors[type].light.icon} ${colors[type].dark.icon}`} />
        <div className="flex-grow">
          <p className={`text-base font-semibold ${colors[type].light.text} ${colors[type].dark.text}`}>
            {message}
          </p>
        </div>
        <button
          onClick={() => setAnimateOut(true)}
          className="ml-4 flex-shrink-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

// Definir las migas de pan (breadcrumbs)
const getBreadcrumbs = (libroId: number, libroTitulo: string) => [
  {
    title: 'Dashboard',
    href: '/dashboard',
  },
  {
    title: 'Libros',
    href: '/libros',
  },
  {
    title: libroTitulo,
    href: `/libros/${libroId}`,
  },
  {
    title: 'Editar',
    href: `/libros/${libroId}/edit`,
  },
];

export default function Edit({ 
  auth, 
  libro, 
  autores = [],
  editoriales = [],
  estanterias = [],
  secciones = [],
  categoriasDewey = [],
  subcategoriasDewey = [],
  temasDewey = [],
  clases = [],
  idiomas = [],
  flash,
  errors = {}
}: EditLibroPageProps) {
  const page = usePage<PageProps>();
  
  // Estado para manejar las alertas
  const [alerts, setAlerts] = useState<{
    success: string | null;
    error: string | null;
    timestamp: number;
  }>({
    success: null,
    error: null,
    timestamp: 0
  });

  // Inicializar estados con los valores del libro directamente
  const [subcategorias, setSubcategorias] = useState(subcategoriasDewey || []);
  const [temas, setTemas] = useState(temasDewey || []);
  const [selectedCategoria, setSelectedCategoria] = useState(
    libro.tema_dewey?.subcategoria?.categoria?.id?.toString() || ''
  );
  const [selectedSubcategoria, setSelectedSubcategoria] = useState(
    libro.tema_dewey?.subcategoria?.id?.toString() || ''
  );

  const { data, setData, put, processing, errors: formErrors, wasSuccessful, recentlySuccessful } = useForm({
    isbn: libro.isbn || '',
    titulo: libro.titulo || '',
    contenido: libro.contenido || '',
    seccion_id: libro.seccion_id?.toString() || '',
    autor_id: libro.autor_id?.toString() || '',
    editorial_id: libro.editorial_id?.toString() || '',
    clase: libro.clase || '',
    tomo: libro.tomo?.toString() || '',
    edicion: libro.edicion || '',
    anio: libro.anio?.toString() || '',
    fecha_ingreso: libro.fecha_ingreso ? libro.fecha_ingreso.substring(0, 10) : '',
    precio: libro.precio?.toString() || '',
    idioma: libro.idioma || '',
    edad_recomendada: libro.edad_recomendada?.toString() || '',
    paginas: libro.paginas?.toString() || '',
    tema_id: libro.tema_id?.toString() || '',
    sign_top: libro.sign_top || '',
    estanteria_id: libro.estanteria_id?.toString() || ''
  });

  // Efecto para manejar los mensajes flash
  useEffect(() => {
    // Prioridad a los mensajes flash que vienen del servidor
    if (flash?.success || flash?.error) {
      setAlerts({
        success: flash.success || null,
        error: flash.error || null,
        timestamp: Date.now()
      });
    }
    // Si no hay flash messages, revisar el objeto page.props
    else if (page.props.flash) {
      setAlerts({
        success: page.props.flash.success || null,
        error: page.props.flash.error || null,
        timestamp: Date.now()
      });
    }
  }, [flash, page.props.flash]);

  // Efecto para manejar errores de validación
  useEffect(() => {
    // Si hay errores de validación del formulario
    if (Object.keys(formErrors).length > 0) {
      const errorMessages = Object.values(formErrors).join(', ');
      setAlerts({
        success: null,
        error: `Error de validación: ${errorMessages}`,
        timestamp: Date.now()
      });
    }
  }, [formErrors]);

  useEffect(() => {
    if (selectedCategoria) {
      fetchSubcategoriasDewey(selectedCategoria);
    } else {
      setSubcategorias([]);
      setSelectedSubcategoria('');
      setTemas([]);
    }
  }, [selectedCategoria]);

  useEffect(() => {
    if (selectedSubcategoria) {
      fetchTemasDewey(selectedSubcategoria);
    } else {
      setTemas([]);
    }
  }, [selectedSubcategoria]);

  const fetchSubcategoriasDewey = async (categoriaId: string) => {
    try {
      const response = await fetch(`/api/categorias/${categoriaId}/subcategorias`);
      const data = await response.json();
      setSubcategorias(data);
    } catch (error) {
      console.error('Error fetching subcategorias dewey:', error);
    }
  };

  const fetchTemasDewey = async (subcategoriaId: string) => {
    try {
      const response = await fetch(`/api/subcategorias/${subcategoriaId}/temas`);
      const data = await response.json();
      setTemas(data);
    } catch (error) {
      console.error('Error fetching temas dewey:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Manejar la selección de categorías y subcategorías para la cascada
    if (name === 'categoria_id') {
      setSelectedCategoria(value);
      setSelectedSubcategoria('');
      setData('tema_id', ''); // Limpiar el tema seleccionado
    } else if (name === 'subcategoria_id') {
      setSelectedSubcategoria(value);
      setData('tema_id', ''); // Limpiar el tema seleccionado
    } else {
      setData(name as keyof typeof data, value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Limpiar alertas previas antes de enviar
    setAlerts({
      success: null,
      error: null,
      timestamp: Date.now()
    });

    put(route('libros.update', libro.id), {
      preserveScroll: true,
      onSuccess: () => {
        // La redirección se maneja en el controlador
        // Este callback se ejecuta antes de la redirección
      },
      onError: (errors) => {
        // Manejar errores si ocurren
        const errorMessages = Object.values(errors).join(', ');
        setAlerts({
          success: null,
          error: errorMessages || 'Error al actualizar el libro',
          timestamp: Date.now()
        });
      }
    });
  };

  const renderAlerts = (): React.ReactElement => {
    return (
      <>
        {alerts.success && (
          <AlertNotification
            key={`success-${alerts.timestamp}`}
            type="success"
            message={alerts.success}
          />
        )}
        {alerts.error && (
          <AlertNotification
            key={`error-${alerts.timestamp}`}
            type="error"
            message={alerts.error}
          />
        )}
      </>
    );
  };

  const breadcrumbs = getBreadcrumbs(libro.id, libro.titulo);

  return (
    <AppLayout
      breadcrumbs={breadcrumbs}
      renderHeader={() => (
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
            Editar Libro: {libro.titulo}
          </h2>
          <div className="flex items-center space-x-4">
            <Link
              href={route('libros.show', libro.id)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <BookOpen className="w-4 h-4" />
              Ver Detalles
            </Link>
          </div>
        </div>
      )}
    >
      <Head title={`Editar: ${libro.titulo}`} />
      
      {renderAlerts()}

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

          <form onSubmit={handleSubmit}>
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
              <div className="p-6 bg-white dark:bg-gray-800">
                <div className="space-y-8">
                  
                  {/* Header con información básica */}
                  <div className="flex items-center justify-between pb-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-500 dark:bg-blue-600 text-white shadow-lg mr-4">
                        <span className="text-lg font-bold">{libro.id}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          Editando: {libro.titulo}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">ISBN: {libro.isbn}</p>
                      </div>
                    </div>
                  </div>

                  {/* Información Básica */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-6 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="flex items-center mb-6">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg mr-3">
                        <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h4 className="font-semibold text-lg text-gray-900 dark:text-white">
                        Información Básica
                      </h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* ISBN */}
                      <div>
                        <label htmlFor="isbn" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          ISBN <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="isbn"
                          name="isbn"
                          value={data.isbn}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="Ingrese el ISBN"
                        />
                        {(formErrors.isbn || errors.isbn) && (
                          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formErrors.isbn || errors.isbn}</p>
                        )}
                      </div>
                      
                      {/* Título */}
                      <div>
                        <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Título <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="titulo"
                          name="titulo"
                          value={data.titulo}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="Ingrese el título del libro"
                        />
                        {(formErrors.titulo || errors.titulo) && (
                          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formErrors.titulo || errors.titulo}</p>
                        )}
                      </div>
                      
                      {/* Autor */}
                      <div>
                        <label htmlFor="autor_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-1 text-gray-500" />
                            Autor <span className="text-red-500">*</span>
                          </div>
                        </label>
                        <select
                          id="autor_id"
                          name="autor_id"
                          value={data.autor_id}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        >
                          <option value="">Seleccione un autor</option>
                          {autores.map((autor: any) => (
                            <option key={autor.id} value={autor.id}>
                              {`${autor.apellidos}, ${autor.nombres}`}
                            </option>
                          ))}
                        </select>
                        {(formErrors.autor_id || errors.autor_id) && (
                          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formErrors.autor_id || errors.autor_id}</p>
                        )}
                      </div>
                      
                      {/* Editorial */}
                      <div>
                        <label htmlFor="editorial_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <div className="flex items-center">
                            <Building className="w-4 h-4 mr-1 text-gray-500" />
                            Editorial <span className="text-red-500">*</span>
                          </div>
                        </label>
                        <select
                          id="editorial_id"
                          name="editorial_id"
                          value={data.editorial_id}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        >
                          <option value="">Seleccione una editorial</option>
                          {editoriales.map((editorial: any) => (
                            <option key={editorial.id} value={editorial.id}>
                              {editorial.nombre}
                            </option>
                          ))}
                        </select>
                        {(formErrors.editorial_id || errors.editorial_id) && (
                          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formErrors.editorial_id || errors.editorial_id}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Clasificación y Ubicación */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-6 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="flex items-center mb-6">
                      <div className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-lg mr-3">
                        <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <h4 className="font-semibold text-lg text-gray-900 dark:text-white">
                        Clasificación y Ubicación
                      </h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Clase */}
                      <div>
                        <label htmlFor="clase" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Clase <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="clase"
                          name="clase"
                          value={data.clase}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        >
                          <option value="">Seleccione una clase</option>
                          {clases.map((clase: string) => (
                            <option key={clase} value={clase}>
                              {clase}
                            </option>
                          ))}
                        </select>
                        {(formErrors.clase || errors.clase) && (
                          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formErrors.clase || errors.clase}</p>
                        )}
                      </div>
                      
                      {/* Sección */}
                      <div>
                        <label htmlFor="seccion_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Sección <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="seccion_id"
                          name="seccion_id"
                          value={data.seccion_id}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        >
                          <option value="">Seleccione una sección</option>
                          {secciones.map((seccion: any) => (
                            <option key={seccion.id} value={seccion.id}>
                              {seccion.nombre}
                            </option>
                          ))}
                        </select>
                        {(formErrors.seccion_id || errors.seccion_id) && (
                          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formErrors.seccion_id || errors.seccion_id}</p>
                        )}
                      </div>
                      
                      {/* Estantería */}
                      <div>
                        <label htmlFor="estanteria_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Estantería <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="estanteria_id"
                          name="estanteria_id"
                          value={data.estanteria_id}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        >
                          <option value="">Seleccione una estantería</option>
                          {estanterias.map((estanteria: any) => (
                            <option key={estanteria.id} value={estanteria.id}>
                              {estanteria.cod_estante}
                            </option>
                          ))}
                        </select>
                        {(formErrors.estanteria_id || errors.estanteria_id) && (
                          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formErrors.estanteria_id || errors.estanteria_id}</p>
                        )}
                      </div>
                      
                      {/* Signatura Topográfica - Solo lectura */}
                      <div>
                        <label htmlFor="sign_top" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <div className="flex items-center">
                            <Hash className="w-4 h-4 mr-1 text-gray-500" />
                            Signatura Topográfica
                            <span className="text-xs text-blue-600 dark:text-blue-400 ml-2">(Generada automáticamente)</span>
                          </div>
                        </label>
                        <input
                          type="text"
                          id="sign_top"
                          name="sign_top"
                          value={data.sign_top}
                          readOnly
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-600 px-4 py-3 text-gray-900 dark:text-gray-100 focus:outline-none select-none cursor-not-allowed"
                          placeholder="Signatura topográfica"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Se genera automáticamente basada en el tema Dewey, autor y título
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Clasificación Dewey */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-6 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="flex items-center mb-6">
                      <div className="flex items-center justify-center w-8 h-8 bg-purple-100 dark:bg-purple-900/50 rounded-lg mr-3">
                        <Tags className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h4 className="font-semibold text-lg text-gray-900 dark:text-white">
                        Clasificación Dewey
                      </h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Categoría Dewey */}
                      <div>
                        <label htmlFor="categoria_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Categoría Principal
                        </label>
                        <select
                          id="categoria_id"
                          name="categoria_id"
                          value={selectedCategoria}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        >
                          <option value="">Seleccione una categoría</option>
                          {categoriasDewey.map((categoria: any) => (
                            <option key={categoria.id} value={categoria.id}>
                              {categoria.codigo} - {categoria.nombre}
                            </option>
                          ))}
                        </select>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Ej: 900 - Geografía e Historia
                        </p>
                      </div>
                      
                      {/* Subcategoría Dewey */}
                      <div>
                        <label htmlFor="subcategoria_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Subcategoría
                        </label>
                        <select
                          id="subcategoria_id"
                          name="subcategoria_id"
                          value={selectedSubcategoria}
                          onChange={handleChange}
                          disabled={!selectedCategoria}
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="">Seleccione una subcategoría</option>
                          {subcategorias.map((subcategoria: any) => (
                            <option key={subcategoria.id} value={subcategoria.id}>
                              {subcategoria.codigo} - {subcategoria.nombre}
                            </option>
                          ))}
                        </select>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {!selectedCategoria ? 'Primero seleccione una categoría' : 'Ej: 980 - Historia de América del Sur'}
                        </p>
                      </div>
                      
                      {/* Tema Dewey */}
                      <div>
                        <label htmlFor="tema_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Tema Específico
                        </label>
                        <select
                          id="tema_id"
                          name="tema_id"
                          value={data.tema_id}
                          onChange={handleChange}
                          disabled={!selectedSubcategoria}
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="">Seleccione un tema</option>
                          {temas.map((tema: any) => (
                            <option key={tema.id} value={tema.id}>
                              {tema.codigo} - {tema.nombre}
                            </option>
                          ))}
                        </select>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {!selectedSubcategoria ? 'Primero seleccione una subcategoría' : 'Ej: 989 - Paraguay y Uruguay'}
                        </p>
                        {(formErrors.tema_id || errors.tema_id) && (
                          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formErrors.tema_id || errors.tema_id}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Detalles del Libro */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h4 className="font-semibold text-lg mb-6 text-gray-900 dark:text-white">
                      Detalles del Libro
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Idioma */}
                      <div>
                        <label htmlFor="idioma" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Idioma <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="idioma"
                          name="idioma"
                          value={data.idioma}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        >
                          <option value="">Seleccione un idioma</option>
                          {idiomas.map((idioma: string) => (
                            <option key={idioma} value={idioma}>
                              {idioma}
                            </option>
                          ))}
                        </select>
                        {(formErrors.idioma || errors.idioma) && (
                          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formErrors.idioma || errors.idioma}</p>
                        )}
                      </div>
                      
                      {/* Páginas */}
                      <div>
                        <label htmlFor="paginas" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Páginas <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          id="paginas"
                          name="paginas"
                          min="1"
                          value={data.paginas}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="Número de páginas"
                        />
                        {(formErrors.paginas || errors.paginas) && (
                          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formErrors.paginas || errors.paginas}</p>
                        )}
                      </div>
                      
                      {/* Año */}
                      <div>
                        <label htmlFor="anio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Año de Publicación
                        </label>
                        <input
                          type="number"
                          id="anio"
                          name="anio"
                          min="1000"
                          max="2099"
                          value={data.anio}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="Ej: 2023"
                        />
                        {(formErrors.anio || errors.anio) && (
                          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formErrors.anio || errors.anio}</p>
                        )}
                      </div>
                      
                      {/* Tomo */}
                      <div>
                        <label htmlFor="tomo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Tomo
                        </label>
                        <input
                          type="text"
                          id="tomo"
                          name="tomo"
                          value={data.tomo}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="Ej: I, II, III"
                        />
                        {(formErrors.tomo || errors.tomo) && (
                          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formErrors.tomo || errors.tomo}</p>
                        )}
                      </div>
                      
                      {/* Edición */}
                      <div>
                        <label htmlFor="edicion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Edición
                        </label>
                        <input
                          type="text"
                          id="edicion"
                          name="edicion"
                          value={data.edicion}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="Ej: 1ra, 2da, 3ra"
                        />
                        {(formErrors.edicion || errors.edicion) && (
                          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formErrors.edicion || errors.edicion}</p>
                        )}
                      </div>
                      
                      {/* Precio */}
                      <div>
                        <label htmlFor="precio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Precio
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 text-sm">$</span>
                          </div>
                          <input
                            type="number"
                            id="precio"
                            name="precio"
                            step="0.01"
                            min="0"
                            value={data.precio}
                            onChange={handleChange}
                            className="w-full pl-8 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder="0.00"
                          />
                        </div>
                        {(formErrors.precio || errors.precio) && (
                          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formErrors.precio || errors.precio}</p>
                        )}
                      </div>
                      
                      {/* Edad Recomendada */}
                      <div>
                        <label htmlFor="edad_recomendada" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Edad Recomendada
                        </label>
                        <input
                          type="number"
                          id="edad_recomendada"
                          name="edad_recomendada"
                          min="0"
                          max="99"
                          value={data.edad_recomendada}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="Ej: 12"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Edad mínima recomendada en años
                        </p>
                        {(formErrors.edad_recomendada || errors.edad_recomendada) && (
                          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formErrors.edad_recomendada || errors.edad_recomendada}</p>
                        )}
                      </div>
                      
                      {/* Fecha de Ingreso - Solo lectura */}
                      <div>
                        <label htmlFor="fecha_ingreso" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Fecha de Ingreso
                          <span className="text-xs text-blue-600 dark:text-blue-400 ml-2">(No modificable)</span>
                        </label>
                        <input
                          type="date"
                          id="fecha_ingreso"
                          name="fecha_ingreso"
                          value={data.fecha_ingreso}
                          readOnly
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-600 px-4 py-3 text-gray-900 dark:text-gray-100 focus:outline-none select-none cursor-not-allowed"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Fecha original de ingreso del libro al sistema
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h4 className="font-semibold text-lg mb-6 text-gray-900 dark:text-white">
                      Contenido del Libro
                    </h4>
                    <div>
                      <textarea
                        id="contenido"
                        name="contenido"
                        rows={6}
                        value={data.contenido}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical"
                        placeholder="Describe el contenido del libro, índice, capítulos, etc..."
                      />
                      {(formErrors.contenido || errors.contenido) && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formErrors.contenido || errors.contenido}</p>
                      )}
                    </div>
                  </div>

                  {/* Botones de Acción */}
                  <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
                    <Link
                      href={route('libros.show', libro.id)}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Volver a Detalles
                    </Link>
                    
                    <div className="flex space-x-4">
                      <Link
                        href={route('libros.index')}
                        className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                      >
                        Cancelar
                      </Link>
                      <button
                        type="submit"
                        disabled={processing}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Save className="w-5 h-5" />
                        {processing ? 'Guardando...' : 'Guardar Cambios'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}