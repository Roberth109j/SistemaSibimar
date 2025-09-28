// types.ts - Tipos para el módulo de Devoluciones con soporte múltiple MEJORADO

export interface BreadcrumbItem {
  title: string;
  href: string;
}

export interface FlashMessage {
  success?: string;
  error?: string;
}

// Interfaz para Autor
export interface Autor {
  id: number;
  nombres: string;
  apellidos: string;
  nombre_completo?: string;
}

// Interfaz para Editorial
export interface Editorial {
  id: number;
  nombre: string;
  ciudad?: string;
  pais?: string;
}

// Interfaz para Libro
export interface Libro {
  id: number;
  titulo: string;
  codigo_unico: string;
  autor_id?: number;
  editorial_id?: number;
  autor?: Autor;
  editorial?: Editorial;
  area?: string;
  clase?: string;
  tomo?: number;
  edicion?: string;
  anio?: number;
  fecha_ingreso?: string;
  precio?: number;
  idioma?: string;
  edad_recomendada?: string;
  paginas?: number;
  tema_id?: number;
  sign_top?: string;
  estanteria_id?: number;
  contenido?: string;
  seccion_id?: number;
  isbn?: string; // Alias de codigo_unico
}

// Interfaz para Ejemplar
export interface Ejemplar {
  id: number;
  libro_id: number;
  numEjemplar: number;
  tipo_adquisicion?: string;
  estado: string; // 'DISPONIBLE' | 'PRESTADO' | 'DADO DE BAJA' | 'PERDIDO'
  observaciones?: string;
  libro: Libro;
  created_at?: string;
  updated_at?: string;
}

// Interfaz para Lector
export interface Lector {
  id: number;
  nombre: string;
  codigo: string;
  tipo: string; // 'ESTUDIANTE' | 'DOCENTE' | 'OTRO'
  grado_id?: number;
  estado: string; // 'ACTIVO' | 'INACTIVO'
  email?: string;
}

// Interfaz para Préstamo
export interface Prestamo {
  id: number;
  ejemplar_id: number;
  lector_id: number;
  fecha_prestamo: string;
  fecha_devolucion: string;
  fecha_devuelto?: string;
  estado: string; // 'ACTIVO' | 'DEVUELTO' | 'VENCIDO'
  ejemplar: Ejemplar;
  lector: Lector;
  // Campos calculados en el frontend
  dias_retraso?: number;
  esta_vencido?: boolean;
}

// LectorInfo para mantener compatibilidad
export interface LectorInfo {
  id?: number;
  nombre: string;
  codigo: string;
  tipo?: string;
  grado_id?: number;
  estado?: string;
  email?: string;
  telefono?: string;
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
  prestamo?: Prestamo;
  data?: any;
}

// MEJORADAS: Interfaces para devolución múltiple sin límites
export interface PrestamoParaDevolucion {
  id: number;
  observaciones?: string;
}

export interface DevolucionMultipleRequest {
  prestamos: PrestamoParaDevolucion[];
  fecha_devuelto: string;
  observaciones_globales?: string;
}

export interface LibroDevuelto {
  ejemplar_numero: number;
  titulo: string;
  codigo: string;
}

