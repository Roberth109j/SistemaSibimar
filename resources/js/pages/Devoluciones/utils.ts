// CORREGIDO: Función para obtener la fecha actual en formato YYYY-MM-DD (hora local)
export const obtenerFechaActual = () => {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
  };
  
  // NUEVO: Función para convertir fecha string a Date local sin cambio de zona horaria
  export const parseFechaLocal = (fechaString: string | Date | null): Date | null => {
    if (!fechaString) return null;
    
    // Si ya es un objeto Date, devolverlo tal como está
    if (fechaString instanceof Date) return fechaString;
    
    // Dividir la fecha en partes (formato YYYY-MM-DD)
    const partes = fechaString.toString().split('T')[0].split('-');
    
    if (partes.length === 3) {
      const año = parseInt(partes[0], 10);
      const mes = parseInt(partes[1], 10) - 1; // Los meses en JavaScript van de 0 a 11
      const dia = parseInt(partes[2], 10);
      
      // Crear la fecha en zona horaria local
      return new Date(año, mes, dia);
    }
    
    // Fallback: usar Date normal si el formato no es el esperado
    return new Date(fechaString);
  };
  
  // NUEVO: Función para formatear fecha sin problemas de zona horaria
  export const formatearFecha = (fechaString: string | Date | null, opciones: Intl.DateTimeFormatOptions = {}) => {
    const fecha = parseFechaLocal(fechaString);
    if (!fecha || isNaN(fecha.getTime())) return 'Fecha inválida';
    
    const opcionesDefault = {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    };
    
    const opcionesFinal = { ...opcionesDefault, ...opciones };
    
    return fecha.toLocaleDateString('es-ES', opcionesFinal as Intl.DateTimeFormatOptions);
  };
  
  // NUEVO: Función para calcular días restantes/vencidos
  export const calcularDiasRestantes = (fechaVencimiento: string | Date | null) => {
    const hoy = new Date();
    const fechaVenc = parseFechaLocal(fechaVencimiento);
    
    if (!fechaVenc) return { dias: 0, estado: 'error' };
    
    // Establecer ambas fechas a medianoche para comparación precisa
    const hoyNormalizada = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    const vencNormalizada = new Date(fechaVenc.getFullYear(), fechaVenc.getMonth(), fechaVenc.getDate());
    
    const diffTime = vencNormalizada.getTime() - hoyNormalizada.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      return { dias: diffDays, estado: 'activo' };
    } else if (diffDays === 0) {
      return { dias: 0, estado: 'vence_hoy' };
    } else {
      return { dias: Math.abs(diffDays), estado: 'vencido' };
    }
  };