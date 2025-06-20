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
    subgrado?: string; // ✅ Agregado el campo subgrado como opcional
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
  subgrados?: string[]; // ✅ Nueva prop para la lista de subgrados
  flash?: {
    success?: string;
    error?: string;
  };
};