// types.ts - Tipos para el módulo de Devoluciones

export interface BreadcrumbItem {
  title: string;
  href: string;
}

export interface FlashMessage {
  success?: string;
  error?: string;
}

export interface Libro {
  titulo: string;
  isbn: string;
  autor?: string;
}

export interface Ejemplar {
  id: number;
  numEjemplar: number;
  libro: Libro;
  observaciones?: string; // AGREGADO: Campo de observaciones
  estado?: string; // AGREGADO: Estado del ejemplar
}

export interface Lector {
  nombre: string;
  codigo: string;
  email?: string;
}

export interface Prestamo {
  id: number;
  fecha_prestamo: string;
  fecha_devolucion: string;
  estado: string;
  ejemplar: Ejemplar;
  lector: Lector;
  dias_retraso?: number; // AGREGADO: Para cálculo de días de retraso
  esta_vencido?: boolean; // AGREGADO: Para indicar si está vencido
}

export interface LectorInfo {
  id?: number;
  nombre: string;
  codigo: string;
  email?: string;
  telefono?: string;
  estado?: string;
}

export interface DevolucionPageProps {
  auth: any;
  flash?: FlashMessage;
}

export interface AlertNotificationProps {
  type: 'success' | 'error';
  message: string;
  className?: string;
  autoClose?: boolean;
  duration?: number;
}

export interface AlertState {
  success: string | null;
  error: string | null;
  timestamp: number;
}

export interface DevolucionRequest {
  fecha_devuelto: string;
  observaciones?: string;
}

export interface DevolucionResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export interface BuscarPrestamosRequest {
  codigo: string;
}

export interface BuscarPrestamosResponse {
  success: boolean;
  message?: string;
  lector?: LectorInfo;
  prestamos?: Prestamo[];
}

// Tipos para estados de préstamos
export type EstadoPrestamo = 'ACTIVO' | 'VENCIDO' | 'PENDIENTE' | 'PROXIMO_VENCER' | 'DEVUELTO';

// Tipos para colores de alertas
export interface AlertColors {
  light: {
    bg: string;
    border: string;
    text: string;
    icon: string;
  };
  dark: {
    bg: string;
    border: string;
    text: string;
    icon: string;
  };
}

export interface AlertColorScheme {
  success: AlertColors;
  error: AlertColors;
}

// Tipos para el modal de devolución
export interface ModalDevolucionState {
  modalAbierto: boolean;
  prestamoSeleccionado: Prestamo | null;
  fechaDevuelto: string;
  observaciones: string;
  procesandoDevolucion: boolean;
}

// Constantes tipadas
export const ESTADOS_PRESTAMO: Record<string, string> = {
  ACTIVO: 'ACTIVO',
  VENCIDO: 'VENCIDO',
  PENDIENTE: 'PENDIENTE',
  PROXIMO_VENCER: 'PROXIMO_VENCER',
  DEVUELTO: 'DEVUELTO'
} as const;

export const DURACION_ALERTAS = {
  SUCCESS: 6000,
  ERROR: 7000
} as const;