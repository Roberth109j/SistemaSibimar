// types.ts - Archivo global de tipos corregido

export interface Libro {
  id: number;
  codigo_unico: string; // 🔄 Campo principal del backend
  isbn?: string; // ⚠️ Opcional para compatibilidad
  titulo: string;
  contenido?: string;
  area?: string;
  clase?: string;
  idioma?: string;
  autor?: {
    nombres: string;
    apellidos: string;
  };
  editorial?: {
    nombre: string;
  };
  seccion?: {
    id: number;
    nombre: string;
  };
  estanteria?: {
    id: number;
    cod_estante: string;
  };
  ejemplares_count: number;
  ejemplares_disponibles_count: number;
  ejemplares_prestados_count: number;
  ejemplares_dados_baja_count: number;
  ejemplares_perdidos_count: number;
}

export interface EstadisticasPorCategoria {
  total_libros: number;
  total_ejemplares: number;
  total_disponibles: number;
  total_prestados: number;
}

export interface EstadisticasGlobales {
  total_libros: number;
  total_ejemplares: number;
  total_disponibles: number;
  total_prestados: number;
  total_dados_baja: number;
  total_perdidos: number;
  total_en_circulacion: number;
  por_clase?: Record<string, EstadisticasPorCategoria>;
  por_area?: Record<string, EstadisticasPorCategoria>;
}

export interface PaginatedData<T> {
  data: T[];
  links?: {
    url: string | null;
    label: string;
    active: boolean;
  }[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number | null;
  to: number | null;
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

// 🔄 CORRECCIÓN: FiltrosInventario específico
export interface FiltrosInventario {
  search?: string;
  clase?: string;
  area?: string; // 🆕 NUEVO
  idioma?: string;
  estado?: string;
  seccion?: string;
  grado?: string;
}

// 🔄 CORRECCIÓN: InventarioProps con todos los campos del controlador
export interface InventarioProps {
  auth: any;
  libros: PaginatedData<Libro>;
  estadisticas: EstadisticasGlobales;
  clases: string[];
  areas: string[]; // 🆕 REQUERIDO
  idiomas: string[];
  estanterias?: { id: number; cod_estante: string }[];
  all_secciones?: { id: number; nombre: string }[]; // 🆕 REQUERIDO
  secciones?: string[];
  grados?: string[];
  estados: Record<string, string>;
  seccionId?: number | null; // 🆕 REQUERIDO
  filters: FiltrosInventario; // 🔄 TIPO ESPECÍFICO
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

export interface BadgeEstadoProps {
  tipo: 'disponibles' | 'prestados' | 'dados_baja' | 'perdidos';
  cantidad: number;
}

// 🆕 NUEVA: Interfaz para el encabezado
export interface EncabezadoInventarioProps {
  totalLibros: number;
  totalEjemplares: number;
  totalDisponibles: number;
  totalPrestados: number;
  totalDadosBaja: number;
  totalPerdidos: number;
  totalEnCirculacion: number;
  terminoBusqueda: string;
  onBusquedaCambio: (valor: string) => void;
  mostrarFiltros: boolean;
  onToggleFiltros: () => void;
  filtrosSeleccionados: {
    clase: string;
    area: string; // 🆕 INCLUIR ÁREA
    idioma: string;
    seccion: string;
    grado: string;
    estado: string;
  };
  onCambioFiltro: (tipoFiltro: string, valor: string) => void;
  onLimpiarFiltros: () => void;
  onExportarExcel: () => void;
  clases: string[];
  areas: string[]; // 🆕 REQUERIDO
  idiomas: string[];
  secciones: string[];
  grados: string[];
  exportandoExcel?: boolean;
}

// 🆕 NUEVA: Interfaz para la tabla
export interface TablaInventarioProps {
  libros: PaginatedData<Libro>; // 🔄 USAR TIPO CORRECTO
  pagination?: PaginationInfo;
}

// Constantes para mantener consistencia
export const CLASES_LIBRO = {
  LIBRO: 'LIBRO',
  REVISTA: 'REVISTA'
} as const;

export const AREAS_LIBRO = {
  CIENCIAS: 'CIENCIAS',
  MATEMATICAS: 'MATEMATICAS',
  HUMANIDADES: 'HUMANIDADES',
  IDIOMAS: 'IDIOMAS',
  TECNOLOGIA: 'TECNOLOGIA',
  OTRAS: 'OTRAS'
} as const;

export const IDIOMAS_LIBRO = {
  ESPANOL: 'ESPAÑOL',
  INGLES: 'INGLES',
  FRANCES: 'FRANCES',
  OTRO: 'OTRO'
} as const;

export type ClaseLibro = keyof typeof CLASES_LIBRO;
export type AreaLibro = keyof typeof AREAS_LIBRO;
export type IdiomaLibro = keyof typeof IDIOMAS_LIBRO;