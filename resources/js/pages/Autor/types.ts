import { type FormDataConvertible, type PageProps } from '@inertiajs/core';

// Define el tipo para un Autor
export interface Autor {
  id: number;
  nombres: string;
  apellidos: string;
  created_at?: string;
  updated_at?: string;
  libros?: { id: number; titulo: string }[]; // Optional, as seen in previous Autor type
}

// Define los tipos de props comunes para los componentes relacionados con Autor
export interface AutorFormData extends Record<string, FormDataConvertible> {
  nombres: string;
  apellidos: string;
}

export interface FlashMessage {
  success?: string;
  error?: string;
}

// Props para el componente Index
export interface AutorIndexProps extends PageProps {
  auth: {
    user: any;
  };
  autores: Autor[];
  flash?: FlashMessage;
  errors?: Record<string, string>;
}

// Props para el componente Show
export interface AutorShowProps {
  isModal: boolean;
  open: boolean;
  onClose: () => void;
  autor: Autor;
}

// Props para el componente Edit
export interface AutorEditProps {
  isModal: boolean;
  open: boolean;
  onClose: () => void;
  autor: Autor;
  errors?: Record<string, string>;
}

// Props para el componente Create
export interface AutorCreateProps {
  isModal: boolean;
  open: boolean;
  onClose: () => void;
  errors?: Record<string, string>;
}

// Definición del tipo BreadcrumbItem (ya que también se usa)
export interface BreadcrumbItem {
  title: string;
  href: string;
}