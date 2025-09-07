// types.ts - Versión actualizada con mejor tipado
export interface Autor {
  id: number;
  nombre: string;
}

export interface Estanteria {
  id: number;
  codigo: string;
  descripcion?: string;
}

export interface Seccion {
  id: number;
  nombre: string;
}

export interface Libro {
  id: number;
  titulo: string;
  isbn: string; // código único
  autor: Autor;
  estanteria?: Estanteria;
  ejemplares_count: number;
  seccion: Seccion;
  sign_top?: string;
  contenido?: string; // Descripción del contenido del libro
}

export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface PaginatedLibros {
  data: Libro[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  links: PaginationLink[];
}

export interface BuscadorProps {
  libros: PaginatedLibros;
  secciones: Seccion[];
  filters: {
    search?: string;
    seccion_id?: number;
  };
}