export interface DevolucionMultipleResponse {
  success: boolean;
  message?: string;
  prestamos_devueltos?: number;
  libros_devueltos?: LibroDevuelto[];
  fecha_devolucion?: string;
  errors?: string[];
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

// Tipos para estados de préstamos según el modelo real
export type EstadoPrestamo = 'ACTIVO' | 'VENCIDO' | 'DEVUELTO';

// Tipos para estados de ejemplares
export type EstadoEjemplar = 'DISPONIBLE' | 'PRESTADO' | 'DADO DE BAJA' | 'PERDIDO';

// Tipos para tipos de lectores
export type TipoLector = 'ESTUDIANTE' | 'DOCENTE' | 'OTRO';

// Tipos para estados de lectores
export type EstadoLector = 'ACTIVO' | 'INACTIVO';

// Tipos para tipos de adquisición
export type TipoAdquisicion = 'COMPRA' | 'REPOSICION' | 'DONACION';

// Tipos para clases de material
export type ClaseMaterial = 'LIBRO' | 'REVISTA';

// Tipos para áreas
export type AreaMaterial = 'CIENCIAS' | 'MATEMATICAS' | 'HUMANIDADES' | 'IDIOMAS' | 'TECNOLOGIA' | 'OTRAS';

// Tipos para idiomas
export type IdiomaLibro = 'ESPAÑOL' | 'INGLES' | 'FRANCES' | 'OTRO';

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

// MEJORADAS: Interfaces para el modal de devolución múltiple
export interface ModalDevolucionMultipleState {
  modalAbierto: boolean;
  prestamosSeleccionados: Set<number>;
  fechaDevuelto: string;
  observacionesGlobales: string;
  observacionesIndividuales: Map<number, string>;
  procesandoDevolucion: boolean;
  // NUEVOS: Estados para observaciones opcionales
  prestamosConObservacionesExpandidas: Set<number>;
  mostrarObservacionesGlobales: boolean;
}

// Props para el modal de devolución múltiple
export interface ConfirmacionModalMultipleProps {
  isOpen: boolean;
  onClose: () => void;
  prestamosSeleccionados: Prestamo[];
  fechaDevuelto: string;
  setFechaDevuelto: (fecha: string) => void;
  observacionesGlobales: string;
  setObservacionesGlobales: (observaciones: string) => void;
  observacionesIndividuales: Map<number, string>;
  setObservacionesIndividuales: React.Dispatch<React.SetStateAction<Map<number, string>>>;
  procesandoDevolucion: boolean;
  onConfirmar: () => void;
  // NUEVOS: Props para observaciones opcionales
  prestamosConObservacionesExpandidas: Set<number>;
  setPrestamosConObservacionesExpandidas: React.Dispatch<React.SetStateAction<Set<number>>>;
  mostrarObservacionesGlobales: boolean;
  setMostrarObservacionesGlobales: (mostrar: boolean) => void;
}

// MEJORADAS: Interfaces para estadísticas de devolución
export interface EstadisticasDevolucion {
  totalPrestamos: number;
  prestamosVencidos: number;
  prestamosActivos: number;
  prestamosSeleccionados: number;
  porcentajeVencidos: number;
  // NUEVAS: Estadísticas adicionales
  prestamosConObservaciones: number;
  prestamosEnLote: number;
}

// MEJORADAS: Interfaces para validación de devolución múltiple
export interface ValidacionDevolucion {
  prestamosValidos: Prestamo[];
  prestamosInvalidos: Prestamo[];
  errores: string[];
  advertencias: string[];
  // NUEVAS: Validaciones adicionales
  recomendaciones: string[];
  puedeProceesar: boolean;
}

// Constantes tipadas según modelos reales
export const ESTADOS_PRESTAMO: Record<string, EstadoPrestamo> = {
  ACTIVO: 'ACTIVO',
  VENCIDO: 'VENCIDO',
  DEVUELTO: 'DEVUELTO'
} as const;

export const ESTADOS_EJEMPLAR: Record<string, EstadoEjemplar> = {
  DISPONIBLE: 'DISPONIBLE',
  PRESTADO: 'PRESTADO',
  DADO_DE_BAJA: 'DADO DE BAJA',
  PERDIDO: 'PERDIDO'
} as const;

export const TIPOS_LECTOR: Record<string, TipoLector> = {
  ESTUDIANTE: 'ESTUDIANTE',
  DOCENTE: 'DOCENTE',
  OTRO: 'OTRO'
} as const;

export const ESTADOS_LECTOR: Record<string, EstadoLector> = {
  ACTIVO: 'ACTIVO',
  INACTIVO: 'INACTIVO'
} as const;

export const TIPOS_ADQUISICION: Record<string, TipoAdquisicion> = {
  COMPRA: 'COMPRA',
  REPOSICION: 'REPOSICION',
  DONACION: 'DONACION'
} as const;

export const CLASES_MATERIAL: Record<string, ClaseMaterial> = {
  LIBRO: 'LIBRO',
  REVISTA: 'REVISTA'
} as const;

export const AREAS_MATERIAL: Record<string, AreaMaterial> = {
  CIENCIAS: 'CIENCIAS',
  MATEMATICAS: 'MATEMATICAS',
  HUMANIDADES: 'HUMANIDADES',
  IDIOMAS: 'IDIOMAS',
  TECNOLOGIA: 'TECNOLOGIA',
  OTRAS: 'OTRAS'
} as const;

export const IDIOMAS_LIBRO: Record<string, IdiomaLibro> = {
  ESPAÑOL: 'ESPAÑOL',
  INGLES: 'INGLES',
  FRANCES: 'FRANCES',
  OTRO: 'OTRO'
} as const;

export const DURACION_ALERTAS = {
  SUCCESS: 6000,
  ERROR: 7000
} as const;

// MEJORADAS: Constantes para devolución múltiple SIN LÍMITES
export const LIMITES_DEVOLUCION_MULTIPLE = {
  MAX_OBSERVACIONES_GLOBALES: 1000,
  MAX_OBSERVACIONES_INDIVIDUALES: 500,
  // Se remueve MAX_PRESTAMOS_SIMULTANEOS para permitir cantidades ilimitadas
  MOSTRAR_PAGINACION_DESDE: 50, // Mostrar paginación cuando hay más de 50 préstamos
  ITEMS_POR_PAGINA: 25
} as const;

// Funciones auxiliares de tipo guardia
export const isEstadoPrestamo = (estado: string): estado is EstadoPrestamo => {
  return Object.values(ESTADOS_PRESTAMO).includes(estado as EstadoPrestamo);
};

export const isEstadoEjemplar = (estado: string): estado is EstadoEjemplar => {
  return Object.values(ESTADOS_EJEMPLAR).includes(estado as EstadoEjemplar);
};

export const isTipoLector = (tipo: string): tipo is TipoLector => {
  return Object.values(TIPOS_LECTOR).includes(tipo as TipoLector);
};

// MEJORADAS: Funciones auxiliares para devolución múltiple
export const calcularEstadisticasDevolucion = (
  prestamos: Prestamo[], 
  prestamosSeleccionados: Set<number>,
  observacionesIndividuales: Map<number, string>
): EstadisticasDevolucion => {
  const totalPrestamos = prestamos.length;
  const prestamosVencidos = prestamos.filter(p => {
    const fechaDevolucion = new Date(p.fecha_devolucion);
    const hoy = new Date();
    return fechaDevolucion < hoy;
  }).length;
  
  const prestamosConObservaciones = Array.from(prestamosSeleccionados).filter(id => {
    const obs = observacionesIndividuales.get(id);
    return obs && obs.trim().length > 0;
  }).length;
  
  return {
    totalPrestamos,
    prestamosVencidos,
    prestamosActivos: totalPrestamos - prestamosVencidos,
    prestamosSeleccionados: prestamosSeleccionados.size,
    porcentajeVencidos: totalPrestamos > 0 ? (prestamosVencidos / totalPrestamos) * 100 : 0,
    prestamosConObservaciones,
    prestamosEnLote: prestamosSeleccionados.size
  };
};

export const validarDevolucionMultiple = (
  prestamos: Prestamo[],
  prestamosSeleccionados: Set<number>
): ValidacionDevolucion => {
  const prestamosValidos: Prestamo[] = [];
  const prestamosInvalidos: Prestamo[] = [];
  const errores: string[] = [];
  const advertencias: string[] = [];
  const recomendaciones: string[] = [];

  if (prestamosSeleccionados.size === 0) {
    errores.push('Debe seleccionar al menos un préstamo para devolver');
  }

  // Se remueve la validación de límite máximo
  if (prestamosSeleccionados.size > 100) {
    advertencias.push(`Procesando ${prestamosSeleccionados.size} préstamos. Esto puede tomar unos momentos.`);
  }

  Array.from(prestamosSeleccionados).forEach(prestamoId => {
    const prestamo = prestamos.find(p => p.id === prestamoId);
    
    if (!prestamo) {
      errores.push(`Préstamo con ID ${prestamoId} no encontrado`);
      return;
    }

    if (prestamo.ejemplar.estado === 'PERDIDO') {
      prestamosInvalidos.push(prestamo);
      errores.push(`El ejemplar #${prestamo.ejemplar.numEjemplar} está marcado como perdido`);
      return;
    }

    if (prestamo.estado === 'DEVUELTO') {
      prestamosInvalidos.push(prestamo);
      errores.push(`El préstamo del ejemplar #${prestamo.ejemplar.numEjemplar} ya fue devuelto`);
      return;
    }

    if (!['ACTIVO', 'VENCIDO'].includes(prestamo.estado)) {
      prestamosInvalidos.push(prestamo);
      errores.push(`El préstamo del ejemplar #${prestamo.ejemplar.numEjemplar} no está en estado válido (${prestamo.estado})`);
      return;
    }

    // Verificar si está vencido para advertencias
    const fechaDevolucion = new Date(prestamo.fecha_devolucion);
    const hoy = new Date();
    if (fechaDevolucion < hoy) {
      advertencias.push(`El préstamo del ejemplar #${prestamo.ejemplar.numEjemplar} está vencido`);
    }

    prestamosValidos.push(prestamo);
  });

  // Agregar recomendaciones
  if (prestamosSeleccionados.size > 10) {
    recomendaciones.push('Para lotes grandes, considere usar observaciones globales en lugar de individuales');
  }

  if (prestamosValidos.length > 0 && prestamosValidos.every(p => p.estado === 'VENCIDO')) {
    recomendaciones.push('Todos los préstamos seleccionados están vencidos. Verifique el estado físico de los ejemplares');
  }

  return {
    prestamosValidos,
    prestamosInvalidos,
    errores,
    advertencias,
    recomendaciones,
    puedeProceesar: errores.length === 0 && prestamosValidos.length > 0
  };
};

// Interfaces para respuestas de API adicionales
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta?: {
    current_page: number;
    total: number;
    per_page: number;
    last_page: number;
  };
}

