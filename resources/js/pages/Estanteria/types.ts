// Define el tipo para una Estantería
export interface Estanteria {
    id: number;
    cod_estante: string;
    descripcion: string | null;
    created_at?: string;
    updated_at?: string;
  }
  
  // Define los tipos de props comunes para los componentes relacionados con Estantería
  export interface EstanteriaFormData {
    cod_estante: string;
    descripcion: string;
  }
  
  export interface EstanteriaFlash {
    success?: string;
    error?: string;
  }
  
  // Props para el componente Index
  export interface EstanteriaIndexProps {
    estanterias: Estanteria[];
    flash?: EstanteriaFlash;
  }
  
  // Props para el componente Show
  export interface EstanteriaShowProps {
    estanteria: Estanteria;
  }
  
  // Props para el componente Edit
  export interface EstanteriaEditProps {
    estanteria: Estanteria;
    errors?: Record<string, string>;
  }
  
  // Props para el componente Create
  export interface EstanteriaCreateProps {
    errors?: Record<string, string>;
  }