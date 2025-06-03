import { PageProps as InertiaPageProps } from '@inertiajs/core';

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

// Actualizar la interfaz de props para usar LibroConAutor
export interface EjemplarPageProps extends InertiaPageProps {
  auth: {
    user: User;
  };
  libro: LibroConAutor; // Ahora especificamos que incluye la relación autor
  ejemplar?: Ejemplar;
  ejemplares?: Ejemplar[];
  tiposAdquisicion: TipoAdquisicion[];
  estados: Estado[];
  success?: string;
}