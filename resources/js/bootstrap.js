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

// Interceptor para responses - maneja errores 419 automáticamente
window.axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 419) {
            console.log('🔄 Token CSRF expirado - refrescando página automáticamente...');
            // Mostrar notificación opcional antes de recargar
            // alert('La sesión ha expirado. La página se recargará automáticamente.');
            window.location.reload();
        }
        return Promise.reject(error);
    }
);

// Log para confirmar que bootstrap se cargó
console.log('✅ Bootstrap CSRF configurado correctamente');