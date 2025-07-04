// src/lib/axios.ts
import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://finance-analytics-backend.onrender.com',
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
  },
});

export default instance;
