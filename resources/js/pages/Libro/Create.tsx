// pages/libros/create.tsx
import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import GeneralInfoSection from './FormCreate/GeneralInfoSection';
import ClasificacionSection from './FormCreate/ClasificacionSection';
import DetallesSection from './FormCreate/DetallesSection';
import { type BreadcrumbItem } from '@/types';
import { type LibroPageProps } from './types';
import { BookOpen, BookmarkIcon, Info } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Libros',
    href: '/libros',
  },
  {
    title: 'Crear Libro',
    href: '/libros/create',
  },
];

export default function Create({
  auth,
  clases,
  areas, // Nuevo prop
  idiomas,
  autores = [],
  editoriales = [],
  estanterias = [],
  secciones = [],
  categoriasDewey = [],
  seccionId = null, // Sección predeterminada según el rol del usuario
}: LibroPageProps) {
  // Verificar si el usuario es administrador
  const isAdmin = auth.user?.roles?.some((role: any) => role.name === 'Administrador') || false;
  const [activeSection, setActiveSection] = useState('general');
  
  // Estados para mantener los datos de clasificación entre secciones
  const [clasificacionState, setClasificacionState] = useState({
    categoriaId: null as number | null,
    subcategoriaId: null as number | null,
    subcategorias: [] as any[],
    temas: [] as any[]
  });

  const form = useForm({
    codigo_unico: '', // Cambio de 'isbn' a 'codigo_unico'
    titulo: '',
    contenido: '',
    seccion_id: seccionId || '', // Usar la sección predeterminada según el rol
    autor_id: '',
    editorial_id: '',
    area: '', // Nuevo campo
    clase: '',
    tomo: '',
    edicion: '',
    anio: '',
    fecha_ingreso: new Date().toISOString().split('T')[0],
    precio: '',
    idioma: '',
    edad_recomendada: '',
    paginas: '',
    tema_id: '',
    estanteria_id: '', // Campo opcional
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validar campos requeridos
    const camposRequeridos = {
      codigo_unico: 'Código único',
      titulo: 'Título',
      autor_id: 'Autor Principal',
      editorial_id: 'Editorial',
      seccion_id: 'Sección',
      tema_id: 'Tema Dewey',
      area: 'Área',
      clase: 'Clase',
      idioma: 'Idioma',
      fecha_ingreso: 'Fecha de Ingreso'
    };

    const camposFaltantes = Object.entries(camposRequeridos)
      .filter(([key]) => !form.data[key as keyof typeof form.data] || form.data[key as keyof typeof form.data] === '')
      .map(([, label]) => label);

    if (camposFaltantes.length > 0) {
      const mensaje = `Por favor, complete los siguientes campos obligatorios:\n- ${camposFaltantes.join('\n- ')}`;
      alert(mensaje);
      return;
    }

    // Validar formato de código único según la clase
    if (form.data.clase === 'LIBRO') {
      // ISBN - 13 dígitos
      const isbnRegex = /^\d{13}$/;
      if (!isbnRegex.test(form.data.codigo_unico.replace(/[^0-9]/g, ''))) {
        alert('El ISBN debe contener exactamente 13 dígitos');
        return;
      }
    } else if (form.data.clase === 'REVISTA') {
      // ISSN - 8 dígitos
      const issnRegex = /^\d{8}$/;
      if (!issnRegex.test(form.data.codigo_unico.replace(/[^0-9]/g, ''))) {
        alert('El ISSN debe contener exactamente 8 dígitos');
        return;
      }
    }

    // Validaciones adicionales
    if (form.data.fecha_ingreso && new Date(form.data.fecha_ingreso) > new Date()) {
      alert('La fecha de ingreso no puede ser futura');
      return;
    }

    if (form.data.paginas && parseInt(form.data.paginas) <= 0) {
      alert('El número de páginas debe ser mayor a 0');
      return;
    }

    if (form.data.precio && parseFloat(form.data.precio) < 0) {
      alert('El precio no puede ser negativo');
      return;
    }

    if (form.data.edad_recomendada && parseInt(form.data.edad_recomendada) < 0) {
      alert('La edad recomendada no puede ser negativa');
      return;
    }

    if (form.data.anio && (parseInt(form.data.anio) < 1000 || parseInt(form.data.anio) > new Date().getFullYear())) {
      alert(`El año debe estar entre 1000 y ${new Date().getFullYear()}`);
      return;
    }

    // Enviar formulario
    form.post(route('libros.store'), {
      onSuccess: () => {
        console.log('Libro creado exitosamente');
      },
      onError: (errors) => {
        console.error('Errores del servidor:', errors);
        const errorMessages = Object.values(errors).join('\n');
        if (errorMessages) {
          alert('Se encontraron los siguientes errores:\n' + errorMessages);
        }
      }
    });
  };

  // Función para manejar cambios de estado en la sección de clasificación
  const handleClasificacionStateChange = (state: {
    categoriaId: number | null;
    subcategoriaId: number | null;
    subcategorias: any[];
    temas: any[];
  }) => {
    setClasificacionState(state);
  };

  const sections = [
    { id: 'general', label: 'Información General', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'clasificacion', label: 'Clasificación', icon: <BookmarkIcon className="w-5 h-5" /> },
    { id: 'detalles', label: 'Detalles Adicionales', icon: <Info className="w-5 h-5" /> }
  ];

  return (
    <AppLayout
      breadcrumbs={breadcrumbs}
      renderHeader={() => (
        <h2 className="text-xl font-semibold leading-tight text-gray-800">
          Crear Libro
        </h2>
      )}
    >
      <Head title="Crear Libro" />

      <div className="py-6">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {/* Header con título y barra de navegación por secciones */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg mb-6">
            <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700">
              <h1 className="text-2xl font-bold text-white mb-2">Registrar Nuevo Material</h1>
              <p className="text-blue-100">Complete los campos para agregar un nuevo libro o revista al catálogo</p>
            </div>
            
            {/* Navegación entre secciones */}
            <div className="flex flex-wrap border-b border-gray-200 dark:border-gray-700">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center px-4 py-3 font-medium text-sm focus:outline-none transition-colors ${
                    activeSection === section.id
                      ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="mr-2">{section.icon}</span>
                  {section.label}
                </button>
              ))}
            </div>
            
            {/* Indicador de progreso */}
            <div className="px-6 py-2 bg-gray-50 dark:bg-gray-700">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <span className="mr-2">Progreso:</span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2 mr-4">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: activeSection === 'general' ? '33%' : 
                             activeSection === 'clasificacion' ? '66%' : '100%'
                    }}
                  ></div>
                </div>
                <span className="text-xs font-medium">
                  {activeSection === 'general' ? '1/3' : 
                   activeSection === 'clasificacion' ? '2/3' : '3/3'}
                </span>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <form onSubmit={handleSubmit} className="p-6">
              {activeSection === 'general' && (
                <GeneralInfoSection
                  form={form}
                  autores={autores}
                  editoriales={editoriales}
                  secciones={secciones}
                  clases={clases}
                  areas={areas} // Nuevo prop
                  idiomas={idiomas}
                  estanterias={estanterias}
                  isAdmin={isAdmin}
                  onNext={() => setActiveSection('clasificacion')}
                />
              )}
              
              {activeSection === 'clasificacion' && (
                <ClasificacionSection
                  form={form}
                  categoriasDewey={categoriasDewey}
                  onPrev={() => setActiveSection('general')}
                  onNext={() => setActiveSection('detalles')}
                  // Props para mantener estado
                  initialCategoriaId={clasificacionState.categoriaId}
                  initialSubcategoriaId={clasificacionState.subcategoriaId}
                  initialSubcategorias={clasificacionState.subcategorias}
                  initialTemas={clasificacionState.temas}
                  onStateChange={handleClasificacionStateChange}
                />
              )}
              
              {activeSection === 'detalles' && (
                <DetallesSection
                  form={form}
                  onPrev={() => setActiveSection('clasificacion')}
                  onSubmit={handleSubmit}
                />
              )}
            </form>
          </div>
          
          {/* Información de ayuda */}
          <div className="mt-6 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Info className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Información importante
                </h3>
                <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Los campos marcados con <span className="text-red-500">*</span> son obligatorios</li>
                    <li>Puede navegar entre secciones sin perder los datos ingresados</li>
                    <li>El código único cambia según el tipo: ISBN para libros (13 dígitos), ISSN para revistas (8 dígitos)</li>
                    <li>La estantería es opcional y puede asignarse posteriormente</li>
                    <li>Asegúrese de completar todos los campos antes de guardar</li>
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