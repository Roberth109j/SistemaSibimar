// Definición de tipos para el módulo de editoriales
export type Editorial = {
    id: number;
    nombre: string;
    ciudad: string | null;
    pais: string | null;
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
  
  export type EditorialFormData = {
    nombre: string;
    ciudad: string;
    pais: string;
  };