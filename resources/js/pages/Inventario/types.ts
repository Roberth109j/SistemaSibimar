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
  // ✅ NUEVOS CAMPOS SEPARADOS
  ejemplares_dados_baja_count: number;
  ejemplares_perdidos_count: number;
}

export interface EstadisticasGlobales {
  total_libros: number;
  total_ejemplares: number;
  total_disponibles: number;
  total_prestados: number;
  // ✅ NUEVOS CAMPOS SEPARADOS
  total_dados_baja: number;
  total_perdidos: number;
  total_en_circulacion: number; // disponibles + prestados
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

export interface PaginationInfo {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
  has_pages: boolean;
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
  pagination?: PaginationInfo;
}

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

// ✅ ACTUALIZADO CON NUEVOS TIPOS DE ESTADO
export interface BadgeEstadoProps {
  tipo: 'disponibles' | 'prestados' | 'dados_baja' | 'perdidos';
  cantidad: number;
}