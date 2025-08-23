import axios from 'axios';

window.axios = axios;

// Función para obtener el token CSRF actual
const getCsrfToken = () => {
    return document.head.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
};

// Configurar interceptores para manejar automáticamente el token CSRF
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Interceptor para requests - usa siempre el token más reciente
window.axios.interceptors.request.use((config) => {
    const token = getCsrfToken();
    if (token) {
        config.headers['X-CSRF-TOKEN'] = token;
    }
    return config;
});

// Función para refrescar el token CSRF sin recargar la página
const refreshCsrfToken = async () => {
    try {
        // Solicitar un nuevo token CSRF
        const response = await fetch('/csrf-refresh', {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'same-origin'
        });
        
        if (response.ok) {
            const data = await response.json();
            // Actualizar el token en el DOM
            const metaTag = document.head.querySelector('meta[name="csrf-token"]');
            if (metaTag && data.token) {
                metaTag.setAttribute('content', data.token);
                return true;
            }
        }
        return false;
    } catch (error) {
        console.error('Error al refrescar el token CSRF:', error);
        return false;
    }
};

// Interceptor para responses - maneja errores 419 con refresco de token
window.axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 419) {
            console.log('🔄 Token CSRF expirado - intentando refrescar token...');
            
            // Intentar refrescar el token
            const refreshed = await refreshCsrfToken();
            
            if (refreshed) {
                // Si se refrescó correctamente, reintentar la solicitud original
                console.log('✅ Token CSRF actualizado, reintentando solicitud...');
                const originalRequest = error.config;
                // Actualizar el token en la solicitud original
                originalRequest.headers['X-CSRF-TOKEN'] = getCsrfToken();
                return axios(originalRequest);
            } else {
                // Si no se pudo refrescar, recargar la página como último recurso
                console.log('❌ No se pudo refrescar el token, recargando página...');
                window.location.reload();
            }
        }
        return Promise.reject(error);
    }
);

// Log para confirmar que bootstrap se cargó
console.log('✅ Bootstrap CSRF configurado correctamente');