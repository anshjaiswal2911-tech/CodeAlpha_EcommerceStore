import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach Bearer token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If expired token, clear storage if needed
      // Do not clear on public requests that failed auth
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// User Services
export const userService = {
  getProfile: (username) => api.get(`/users/profile/${username}`),
  updateProfile: (data) => api.put('/users/profile', data),
  toggleFollow: (userId) => api.post(`/users/${userId}/follow`),
  getSuggested: () => api.get('/users/suggested'),
  searchUsers: (query) => api.get(`/users/search?q=${encodeURIComponent(query)}`),
};

// Post Services
export const postService = {
  getFeed: (params) => api.get('/posts', { params }),
  getPost: (id) => api.get(`/posts/${id}`),
  createPost: (data) => api.post('/posts', data),
  deletePost: (id) => api.delete(`/posts/${id}`),
  toggleLike: (id) => api.post(`/posts/${id}/like`),
};

// Comment Services
export const commentService = {
  getComments: (postId) => api.get(`/posts/${postId}/comments`),
  addComment: (postId, data) => api.post(`/posts/${postId}/comments`, data),
  deleteComment: (commentId) => api.delete(`/comments/${commentId}`),
};

export default api;
