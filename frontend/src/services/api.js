const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Helper to make API requests with JSON parsing and error handling
 */
const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('codealpha_token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
};

// Auth API
export const apiLogin = (email, password) =>
  request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const apiRegister = (name, email, password) =>
  request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });

export const apiGetProfile = () =>
  request('/auth/profile', { method: 'GET' });

// Products API
export const apiGetProducts = (keyword = '', category = '') => {
  const params = new URLSearchParams();
  if (keyword) params.append('keyword', keyword);
  if (category && category !== 'All') params.append('category', category);
  const queryString = params.toString() ? `?${params.toString()}` : '';
  return request(`/products${queryString}`, { method: 'GET' });
};

export const apiGetProductById = (id) =>
  request(`/products/${id}`, { method: 'GET' });

// Orders API
export const apiCreateOrder = (orderData) =>
  request('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });

export const apiGetMyOrders = () =>
  request('/orders/myorders', { method: 'GET' });

export const apiGetOrderById = (id) =>
  request(`/orders/${id}`, { method: 'GET' });

// Health API
export const apiHealthCheck = () =>
  request('/health', { method: 'GET' });
