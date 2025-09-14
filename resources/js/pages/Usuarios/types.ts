// Define el tipo para un Usuario
export type Usuario = {
  id: number;
  name: string;
  email: string;
  seccion_id?: number;
  fecha_inicio_labores?: string;
  fecha_fin_labores?: string;
  estado_activo: boolean;
  roles?: Role[];
  seccion?: Seccion;
};

export type Role = {
  id: number;
  name: string;
  guard_name: string;
};

export type Seccion = {
  id: number;
  nombre: string;
  descripcion?: string;
};

export type FlashMessage = {
  success?: string;
  error?: string;
};

// Definición del tipo BreadcrumbItem
export type BreadcrumbItem = {
  title: string;
  href: string;
};

// Define los tipos de props comunes para los componentes relacionados con Usuario
export type UsuarioFormData = {
  name: string;
  email: string;
  password?: string;
  password_confirmation?: string;
  roles?: string[];
  seccion_id?: number;
  fecha_inicio_labores?: string;
  fecha_fin_labores?: string;
  estado_activo?: boolean;
};

// Tipo para paginación
export type PaginatedUsuarios = {
  data: Usuario[];
  links?: any[];
  from?: number;
  to?: number;
  total?: number;
  current_page: number;
  last_page: number;
  per_page?: number;
};

// Props para el componente Index
export type IndexProps = {
  auth: {
    user: any;
  };
  usuarios: PaginatedUsuarios | { data: Usuario[]; total?: number };
  secciones?: Seccion[];
  roles?: Role[];
  flash?: FlashMessage;
  errors?: Record<string, string>;
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    has_pages: boolean;
  };
  sort_order?: string;
  search?: string;
  start_number?: number;
  filters?: {
    search?: string;
    sort_field?: string;
    sort_order?: string;
    estado_filter?: string;
  };
};

// Props para el componente Create
export type CreateProps = {
  auth: {
    user: any;
  };
  secciones?: Seccion[];
  roles?: Role[];
  errors?: Record<string, string>;
};

// Props para el componente Edit
export type EditProps = {
  auth: {
    user: any;
  };
  usuario: Usuario;
  secciones?: Seccion[];
  roles?: Role[];
  errors?: Record<string, string>;
};

// Props para el componente Show
export type ShowProps = {
  auth: {
    user: any;
  };
  usuario: Usuario;
};