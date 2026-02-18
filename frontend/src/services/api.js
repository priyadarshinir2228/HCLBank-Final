import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

export const accountService = {
  getMyAccount: () => api.get('/account/my-account'),
  deposit: (data) => api.post('/account/deposit', data),
};

export const userService = {
  searchByUpi: (upiId) => api.get(`/users/search?upiId=${upiId}`),
  getAllSearchable: () => api.get('/users/all'),
  submitKyc: () => api.post('/users/kyc/submit'),
  getAll: () => api.get('/users'),
  updateKycStatus: (id, status) => api.put(`/users/${id}/kyc-status?status=${status}`),
};

export const transactionService = {
  getHistory: (accountId) => {
    if (accountId === null || accountId === undefined || Number.isNaN(Number(accountId))) {
      return Promise.reject(new Error('Account ID is missing'));
    }
    return api.get(`/transactions/history/${accountId}`);
  },
  transfer: (data) => api.post('/transactions/transfer', data),
};

export const getApiErrorMessage = (error, fallbackMessage = 'Something went wrong') => {
  if (!error) return fallbackMessage;

  const data = error.response?.data;
  if (typeof data === 'string' && data.trim()) return data;
  if (data?.message) return data.message;
  if (error.message) return error.message;

  return fallbackMessage;
};

export default api;
