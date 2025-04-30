import { type BreadcrumbItem } from '@/types';

export type Grado = {
  id: number;
  grado: string;
  subGrado?: string;
  estado: string;
};

export type Lector = {
  id: number;
  codigo: string;
  nombre: string;
  tipo: 'ESTUDIANTE' | 'DOCENTE' | 'OTRO';
  grado?: Grado;
  estado: 'ACTIVO' | 'INACTIVO';
};

export type LectorPageProps = {
  auth: any;
  lectores: {
    data: Lector[];
    // Agregar propiedades de paginación si es necesario
  };
  filters?: Record<string, any>;
  grados: Grado[];
  errors?: Record<string, string>;
  flash?: {
    success?: string;
    error?: string;
  };
};