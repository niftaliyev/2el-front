import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Base URL for all API requests
// Local  Docker: 'http://localhost:5000/api/'
// Local: 'http://localhost:5156/api/'
// Production: 'http://84.247.184.186:5000/api/'
// Dəyər .env faylından NEXT_PUBLIC_API_URL olaraq oxunacaq
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://84.247.184.186:5000/api/';

// Create axios instance with default config
const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to requests
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from storage (check both)
    const token = typeof window !== 'undefined' 
      ? (localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')) 
      : null;

    // Add token to headers if it exists
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // For FormData, let axios set Content-Type automatically with boundary
    if (config.data instanceof FormData && config.headers) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle common errors and token refresh
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token (check both storages)
        const refreshToken = typeof window !== 'undefined' 
          ? (localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken')) 
          : null;

        if (refreshToken) {
          const response = await axios.post(`${BASE_URL}auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;

          // Save new tokens to the SAME storage they were in
          if (typeof window !== 'undefined') {
            const storage = localStorage.getItem('refreshToken') ? localStorage : sessionStorage;
            storage.setItem('accessToken', accessToken);
            if (newRefreshToken) {
              storage.setItem('refreshToken', newRefreshToken);
            }
          }

          // Retry the original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }

          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - clear tokens and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          sessionStorage.removeItem('accessToken');
          sessionStorage.removeItem('refreshToken');
          sessionStorage.removeItem('user');
          window.location.href = '/auth/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    if (error.response) {
      // Server responded with error status
      const data = error.response.data as any;
      let message = 'Bir xəta baş verdi';

      if (data && typeof data === 'object') {
        if (data.errors) {
          message = Object.values(data.errors).flat().join(', ');
          (error as any).validationErrors = data.errors;
        } else {
          message = data.message || data.title || 'Bir xəta baş verdi';
        }
      } else if (typeof data === 'string') {
        message = data;
      }

      error.message = message;
    } else if (error.request) {
      error.message = 'Serverə qoşulmaq mümkün olmadı';
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
