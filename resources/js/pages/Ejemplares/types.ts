// Flash messages interface
export interface FlashMessages {
  success?: string;
  error?: string;
  warning?: string;
  info?: string;
}

// Base page props interface
export interface BasePageProps {
  auth: {
    user: any;
  };
  flash?: FlashMessages;
  errors?: Record<string, string>;
}

// Definir la interfaz Autor
export interface Autor {
  id: number;
  apellidos: string;
  nombres: string;
  nombre_completo: string; // Viene del accessor getNombreCompletoAttribute
}

// Actualizar la interfaz Libro para manejar ambos casos
export interface Libro {
  id: number;
  titulo: string;
  autor?: Autor; // Cuando se carga la relación
  autor_id?: number; // El ID del autor en la base de datos
  editorial?: string;
  anio_publicacion?: number;
  isbn?: string;
  created_at: string;
  updated_at: string;
}

// Alternativamente, si quieres ser más específico, puedes crear dos interfaces:
export interface LibroBase {
  id: number;
  titulo: string;
  autor_id: number;
  editorial?: string;
  anio_publicacion?: number;
  isbn?: string;
  created_at: string;
  updated_at: string;
}

export interface LibroConAutor extends LibroBase {
  autor: Autor;
}

// Tipos para ejemplares
export const TIPO_ADQUISICION = {
  COMPRA: 'COMPRA',
  DONACION: 'DONACION',
  REPOSICION: 'REPOSICION'
} as const;

export type TipoAdquisicion = typeof TIPO_ADQUISICION[keyof typeof TIPO_ADQUISICION];

// ESTADOS - CON ESPACIOS (COMO ESTÁN EN LA MIGRACIÓN)
export const ESTADO = {
  DISPONIBLE: 'DISPONIBLE',
  PRESTADO: 'PRESTADO',
  DAR_DE_BAJA: 'DADO DE BAJA', 
  PERDIDO: 'PERDIDO'
} as const;

export type Estado = typeof ESTADO[keyof typeof ESTADO];

// Mapeo de estados para visualización (bonitos para el usuario)
export const ESTADO_LABELS = {
  [ESTADO.DISPONIBLE]: 'Disponible',
  [ESTADO.PRESTADO]: 'Prestado',
  [ESTADO.DAR_DE_BAJA]: 'Dado de Baja',
  [ESTADO.PERDIDO]: 'Perdido'
} as const;

export interface Ejemplar {
  id: number;
  libro_id: number;
  numEjemplar: number;
  tipo_adquisicion: TipoAdquisicion;
  estado: Estado;
  observaciones?: string | null;
  created_at: string;
  updated_at: string;
}

export interface BreadcrumbItem {
  title: string;
  href: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

// Props específicas para páginas de ejemplares
export interface EjemplarPageProps extends BasePageProps {
  auth: {
    user: User;
  };
  libro: LibroConAutor; // Ahora especificamos que incluye la relación autor
  ejemplar?: Ejemplar;
  ejemplares?: Ejemplar[];
  tiposAdquisicion: TipoAdquisicion[];
  estados: Estado[];
  siguienteNumero?: number; // Nuevo campo para el número sugerido
  search?: string; // Nuevo campo para el término de búsqueda
  success?: string;
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

export interface LibroCompleto {
  id: number;
  isbn: string;
  titulo: string;
  contenido?: string;
  seccion_id: number;
  autor_id: number;
  editorial_id: number;
  clase: string;
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
export interface LibroPageProps extends BasePageProps {
  libros: LaravelPagination<LibroCompleto>;
  clases: string[];
  idiomas: string[];
  filters?: {
    search?: string;
    clase?: string;
    idioma?: string;
    estanteria?: string;
  };
  autores?: Autor[];
  editoriales?: Editorial[];
  estanterias?: Estanteria[];
  secciones?: Seccion[];
  categoriasDewey?: CategoriaDewey[];
}

// Interfaz específica para las props de la página de edición de libros
export interface EditLibroPageProps extends BasePageProps {
  libro: LibroCompleto;
  autores: Autor[];
  editoriales: Editorial[];
  estanterias: Estanteria[];
  secciones: Seccion[];
  categoriasDewey: CategoriaDewey[];
  subcategoriasDewey: SubcategoriaDewey[];
  temasDewey: TemaDewey[];
  clases: string[];
  idiomas: string[];
  success?: string;
}

// Interfaz para las props de la página de show de libros
export interface ShowLibroPageProps extends BasePageProps {
  libro: LibroCompleto;
  temaDewey?: TemaDewey;
}