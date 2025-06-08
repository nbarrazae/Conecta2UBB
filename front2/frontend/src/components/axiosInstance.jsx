import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/';

const AxiosInstance = axios.create({
    baseURL: baseURL,
    timeout: 10000, // 10 seconds timeout
    headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
    }

});

export default AxiosInstance;