// ================================
// TIPOS CENTRALIZADOS PARA INFORMES
// ================================

// Tipos base compartidos
export interface PeriodoInforme {
  inicio: string;
  fin: string;
  tipo: string;
  inicio_formatted?: string;
  fin_formatted?: string;
}

export interface LibroBase {
  id: number;
  titulo: string;
  isbn?: string;
  autor: {
    nombres: string;
    apellidos: string;
  };
}

export interface EjemplarBase {
  id?: number;
  codigo?: string;
  numEjemplar?: number;
  libro: LibroBase;
}

export interface LectorBase {
  id?: number;
  nombre: string;
  codigo: string;
  grado?: {
    id?: number;
    subGrado: string;
  };
}

// ================================
// TIPOS PARA PRÉSTAMOS REALIZADOS
// ================================

export interface PrestamoDetalle {
  id: number;
  fecha_prestamo: string;
  fecha_devolucion: string;
  fecha_devuelto?: string;
  estado: string;
  observaciones?: string;
  dias_retraso?: number; // Para libros no devueltos
  ejemplar: EjemplarBase;
  lector: LectorBase;
}

export interface LibroMasPrestado {
  titulo: string;
  autor: string;
  cantidad: number;
}

export interface PrestamoPorMes {
  mes: string;
  cantidad: number;
}

export interface PrestamoPorGrado {
  grado: string;
  cantidad: number;
}

export interface PrestamoPorEstado {
  estado: string;
  cantidad: number;
  porcentaje: number;
}

export interface InformeEstadisticas {
  total_prestamos: number;
  prestamos_activos: number;
  prestamos_devueltos: number;
  prestamos_vencidos: number;
  libros_mas_prestados: LibroMasPrestado[];
  prestamos_por_mes: PrestamoPorMes[];
  prestamos_por_grado: PrestamoPorGrado[];
  prestamos_por_estado: PrestamoPorEstado[];
}

export interface PaginationData {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
  has_pages: boolean;
}

// ================================
// TIPOS PARA LIBROS NO DEVUELTOS
// ================================

export interface NoDevueltoPorGrado {
  grado: string;
  cantidad: number;
  vencidos: number;
}

export interface NoDevueltoPorSeveridad {
  critico: number;  // 30+ días
  alto: number;     // 15-29 días
  medio: number;    // 7-14 días
  bajo: number;     // 1-6 días
}

export interface EstadisticasNoDevueltos {
  total_no_devueltos: number;
  vencidos: number;
  promedio_dias_retraso: number;
  por_grado: NoDevueltoPorGrado[];
  por_severidad: NoDevueltoPorSeveridad;
}

// ================================
// TIPOS PARA LIBROS PERDIDOS
// ================================

export interface PerdidosPorMes {
  mes: string;
  cantidad: number;
}

export interface EjemplarPerdido {
  id: number;
  numEjemplar: number;
  estado: string;
  observaciones?: string;
  updated_at: string;
  fecha_perdida: string;
  fecha_perdida_formateada: string;
  libro: LibroBase;
}

export interface EstadisticasLibrosPerdidos {
  total_perdidos: number;
  libros_afectados: number;
  valor_estimado: number;
  por_mes: PerdidosPorMes[];
  perdidas_año_actual: number;
}

// ================================
// TIPOS PARA FORMULARIOS Y RANGOS
// ================================

export interface RangoFecha {
  inicio: string;
  fin: string;
}

export interface RangosFecha {
  anual: RangoFecha;
}

export interface InformesProps {
  auth: any;
  flash?: {
    success?: string;
    error?: string;
  };
}

export type TipoInforme = 'prestamos-realizados' | 'libros-no-devueltos' | 'libros-perdidos';
export type TipoPeriodo = 'personalizado' | 'anual';

// ================================
// TIPOS PARA PROPS DE COMPONENTES
// ================================

export interface PrestamosRealizadosProps {
  prestamos: PrestamoDetalle[];
  estadisticas: InformeEstadisticas;
  periodo: PeriodoInforme;
  pagination?: PaginationData;
}

export interface LibrosNoDevueltosProps {
  prestamos_no_devueltos: PrestamoDetalle[];
  estadisticas: EstadisticasNoDevueltos;
  periodo: PeriodoInforme;
}

export interface LibrosPerdidosProps {
  ejemplares_perdidos: EjemplarPerdido[];
  estadisticas: EstadisticasLibrosPerdidos;
  periodo: PeriodoInforme;
}