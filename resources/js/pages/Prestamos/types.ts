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
  codigo?: string;
  numEjemplar: number;
  tipo_adquisicion?: 'COMPRA' | 'DONACION' | 'REPOSICION';
  estado: 'DISPONIBLE' | 'PRESTADO' | 'INACTIVO';
  observaciones?: string;
  libro?: Libro;
};

export type Libro = {
  id: number;
  titulo: string;
  isbn: string;
  autor?: Autor;
  editorial?: Editorial;
  seccion?: Seccion;
};

export type Autor = {
  id: number;
  nombres: string;
  apellidos: string;
};

export type Editorial = {
  id: number;
  nombre: string;
};

export type Seccion = {
  id: number;
  nombre: string;
  descripcion?: string;
};

export type Usuario = {
  id: number;
  nombre: string;
  codigo: string;
  email?: string;
};

export type PrestamoPageProps = {
  auth: any;
  ejemplares?: Ejemplar[];
  libro?: Libro | null;
  prestamos?: {
    data: Prestamo[];
  };
  flash?: {
    success?: string;
    error?: string;
  };
};

export type NotificationType = {
  show: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
};

export type PrestamoForm = {
  fecha_prestamo: string;
  fecha_devolucion: string;
  estado: 'ACTIVO';
  observaciones: string;
};

export type BreadcrumbItem = {
  title: string;
  href: string;
};