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

export interface PrestamoDetalle {
  id: number;
  fecha_prestamo: string;
  fecha_devolucion: string;
  fecha_devuelto?: string;
  estado: string;
  observaciones?: string;
  ejemplar: {
    id?: number;
    codigo?: string;
    numEjemplar?: number;
    libro: {
      id?: number;
      titulo: string;
      isbn?: string;
      autor: {
        nombres: string;
        apellidos: string;
      };
    };
  };
  lector: {
    id?: number;
    nombre: string;
    codigo: string;
    grado?: {
      id?: number;
      subGrado: string;
    };
  };
}

export interface EstadisticasNoDevueltos {
  total_no_devueltos: number;
  activos: number;
  vencidos: number;
  promedio_dias_retraso: number;
  por_grado: NoDevueltoPorGrado[];
  por_severidad: NoDevueltoPorSeveridad;
}

export interface NoDevueltoPorGrado {
  grado: string;
  cantidad: number;
  activos: number;
  vencidos: number;
}

export interface NoDevueltoPorSeveridad {
  critico: number;
  alto: number;
  medio: number;
  bajo: number;
  activos: number;
}

// NUEVAS INTERFACES AGREGADAS PARA SOLUCIONAR EL ERROR
export interface PeriodoInforme {
  inicio: string;
  fin: string;
  tipo: string;
  inicio_formatted?: string;
  fin_formatted?: string;
}