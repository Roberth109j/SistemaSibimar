// Interfaces para los modelos
export interface Autor {
  id: number;
  nombre: string;
  apellidos: string;
}

export interface Editorial {
  id: number;
  nombre: string;
}

export interface Estanteria {
  id: number;
  cod_estante: string;
  descripcion?: string;
}

export interface Seccion {
  id: number;
  nombre: string;
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
}

export interface TemaDewey {
  id: number;
  subcategoria_id: number;
  codigo: string;
  nombre: string;
  subcategoria?: {
    categoria?: CategoriaDewey;
  };
}

export interface Libro {
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
  autor?: Autor;
  editorial?: Editorial;
  seccion?: Seccion;
  temaDewey?: TemaDewey;
  estanteria?: Estanteria;

}

// Interfaz para las props de la página
export interface LibroPageProps {
  auth: {
    user: any;
  };
  libros: {
    data: Libro[];
    links: any[];
    total: number;
  };
  clases: string[];
  idiomas: string[];
  filters?: {
    titulo?: string;
    isbn?: string;
    autor_id?: number;
    clase?: string;
    seccion_id?: string;
  };
  autores?: Autor[];
  editoriales?: Editorial[];
  estanterias?: Estanteria[];
  secciones?: Seccion[];
  categoriasDewey?: CategoriaDewey[];
  libro?: Libro;
  temaDewey?: TemaDewey;
  subcategoriaDewey?: SubcategoriaDewey;
  categoriaDewey?: CategoriaDewey;
  subcategorias?: SubcategoriaDewey[];
  temas?: TemaDewey[];
  errors?: Record<string, string>;
  flash?: {
    success?: string;
    error?: string;
  };
}