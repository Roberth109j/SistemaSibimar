import { useState, useEffect } from 'react';
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
  const [isManualMode, setIsManualMode] = useState(false);

  // Obtener el nombre completo del autor
  const getAutorNombre = () => {
    if (!autorId) return '';
    const autor = autores.find(a => a.id.toString() === autorId.toString());
    return autor ? `${autor.nombres} ${autor.apellidos}` : '';
  };

  const autorNombre = getAutorNombre();

  // Verificar si se pueden generar automáticamente
  const canGenerate = temaId && autorId && autorNombre.trim() && titulo.trim();

  // Efecto para generar automáticamente cuando cambien los datos
  useEffect(() => {
    if (canGenerate && !isManualMode && !form.data.sign_top) {
      handleGenerateSignatura();
    }
  }, [temaId, autorId, autorNombre, titulo, canGenerate, isManualMode]);

  const handleGenerateSignatura = async () => {
    if (!canGenerate) {
      setError('Debe completar el tema Dewey, autor y título antes de generar la signatura');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/signatura/generar-signatura', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          tema_id: temaId,
          autor: autorNombre,
          titulo: titulo
        })
      });

      const data = await response.json();

      if (response.ok && data.signatura) {
        setSignaturaData(data);
        form.setData('sign_top', data.signatura);
        if (onSignaturaGenerated) {
          onSignaturaGenerated(data.signatura);
        }
        setError(null);
      } else {
        setError(data.error || 'Error al generar la signatura topográfica');
        setSignaturaData(null);
      }
    } catch (err) {
      console.error('Error al generar signatura:', err);
      setError('Error de conexión al generar la signatura topográfica');
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
    setIsManualMode(!isManualMode);
    if (!isManualMode) {
      // Cambiar a modo manual
      setSignaturaData(null);
      setError(null);
    } else {
      // Cambiar a modo automático
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
            onClick={handleGenerateSignatura}
            disabled={isGenerating}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-800 dark:text-emerald-200 dark:hover:bg-emerald-700 rounded-md transition-colors disabled:opacity-50"
          >
            {isGenerating ? (
              <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <Wand2 className="w-4 h-4 mr-1" />
            )}
            {isGenerating ? 'Generando...' : 'Regenerar'}
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
          <div>
            <p className="text-sm font-medium text-red-800 dark:text-red-200">Error</p>
            <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
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