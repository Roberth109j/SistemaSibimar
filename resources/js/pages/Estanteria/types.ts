

export type Estanteria = {
  id: number;
  cod_estante: string;
  descripcion: string | null;
  position: number;
  created_at?: string;
  updated_at?: string;
};

export type FlashMessage = {
  success?: string;
  error?: string;
};

export type BreadcrumbItem = {
  title: string;
  href: string;
};

export type EstanteriaFormData = {
  cod_estante: string;
  descripcion: string | null;
};