import { PageProps as InertiaPageProps } from '@inertiajs/core';

export interface Libro {
  id: number;
  titulo: string;
  autor: string;
  editorial?: string;
  anio_publicacion?: number;
  isbn?: string;
  created_at: string;
  updated_at: string;
}

// Tipos para ejemplares
export const TIPO_ADQUISICION = {
  COMPRA: 'COMPRA',
  DONACION: 'DONACION',
  REPOSICION: 'REPOSICION'
} as const;

export type TipoAdquisicion = typeof TIPO_ADQUISICION[keyof typeof TIPO_ADQUISICION];

export const ESTADO = {
  DISPONIBLE: 'DISPONIBLE',
  PRESTADO: 'PRESTADO',
  INACTIVO: 'INACTIVO'
} as const;

export type Estado = typeof ESTADO[keyof typeof ESTADO];

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

export interface EjemplarPageProps extends InertiaPageProps {
  auth: {
    user: User;
  };
  libro: Libro;
  ejemplar?: Ejemplar;
  ejemplares?: Ejemplar[];
  tiposAdquisicion: TipoAdquisicion[];
  estados: Estado[];
  success?: string;
}