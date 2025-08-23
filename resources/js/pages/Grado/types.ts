export type BreadcrumbItem = {
  title: string;
  href: string;
};

export type FlashMessage = {
  success?: string;
  error?: string;
};

export type Seccion = {
  id: number;
  nombre: string;
};

export type Grado = {
  id: number;
  grado: string; // Cambiar a string para mayor flexibilidad
  subGrado?: string | null;
  estado: 'ACTIVO' | 'INACTIVO';
  seccion_id: number;
  seccion?: Seccion; // Agregar relación opcional
  created_at?: string;
  updated_at?: string;
};

export type GradoFormData = {
  grado: string;
  subGrado?: string;
  estado: 'ACTIVO' | 'INACTIVO';
  seccion_id: string;
  current_filters?: {
    search?: string;
    grado_filter?: string;
    estado?: string;
    seccion_filter?: string;
    sort_order?: string;
    page?: string;
  };
};

export type PaginatedGrados = {
  data: Grado[];
  links?: any[];
  from?: number;
  to?: number;
  total?: number;
  current_page: number;
  last_page: number;
  per_page?: number;
};

export type IndexProps = {
  auth: {
    user: any;
  };
  grados: PaginatedGrados | { data: Grado[]; total?: number };
  flash?: FlashMessage;
  errors?: Record<string, string>;
  sort_order?: string;
  search?: string;
  start_number?: number;
  filters?: {
    grado_filter?: string;
    estado?: string;
    seccion_filter?: string;
  };
  all_grados?: string[];
  all_estados?: string[];
  all_secciones?: Seccion[];
  seccionId?: number | null;
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    has_pages: boolean;
  };
};

export type AlertNotificationProps = {
  type: 'success' | 'error';
  message: string;
  className?: string;
  autoClose?: boolean;
  duration?: number;
};

export type AlertState = {
  success: string | null;
  error: string | null;
  timestamp: number;
};

export type FilterState = {
  grado_filter: string;
  estado: string;
  seccion_filter: string;
};

// Constantes para los grados disponibles
export const GRADOS_DISPONIBLES = [
  'PREESCOLAR',
  'PRIMERO', 
  'SEGUNDO',
  'TERCERO',
  'CUARTO',
  'QUINTO',
  'SEXTO',
  'SÉPTIMO',
  'OCTAVO',
  'NOVENO',
  'DÉCIMO',
  'ONCE'
] as const;

export const ESTADOS_DISPONIBLES = ['ACTIVO', 'INACTIVO'] as const;

export type GradoDisponible = typeof GRADOS_DISPONIBLES[number];
export type EstadoDisponible = typeof ESTADOS_DISPONIBLES[number];

// Props para componentes modales
export type CreateGradoProps = {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  errors: Record<string, string>;
};

export type EditGradoProps = {
  grado: Grado;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  errors: Record<string, string>;
};

export type ShowGradoProps = {
  grado: Grado;
  tableNumber: number;
};