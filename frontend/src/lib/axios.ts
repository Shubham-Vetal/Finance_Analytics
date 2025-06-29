import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

// ✅ Interceptor no longer sets Authorization header
instance.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

export default instance;
