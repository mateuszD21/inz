import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

console.log('API configured with base URL:', API_URL);

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor - automatycznie dodaje token do requestów
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log('API Request:', config.method?.toUpperCase(), config.url);
  console.log('Token:', token ? 'EXISTS' : 'MISSING');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export const productApi = {
  getAll: () => api.get('/products'),
  getById: (id: number) => api.get(`/products/${id}`),
  getMyProducts: () => api.get('/products/my'),
  create: (data: any) => api.post('/products', data),
  update: (id: number, data: any) => api.put(`/products/${id}`, data),
  delete: (id: number) => api.delete(`/products/${id}`),
  
  
  searchByLocation: (params: URLSearchParams) => 
    api.get(`/products/search?${params.toString()}`),
};

// Auth
export const authApi = {
  register: (data: { email: string; password: string; name: string; phone?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/change-password', data),
};

// User
export const userApi = {
  updateProfile: (data: { name: string; email: string; phone?: string; avatar?: string }) =>
    api.put('/auth/profile', data),
};

// Transactions
export const transactionApi = {
  create: (productId: number, message?: string) => 
    api.post('/transactions', { productId, message }),
  getMyTransactions: () => api.get('/transactions/my'),
  getById: (id: number) => api.get(`/transactions/${id}`),
  accept: (id: number) => api.put(`/transactions/${id}/accept`),
  complete: (id: number) => api.put(`/transactions/${id}/complete`),
  cancel: (id: number, reason?: string) => api.put(`/transactions/${id}/cancel`, { reason }),
  getProductTransactions: (productId: number) => api.get(`/transactions/product/${productId}`),
};

// Messages
export const messageApi = {
  sendMessage: (data: { receiverId: number; content: string; productId?: number }) =>
    api.post('/messages', data),
  getConversations: () => api.get('/messages/conversations'),
  getMessages: (otherUserId: number) => api.get(`/messages/${otherUserId}`),
  getUnreadCount: () => api.get('/messages/unread/count'),
};

// Reviews
export const reviewApi = {
  create: (data: { transactionId: number; rating: number; comment?: string }) =>
    api.post('/reviews', data),
  getUserReviews: (userId: number) => api.get(`/reviews/user/${userId}`),
  getUserReviewStats: (userId: number) => api.get(`/reviews/user/${userId}/stats`),
  canReview: (transactionId: number) => api.get(`/reviews/can-review/${transactionId}`),
  delete: (reviewId: number) => api.delete(`/reviews/${reviewId}`),
};