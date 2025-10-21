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
  register: (data: { name: string; email: string; password: string; phone?: string }) =>
    apiCall('/api/users/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  login: (email: string, password: string) =>
    apiCall<{ token: string; user: any }>('/api/users/login', {
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
  
  getAll: () =>
    apiCall<{ users: any[] }>('/api/users'),
  
  getById: (id: string) =>
    apiCall(`/api/users/${id}`),
  
  updateUser: (id: string, data: any) =>
    apiCall(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  deleteUser: (id: string) =>
    apiCall(`/api/users/${id}`, { method: 'DELETE' }),
};

// Announcements APIs
export const announcementsAPI = {
  getAll: () =>
    apiCall<{ announcements: any[] }>('/api/announcements'),
  
  getById: (id: string) =>
    apiCall(`/api/announcements/${id}`),
  
  create: (data: { title: string; content: string; priority?: string }) =>
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
    apiCall<{ events: any[] }>('/api/events'),
  
  getById: (id: string) =>
    apiCall(`/api/events/${id}`),
  
  create: (data: { title: string; description: string; date: string; location: string; type?: string }) =>
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
  
  register: (id: string) =>
    apiCall(`/api/events/${id}/register`, { method: 'POST' }),
  
  unregister: (id: string) =>
    apiCall(`/api/events/${id}/unregister`, { method: 'POST' }),
  
  getRegistrations: (id: string) =>
    apiCall(`/api/events/${id}/registrations`),
};

// Quizzes APIs
export const quizzesAPI = {
  getAll: () =>
    apiCall<{ quizzes: any[] }>('/api/quizzes'),
  
  getById: (id: string) =>
    apiCall(`/api/quizzes/${id}`),
  
  create: (data: { title: string; description: string; questions: any[] }) =>
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
  
  submitAnswer: (id: string, answers: any) =>
    apiCall(`/api/quizzes/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    }),
  
  getResults: (id: string) =>
    apiCall(`/api/quizzes/${id}/results`),
};

// Sermons APIs
export const sermonsAPI = {
  getAll: () =>
    apiCall<{ sermons: any[] }>('/api/sermons'),
  
  getById: (id: string) =>
    apiCall(`/api/sermons/${id}`),
  
  create: (data: { title: string; preacher: string; date: string; videoUrl?: string; audioUrl?: string; notes?: string }) =>
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
    apiCall<{ prayers: any[] }>('/api/prayers'),
  
  getById: (id: string) =>
    apiCall(`/api/prayers/${id}`),
  
  create: (data: { title: string; description: string; isAnonymous?: boolean }) =>
    apiCall('/api/prayers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: any) =>
    apiCall(`/api/prayers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string) =>
    apiCall(`/api/prayers/${id}`, { method: 'DELETE' }),
  
  addPrayer: (id: string) =>
    apiCall(`/api/prayers/${id}/pray`, { method: 'POST' }),
  
  markAsAnswered: (id: string) =>
    apiCall(`/api/prayers/${id}/answered`, { method: 'PUT' }),
};