// Configuration for different environments
const API_CONFIG = {
  development: {
    // Use your computer's IP address here
    // This should match the network your phone and computer are on
    baseUrl: 'http://192.168.1.3:5000/api'
  },
  production: {
    // Update with your production API URL when deployed
    baseUrl: 'http://192.168.1.3:5000/api'
  }
};

// Get the appropriate base URL based on environment
const getBaseURL = () => {
  const env = process.env.NODE_ENV || 'development';
  return API_CONFIG[env]?.baseUrl || API_CONFIG.development.baseUrl;
};

const API_BASE_URL = getBaseURL();

console.log('API Base URL:', API_BASE_URL);

// Helper function to make API requests
const apiRequest = async (endpoint, method = 'GET', data = null) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  try {
    console.log(`Making ${method} request to: ${url}`, data ? { body: data } : '');
    const response = await fetch(url, options);
    
    // Handle case where there's no response body
    let result;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.indexOf('application/json') !== -1) {
      result = await response.json();
    } else {
      result = { message: await response.text() };
    }
    
    if (!response.ok) {
      throw new Error(result.message || `HTTP Error: ${response.status} ${response.statusText}`);
    }
    
    console.log('API Response:', result);
    return result;
  } catch (error) {
    console.error('API Request Error:', error);
    
    // Provide more specific error messages
    if (error.name === 'TypeError' && error.message === 'Network request failed') {
      throw new Error('Unable to connect to the server. Please make sure:\n1. The backend server is running on your computer\n2. You are using the correct IP address\n3. Your phone and computer are on the same Wi-Fi network');
    }
    
    throw new Error(error.message || 'Network error occurred');
  }
};

// Authentication API functions
export const authAPI = {
  // Register a new user
  register: async (userData) => {
    return apiRequest('/auth/register', 'POST', userData);
  },
  
  // Login user
  login: async (credentials) => {
    return apiRequest('/auth/login', 'POST', credentials);
  },
};

export default authAPI;