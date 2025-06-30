// Interfaces del Inventario
export interface Libro {
  id: number;
  isbn: string;
  titulo: string;
  autor?: {
    nombres: string;
    apellidos: string;
  };
  editorial?: {
    nombre: string;
  };
  ejemplares_count: number;
  ejemplares_disponibles_count: number;
  ejemplares_prestados_count: number;
  ejemplares_inactivos_count: number;
}

export interface EstadisticasGlobales {
  total_libros: number;
  total_ejemplares: number;
  total_disponibles: number;
  total_prestados: number;
  total_inactivos: number;
}

export interface PaginatedData<T> {
  data: T[];
  links: {
    url: string | null;
    label: string;
    active: boolean;
  }[];
  current_page: number;
  per_page: number;
  total: number;
}

export interface InventarioProps {
  auth: any;
  libros: PaginatedData<Libro>;
  estadisticas: EstadisticasGlobales;
  clases: string[];
  idiomas: string[];
  estanterias: { id: number; cod_estante: string }[];
  secciones?: string[];
  grados?: string[];
  estados: Record<string, string>;
  filters: Record<string, string>;
  flash?: {
    success?: string;
    error?: string;
  };
  errors?: Record<string, string>;
}

// Props para componentes
export interface AlertNotificationProps {
  type: 'success' | 'error';
  message: string;
  onClose?: () => void;
}

export interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  colorClass: string;
}

export interface BadgeEstadoProps {
  tipo: 'disponibles' | 'prestados' | 'inactivos';
  cantidad: number;
}