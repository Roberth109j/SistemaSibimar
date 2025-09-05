import React, { useState, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import { Search, ChevronLeft, ChevronRight, BookOpen, MapPin, CheckCircle, Eye, GraduationCap, Users, ArrowLeft, Home } from 'lucide-react';
import { Autor, Estanteria, Seccion, Libro, PaginationLink, PaginatedLibros, BuscadorProps } from './types';

// Componentes reutilizables
const LoadingSpinner = ({ search, seccionNombre }: { search: string; seccionNombre: string }) => (
  <div className="text-center py-12">
    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
    <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">
      {search.length >= 3 ? 'Buscando libros...' : 'Cargando sección...'}
    </h3>
    <p className="text-sm text-gray-500">
      {search.length >= 3 ? `Buscando "${search}" en ${seccionNombre}` : `Preparando ${seccionNombre}`}
    </p>
  </div>
);

const EmptyState = ({ type, search, seccionId }: { type: 'no-section' | 'no-results' | 'search-short'; search: string; seccionId: number | '' }) => {
  const states = {
    'no-section': {
      icon: <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />,
      title: 'Selecciona una Sección',
      description: 'Elige si buscas material de Primaria o Bachillerato'
    },
    'no-results': {
      icon: <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />,
      title: search.length >= 3 ? 'Sin resultados' : search.length > 0 ? 'Búsqueda muy corta' : 'Escribe para buscar',
      description: search.length >= 3 
        ? `No se encontraron libros para "${search}"`
        : search.length > 0 
          ? 'Escribe al menos 3 caracteres para iniciar la búsqueda'
          : 'Escribe el título, autor o ISBN del libro que buscas'
    },
    'search-short': {
      icon: <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />,
      title: 'Escribe para buscar',
      description: 'Ingresa al menos 3 caracteres'
    }
  };

  const state = states[type];
  
  return (
    <div className="text-center py-10">
      {state.icon}
      <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">{state.title}</h3>
      <p className="text-sm text-gray-500 mb-4">{state.description}</p>
      
      {type === 'no-results' && seccionId && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 max-w-md mx-auto">
          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">💡 Consejos de búsqueda:</h4>
          <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1 text-left">
            {['Busca por título: "don quijote"', 'Busca por autor: "cervantes"', 'Busca por ISBN: "978-84-376"', 'Usa palabras clave simples'].map((tip, i) => (
              <div key={i}>• {tip}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const LibroRow = ({ libro }: { libro: Libro }) => (
  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
    <td className="px-4 py-3">
      <div className="font-medium text-gray-900 dark:text-white text-sm mb-1">{libro.titulo}</div>
      {libro.sign_top && (
        <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded inline-block">
          {libro.sign_top}
        </div>
      )}
    </td>
    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{libro.autor.nombre}</td>
    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400 font-mono">{libro.isbn}</td>
    <td className="px-4 py-3">
      {libro.estanteria ? (
        <div className="flex items-center text-xs">
          <MapPin className="w-3 h-3 text-gray-400 mr-1" />
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">{libro.estanteria.codigo}</span>
            {libro.estanteria.descripcion && (
              <div className="text-xs text-gray-500 truncate max-w-24">{libro.estanteria.descripcion}</div>
            )}
          </div>
        </div>
      ) : (
        <span className="text-gray-400 text-xs">Sin asignar</span>
      )}
    </td>
    <td className="px-4 py-3 text-center">
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
        libro.ejemplares_count > 0 
          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
      }`}>
        {libro.ejemplares_count}
      </span>
    </td>
  </tr>
);

const SeccionButton = ({ seccion, isSelected, onClick }: { seccion: Seccion; isSelected: boolean; onClick: () => void }) => {
  const getIcon = (nombre: string) => {
    if (nombre.toLowerCase().includes('primaria')) return <Users className="w-3.5 h-3.5" />;
    if (nombre.toLowerCase().includes('bachillerato')) return <GraduationCap className="w-3.5 h-3.5" />;
    return <BookOpen className="w-3.5 h-3.5" />;
  };

  return (
    <button
      onClick={onClick}
      className={`w-full p-2 rounded-lg border-2 transition-all duration-300 text-left transform hover:scale-105 ${
        isSelected
          ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 dark:border-blue-400 shadow-md shadow-blue-200/50 dark:shadow-blue-900/30'
          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 dark:hover:from-gray-700/30 dark:hover:to-blue-900/20 hover:shadow-md'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`p-1.5 rounded-lg transition-all duration-200 ${
            isSelected 
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 group-hover:bg-blue-100'
          }`}>
            {getIcon(seccion.nombre)}
          </div>
          <span className="font-medium text-gray-900 dark:text-white text-xs">{seccion.nombre}</span>
        </div>
        {isSelected && (
          <CheckCircle className="w-4 h-4 text-blue-500 animate-pulse" />
        )}
      </div>
    </button>
  );
};

const Index: React.FC<BuscadorProps> = ({ libros, secciones, filters }) => {
  const [search, setSearch] = useState(filters.search || '');
  const [seccionId, setSeccionId] = useState<number | ''>(filters.seccion_id || '');
  const [loading, setLoading] = useState(false);
  const [currentLibros, setCurrentLibros] = useState(libros);
  const [mounted, setMounted] = useState(false);
  
  const isChangingSection = useRef(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => setCurrentLibros(libros), [libros]);

  useEffect(() => {
    if (filters.seccion_id !== seccionId && !isChangingSection.current) {
      setSeccionId(filters.seccion_id || '');
    }
  }, [filters.seccion_id]);

  const handleSearch = (searchTerm: string, selectedSeccion: number | '') => {
    if (!selectedSeccion) return;

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    setLoading(true);
    router.get('/buscador', 
      { 
        search: searchTerm || undefined,
        seccion_id: selectedSeccion || undefined
      },
      { 
        preserveState: true,
        preserveScroll: true,
        replace: true,
        onFinish: () => setLoading(false) 
      }
    );
  };

  useEffect(() => {
    if (isChangingSection.current) return;

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (seccionId && (search.length >= 3 || search.length === 0)) {
      searchTimeoutRef.current = setTimeout(() => {
        handleSearch(search, seccionId);
      }, 500);
    }

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [search, seccionId]);

  const handlePageChange = (url: string | null) => {
    if (!url) return;
    setLoading(true);
    router.get(url, {}, { 
      preserveState: true,
      onFinish: () => setLoading(false) 
    });
  };

  const handleSeccionChange = (selectedSeccion: number | '') => {
    isChangingSection.current = true;
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
    
    setSearch('');
    setSeccionId(selectedSeccion);
    
    if (selectedSeccion) {
      setLoading(true);
      router.get('/buscador', 
        { seccion_id: selectedSeccion },
        { 
          preserveState: true,
          preserveScroll: true,
          replace: true,
          onFinish: () => {
            setLoading(false);
            setTimeout(() => { isChangingSection.current = false; }, 200);
          }
        }
      );
    } else {
      setCurrentLibros({
        ...currentLibros,
        data: [],
        total: 0,
        current_page: 1,
        last_page: 1
      });
      setTimeout(() => { isChangingSection.current = false; }, 100);
    }
  };

  const selectedSeccion = secciones.find(s => s.id === seccionId);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 relative overflow-hidden">
      <Head title="Buscador de Material" />
      
      {/* Fondo dinámico igual al login */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/30 to-white dark:opacity-0 opacity-90"></div>
      
      {/* Ondas SVG decorativas */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <div className="absolute inset-0">
          {/* Ondas superiores */}
          <svg className="absolute w-full h-1/3 opacity-15 dark:opacity-8" viewBox="0 0 1440 420" preserveAspectRatio="none">
            <path fill="currentColor" className="text-blue-300 dark:text-white/40" d="M0,160C120,240,240,280,360,266.7C480,253,600,187,720,160C840,133,960,147,1080,160C1200,173,1320,187,1380,193.3L1440,200L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"></path>
          </svg>
          <svg className="absolute w-full h-1/4 opacity-10 dark:opacity-6 top-0" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="currentColor" className="text-blue-200 dark:text-white/30" d="M0,96C48,128,96,160,192,160C288,160,384,128,480,122.7C576,117,672,139,768,138.7C864,139,960,117,1056,106.7C1152,96,1248,96,1344,106.7C1392,112,1416,117,1428,120L1440,123L1440,0L1428,0C1416,0,1392,0,1344,0C1248,0,1152,0,1056,0C960,0,864,0,768,0C672,0,576,0,480,0C384,0,288,0,192,0C96,0,48,0,24,0L0,0Z"></path>
          </svg>
          
          {/* Ondas inferiores */}
          <svg className="absolute w-full bottom-0 opacity-12 dark:opacity-6" height="280" viewBox="0 0 1440 280" preserveAspectRatio="none">
            <path fill="currentColor" className="text-blue-400 dark:text-white/40" d="M0,224C60,213,120,203,240,203C360,203,480,213,600,202.7C720,192,840,160,960,154.7C1080,149,1200,171,1320,176C1380,179,1410,181,1425,184L1440,187L1440,320L1425,320C1410,320,1380,320,1320,320C1200,320,1080,320,960,320C840,320,720,320,600,320C480,320,360,320,240,320C120,320,60,320,30,320L0,320Z"></path>
          </svg>
        </div>
      </div>

      {/* Patrón de puntos */}
      <div className="absolute inset-0 bg-repeat opacity-5 dark:opacity-8" style={{ 
        backgroundImage: 'radial-gradient(#4285F4 1px, transparent 1px)', 
        backgroundSize: '40px 40px' 
      }}></div>

      {/* Efectos de luz */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-600/15 animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-indigo-500/8 blur-3xl dark:bg-indigo-600/12 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-purple-500/5 blur-3xl dark:bg-purple-600/10 animate-pulse delay-500"></div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 relative z-10">
        
        {/* Header mejorado con escudo */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row items-center justify-between mb-6">
            {/* Logo y título */}
            <div className="flex items-center space-x-6 mb-4 lg:mb-0">
              <div className="relative">
                <img
                  src="/IMG/escudo.png"
                  alt="Escudo Biblioteca Madre Caridad"
                  className="h-16 w-16 object-contain filter drop-shadow-xl"
                />
                <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-xl"></div>
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 bg-clip-text text-transparent mb-1 tracking-tight">
                  Biblioteca Madre Caridad
                </h1>
                <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400">
                  Sistema de búsqueda bibliográfica
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="h-1 w-8 bg-blue-200 dark:bg-blue-700 rounded-full"></div>
                  <div className="h-1 w-14 bg-blue-400 dark:bg-blue-500 rounded-full"></div>
                  <div className="h-1 w-8 bg-blue-200 dark:bg-blue-700 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Navegación */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.get('/')}
                className="flex items-center space-x-2 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400 
                           hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 
                           rounded-xl transition-all duration-200 border border-gray-200 dark:border-gray-700 
                           hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md backdrop-blur-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="font-medium">Inicio</span>
              </button>
              
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 px-3 py-2 rounded-lg backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                <Home className="w-3 h-3" />
                <span>/ Buscador</span>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario compacto */}
        <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden mb-6">
          <div className="p-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              
              {/* Selector de Sección compacto */}
              <div className="lg:col-span-1">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-3 h-3 text-blue-500" />
                  Selecciona Sección <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {secciones.map((seccion) => (
                    <SeccionButton
                      key={seccion.id}
                      seccion={seccion}
                      isSelected={seccionId === seccion.id}
                      onClick={() => handleSeccionChange(seccion.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Campo de búsqueda compacto */}
              <div className="lg:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                  <Search className="w-3 h-3 text-blue-500" />
                  Términos de Búsqueda
                </label>
                
                <div className="relative mb-2">
                  <input
                    type="text"
                    placeholder={seccionId ? "Buscar por título, autor o ISBN (mín. 3 caracteres)..." : "Primero selecciona una sección"}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    disabled={!seccionId}
                    className={`w-full pl-8 pr-4 py-2.5 rounded-lg border text-gray-900 dark:text-white 
                               focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 transition-all text-sm ${
                      !seccionId
                        ? 'bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500 cursor-not-allowed'
                        : 'bg-gray-50/50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-white dark:hover:bg-gray-700 shadow-sm hover:shadow-md'
                    }`}
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  {search && seccionId && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        search.length >= 3 ? 'bg-green-500 animate-pulse' : 'bg-orange-400'
                      }`}></div>
                    </div>
                  )}
                </div>

                {/* Estado de búsqueda compacto */}
                {seccionId && (
                  <div className="p-2.5 bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 dark:from-blue-900/20 dark:via-blue-800/30 dark:to-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="p-1 bg-blue-500 rounded">
                          <Eye className="w-2.5 h-2.5 text-white" />
                        </div>
                        <span className="text-xs font-semibold text-blue-800 dark:text-blue-200">
                          {selectedSeccion?.nombre}
                        </span>
                      </div>
                      {search && (
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-blue-700 dark:text-blue-300 bg-white/70 dark:bg-blue-800/30 px-2 py-1 rounded font-medium border border-blue-200/50">
                            "{search.length >= 3 ? search : `${search} (${3 - search.length} más)`}"
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Resultados con estilo mejorado */}
        {!seccionId ? (
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-8">
            <EmptyState type="no-section" search={search} seccionId={seccionId} />
          </div>
        ) : loading ? (
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-8">
            <LoadingSpinner search={search} seccionNombre={selectedSeccion?.nombre || ''} />
          </div>
        ) : currentLibros.data.length > 0 ? (
          <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
            
            {/* Header de resultados mejorado */}
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 border-b border-blue-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <BookOpen className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-bold text-blue-900 dark:text-white">
                      {currentLibros.total} {currentLibros.total === 1 ? 'libro encontrado' : 'libros encontrados'}
                    </span>
                  </div>
                  <div className="h-4 w-px bg-blue-300 dark:bg-gray-500"></div>
                  <span className="text-xs text-blue-700 dark:text-gray-300 font-medium">
                    {selectedSeccion?.nombre}
                  </span>
                </div>
                {search && (
                  <div className="flex items-center space-x-2">
                    <Search className="w-3 h-3 text-blue-600" />
                    <span className="text-xs text-blue-700 dark:text-blue-300 bg-white/70 dark:bg-gray-700 px-2 py-1 rounded-lg font-medium">
                      "{search}"
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Tabla con estilo mejorado */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600">
                  <tr>
                    {['Título', 'Autor', 'ISBN', 'Ubicación', 'Ejemplares'].map((header) => (
                      <th key={header} className={`px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider ${header === 'Ejemplares' ? 'text-center' : ''}`}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {currentLibros.data.map((libro) => (
                    <LibroRow key={libro.id} libro={libro} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación mejorada */}
            {currentLibros.last_page > 1 && (
              <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handlePageChange(currentLibros.links[0].url)}
                    disabled={!currentLibros.links[0].url}
                    className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 
                               dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 
                               disabled:cursor-not-allowed transition-all duration-200 rounded-lg hover:bg-white 
                               dark:hover:bg-gray-700 hover:shadow-md border border-transparent hover:border-gray-200"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Anterior
                  </button>

                  <div className="flex items-center space-x-3 bg-white dark:bg-gray-800 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      Página {currentLibros.current_page} de {currentLibros.last_page}
                    </span>
                    <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {currentLibros.total} resultados
                    </span>
                  </div>

                  <button
                    onClick={() => handlePageChange(currentLibros.links[currentLibros.links.length - 1].url)}
                    disabled={!currentLibros.links[currentLibros.links.length - 1].url}
                    className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 
                               dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 
                               disabled:cursor-not-allowed transition-all duration-200 rounded-lg hover:bg-white 
                               dark:hover:bg-gray-700 hover:shadow-md border border-transparent hover:border-gray-200"
                  >
                    Siguiente
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : seccionId ? (
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-8">
            <EmptyState type="no-results" search={search} seccionId={seccionId} />
          </div>
        ) : null}

        {/* Información adicional mejorada */}
        {seccionId && currentLibros.data.length > 0 && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-xl px-4 py-3 backdrop-blur-sm">
              <div className="p-1.5 bg-blue-500 rounded-lg">
                <MapPin className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Utiliza la <strong>signatura topográfica</strong> para localizar físicamente el libro
              </span>
            </div>
          </div>
        )}

        {/* Footer con información adicional */}
      </div>
    </div>
  );
};

export default Index;