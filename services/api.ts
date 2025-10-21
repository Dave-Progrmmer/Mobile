// services/api.ts
const API_BASE_URL = 'https://sol-coral.vercel.app';

// Helper function for API calls
async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = global.authToken;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// Users/Auth APIs
export const usersAPI = {
  register: (data: { name: string; email: string; password: string; phoneNumber?: string }) =>
    apiCall('/api/users/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  login: (email: string, password: string) =>
    apiCall<{ token: string; _id: string; name: string; email: string; role: string }>('/api/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  
  getProfile: () =>
    apiCall('/api/users/profile'),
  
  updateProfile: (data: any) =>
    apiCall('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  getAllUsers: () =>
    apiCall('/api/users'),
};

// Announcements APIs
export const announcementsAPI = {
  getAll: () =>
    apiCall('/api/announcements'),
  
  getById: (id: string) =>
    apiCall(`/api/announcements/${id}`),
  
  create: (data: { title: string; content: string; priority?: string; expiresAt?: string }) =>
    apiCall('/api/announcements', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: any) =>
    apiCall(`/api/announcements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string) =>
    apiCall(`/api/announcements/${id}`, { method: 'DELETE' }),
};

// Events APIs
export const eventsAPI = {
  getAll: () =>
    apiCall('/api/events'),
  
  getById: (id: string) =>
    apiCall(`/api/events/${id}`),
  
  create: (data: { title: string; description: string; startAt: string; endAt?: string; location: string }) =>
    apiCall('/api/events', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: any) =>
    apiCall(`/api/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string) =>
    apiCall(`/api/events/${id}`, { method: 'DELETE' }),
};

// Quizzes APIs  
export const quizzesAPI = {
  getAll: () =>
    apiCall('/api/quizzes'),
  
  getById: (id: string) =>
    apiCall(`/api/quizzes/${id}`),
  
  create: (data: { question: string; options: string[]; correctIndex: number; explanation?: string; tags?: string[] }) =>
    apiCall('/api/quizzes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: any) =>
    apiCall(`/api/quizzes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string) =>
    apiCall(`/api/quizzes/${id}`, { method: 'DELETE' }),
  
  submitAnswer: (id: string, selectedIndex: number) =>
    apiCall(`/api/quizzes/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify({ selectedIndex }),
    }),
};

// Sermons APIs
export const sermonsAPI = {
  getAll: () =>
    apiCall('/api/sermons'),
  
  getById: (id: string) =>
    apiCall(`/api/sermons/${id}`),
  
  create: (data: { title: string; speaker: string; description?: string; mediaUrl: string; mediaType: 'video' | 'audio'; thumbnailUrl?: string; publishedAt?: string }) =>
    apiCall('/api/sermons', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: any) =>
    apiCall(`/api/sermons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string) =>
    apiCall(`/api/sermons/${id}`, { method: 'DELETE' }),
};

// Prayer Requests APIs
export const prayersAPI = {
  getAll: () =>
    apiCall('/api/prayers'),
  
  getMyPrayers: () =>
    apiCall('/api/prayers/my-prayers'),
  
  getById: (id: string) =>
    apiCall(`/api/prayers/${id}`),
  
  create: (data: { message: string; fromName?: string }) =>
    apiCall('/api/prayers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string) =>
    apiCall(`/api/prayers/${id}`, { method: 'DELETE' }),
  
  markAsAnswered: (id: string) =>
    apiCall(`/api/prayers/${id}/answer`, { method: 'PUT' }),
};