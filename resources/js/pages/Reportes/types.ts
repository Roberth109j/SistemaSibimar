export type Prestamo = {
  id: number;
  ejemplar: {
    id: number;
    numEjemplar?: number;
    libro: {
      titulo: string;
      isbn: string;
    };
  };
  lector: {
    id: number;
    nombre: string;
    codigo: string;
  };
  fecha_prestamo: string;
  fecha_devolucion: string;
  fecha_devuelto?: string;
  estado: 'ACTIVO' | 'DEVUELTO' | 'VENCIDO';
  observaciones?: string;
};

export type HistorialPrestamosProps = {
  auth: any;
  prestamos?: {
    data: Prestamo[];
    links: any;
    total: number;
  };
  flash?: {
    success?: string;
    error?: string;
  };
};