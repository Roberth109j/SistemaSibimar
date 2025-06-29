import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Head, router } from '@inertiajs/react';
import {
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type InventarioProps } from './types';
import EncabezadoInventario from './Encabezado';
import TablaInventario from './Tabla';

// --- Breadcrumbs ---
const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Inicio', href: '/dashboard' },
  { title: 'Inventario', href: '#' },
];

// --- Componente NotificacionAlerta ---
interface NotificacionAlertaProps {
  tipo: 'success' | 'error';
  mensaje: string;
  onCerrar?: () => void;
}

const NotificacionAlerta: React.FC<NotificacionAlertaProps> = ({ tipo, mensaje, onCerrar }) => {
  const [esVisible, setEsVisible] = useState(true);
  const [animarSalida, setAnimarSalida] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimarSalida(true);
      setTimeout(() => {
        setEsVisible(false);
        onCerrar?.();
      }, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onCerrar]);

  const manejarCerrar = () => {
    setAnimarSalida(true);
    setTimeout(() => {
      setEsVisible(false);
      onCerrar?.();
    }, 300);
  };

  if (!esVisible) return null;

  const colores = {
    success: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-400',
      text: 'text-green-800 dark:text-green-200',
      icon: 'text-green-500'
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-400',
      text: 'text-red-800 dark:text-red-200',
      icon: 'text-red-500'
    }
  };

  const Icono = tipo === 'success' ? CheckCircle : AlertCircle;

  return (
    <div className={`fixed top-6 right-6 z-50 max-w-md transition-all duration-300 ${
      animarSalida ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'
    }`}>
      <div className={`rounded-lg shadow-lg border-l-4 p-4 flex items-start ${colores[tipo].bg} ${colores[tipo].border}`}>
        <Icono className={`h-5 w-5 mt-0.5 mr-3 ${colores[tipo].icon}`} />
        <div className="flex-1">
          <p className={`text-sm font-medium ${colores[tipo].text}`}>{mensaje}</p>
        </div>
        <button
          onClick={manejarCerrar}
          className="ml-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// --- Componente Principal ---
const Index: React.FC<InventarioProps> = ({
  auth,
  libros,
  estadisticas,
  clases = [],
  idiomas = [],
  estanterias = [],
  secciones = [],
  grados = [],
  estados = {},
  filters: filtrosIniciales = {},
  flash,
  errors = {}
}) => {
  // Estados del componente
  const [terminoBusqueda, setTerminoBusqueda] = useState(filtrosIniciales.search || '');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [exportandoExcel, setExportandoExcel] = useState(false);
  const [filtrosSeleccionados, setFiltrosSeleccionados] = useState({
    clase: filtrosIniciales.clase || '',
    idioma: filtrosIniciales.idioma || '',
    seccion: filtrosIniciales.seccion || '',
    grado: filtrosIniciales.grado || '',
    estado: filtrosIniciales.estado || ''
  });

  const [alertas, setAlertas] = useState<{
    success: string | null;
    error: string | null;
  }>({
    success: null,
    error: null
  });

  const timeoutBusquedaRef = useRef<NodeJS.Timeout | null>(null);

  // Manejar mensajes flash
  useEffect(() => {
    if (flash?.success) {
      setAlertas(prev => ({ ...prev, success: flash.success || null }));
    }
    if (flash?.error) {
      setAlertas(prev => ({ ...prev, error: flash.error || null }));
    }
  }, [flash]);

  // Funciones de manejo
  const aplicarFiltros = useCallback((terminoActual: string, filtrosActuales: typeof filtrosSeleccionados) => {
    const params = new URLSearchParams();
    
    if (terminoActual) params.set('search', terminoActual);
    Object.entries(filtrosActuales).forEach(([clave, valor]) => {
      if (valor) params.set(clave, valor);
    });

    router.get(`/inventario?${params.toString()}`, {}, {
      preserveState: true,
      preserveScroll: true,
    });
  }, []);

  const manejarBusqueda = (valor: string) => {
    setTerminoBusqueda(valor);
    
    if (timeoutBusquedaRef.current) {
      clearTimeout(timeoutBusquedaRef.current);
    }
    
    timeoutBusquedaRef.current = setTimeout(() => {
      aplicarFiltros(valor, filtrosSeleccionados);
    }, 500);
  };

  const manejarCambioFiltro = (tipoFiltro: string, valor: string) => {
    const nuevosFiltros = { ...filtrosSeleccionados, [tipoFiltro]: valor };
    setFiltrosSeleccionados(nuevosFiltros);
    aplicarFiltros(terminoBusqueda, nuevosFiltros);
  };

  const limpiarFiltros = () => {
    setTerminoBusqueda('');
    setFiltrosSeleccionados({
      clase: '',
      idioma: '',
      seccion: '',
      grado: '',
      estado: ''
    });
    router.get('/inventario');
  };

  // ✅ FUNCIÓN EXPORTAR EXCEL CORREGIDA
  const exportarExcel = async () => {
    if (exportandoExcel) return; // Prevenir clics múltiples
    
    setExportandoExcel(true);
    
    try {
      const params = new URLSearchParams();
      
      // Agregar parámetro de búsqueda si existe
      if (terminoBusqueda.trim()) {
        params.set('search', terminoBusqueda.trim());
      }
      
      // Agregar filtros que tengan valor
      Object.entries(filtrosSeleccionados).forEach(([clave, valor]) => {
        if (valor && valor.trim()) {
          params.set(clave, valor);
        }
      });
      
      // Construir URL - CORREGIDA AQUÍ
      const baseUrl = '/inventario/exportar'; // Cambiado de exportar-excel a exportar
      const queryString = params.toString();
      const fullUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;
      
      // Mostrar mensaje de inicio
      setAlertas(prev => ({ 
        ...prev, 
        success: 'Generando archivo Excel...' 
      }));
      
      // Crear elemento de descarga
      const link = document.createElement('a');
      link.href = fullUrl;
      link.target = '_blank';
      
      // Simular clic
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Esperar un momento y mostrar mensaje de finalización
      setTimeout(() => {
        setAlertas(prev => ({ 
          ...prev, 
          success: 'Archivo Excel descargado exitosamente' 
        }));
      }, 2000);
      
    } catch (error) {
      console.error('Error al exportar Excel:', error);
      setAlertas(prev => ({ 
        ...prev, 
        error: 'Error al generar el archivo Excel. Por favor, inténtalo de nuevo.' 
      }));
    } finally {
      setExportandoExcel(false);
    }
  };

  const toggleFiltros = () => {
    setMostrarFiltros(!mostrarFiltros);
  };

  // Limpiar timeout al desmontar el componente
  useEffect(() => {
    return () => {
      if (timeoutBusquedaRef.current) {
        clearTimeout(timeoutBusquedaRef.current);
      }
    };
  }, []);

  return (
    <AppLayout
      breadcrumbs={breadcrumbs}
    >
      <Head title="Inventario de Biblioteca" />

      {/* Alertas */}
      {alertas.success && (
        <NotificacionAlerta
          tipo="success"
          mensaje={alertas.success}
          onCerrar={() => setAlertas(prev => ({ ...prev, success: null }))}
        />
      )}
      {alertas.error && (
        <NotificacionAlerta
          tipo="error"
          mensaje={alertas.error}
          onCerrar={() => setAlertas(prev => ({ ...prev, error: null }))}
        />
      )}

      <div className="py-8 px-6 bg-slate-50 dark:bg-black min-h-screen">
        <div className="max-w-7xl mx-auto">
          
          {/* Encabezado con estadísticas y controles */}
          <EncabezadoInventario
            totalLibros={estadisticas.total_libros}
            totalEjemplares={estadisticas.total_ejemplares}
            totalDisponibles={estadisticas.total_disponibles}
            totalPrestados={estadisticas.total_prestados}
            totalInactivos={estadisticas.total_inactivos}
            terminoBusqueda={terminoBusqueda}
            onBusquedaCambio={manejarBusqueda}
            mostrarFiltros={mostrarFiltros}
            onToggleFiltros={toggleFiltros}
            filtrosSeleccionados={filtrosSeleccionados}
            onCambioFiltro={manejarCambioFiltro}
            onLimpiarFiltros={limpiarFiltros}
            onExportarExcel={exportarExcel}
            clases={clases}
            idiomas={idiomas}
            secciones={secciones}
            grados={grados}
            exportandoExcel={exportandoExcel}
          />

          {/* Tabla de libros */}
          <TablaInventario libros={libros} />
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;