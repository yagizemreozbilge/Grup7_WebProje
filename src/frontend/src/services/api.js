import axios from 'axios';

// Backend API base URL - backend port 3000'de çalışıyor
const API_BASE_URL = 'http://localhost:3000';

// Axios instance oluştur
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - her istekte token'ı header'a ekle
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - hata yönetimi
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 401 Unauthorized hatası - token geçersiz veya süresi dolmuş
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/giris-yap';
    }
    return Promise.reject(error);
  }
);

// API fonksiyonları

// Kullanıcı işlemleri
export const authAPI = {
  // Giriş yap
  login: async (email, password) => {
    const response = await api.post('/users/auth', { email, password });
    return response.data;
  },

  // Kayıt ol
  register: async (userData) => {
    const response = await api.post('/users/register', userData);
    return response.data;
  },
};

// Saha (Field) işlemleri
export const fieldsAPI = {
  // Tüm sahaları getir
  getAll: async () => {
    const response = await api.get('/fields');
    return response.data;
  },

  // Saha ekle
  add: async (fieldData) => {
    const response = await api.post('/fields/add', fieldData);
    return response.data;
  },

  // Saha güncelle
  update: async (fieldData) => {
    const response = await api.post('/fields/update', fieldData);
    return response.data;
  },

  // Saha sil
  delete: async (fieldId) => {
    const response = await api.post('/fields/delete', { _id: fieldId });
    return response.data;
  },
};

// Rezervasyon işlemleri
export const reservationsAPI = {
  // Tüm rezervasyonları getir
  getAll: async () => {
    const response = await api.get('/reservations');
    return response.data;
  },

  // Rezervasyon ekle
  add: async (reservationData) => {
    const response = await api.post('/reservations/add', reservationData);
    return response.data;
  },

  // Rezervasyon güncelle
  update: async (reservationData) => {
    const response = await api.post('/reservations/update', reservationData);
    return response.data;
  },

  // Rezervasyon sil
  delete: async (reservationId) => {
    const response = await api.post('/reservations/delete', { _id: reservationId });
    return response.data;
  },
};

// Roller işlemleri
export const rolesAPI = {
  // Tüm rolleri getir (public endpoint olabilir)
  getAll: async () => {
    const response = await api.get('/roles');
    return response.data;
  },
};

export default api;

