import React, { useState, useEffect } from 'react';
import { Hash, BookOpen, User, Type, Loader2, CheckCircle, AlertCircle, Info } from 'lucide-react';
import axios from 'axios';

interface SignaturaTopograficaProps {
  temaId?: number | string;
  autor?: string;
  titulo?: string;
  value?: string;
  onChange?: (signatura: string) => void;
  disabled?: boolean;
  className?: string;
}

interface ComponentesSignatura {
  codigo_dewey: string;
  cutter: string;
  letra_titulo: string;
  autor_normalizado: string;
  titulo_normalizado: string;
}

const SignaturaTopografica: React.FC<SignaturaTopograficaProps> = ({
  temaId,
  autor,
  titulo,
  value = '',
  onChange,
  disabled = false,
  className = ''
}) => {
  const [signatura, setSignatura] = useState(value);
  const [componentes, setComponentes] = useState<ComponentesSignatura | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [modoManual, setModoManual] = useState(false);

  // Actualizar signatura cuando cambie el valor externo
  useEffect(() => {
    setSignatura(value);
  }, [value]);

  // Generar signatura automáticamente cuando cambien los datos
  useEffect(() => {
    if (!modoManual && temaId && autor && titulo) {
      generarSignaturaAutomatica();
    }
  }, [temaId, autor, titulo, modoManual]);

  const generarSignaturaAutomatica = async () => {
    if (!temaId || !autor || !titulo) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/signatura/generar-signatura', {
        tema_id: temaId,
        autor: autor,
        titulo: titulo
      });

      const nuevaSignatura = response.data.signatura;
      setSignatura(nuevaSignatura);
      setComponentes(response.data.componentes);
      setIsValid(true);
      
      if (onChange) {
        onChange(nuevaSignatura);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Error al generar la signatura topográfica';
      setError(errorMessage);
      setIsValid(false);
    } finally {
      setLoading(false);
    }
  };

  const validarSignatura = async (signaturaAValidar: string) => {
    if (!signaturaAValidar.trim()) {
      setIsValid(null);
      setError(null);
      return;
    }

    try {
      const response = await axios.post('/api/signatura/validar-signatura', {
        signatura: signaturaAValidar
      });

      setIsValid(response.data.valida);
      if (!response.data.valida) {
        setError(response.data.error);
      } else {
        setError(null);
        setComponentes(response.data.componentes);
      }
    } catch (err: any) {
      setIsValid(false);
      setError('Error al validar la signatura');
    }
  };

  const handleSignaturaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nuevaSignatura = e.target.value;
    setSignatura(nuevaSignatura);
    
    if (onChange) {
      onChange(nuevaSignatura);
    }

    // Validar en tiempo real si está en modo manual
    if (modoManual) {
      validarSignatura(nuevaSignatura);
    }
  };

  const toggleModoManual = () => {
    setModoManual(!modoManual);
    setError(null);
    setIsValid(null);
    
    if (!modoManual) {
      // Cambiar a modo manual
      setComponentes(null);
    } else {
      // Cambiar a modo automático
      if (temaId && autor && titulo) {
        generarSignaturaAutomatica();
      }
    }
  };

  const getStatusIcon = () => {
    if (loading) {
      return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
    }
    
    if (isValid === true) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    
    if (isValid === false) {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
    
    return <Hash className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header con información */}
      <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-indigo-800 dark:text-indigo-300 mb-2 flex items-center">
          <Hash className="w-5 h-5 mr-2" />
          Signatura Topográfica
        </h3>
        <p className="text-sm text-indigo-600 dark:text-indigo-400">
          La signatura topográfica identifica de manera única la ubicación del libro en la biblioteca.
          Formato: <code className="bg-indigo-100 dark:bg-indigo-800 px-1 rounded">CDD-CutterTítulo</code>
        </p>
      </div>

      {/* Toggle entre modo automático y manual */}
      <div className="flex items-center justify-between">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={modoManual}
            onChange={toggleModoManual}
            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Modo manual
          </span>
        </label>
        
        {!modoManual && (
          <button
            type="button"
            onClick={generarSignaturaAutomatica}
            disabled={!temaId || !autor || !titulo || loading}
            className="text-sm text-indigo-600 hover:text-indigo-800 disabled:text-gray-400"
          >
            Regenerar
          </button>
        )}
      </div>

      {/* Campo de entrada */}
      <div className="space-y-2">
        <label htmlFor="signatura" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          Signatura Topográfica <span className="text-red-500">*</span>
        </label>
        
        <div className="relative">
          <input
            id="signatura"
            type="text"
            value={signatura}
            onChange={handleSignaturaChange}
            disabled={disabled || (!modoManual && loading)}
            placeholder={modoManual ? "Ej: 900-G216h" : "Se generará automáticamente..."}
            className={`block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 px-3 py-2 pr-10 text-sm ${
              isValid === false ? 'border-red-300 focus:border-red-500 focus:ring-red-500' :
              isValid === true ? 'border-green-300 focus:border-green-500 focus:ring-green-500' : ''
            }`}
          />
          
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {getStatusIcon()}
          </div>
        </div>

        {/* Mensaje de error */}
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {error}
          </p>
        )}

        {/* Información de componentes */}
        {componentes && !error && (
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-sm">
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Componentes:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-blue-500" />
                <span className="text-gray-600 dark:text-gray-400">CDD:</span>
                <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">{componentes.codigo_dewey}</code>
              </div>
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-green-500" />
                <span className="text-gray-600 dark:text-gray-400">Cutter:</span>
                <code className="bg-green-100 dark:bg-green-900 px-1 rounded">{componentes.cutter}</code>
              </div>
              <div className="flex items-center space-x-2">
                <Type className="w-4 h-4 text-purple-500" />
                <span className="text-gray-600 dark:text-gray-400">Título:</span>
                <code className="bg-purple-100 dark:bg-purple-900 px-1 rounded">{componentes.letra_titulo}</code>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Información de ayuda */}
      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
        <div className="flex">
          <Info className="h-4 w-4 text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <p className="font-medium mb-1">¿Cómo funciona?</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li><strong>CDD:</strong> Código Decimal Dewey del tema seleccionado</li>
              <li><strong>Cutter:</strong> Código basado en el apellido del autor (tabla Cutter-Sanborn)</li>
              <li><strong>Título:</strong> Primera letra del título (sin artículos)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignaturaTopografica;