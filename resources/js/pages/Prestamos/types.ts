export type Prestamo = {
  id: number;
  ejemplar_id: number;
  usuario_id: number;
  fecha_prestamo: string;
  fecha_devolucion: string;
  estado: 'ACTIVO' | 'DEVUELTO' | 'VENCIDO';
  observaciones?: string;
  ejemplar?: Ejemplar;
  usuario?: Usuario;
};

export type Ejemplar = {
  id: number;
  libro_id: number;
  codigo: string;
  estado: string;
  libro?: Libro;
};

export type Libro = {
  id: number;
  titulo: string;
  isbn: string;
  autor?: Autor;
};

export type Autor = {
  id: number;
  nombre: string;
  apellidos: string;
};

export type Usuario = {
  id: number;
  nombre: string;
  codigo: string;
};

export type PrestamoPageProps = {
  auth: any;
  ejemplares?: Ejemplar[];
  prestamos?: {
    data: Prestamo[];
  };
  flash?: {
    success?: string;
    error?: string;
  };
};