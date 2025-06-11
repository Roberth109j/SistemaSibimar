export type Lector = {
  id: number;
  codigo: string;
  nombre: string;
  tipo: 'ESTUDIANTE' | 'DOCENTE' | 'OTRO';
  grado?: Grado;
  estado: 'ACTIVO' | 'INACTIVO';
  created_at?: string;
  updated_at?: string;
};

export type Grado = {
  id: number;
  grado: string;
  subGrado?: string;
  estado: string;
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

// Define los tipos de props comunes para los componentes relacionados con Lector
export type LectorFormData = {
  codigo: string;
  nombre: string;
  tipo: 'ESTUDIANTE' | 'DOCENTE' | 'OTRO';
  grado_id?: string;
  estado: 'ACTIVO' | 'INACTIVO';
};

export type LectorPageProps = {
  auth: any;
  lectores: {
    data: Lector[];
    links?: any[];
    from?: number;
    to?: number;
    total?: number;
  };
  filters?: Record<string, any>;
  grados?: Grado[];
  errors?: Record<string, string>;
  flash?: {
    success?: string;
    error?: string;
  };
};