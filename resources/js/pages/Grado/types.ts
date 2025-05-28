export type Grado = {
  id: number;
  grado: 'Prescolar' | 'Primero' | 'Segundo' | 'Tercero' | 'Cuarto' | 'Quinto' | 'Sexto' | 'Séptimo' | 'Octavo' | 'Noveno' | 'Décimo' | 'Once';
  subGrado?: string;
  estado: 'ACTIVO' | 'INACTIVO';
  seccion_id: number;
};

export type FlashMessage = {
  success?: string;
  error?: string;
};

export type BreadcrumbItem = {
  title: string;
  href: string;
};

export type GradoFormData = {
  grado: string;
  subGrado?: string;
  estado: 'ACTIVO' | 'INACTIVO';
  seccion_id: string;
};