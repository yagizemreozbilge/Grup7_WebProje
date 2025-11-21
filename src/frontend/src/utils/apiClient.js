import axios from 'axios';
import { getStoredAuth, clearStoredAuth } from './auth';

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'https://grup7-api-404670274592.europe-west1.run.app';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const auth = getStoredAuth();

  if (auth?.token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${auth.token}`,
    };
  }

  if (!config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json';
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearStoredAuth();
    }
    return Promise.reject(error);
  }
);

export default apiClient;

