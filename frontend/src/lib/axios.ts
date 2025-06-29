import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, 
  withCredentials: true, 
});

// Add the interceptor
instance.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);


export default instance; // ✅ Only one default export
