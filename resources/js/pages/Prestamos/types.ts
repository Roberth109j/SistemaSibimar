export type Prestamo = {
  id: number;
  ejemplar_id: number;
  usuario_id: number;
  fecha_prestamo: string;
  fecha_devolucion: string;
  estado: 'ACTIVO' | 'DEVUELTO' | 'VENCIDO';
  observaciones?: string;
  ejemplar?: Ejemplar;
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
  codigo_unico: string; // Campo principal que puede ser ISBN o ISSN
  isbn?: string; // Mantener para compatibilidad con código existente
  clase: 'LIBRO' | 'REVISTA'; // Determina si es ISBN o ISSN
  area?: string; // Nuevo campo
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

// Tipo Lector
export type Lector = {
  id: number;
  nombre: string;
  codigo: string;
  tipo?: string;
  estado?: string;
  grado_id?: number;
  grado?: {
    id: number;
    grado: string;
    subGrado: string;
    seccion?: {
      id: number;
      nombre: string;
    };
  };
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

// Funciones helper para manejar códigos
export const obtenerTipoCodigo = (libro: Libro): 'ISBN' | 'ISSN' => {
  return libro.clase === 'LIBRO' ? 'ISBN' : 'ISSN';
};

export const obtenerCodigoPrincipal = (libro: Libro): string => {
  return libro.codigo_unico || libro.isbn || '';
};

export const formatearCodigo = (libro: Libro): string => {
  const codigo = obtenerCodigoPrincipal(libro);
  const tipo = obtenerTipoCodigo(libro);
  return `${tipo}: ${codigo}`;
};