// Interfaces para validación
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResponse {
  success: boolean;
  errors: ValidationError[];
}

// Interfaz para configuración del sistema
export interface ConfiguracionSistema {
  dias_prestamo_defecto: number;
  dias_aviso_vencimiento: number;
  multa_por_dia: number;
  max_prestamos_simultaneos: number;
  permite_renovacion: boolean;
  dias_max_renovacion: number;
}

// MEJORADAS: Tipos para eventos y hooks personalizados
export type DevolucionEvent = 'seleccion_cambiada' | 'validacion_requerida' | 'devolucion_completada' | 'error_devolucion' | 'observaciones_expandidas';

export interface DevolucionEventData {
  prestamosSeleccionados: number[];
  accion: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

// MEJORADA: Interfaz para el contexto de devolución múltiple
export interface DevolucionMultipleContextValue {
  prestamosSeleccionados: Set<number>;
  setPrestamosSeleccionados: (prestamos: Set<number>) => void;
  observacionesIndividuales: Map<number, string>;
  setObservacionesIndividuales: (observaciones: Map<number, string>) => void;
  prestamosConObservacionesExpandidas: Set<number>;
  setPrestamosConObservacionesExpandidas: (prestamos: Set<number>) => void;
  estadisticas: EstadisticasDevolucion;
  validacion: ValidacionDevolucion;
  procesandoDevolucion: boolean;
  resetearSeleccion: () => void;
  toggleObservacionesIndividuales: (prestamoId: number) => void;
}

// NUEVAS: Interfaces para paginación de préstamos grandes
export interface PaginacionPrestamos {
  paginaActual: number;
  totalPaginas: number;
  itemsPorPagina: number;
  totalItems: number;
  mostrarPaginacion: boolean;
}

// NUEVA: Interfaz para filtros de préstamos
export interface FiltrosPrestamos {
  soloVencidos: boolean;
  soloActivos: boolean;
  conObservaciones: boolean;
  busquedaTexto: string;
}

// NUEVAS: Funciones auxiliares para manejo de lotes grandes
export const paginarPrestamos = (
  prestamos: Prestamo[],
  paginaActual: number,
  itemsPorPagina: number = LIMITES_DEVOLUCION_MULTIPLE.ITEMS_POR_PAGINA
): { prestamosEnPagina: Prestamo[]; paginacion: PaginacionPrestamos } => {
  const totalItems = prestamos.length;
  const totalPaginas = Math.ceil(totalItems / itemsPorPagina);
  const inicio = (paginaActual - 1) * itemsPorPagina;
  const fin = inicio + itemsPorPagina;
  
  return {
    prestamosEnPagina: prestamos.slice(inicio, fin),
    paginacion: {
      paginaActual,
      totalPaginas,
      itemsPorPagina,
      totalItems,
      mostrarPaginacion: totalItems > LIMITES_DEVOLUCION_MULTIPLE.MOSTRAR_PAGINACION_DESDE
    }
  };
};

export const filtrarPrestamos = (
  prestamos: Prestamo[],
  filtros: FiltrosPrestamos
): Prestamo[] => {
  return prestamos.filter(prestamo => {
    // Filtro por estado vencido
    if (filtros.soloVencidos) {
      const fechaDevolucion = new Date(prestamo.fecha_devolucion);
      const hoy = new Date();
      if (fechaDevolucion >= hoy) return false;
    }

    // Filtro por estado activo
    if (filtros.soloActivos) {
      if (prestamo.estado !== 'ACTIVO') return false;
    }

    // Filtro por búsqueda de texto
    if (filtros.busquedaTexto.trim()) {
      const textoBusqueda = filtros.busquedaTexto.toLowerCase();
      const tituloLibro = prestamo.ejemplar.libro.titulo.toLowerCase();
      const codigoLibro = prestamo.ejemplar.libro.codigo_unico.toLowerCase();
      const numeroEjemplar = prestamo.ejemplar.numEjemplar.toString();
      
      if (!tituloLibro.includes(textoBusqueda) && 
          !codigoLibro.includes(textoBusqueda) && 
          !numeroEjemplar.includes(textoBusqueda)) {
        return false;
      }
    }

    return true;
  });
};