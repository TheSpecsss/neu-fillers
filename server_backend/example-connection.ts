import axios from 'axios';

const API_URL = 'http://localhost:3003/api';

// Create an axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // or however you store your token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Example functions to interact with the API
export const auth = {
  // Register a new user
  register: async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => {
    const response = await api.post('/users/register', userData);
    return response.data;
  },

  // Login user
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/users/login', credentials);
    // Store the token
    localStorage.setItem('token', response.data.token);
    return response.data;
  },

  // Get user profile
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
  }
};

// Usage example:
async function example() {
  try {
    // Register
    const newUser = await auth.register({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123'
    });
    console.log('Registered:', newUser);

    // Login
    const loggedIn = await auth.login({
      email: 'john@example.com',
      password: 'password123'
    });
    console.log('Logged in:', loggedIn);

    // Get profile
    const profile = await auth.getProfile();
    console.log('Profile:', profile);

    // Logout
    auth.logout();
  } catch (error) {
    console.error('Error:', error);
  }
} 