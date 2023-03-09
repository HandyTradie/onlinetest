/// <reference types="vite/client" />

import defaultAxios from 'axios';
import { getAuthToken } from '../firebase/auth';

export const baseURL = import.meta.env.DEV
  ? 'http://localhost:5001/quizmine-a809e/us-central1/onlineTestAPI'
  : 'https://us-central1-quizmine-a809e.cloudfunctions.net/onlineTestAPI';

export const axios = defaultAxios.create({
  baseURL
});

// Add auth token to request headers.
axios.interceptors.request.use(async (config) => {
  const token = await getAuthToken();

  if (token && config?.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const axiosWithoutInterceptor = defaultAxios.create({
  baseURL
});
