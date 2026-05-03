import axios from 'axios';

const API = import.meta.env.VITE_API_URL || '';

const api = axios.create({
    baseURL: API,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
});

// Handle 401 globally — clear local storage and redirect
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            if (error.response?.data?.message === 'Session expired. Logged in from another device.') {
                alert('You were logged out because your account was used on another device');
            }
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
