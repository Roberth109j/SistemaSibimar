// Definición de tipos para la aplicación
export type BreadcrumbItem = {
    title: string;
    href: string;
  };
  
  export type Autor = {
    id: number;
    apellidos: string;
    nombres: string;
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