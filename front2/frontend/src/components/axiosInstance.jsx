import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://146.83.198.35:1258/';

const AxiosInstance = axios.create({
    baseURL: baseURL,
    timeout: 5000, 
    headers: {
        "Content-Type": "application/json",
        accept: "application/json"
    }
});

AxiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('Token');
        if (token) {
            config.headers.Authorization = `Token ${token}`;
        } else {
            config.headers.Authorization = ``;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

AxiosInstance.interceptors.response.use(
    (response) => {
        return response;
    }, 
    (error) => {
        if (error.response) {
            // Manejo específico para errores 401 (No autorizado)
            if (error.response.status === 401) {
                localStorage.removeItem('Token');
                localStorage.removeItem('user');
            }
            
            // Para otros errores, incluido el 403, simplemente rechazamos la promesa
            // con el error completo para que sea manejado en el componente
            return Promise.reject(error);
        } else if (error.request) {
            // La solicitud fue hecha pero no se recibió respuesta
            error.response = {
                status: 0,
                data: { message: "No se recibió respuesta del servidor" }
            };
        } else {
            // Error al configurar la solicitud
            error.response = {
                status: 0,
                data: { message: "Error de configuración de la solicitud" }
            };
        }
        
        return Promise.reject(error);
    }
);

export default AxiosInstance;
