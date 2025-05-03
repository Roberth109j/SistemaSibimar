import { type FormDataConvertible } from '@inertiajs/core';

// Define el tipo para una Estantería
export interface Estanteria {
  id: number;
  cod_estante: string;
  descripcion: string | null;
  created_at?: string;
  updated_at?: string;
}

// Define los tipos de props comunes para los componentes relacionados con Estantería
export interface EstanteriaFormData extends Record<string, FormDataConvertible> {
  cod_estante: string;
  descripcion: string;
}

export interface EstanteriaFlash {
  success?: string;
  error?: string;
}

// Props para el componente Index
export interface EstanteriaIndexProps {
  estanterias: Estanteria[];
  flash?: EstanteriaFlash;
  errors?: Record<string, string>;
}

// Props para el componente Show
export interface EstanteriaShowProps {
  isModal: boolean;
  open: boolean;
  onClose: () => void;
  estanteria: Estanteria;
}

// Props para el componente Edit
export interface EstanteriaEditProps {
  isModal: boolean;
  open: boolean;
  onClose: () => void;
  estanteria: Estanteria;
  errors?: Record<string, string>;
}

// Props para el componente Create
export interface EstanteriaCreateProps {
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