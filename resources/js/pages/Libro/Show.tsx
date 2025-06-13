import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Library, PlusCircle, BookOpen, Calendar, DollarSign, Globe, Hash, MapPin, Tag, Users, Edit, ArrowLeft, ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';
import { Libro } from './types';

// Definir las migas de pan (breadcrumbs)
const getBreadcrumbs = (libroId: number, libroTitulo: string) => [
  {
    title: 'Libros',
    href: '/libros',
  },
  {
    title: libroTitulo,
    href: `/libros/${libroId}`,
  },
];

interface ShowLibroProps {
  auth: any;
  libro: Libro;
  success?: string;
}

// Componente para las tarjetas de información
const InfoCard = ({ 
  title, 
  children, 
  icon: Icon,
  className = "" 
}: { 
  title: string; 
  children: React.ReactNode; 
  icon?: React.ComponentType<any>;
  className?: string;
}) => (
  <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 ${className}`}>
    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-3">
        {Icon && <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
);

// Componente para campos de información
const InfoField = ({ 
  label, 
  value, 
  icon: Icon,
  type = 'text'
}: { 
  label: string; 
  value: any; 
  icon?: React.ComponentType<any>;
  type?: 'text' | 'badge' | 'currency' | 'date';
}) => {
  const renderValue = () => {
    if (!value || value === '-') {
      return <span className="text-gray-400 dark:text-gray-500 italic">No especificado</span>;
    }

    switch (type) {
      case 'badge':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {value}
          </span>
        );
      case 'currency':
        return (
          <span className="font-semibold text-green-600 dark:text-green-400">
            ${typeof value === 'number' ? value.toLocaleString() : value}
          </span>
        );
      case 'date':
        return (
          <span className="font-medium text-gray-900 dark:text-white">
            {new Date(value).toLocaleDateString('es-ES', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        );
      default:
        return <span className="font-medium text-gray-900 dark:text-white">{value}</span>;
    }
  };

  return (
    <div className="flex items-start justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {Icon && <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />}
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
          {label}
        </span>
      </div>
      <div className="ml-4 text-right">
        {renderValue()}
      </div>
    </div>
  );
};

// Componente para mostrar contenido expandible
const ExpandableContent = ({ content }: { content: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Determinar si el contenido es largo (más de 300 caracteres o 5 líneas)
  const isLongContent = content.length > 300 || content.split('\n').length > 5;
  const previewContent = isLongContent ? content.substring(0, 300) + '...' : content;

  const toggleExpanded = () => setIsExpanded(!isExpanded);
  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Header del modal fullscreen */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Contenido del Libro
              </h2>
            </div>
            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-2 px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <Minimize2 className="w-4 h-4" />
              <span className="text-sm">Cerrar</span>
            </button>
          </div>
          
          {/* Contenido scrolleable */}
          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-4xl mx-auto">
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                  {content}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Contenido con altura controlada */}
      <div className={`
        bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 border-blue-500 overflow-hidden
        ${isExpanded ? '' : 'max-h-48'}
      `}>
        <div className={`
          p-4 overflow-y-auto
          ${isExpanded ? 'max-h-96' : ''}
        `}>
          <pre className="whitespace-pre-wrap font-sans text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
            {isExpanded ? content : previewContent}
          </pre>
        </div>
        
        {/* Gradiente fade si no está expandido y el contenido es largo */}
        {!isExpanded && isLongContent && (
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-50 dark:from-gray-700 to-transparent pointer-events-none" />
        )}
      </div>

      {/* Controles */}
      {isLongContent && (
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={toggleExpanded}
            className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Mostrar menos
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Mostrar más
              </>
            )}
          </button>
          
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
          >
            <Maximize2 className="w-4 h-4" />
            Pantalla completa
          </button>
        </div>
      )}

      {/* Información adicional sobre el contenido */}
      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-600">
        <span className="flex items-center gap-1">
          <Hash className="w-3 h-3" />
          {content.length.toLocaleString()} caracteres
        </span>
      </div>
    </div>
  );
};

export default function Show({ auth, libro, success }: ShowLibroProps) {
  if (!libro) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando información del libro...</p>
        </div>
      </div>
    );
  }

  const breadcrumbs = getBreadcrumbs(libro.id, libro.titulo);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`${libro.titulo} - Detalles`} />

      <div className="min-h-screen bg-slate-50 dark:bg-black">
        {/* Efectos de fondo decorativos */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl dark:bg-blue-600/10"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-indigo-500/5 blur-3xl dark:bg-indigo-600/10"></div>
        </div>

        <div className="py-8 px-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            {success && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  {success}
                </div>
              </div>
            )}

            {/* Header Section */}
            <div className="mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur rounded-lg">
                        <span className="text-lg font-bold text-white">{libro.id}</span>
                      </div>
                      <div className="text-white">
                        <h1 className="text-2xl font-bold mb-1">{libro.titulo}</h1>
                        <div className="flex items-center gap-3 text-blue-100 text-sm">
                          <span className="flex items-center gap-1">
                            <Hash className="w-3 h-3" />
                            ISBN: {libro.isbn}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href="/libros"
                        className="flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur text-white text-sm rounded-lg hover:bg-white/30 transition-all duration-200"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Volver
                      </Link>
                      <Link
                        href={`/libros/${libro.id}/edit`}
                        className="flex items-center gap-2 px-4 py-1.5 bg-white text-blue-600 text-sm rounded-lg hover:bg-blue-50 transition-all duration-200 font-medium shadow-lg"
                      >
                        <Edit className="w-4 h-4" />
                        Editar Libro
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column - Main Information */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Basic Information */}
                <InfoCard title="Información Básica" icon={BookOpen}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                    <div>
                      <InfoField 
                        label="Título" 
                        value={libro.titulo}
                        icon={BookOpen}
                      />
                      <InfoField 
                        label="Autor" 
                        value={libro.autor ? `${libro.autor.nombres} ${libro.autor.apellidos}` : null}
                        icon={Users}
                      />
                      <InfoField 
                        label="Editorial" 
                        value={libro.editorial?.nombre}
                        icon={Tag}
                      />
                      <InfoField 
                        label="Clase" 
                        value={libro.clase}
                        type="badge"
                      />
                    </div>
                    <div>
                      <InfoField 
                        label="Idioma" 
                        value={libro.idioma}
                        icon={Globe}
                      />
                      <InfoField 
                        label="Páginas" 
                        value={libro.paginas}
                        icon={BookOpen}
                      />
                      <InfoField 
                        label="Año de Publicación" 
                        value={libro.anio}
                        icon={Calendar}
                      />
                      <InfoField 
                        label="Precio" 
                        value={libro.precio}
                        type="currency"
                        icon={DollarSign}
                      />
                    </div>
                  </div>
                </InfoCard>

                {/* Location and Classification */}
                <InfoCard title="Ubicación y Clasificación" icon={MapPin}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                    <div>
                      <InfoField 
                        label="Estantería" 
                        value={libro.estanteria?.cod_estante}
                        icon={MapPin}
                      />
                      <InfoField 
                        label="Sección" 
                        value={libro.seccion?.nombre}
                        icon={Tag}
                      />
                    </div>
                    <div>
                      <InfoField 
                        label="Signatura Topográfica" 
                        value={libro.sign_top}
                        icon={Hash}
                      />
                      <InfoField 
                        label="Tema Dewey" 
                        value={libro.tema_dewey ? `${libro.tema_dewey.codigo} - ${libro.tema_dewey.nombre}` : null}
                        icon={BookOpen}
                      />
                    </div>
                  </div>
                  
                  {/* Dewey Hierarchy */}
                  {libro.tema_dewey?.subcategoria && (
                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">Jerarquía Dewey</h4>
                      <div className="space-y-2 text-sm">
                        {libro.tema_dewey.subcategoria.categoria && (
                          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="font-medium">Categoría:</span>
                            <span>{libro.tema_dewey.subcategoria.categoria.codigo} - {libro.tema_dewey.subcategoria.categoria.nombre}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 ml-4">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <span className="font-medium">Subcategoría:</span>
                          <span>{libro.tema_dewey.subcategoria.codigo} - {libro.tema_dewey.subcategoria.nombre}</span>
                        </div>
                        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 ml-8">
                          <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                          <span className="font-medium">Tema:</span>
                          <span>{libro.tema_dewey.codigo} - {libro.tema_dewey.nombre}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </InfoCard>

                {/* Content - Mejorado */}
                {libro.contenido && (
                  <InfoCard title="Contenido del Libro" icon={BookOpen}>
                    <ExpandableContent content={libro.contenido} />
                  </InfoCard>
                )}
              </div>

              {/* Right Column - Sidebar */}
              <div className="space-y-6">
                
                {/* Status Card */}
                <InfoCard title="Estado y Disponibilidad" icon={Library}>
                  <div className="text-center py-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                      <Library className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="space-y-2">
                      <div className="text-3xl font-bold text-gray-900 dark:text-white">
                        {libro.ejemplares_count || 0}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Ejemplares disponibles
                      </div>
                      <div className="pt-2">
                        {(libro.ejemplares_count || 0) > 0 ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            ✓ Disponible para préstamo
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                            Sin ejemplares
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </InfoCard>

                {/* Additional Details */}
                <InfoCard title="Detalles Adicionales" icon={Tag}>
                  <div className="space-y-1">
                    <InfoField 
                      label="Fecha de Ingreso" 
                      value={libro.fecha_ingreso}
                      type="date"
                      icon={Calendar}
                    />
                    <InfoField 
                      label="Edad Recomendada" 
                      value={libro.edad_recomendada ? `${libro.edad_recomendada} años` : null}
                      icon={Users}
                    />
                    <InfoField 
                      label="Editorial (Ubicación)" 
                      value={libro.editorial?.ciudad && libro.editorial?.pais ? 
                        `${libro.editorial.ciudad}, ${libro.editorial.pais}` : null}
                      icon={MapPin}
                    />
                  </div>
                </InfoCard>

                {/* Actions */}
                <InfoCard title="Gestión de Ejemplares" icon={Library}>
                  <div className="space-y-3">
                    <Link
                      href={`/libros/${libro.id}/ejemplares`}
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <Library className="w-5 h-5" />
                      Ver Ejemplares ({libro.ejemplares_count || 0})
                    </Link>
                    <Link
                      href={`/libros/${libro.id}/ejemplares/create`}
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <PlusCircle className="w-5 h-5" />
                      Añadir Ejemplar
                    </Link>
                  </div>
                </InfoCard>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}