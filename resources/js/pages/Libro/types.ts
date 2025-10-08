// Flash messages interface
export interface FlashMessages {
  success?: string;
  error?: string;
  warning?: string;
  info?: string;
}

// Definir el tipo global de PageProps para Inertia
export interface PageProps {
  auth: {
    user: any;
  };
  flash: FlashMessages;
  errors?: Record<string, string>;
  [key: string]: any; // Para permitir propiedades adicionales
}

// Inertia page props interface
export interface InertiaPageProps {
  auth: {
    user: any;
  };
  flash?: FlashMessages;
  errors?: Record<string, string>;
}

export interface Autor {
  id: number;
  nombres: string;
  apellidos: string;
}

export interface BreadcrumbItem {
  title: string;
  href: string;
}

export interface Editorial {
  id: number;
  nombre: string;
  ciudad?: string;
  pais?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Estanteria {
  id: number;
  cod_estante: string;
  descripcion?: string;
  seccion_id: number; // ✅ AGREGADO
  seccion?: Seccion;
  created_at?: string;
  updated_at?: string;
}

export interface Seccion {
  id: number;
  nombre: string;
  created_at?: string;
  updated_at?: string;
}

export interface CategoriaDewey {
  id: number;
  codigo: string;
  nombre: string;
}

export interface SubcategoriaDewey {
  id: number;
  categoria_id: number;
  codigo: string;
  nombre: string;
  categoria?: CategoriaDewey;
}

export interface TemaDewey {
  id: number;
  subcategoria_id: number;
  codigo: string;
  nombre: string;
  subcategoria?: SubcategoriaDewey;
}

export interface Libro {
  id: number;
  codigo_unico: string; // Cambio de 'isbn' a 'codigo_unico'
  isbn?: string; // Mantener para compatibilidad con código existente
  titulo: string;
  contenido?: string;
  seccion_id: number;
  autor_id: number;
  editorial_id: number;
  area: string; // Nuevo campo obligatorio
  clase: string; // Solo 'LIBRO' o 'REVISTA'
  tomo?: number;
  edicion?: string;
  anio?: number;
  fecha_ingreso: string;
  precio?: number;
  idioma: string;
  edad_recomendada?: number;
  paginas: number;
  tema_id: number;
  sign_top: string;
  estanteria_id: number;
  created_at: string;
  updated_at: string;
  // Relaciones
  autor?: Autor;
  editorial?: Editorial;
  seccion?: Seccion;
  tema_dewey?: TemaDewey;
  estanteria?: Estanteria;
  ejemplares?: Array<any>;
  ejemplares_count?: number;
}

// Interfaz para el paginador de Laravel
export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface LaravelPagination<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: PaginationLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

// Interfaz para las props de la página de índice de libros
export interface LibroPageProps extends InertiaPageProps {
  libros: LaravelPagination<Libro>;
  clases: string[]; // Solo ['LIBRO', 'REVISTA']
  areas: string[]; // Nuevo campo: ['CIENCIAS', 'MATEMATICAS', 'HUMANIDADES', 'IDIOMAS', 'TECNOLOGIA', 'OTRAS']
  idiomas: string[];
  filters?: {
    search?: string;
    clase?: string;
    area?: string; // Nuevo filtro
    idioma?: string;
    estanteria?: string;
  };
  autores?: Autor[];
  editoriales?: Editorial[];
  estanterias?: Estanteria[];
  secciones?: Seccion[];
  categoriasDewey?: CategoriaDewey[];
  seccionId?: number | null; // ID de la sección predeterminada según el rol del usuario
}

// Interfaz específica para las props de la página de edición de libros
export interface EditLibroPageProps extends InertiaPageProps {
  libro: Libro;
  autores: Autor[];
  editoriales: Editorial[];
  estanterias: Estanteria[];
  secciones: Seccion[];
  categoriasDewey: CategoriaDewey[];
  subcategoriasDewey: SubcategoriaDewey[];
  temasDewey: TemaDewey[];
  clases: string[]; // Solo ['LIBRO', 'REVISTA']
  areas: string[]; // Nuevo campo
  idiomas: string[];
  seccionId?: number | null; // ID de la sección predeterminada según el rol del usuario
  success?: string;
}

// Interfaz para las props de la página de show de libros
export interface ShowLibroPageProps extends InertiaPageProps {
  libro: Libro;
  temaDewey?: TemaDewey;
}