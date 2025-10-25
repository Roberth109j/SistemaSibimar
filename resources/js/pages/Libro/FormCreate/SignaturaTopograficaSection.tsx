import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { Hash, Wand2, CheckCircle, AlertCircle, Info, RefreshCw } from 'lucide-react';

interface SignaturaTopograficaSectionProps {
  form: any;
  temaId: string | number;
  autorId: string | number;
  titulo: string;
  autores: any[];
  onSignaturaGenerated?: (signatura: string) => void;
}

interface SignaturaResponse {
  signatura: string;
  componentes: {
    codigo_dewey: string;
    cutter: string;
    letra_titulo: string;
    autor_normalizado: string;
    titulo_normalizado: string;
  };
}

export default function SignaturaTopograficaSection({
  form,
  temaId,
  autorId,
  titulo,
  autores,
  onSignaturaGenerated
}: SignaturaTopograficaSectionProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [signaturaData, setSignaturaData] = useState<SignaturaResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isManualMode, setIsManualMode] = useState(!form.data.signatura_automatica);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 2; // Intentar hasta 2 veces

  useEffect(() => {
    setIsManualMode(!form.data.signatura_automatica);
  }, [form.data.signatura_automatica]);

  const getAutorNombre = () => {
    if (!autorId) return '';
    const autor = autores.find(a => a.id.toString() === autorId.toString());
    return autor ? `${autor.nombres} ${autor.apellidos}` : '';
  };

  const autorNombre = getAutorNombre();
  const canGenerate = temaId && autorId && autorNombre.trim() && titulo.trim();

  useEffect(() => {
    if (canGenerate && !isManualMode && !form.data.sign_top) {
      handleGenerateSignatura();
    }
  }, [temaId, autorId, autorNombre, titulo, canGenerate, isManualMode]);

  // Función para refrescar el token CSRF
  const refreshCsrfToken = async (): Promise<boolean> => {
    try {
      console.log('🔄 Refrescando token CSRF...');
      const response = await fetch('/csrf-refresh', {
        method: 'GET',
        credentials: 'same-origin'
      });
      
      if (response.ok) {
        const data = await response.json();
        const metaTag = document.querySelector('meta[name="csrf-token"]');
        if (metaTag && data.token) {
          metaTag.setAttribute('content', data.token);
          console.log('✅ Token CSRF refrescado');
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error('Error al refrescar token CSRF:', err);
      return false;
    }
  };

  // ✅ Función principal con retry automático
  const handleGenerateSignatura = async (isRetry: boolean = false) => {
    if (!canGenerate) {
      setError('Debe completar el tema Dewey, autor y título antes de generar la signatura');
      return;
    }

    setIsGenerating(true);
    if (!isRetry) {
      setError(null);
      setRetryCount(0);
    }

    try {
      console.log(`📤 Generando signatura... (intento ${retryCount + 1})`, {
        tema_id: temaId,
        autor: autorNombre,
        titulo: titulo,
        isRetry
      });

      const response = await axios.post('/api/signatura/generar-signatura', {
      tema_id: temaId,
      autor_id: autorId,
      titulo: titulo
      });

      console.log('Signatura generada exitosamente:', response.data);

      if (response.data.signatura) {
        setSignaturaData(response.data);
        form.setData('sign_top', response.data.signatura);
        if (onSignaturaGenerated) {
          onSignaturaGenerated(response.data.signatura);
        }
        setError(null);
        setRetryCount(0); // Reset del contador al tener éxito
      } else {
        throw new Error(response.data.error || 'No se pudo generar la signatura');
      }
    } catch (err: any) {
      console.error('Error al generar signatura:', err);
      
      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;
        
        // ✅ MANEJO ESPECIAL DEL ERROR 419 CON RETRY AUTOMÁTICO
        if (status === 419) {
          console.warn('⚠️ Error 419 detectado - Token CSRF inválido');
          
          // Si aún podemos reintentar
          if (retryCount < MAX_RETRIES) {
            console.log(`🔄 Reintentando... (${retryCount + 1}/${MAX_RETRIES})`);
            setRetryCount(prev => prev + 1);
            
            // Refrescar el token CSRF
            const refreshed = await refreshCsrfToken();
            
            // Esperar un momento antes de reintentar
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Reintentar
            setIsGenerating(false);
            return handleGenerateSignatura(true);
          } else {
            // Ya se agotaron los intentos
            setError('Error de sesión persistente. Por favor, recargue la página.');
            console.error('Máximo de reintentos alcanzado');
          }
          return;
        }
        
        if (status === 401) {
          setError('No está autenticado. Por favor, inicie sesión.');
          return;
        }
        
        if (status === 403) {
          setError('No tiene permisos para realizar esta acción.');
          return;
        }
        
        if (status === 400) {
          setError(data.error || 'Datos inválidos para generar la signatura.');
          return;
        }
        
        // Error genérico del servidor
        setError(data.error || data.message || `Error del servidor (${status})`);
      } else if (err.request) {
        setError('Error de conexión. Verifique su conexión a internet.');
      } else {
        setError(err.message || 'Error desconocido al generar la signatura.');
      }
      
      setSignaturaData(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleManualChange = (value: string) => {
    form.setData('sign_top', value);
    setSignaturaData(null);
    setError(null);
  };

  const toggleManualMode = () => {
    const newManualMode = !isManualMode;
    setIsManualMode(newManualMode);
    form.setData('signatura_automatica', !newManualMode);
    
    if (newManualMode) {
      setSignaturaData(null);
      setError(null);
      setRetryCount(0);
    } else {
      if (canGenerate) {
        handleGenerateSignatura();
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800">
        <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-300 mb-2 flex items-center">
          <Hash className="w-5 h-5 mr-2" />
          Signatura Topográfica
        </h3>
        <p className="text-sm text-emerald-600 dark:text-emerald-400">
          La signatura topográfica se genera automáticamente usando el sistema Cutter-Sanborn. 
          Formato: <code className="bg-emerald-100 dark:bg-emerald-800 px-1 rounded">CDD-CutterTítulo</code>
        </p>
      </div>

      {/* Modo de entrada */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Modo:</span>
          <button
            type="button"
            onClick={toggleManualMode}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
              isManualMode ? 'bg-gray-400' : 'bg-emerald-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isManualMode ? 'translate-x-1' : 'translate-x-6'
              }`}
            />
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {isManualMode ? 'Manual' : 'Automático'}
          </span>
        </div>

        {!isManualMode && canGenerate && (
          <button
            type="button"
            onClick={() => handleGenerateSignatura(false)}
            disabled={isGenerating}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-800 dark:text-emerald-200 dark:hover:bg-emerald-700 rounded-md transition-colors disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                {retryCount > 0 ? `Reintentando (${retryCount}/${MAX_RETRIES})...` : 'Generando...'}
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-1" />
                Regenerar
              </>
            )}
          </button>
        )}
      </div>

      {/* Campo de entrada */}
      <div className="space-y-2">
        <label htmlFor="sign_top" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          Signatura Topográfica <span className="text-red-500">*</span>
        </label>
        
        {isManualMode ? (
          <input
            type="text"
            id="sign_top"
            value={form.data.sign_top || ''}
            onChange={(e) => handleManualChange(e.target.value)}
            placeholder="Ej: 900-G216h"
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 px-3 py-2 text-sm"
          />
        ) : (
          <div className="relative">
            <input
              type="text"
              id="sign_top"
              value={form.data.sign_top || ''}
              readOnly
              placeholder={canGenerate ? "Se generará automáticamente..." : "Complete tema Dewey, autor y título"}
              className="block w-full rounded-lg border-gray-300 shadow-sm bg-gray-50 dark:bg-gray-600 dark:border-gray-600 px-3 py-2 text-sm text-gray-600 dark:text-gray-400"
            />
            {isGenerating && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
              </div>
            )}
          </div>
        )}

        {form.errors.sign_top && (
          <p className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded-md border-l-2 border-red-500">
            {form.errors.sign_top}
          </p>
        )}
      </div>

      {/* Información de error */}
      {error && (
        <div className="flex items-start space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">Error</p>
            <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
            {error.includes('recargue la página') && (
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-2 text-sm text-red-700 underline hover:text-red-900"
              >
                Recargar página ahora
              </button>
            )}
          </div>
        </div>
      )}

      {/* Información de la signatura generada */}
      {signaturaData && !error && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-start space-x-2 mb-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                Signatura generada exitosamente
              </p>
              <p className="text-lg font-mono font-bold text-green-900 dark:text-green-100 mt-1">
                {signaturaData.signatura}
              </p>
            </div>
          </div>

          {/* Desglose de componentes */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-green-800 dark:text-green-200">Componentes:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-white dark:bg-gray-800 p-2 rounded border">
                <span className="font-medium text-gray-600 dark:text-gray-400">CDD:</span>
                <span className="ml-1 font-mono text-gray-900 dark:text-gray-100">
                  {signaturaData.componentes.codigo_dewey}
                </span>
              </div>
              <div className="bg-white dark:bg-gray-800 p-2 rounded border">
                <span className="font-medium text-gray-600 dark:text-gray-400">Cutter:</span>
                <span className="ml-1 font-mono text-gray-900 dark:text-gray-100">
                  {signaturaData.componentes.cutter}
                </span>
                <span className="block text-gray-500 dark:text-gray-400 text-xs">
                  ({signaturaData.componentes.autor_normalizado})
                </span>
              </div>
              <div className="bg-white dark:bg-gray-800 p-2 rounded border">
                <span className="font-medium text-gray-600 dark:text-gray-400">Título:</span>
                <span className="ml-1 font-mono text-gray-900 dark:text-gray-100">
                  {signaturaData.componentes.letra_titulo}
                </span>
                <span className="block text-gray-500 dark:text-gray-400 text-xs">
                  ({signaturaData.componentes.titulo_normalizado})
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Información de ayuda */}
      {!canGenerate && !isManualMode && (
        <div className="flex items-start space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Información</p>
            <p className="text-sm text-blue-600 dark:text-blue-300">
              Para generar automáticamente la signatura topográfica, complete primero:
            </p>
            <ul className="text-sm text-blue-600 dark:text-blue-300 mt-1 ml-4 list-disc">
              {!temaId && <li>Tema Dewey (en la sección anterior)</li>}
              {!autorId && <li>Autor del libro</li>}
              {!titulo.trim() && <li>Título del libro</li>}
            </ul>
          </div>
        </div>
      )}

      {/* Información sobre el sistema Cutter-Sanborn */}
      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center">
          <Info className="w-4 h-4 mr-1" />
          Sistema Cutter-Sanborn
        </h4>
        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
          La signatura topográfica utiliza la <strong>Tabla de Tres Cifras de Cutter-Sanborn</strong> para generar códigos únicos basados en el apellido del autor. 
          El formato final combina el código Dewey (CDD), el código Cutter del autor y la primera letra del título.
        </p>
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
          <strong>Ejemplo:</strong> Para "Historia de una Ciudad Antigua" de Jorge García con CDD 900:
          <br />
          <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">900-G216h</code> 
          (900=Historia, G216=García según Cutter, h=historia)
        </div>
      </div>
    </div>
  );
}