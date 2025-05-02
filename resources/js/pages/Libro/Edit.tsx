import { useState, useEffect } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
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
  {
    title: 'Editar Libro',
    href: '#',
  },
];

export default function Edit({
  libro,
  clases,
  idiomas,
  autores = [],
  editoriales = [],
  estanterias = [],
  secciones = [],
  categoriasDewey = [],
  temaDewey,
  subcategoriaDewey,
  categoriaDewey,
  subcategorias = [],
  temas = [],
}: LibroPageProps) {
  // Estados para la clasificación Dewey dinámica
  const [selectedCategoriaId, setSelectedCategoriaId] = useState<number | null>(null);
  const [selectedSubcategoriaId, setSelectedSubcategoriaId] = useState<number | null>(null);
  const [loadedSubcategorias, setLoadedSubcategorias] = useState(subcategorias);
  const [loadedTemas, setLoadedTemas] = useState(temas);
  // Formulario con Inertia
  const form = useForm({
    isbn: libro?.isbn || '',
    titulo: libro?.titulo || '',
    contenido: libro?.contenido || '',
    seccion_id: libro?.seccion_id.toString() || '',
    autor_id: libro?.autor_id.toString() || '',
    editorial_id: libro?.editorial_id.toString() || '',
    clase: libro?.clase || '',
    tomo: libro?.tomo?.toString() || '',
    edicion: libro?.edicion || '',
    anio: libro?.anio?.toString() || '',
    fecha_ingreso: libro?.fecha_ingreso || '',
    precio: libro?.precio?.toString() || '',
    idioma: libro?.idioma || '',
    edad_recomendada: libro?.edad_recomendada?.toString() || '',
    paginas: libro?.paginas.toString() || '',
    tema_id: libro?.tema_id.toString() || '',
    estanteria_id: libro?.estanteria_id.toString() || '',
  });

  // Efectos
  useEffect(() => {
    if (categoriaDewey) {
      setSelectedCategoriaId(categoriaDewey.id);
      setLoadedSubcategorias(subcategorias);
    }
    
    if (subcategoriaDewey) {
      setSelectedSubcategoriaId(subcategoriaDewey.id);
      setLoadedTemas(temas);
    }


  }, [libro, categoriaDewey, subcategoriaDewey]);

  // Funciones para la clasificación Dewey
  const loadSubcategorias = async (categoriaId: number) => {
    try {
      const response = await fetch(`/api/categorias/${categoriaId}/subcategorias`);
      const data = await response.json();
      setLoadedSubcategorias(data);
      setSelectedSubcategoriaId(null);
      setLoadedTemas([]);
      form.setData('tema_id', '');
    } catch (error) {
      console.error('Error al cargar subcategorías:', error);
    }
  };

  const loadTemas = async (subcategoriaId: number) => {
    try {
      const response = await fetch(`/api/subcategorias/${subcategoriaId}/temas`);
      const data = await response.json();
      setLoadedTemas(data);
      form.setData('tema_id', '');
    } catch (error) {
      console.error('Error al cargar temas:', error);
    }
  };

  // Manejadores de eventos
  const handleCategoriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoriaId = parseInt(e.target.value);
    setSelectedCategoriaId(categoriaId || null);
    
    if (categoriaId) {
      loadSubcategorias(categoriaId);
    } else {
      setLoadedSubcategorias([]);
      setSelectedSubcategoriaId(null);
      setLoadedTemas([]);
    }
  };

  const handleSubcategoriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const subcategoriaId = parseInt(e.target.value);
    setSelectedSubcategoriaId(subcategoriaId || null);
    
    if (subcategoriaId) {
      loadTemas(subcategoriaId);
    } else {
      setLoadedTemas([]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validar campos requeridos con mensajes específicos
    const camposRequeridos = {
      isbn: 'ISBN',
      titulo: 'Título',
      autor_id: 'Autor Principal',
      editorial_id: 'Editorial',
      seccion_id: 'Sección',
      tema_id: 'Tema',
      estanteria_id: 'Estantería'
    };

    const camposFaltantes = Object.entries(camposRequeridos)
      .filter(([key]) => !form.data[key])
      .map(([, label]) => label);

    if (camposFaltantes.length > 0) {
      const mensaje = `Por favor, complete los siguientes campos obligatorios:\n- ${camposFaltantes.join('\n- ')}`;
      alert(mensaje);
      return;
    }

    // Validar formato de ISBN (13 dígitos)
    const isbnRegex = /^\d{13}$/;
    if (!isbnRegex.test(form.data.isbn)) {
      alert('El ISBN debe contener exactamente 13 dígitos');
      return;
    }

    // Mostrar indicador de carga
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.setAttribute('disabled', 'true');
      submitButton.textContent = 'Guardando...';
    }

    if (libro) {
      form.put(route('libros.update', libro.id), {
        onSuccess: () => {
          // Redirigir a la lista de libros
          router.visit(route('libros.index'));
        },
        onError: (errors) => {
          // Mostrar errores específicos del servidor
          const errorMessages = Object.values(errors).join('\n');
          if (errorMessages) {
            alert('Se encontraron los siguientes errores:\n' + errorMessages);
          }

          // Restaurar el botón
          if (submitButton) {
            submitButton.removeAttribute('disabled');
            submitButton.textContent = 'Guardar';
          }
        }
      });
    }
  };

  if (!libro) {
    return (
      <AppLayout title="Error">
        <div className="p-4 text-red-600">Libro no encontrado</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Editar Libro"
      breadcrumbs={breadcrumbs}
      renderHeader={() => (
        <h2 className="text-xl font-semibold leading-tight text-gray-800">
          Editar Libro: {libro.titulo}
        </h2>
      )}
    >
      <Head title={`Editar Libro: ${libro.titulo}`} />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="isbn" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    ISBN
                  </label>
                  <input
                    type="text"
                    id="isbn"
                    value={form.data.isbn}
                    onChange={e => form.setData('isbn', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                  {form.errors.isbn && (
                    <p className="mt-1 text-sm text-red-600">{form.errors.isbn}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Título
                  </label>
                  <input
                    type="text"
                    id="titulo"
                    value={form.data.titulo}
                    onChange={e => form.setData('titulo', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                  {form.errors.titulo && (
                    <p className="mt-1 text-sm text-red-600">{form.errors.titulo}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="contenido" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Contenido
                  </label>
                  <textarea
                    id="contenido"
                    value={form.data.contenido}
                    onChange={e => form.setData('contenido', e.target.value)}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                  {form.errors.contenido && (
                    <p className="mt-1 text-sm text-red-600">{form.errors.contenido}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="autor_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Autor Principal
                  </label>
                  <select
                    id="autor_id"
                    value={form.data.autor_id}
                    onChange={e => form.setData('autor_id', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="">Seleccione un autor</option>
                    {autores.map(autor => (
                      <option key={autor.id} value={autor.id}>
                        {`${autor.apellidos}, ${autor.nombres}`}
                      </option>
                    ))}
                  </select>
                  {form.errors.autor_id && (
                    <p className="mt-1 text-sm text-red-600">{form.errors.autor_id}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="editorial_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Editorial
                  </label>
                  <select
                    id="editorial_id"
                    value={form.data.editorial_id}
                    onChange={e => form.setData('editorial_id', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="">Seleccione una editorial</option>
                    {editoriales.map(editorial => (
                      <option key={editorial.id} value={editorial.id}>
                        {editorial.nombre}
                      </option>
                    ))}
                  </select>
                  {form.errors.editorial_id && (
                    <p className="mt-1 text-sm text-red-600">{form.errors.editorial_id}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="seccion_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Sección
                  </label>
                  <select
                    id="seccion_id"
                    value={form.data.seccion_id}
                    onChange={e => form.setData('seccion_id', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                  >
                    {secciones.map(seccion => (
                      <option key={seccion.id} value={seccion.id}>
                        {seccion.nombre}
                      </option>
                    ))}
                  </select>
                  {form.errors.seccion_id && (
                    <p className="mt-1 text-sm text-red-600">{form.errors.seccion_id}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="clase" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Clase
                  </label>
                  <select
                    id="clase"
                    value={form.data.clase}
                    onChange={e => form.setData('clase', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                  >
                    {clases.map(clase => (
                      <option key={clase} value={clase}>
                        {clase}
                      </option>
                    ))}
                  </select>
                  {form.errors.clase && (
                    <p className="mt-1 text-sm text-red-600">{form.errors.clase}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="idioma" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Idioma
                  </label>
                  <select
                    id="idioma"
                    value={form.data.idioma}
                    onChange={e => form.setData('idioma', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                  >
                    {idiomas.map(idioma => (
                      <option key={idioma} value={idioma}>
                        {idioma}
                      </option>
                    ))}
                  </select>
                  {form.errors.idioma && (
                    <p className="mt-1 text-sm text-red-600">{form.errors.idioma}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="tomo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tomo
                  </label>
                  <input
                    type="number"
                    id="tomo"
                    min="1"
                    value={form.data.tomo}
                    onChange={e => form.setData('tomo', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                  {form.errors.tomo && (
                    <p className="mt-1 text-sm text-red-600">{form.errors.tomo}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="edicion" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Edición
                  </label>
                  <input
                    type="text"
                    id="edicion"
                    value={form.data.edicion}
                    onChange={e => form.setData('edicion', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                  {form.errors.edicion && (
                    <p className="mt-1 text-sm text-red-600">{form.errors.edicion}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="anio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Año de Publicación
                  </label>
                  <input
                    type="number"
                    id="anio"
                    min="1000"
                    max={new Date().getFullYear()}
                    value={form.data.anio}
                    onChange={e => form.setData('anio', e.target.value)}
                    placeholder="Ej: 2023"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                  {form.errors.anio && (
                    <p className="mt-1 text-sm text-red-600">{form.errors.anio}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="fecha_ingreso" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Fecha de Ingreso
                  </label>
                  <input
                    type="date"
                    id="fecha_ingreso"
                    value={form.data.fecha_ingreso}
                    onChange={e => form.setData('fecha_ingreso', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                  {form.errors.fecha_ingreso && (
                    <p className="mt-1 text-sm text-red-600">{form.errors.fecha_ingreso}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="precio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Precio
                  </label>
                  <input
                    type="number"
                    id="precio"
                    step="0.01"
                    min="0"
                    value={form.data.precio}
                    onChange={e => form.setData('precio', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                  {form.errors.precio && (
                    <p className="mt-1 text-sm text-red-600">{form.errors.precio}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="edad_recomendada" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Edad Recomendada
                  </label>
                  <input
                    type="number"
                    id="edad_recomendada"
                    min="0"
                    value={form.data.edad_recomendada}
                    onChange={e => form.setData('edad_recomendada', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                  {form.errors.edad_recomendada && (
                    <p className="mt-1 text-sm text-red-600">{form.errors.edad_recomendada}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="paginas" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Número de Páginas
                  </label>
                  <input
                    type="number"
                    id="paginas"
                    min="1"
                    value={form.data.paginas}
                    onChange={e => form.setData('paginas', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                  {form.errors.paginas && (
                    <p className="mt-1 text-sm text-red-600">{form.errors.paginas}</p>
                  )}
                </div>

                {/* Clasificación Dewey */}
                <div>
                  <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Categoría Dewey
                  </label>
                  <select
                    id="categoria"
                    value={selectedCategoriaId || ''}
                    onChange={handleCategoriaChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="">Seleccione una categoría</option>
                    {categoriasDewey.map(categoria => (
                      <option key={categoria.id} value={categoria.id}>
                        {categoria.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="subcategoria" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Subcategoría Dewey
                  </label>
                  <select
                    id="subcategoria"
                    value={selectedSubcategoriaId || ''}
                    onChange={handleSubcategoriaChange}
                    disabled={!selectedCategoriaId}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="">Seleccione una subcategoría</option>
                    {loadedSubcategorias.map(subcategoria => (
                      <option key={subcategoria.id} value={subcategoria.id}>
                        {subcategoria.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="tema_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tema Dewey
                  </label>
                  <select
                    id="tema_id"
                    value={form.data.tema_id}
                    onChange={e => form.setData('tema_id', e.target.value)}
                    disabled={!selectedSubcategoriaId}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="">Seleccione un tema</option>
                    {loadedTemas.map(tema => (
                      <option key={tema.id} value={tema.id}>
                        {tema.nombre}
                      </option>
                    ))}
                  </select>
                  {form.errors.tema_id && (
                    <p className="mt-1 text-sm text-red-600">{form.errors.tema_id}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="estanteria_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Estantería
                  </label>
                  <select
                    id="estanteria_id"
                    value={form.data.estanteria_id}
                    onChange={e => form.setData('estanteria_id', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="">Seleccione una estantería</option>
                    {estanterias.map(estanteria => (
                      <option key={estanteria.id} value={estanteria.id}>
                        {estanteria.cod_estante}
                      </option>
                    ))}
                  </select>
                  {form.errors.estanteria_id && (
                    <p className="mt-1 text-sm text-red-600">{form.errors.estanteria_id}</p>
                  )}
                </div>
                </div>

                {/* Botón de envío */}
                <div className="col-span-2">
                  <button
                    type="submit"
                    disabled={form.processing}
                    className="w-full md:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {form.processing ? 'Guardando...' : 'Actualizar Libro'}
                  </button>
                </div>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}