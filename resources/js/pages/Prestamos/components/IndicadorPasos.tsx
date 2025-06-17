import React from 'react';
import { Book, ListChecks, UserCheck, Check } from 'lucide-react';

interface IndicadorPasosProps {
  pasoActual: 1 | 2 | 3 | 4;
  libroSeleccionado: boolean;
  ejemplarSeleccionado: boolean;
  estudianteEscaneado: boolean;
}

export function IndicadorPasos({
  pasoActual,
  libroSeleccionado,
  ejemplarSeleccionado,
  estudianteEscaneado
}: IndicadorPasosProps) {
  const pasos = [
    {
      numero: 1,
      titulo: 'Buscar Libro',
      icono: Book,
      completado: libroSeleccionado
    },
    {
      numero: 2,
      titulo: 'Seleccionar Ejemplar',
      icono: ListChecks,
      completado: ejemplarSeleccionado
    },
    {
      numero: 3,
      titulo: 'Escanear Estudiante',
      icono: UserCheck,
      completado: estudianteEscaneado
    }
  ];

  return (
    <div className="w-full py-4">
      <div className="flex max-w-3xl mx-auto">
        
        {/* Contenedor del paso a paso */}
        <div className="flex-1 grid grid-cols-5">
          {pasos.map((paso, index) => {
            const Icon = paso.icono;
            const esActual = paso.numero === pasoActual;
            const estaCompletado = paso.completado;
            
            return (
              <React.Fragment key={`fragment-${paso.numero}`}>
                {/* Cada paso ocupa una columna */}
                <div className="col-span-1 flex flex-col items-center justify-center">
                  {/* Círculo con icono */}
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                    ${estaCompletado 
                      ? 'bg-green-600 dark:bg-green-500 text-white' 
                      : esActual 
                        ? 'bg-blue-600 dark:bg-blue-500 text-white ring-4 ring-blue-100 dark:ring-blue-900/30' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }
                  `}>
                    {estaCompletado ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  
                  {/* Título del paso */}
                  <span className={`
                    mt-2 text-xs font-medium text-center transition-colors duration-300 w-24
                    ${esActual 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : estaCompletado 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-gray-500 dark:text-gray-400'
                    }
                  `}>
                    {paso.titulo}
                  </span>
                </div>
                
                {/* Línea conectora (ocupa una columna) */}
                {index < pasos.length - 1 && (
                  <div className="col-span-1 flex items-center justify-center">
                    <div className={`
                      w-full h-0.5 transition-all duration-300
                      ${paso.completado 
                        ? 'bg-green-600 dark:bg-green-500' 
                        : 'bg-gray-200 dark:bg-gray-700'
                      }
                    `} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}