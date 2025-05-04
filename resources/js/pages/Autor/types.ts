// Define el tipo para un Autor
export type Autor = {
  id: number;
  nombres: string;
  apellidos: string;
  created_at?: string;
  updated_at?: string;
};

export type FlashMessage = {
  success?: string;
  error?: string;
};

// Definición del tipo BreadcrumbItem
export type BreadcrumbItem = {
  title: string;
  href: string;
};

// Define los tipos de props comunes para los componentes relacionados con Autor
export type AutorFormData = {
  nombres: string;
  apellidos: string;
};