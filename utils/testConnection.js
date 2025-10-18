import { authAPI } from './api';

export const testAPIConnection = async () => {
  try {
    // Test the base API connection
    const response = await fetch('http://localhost:5000');
    if (response.ok) {
      const data = await response.json();
      console.log('API Connection Test Success:', data);
      return { success: true, message: 'Connected to API successfully' };
    } else {
      throw new Error(`API returned status ${response.status}`);
    }
  } catch (error) {
    console.error('API Connection Test Failed:', error);
    return { 
      success: false, 
      message: 'Failed to connect to API. Please check that the backend server is running.' 
    };
  }
};

export default testAPIConnection;