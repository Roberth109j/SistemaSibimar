// Definición de tipos para la gestión de grados

export type Grado = {
  id: number;
  nombre: string;
  grado: 'Prescolar' | 'Primero' | 'Segundo' | 'Tercero' | 'Cuarto' | 'Quinto' | 'Sexto' | 'Séptimo' | 'Octavo' | 'Noveno' | 'Décimo' | 'Once';
  subGrado?: string;
  estado: 'ACTIVO' | 'INACTIVO';
  seccion_id: number;
};

export type GradoPageProps = {
  auth: any;
  grados: {
    data: Grado[];
    // Agregar propiedades de paginación si es necesario
  };
  filters?: Record<string, any>;
  errors?: Record<string, string>;
  flash?: {
    success?: string;
    error?: string;
  };
};