import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { X as XMarkIcon, ArrowLeft, Edit as EditIcon, Search, Loader2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

// Importar componentes reutilizables
import Modal from '@/components/Modal';
import AlertNotification from '@/components/AlertNotification';
import { Editorial } from './types';

type EditProps = {
  auth: {
    user: any;
  };
  editorial: Editorial;
  errors?: Record<string, string>;
};

export default function Edit({ auth, editorial, errors = {} }: EditProps) {
  // Estados para controlar modal y alertas
  const [showModal, setShowModal] = useState(false);
  const [alert, setAlert] = useState<{type: 'success' | 'error', message: string} | null>(null);
  
  // Datos iniciales para el formulario
  const initialData = {
    nombre: editorial.nombre,
    ciudad: editorial.ciudad || '',
    pais: editorial.pais || ''
  };

  // Estados para el país y ciudad
  const [selectedCountry, setSelectedCountry] = useState(editorial.pais || '');
  const [selectedCity, setSelectedCity] = useState(editorial.ciudad || '');

  // Estados para los selectores
  const [countries, setCountries] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  // Referencias para los dropdowns
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const cityDropdownRef = useRef<HTMLDivElement>(null);

  // Campos para el formulario de editoriales
  const editorialFields = [
    {
      name: 'nombre',
      label: 'Nombre',
      type: 'text',
      placeholder: 'Ingrese el nombre',
      required: true
    }
    // No incluimos los campos de país y ciudad aquí porque los reemplazaremos con nuestros selectores personalizados
  ];

  // Cargar países cuando se monta el componente
  useEffect(() => {
    fetchCountries();
    
    // Si hay un país seleccionado, cargar sus ciudades
    if (selectedCountry) {
      fetchCities(selectedCountry);
    }
  }, []);

  // Efecto para manejar clics fuera de los dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false);
      }
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
        setShowCityDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Función para obtener países
  const fetchCountries = async () => {
    setLoadingCountries(true);
    try {
      const response = await fetch('https://countriesnow.space/api/v0.1/countries');
      const data = await response.json();
      
      if (data && data.data) {
        const countryNames = data.data.map((country: any) => country.country);
        setCountries(countryNames.sort());
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
      setAlert({
        type: 'error',
        message: 'Error al cargar países. Por favor, intente nuevamente.'
      });
    } finally {
      setLoadingCountries(false);
    }
  };

  // Función para obtener ciudades
  const fetchCities = async (country: string) => {
    if (!country) return;
    
    setLoadingCities(true);
    setCities([]);
    
    try {
      const response = await fetch('https://countriesnow.space/api/v0.1/countries/cities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ country }),
      });
      
      const data = await response.json();
      
      if (data && data.data) {
        setCities(data.data.sort());
      }
    } catch (error) {
      console.error(`Error fetching cities for ${country}:`, error);
      setAlert({
        type: 'error',
        message: `Error al cargar ciudades de ${country}. Por favor, intente nuevamente.`
      });
    } finally {
      setLoadingCities(false);
    }
  };

  // Manejar selección de país
  const handleSelectCountry = (country: string) => {
    setSelectedCountry(country);
    setSelectedCity(''); // Resetear ciudad cuando cambia el país
    setCountrySearch('');
    setShowCountryDropdown(false);
    fetchCities(country);
  };

  // Manejar selección de ciudad
  const handleSelectCity = (city: string) => {
    setSelectedCity(city);
    setCitySearch('');
    setShowCityDropdown(false);
  };

  // Filtrar países por término de búsqueda
  const filteredCountries = countrySearch 
    ? countries.filter(country => 
        country.toLowerCase().includes(countrySearch.toLowerCase()))
    : countries;

  // Filtrar ciudades por término de búsqueda
  const filteredCities = citySearch 
    ? cities.filter(city => 
        city.toLowerCase().includes(citySearch.toLowerCase()))
    : cities;

  // Manejador para enviar el formulario en la página
  const handleSubmit = (formData: any) => {
    // Agregar país y ciudad a los datos del formulario
    formData.pais = selectedCountry;
    formData.ciudad = selectedCity;

    router.put(`/editoriales/${editorial.id}`, formData, {
      onSuccess: () => {
        setAlert({
          type: 'success',
          message: 'Editorial actualizada correctamente'
        });
        
        // Redirigir después de mostrar la alerta
        setTimeout(() => {
          router.visit('/editoriales');
        }, 2000);
      },
      onError: () => {
        setAlert({
          type: 'error',
          message: 'Hubo un error al actualizar la editorial'
        });
      }
    });
  };

  // Función específica para manejar la actualización desde el modal
  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Obtener los datos del formulario directamente del DOM
    const form = document.getElementById('modalForm') as HTMLFormElement;
    const formData = new FormData(form);
    const data = {
      nombre: formData.get('nombre') as string,
      ciudad: selectedCity, // Usar valor del selector
      pais: selectedCountry  // Usar valor del selector
    };
    
    // Enviar la solicitud con los datos obtenidos
    router.put(`/editoriales/${editorial.id}`, data, {
      onSuccess: () => {
        setShowModal(false);
        setAlert({
          type: 'success',
          message: 'Editorial actualizada correctamente'
        });
        
        setTimeout(() => {
          router.visit('/editoriales');
        }, 2000);
      },
      onError: () => {
        setAlert({
          type: 'error',
          message: 'Hubo un error al actualizar la editorial'
        });
      }
    });
  };

  // Cancelar y volver a la lista
  const handleCancel = () => {
    router.visit('/editoriales');
  };

  // Contenido rediseñado con nuevos colores y efectos
  const content = (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none fixed">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-amber-500/5 blur-3xl dark:bg-amber-600/10"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-amber-500/5 blur-3xl dark:bg-amber-600/10"></div>
      </div>
      
      {/* Header con título y botones */}
      <div className="flex justify-between items-center mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <Link
            href="/editoriales"
            className="bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200
                      p-2 rounded-full shadow-md transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">
            Editar Editorial
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white
                     px-4 py-2 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2"
          >
            <EditIcon className="w-4 h-4" />
            <span>Editar en Modal</span>
          </button>
          <Link
            href="/editoriales"
            className="bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200
                      p-2 rounded-full shadow-md transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <XMarkIcon className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Tarjeta principal con formulario */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden relative z-10">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-5 text-white">
          <h2 className="text-xl font-semibold">Editar Editorial</h2>
          <p className="text-white/70 text-sm mt-1">
            ID: {editorial.id} - {editorial.nombre}
          </p>
        </div>
        
        <div className="p-6">
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const data: Record<string, any> = {};
            formData.forEach((value, key) => {
              data[key] = value;
            });
            handleSubmit(data);
          }} className="space-y-5">
            {/* Campo Nombre */}
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                defaultValue={initialData.nombre}
                placeholder="Ingrese el nombre de la editorial"
                required
                className="block w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50
                  border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                  placeholder-gray-400 focus:border-amber-500 transition-colors duration-200"
              />
              {errors.nombre && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.nombre}</p>
              )}
            </div>

            {/* Campo País con dropdown */}
            <div ref={countryDropdownRef}>
              <label htmlFor="pais" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                País
              </label>
              <div className="relative">
                <div className="flex">
                  <input
                    id="pais"
                    name="pais"
                    type="text"
                    value={selectedCountry}
                    onChange={(e) => {
                      setSelectedCountry(e.target.value);
                      setCountrySearch(e.target.value);
                      setShowCountryDropdown(true);
                    }}
                    onClick={() => setShowCountryDropdown(true)}
                    placeholder="Buscar y seleccionar país"
                    className="block w-full px-4 py-3 border rounded-lg rounded-r-none shadow-sm
                      border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                      placeholder-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500 transition-colors duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    className="px-3 bg-gray-100 dark:bg-gray-600 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-lg
                            hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                  >
                    <Search className="w-5 h-5 text-gray-500 dark:text-gray-300" />
                  </button>
                </div>
                
                {/* Dropdown de países */}
                {showCountryDropdown && (
                  <div className="absolute z-40 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                                rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {loadingCountries ? (
                      <div className="flex items-center justify-center p-4 text-gray-500 dark:text-gray-400">
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        <span>Cargando países...</span>
                      </div>
                    ) : filteredCountries.length > 0 ? (
                      <ul className="py-1">
                        {filteredCountries.map((country, index) => (
                          <li
                            key={`country-${index}`}
                            onClick={() => handleSelectCountry(country)}
                            className="px-4 py-2 hover:bg-amber-50 dark:hover:bg-gray-700 cursor-pointer transition-colors
                                    text-gray-700 dark:text-gray-300"
                          >
                            {country}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        No se encontraron países que coincidan
                      </div>
                    )}
                  </div>
                )}
              </div>
              {errors.pais && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.pais}</p>
              )}
            </div>

            {/* Campo Ciudad con dropdown */}
            <div ref={cityDropdownRef}>
              <label htmlFor="ciudad" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ciudad
              </label>
              <div className="relative">
                <div className="flex">
                  <input
                    id="ciudad"
                    name="ciudad"
                    type="text"
                    value={selectedCity}
                    onChange={(e) => {
                      setSelectedCity(e.target.value);
                      setCitySearch(e.target.value);
                      if (selectedCountry) {
                        setShowCityDropdown(true);
                      }
                    }}
                    onClick={() => {
                      if (selectedCountry) {
                        setShowCityDropdown(true);
                      } else {
                        setAlert({
                          type: 'error',
                          message: 'Por favor, seleccione un país primero'
                        });
                      }
                    }}
                    placeholder={selectedCountry ? "Buscar y seleccionar ciudad" : "Primero seleccione un país"}
                    disabled={!selectedCountry}
                    className={`block w-full px-4 py-3 border rounded-lg rounded-r-none shadow-sm
                      border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                      placeholder-gray-400 transition-colors duration-200
                      ${selectedCountry 
                        ? "focus:border-amber-500 focus:ring-2 focus:ring-amber-500" 
                        : "opacity-60 cursor-not-allowed"}`}
                  />
                  <button
                    type="button"
                    disabled={!selectedCountry}
                    onClick={() => {
                      if (selectedCountry) {
                        setShowCityDropdown(!showCityDropdown);
                      } else {
                        setAlert({
                          type: 'error',
                          message: 'Por favor, seleccione un país primero'
                        });
                      }
                    }}
                    className={`px-3 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-lg
                            ${selectedCountry 
                              ? "bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500" 
                              : "bg-gray-100 dark:bg-gray-700 opacity-60 cursor-not-allowed"} 
                            transition-colors`}
                  >
                    <Search className="w-5 h-5 text-gray-500 dark:text-gray-300" />
                  </button>
                </div>
                
                {/* Dropdown de ciudades */}
                {showCityDropdown && selectedCountry && (
                  <div className="absolute z-40 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                                rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {loadingCities ? (
                      <div className="flex items-center justify-center p-4 text-gray-500 dark:text-gray-400">
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        <span>Cargando ciudades de {selectedCountry}...</span>
                      </div>
                    ) : filteredCities.length > 0 ? (
                      <ul className="py-1">
                        {filteredCities.map((city, index) => (
                          <li
                            key={`city-${index}`}
                            onClick={() => handleSelectCity(city)}
                            className="px-4 py-2 hover:bg-amber-50 dark:hover:bg-gray-700 cursor-pointer transition-colors
                                    text-gray-700 dark:text-gray-300"
                          >
                            {city}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        {citySearch 
                          ? `No se encontraron ciudades que coincidan con "${citySearch}"` 
                          : `No se encontraron ciudades para ${selectedCountry}`}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {errors.ciudad && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.ciudad}</p>
              )}
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end space-x-3 pt-6">
              <button
                type="button"
                onClick={handleCancel}
                className="px-5 py-2.5 text-sm font-medium rounded-lg shadow-sm
                  bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                  border border-gray-300 dark:border-gray-600
                  hover:bg-gray-50 dark:hover:bg-gray-600
                  focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-sm font-medium rounded-lg shadow-sm
                  bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white
                  focus:outline-none focus:ring-2 focus:ring-amber-500
                  disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5"
              >
                Actualizar
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal con formulario directo para asegurar que se muestren todos los campos */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Editar Editorial"
      >
        <form id="modalForm" onSubmit={handleModalSubmit} className="space-y-4">
          {/* Campo Nombre */}
          <div>
            <label 
              htmlFor="modal-nombre" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              id="modal-nombre"
              name="nombre"
              type="text"
              defaultValue={initialData.nombre}
              required
              className="block w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            {errors.nombre && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.nombre}</p>
            )}
          </div>

          {/* Campo País */}
          <div>
            <label 
              htmlFor="modal-pais" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              País
            </label>
            <input
              id="modal-pais"
              name="pais"
              type="text"
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              onClick={() => setShowModal(false)} // Cerrar modal para mostrar dropdown principal
              className="block w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            {errors.pais && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.pais}</p>
            )}
            <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
              Haga clic para seleccionar un país del listado
            </p>
          </div>

          {/* Campo Ciudad */}
          <div>
            <label 
              htmlFor="modal-ciudad" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Ciudad
            </label>
            <input
              id="modal-ciudad"
              name="ciudad"
              type="text"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              onClick={() => {
                if (selectedCountry) {
                  setShowModal(false); // Cerrar modal para mostrar dropdown principal
                } else {
                  setAlert({
                    type: 'error',
                    message: 'Por favor, seleccione un país primero'
                  });
                }
              }}
              className="block w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            {errors.ciudad && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.ciudad}</p>
            )}
            {selectedCountry && (
              <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                Haga clic para seleccionar una ciudad del listado
              </p>
            )}
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
            >
              Actualizar
            </button>
          </div>
        </form>
      </Modal>

      {/* Alerta de notificación */}
      {alert && (
        <AlertNotification
          type={alert.type}
          message={alert.message}
          position="top-right"
          autoClose={true}
          duration={4000}
          onClose={() => setAlert(null)}
        />
      )}
    </div>
  );

  return (
    <AppLayout>
      <Head title={`Editar Editorial: ${editorial.nombre}`} />
      <div className="bg-slate-50 dark:bg-gray-900 min-h-screen">
        {content}
      </div>
    </AppLayout>
  );
}