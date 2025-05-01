// Definición de tipos para el módulo de autores
export type Autor = {
  id: number;
  nombres: string;
  apellidos: string;
  libros?: Libro[];
};

export type Libro = {
  id: number;
  titulo: string;
};

export type FlashMessage = {
  success?: string;
  error?: string;
};

export type BreadcrumbItem = {
  title: string;
  href: string;
};

export type AutorFormData = {
  nombres: string;
  apellidos: string;
};