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

// Interceptor - loguje odpowiedzi
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

// Products
export const productApi = {
  getAll: () => api.get('/products'),
  getById: (id: number) => api.get(`/products/${id}`),
  getMyProducts: () => api.get('/products/my'),
  create: (data: any) => api.post('/products', data),
  update: (id: number, data: any) => api.put(`/products/${id}`, data),
  delete: (id: number) => api.delete(`/products/${id}`),
  searchByLocation: (lat: number, lon: number, radius: number) => 
    api.get(`/products/search?latitude=${lat}&longitude=${lon}&radius=${radius}`),
};

// Auth
export const authApi = {
  register: (data: { email: string; password: string; name: string; phone?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// User
export const userApi = {
  updateProfile: (data: { name: string; email: string; phone?: string; avatar?: string }) =>
    api.put('/auth/profile', data),
};

// ✨ Transactions
export const transactionApi = {
  // Rozpocznij transakcję (kupujący klika "Kup")
  create: (productId: number, message?: string) => 
    api.post('/transactions', { productId, message }),
  
  // Pobierz moje transakcje
  getMyTransactions: () => api.get('/transactions/my'),
  
  // Pobierz szczegóły transakcji
  getById: (id: number) => api.get(`/transactions/${id}`),
  
  // Zaakceptuj transakcję (sprzedający)
  accept: (id: number) => api.put(`/transactions/${id}/accept`),
  
  // Oznacz jako ukończoną (sprzedający)
  complete: (id: number) => api.put(`/transactions/${id}/complete`),
  
  // Anuluj transakcję
  cancel: (id: number, reason?: string) => api.put(`/transactions/${id}/cancel`, { reason }),
  
  // Pobierz transakcje produktu (dla sprzedającego)
  getProductTransactions: (productId: number) => api.get(`/transactions/product/${productId}`),
};

// ✨ Messages
export const messageApi = {
  // Wyślij wiadomość
  sendMessage: (data: { receiverId: number; content: string; productId?: number }) =>
    api.post('/messages', data),
  
  // Pobierz wszystkie konwersacje
  getConversations: () => api.get('/messages/conversations'),
  
  // Pobierz wiadomości z konkretną osobą
  getMessages: (otherUserId: number) => api.get(`/messages/${otherUserId}`),
  
  // Liczba nieprzeczytanych
  getUnreadCount: () => api.get('/messages/unread/count'),
};

// ⭐ Reviews - NOWE
export const reviewApi = {
  // Dodaj opinię
  create: (data: { transactionId: number; rating: number; comment?: string }) =>
    api.post('/reviews', data),
  
  // Pobierz opinie o użytkowniku
  getUserReviews: (userId: number) => api.get(`/reviews/user/${userId}`),
  
  // Pobierz statystyki opinii użytkownika
  getUserReviewStats: (userId: number) => api.get(`/reviews/user/${userId}/stats`),
  
  // Sprawdź czy można dodać opinię
  canReview: (transactionId: number) => api.get(`/reviews/can-review/${transactionId}`),
  
  // Usuń opinię
  delete: (reviewId: number) => api.delete(`/reviews/${reviewId}`),
};