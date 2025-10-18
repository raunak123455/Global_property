import AsyncStorage from '@react-native-async-storage/async-storage';

export const testUserStorage = async () => {
  try {
    // Test storing user data
    const testUser = {
      _id: 'test123',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      role: 'buyer',
      token: 'test-token-123'
    };
    
    await AsyncStorage.setItem('user', JSON.stringify(testUser));
    console.log('User data stored successfully');
    
    // Test retrieving user data
    const storedUser = await AsyncStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      console.log('Retrieved user data:', parsedUser);
      return parsedUser;
    } else {
      console.log('No user data found');
      return null;
    }
  } catch (error) {
    console.error('Error testing user storage:', error);
    return null;
  }
};

export const clearUserStorage = async () => {
  try {
    await AsyncStorage.removeItem('user');
    console.log('User data cleared successfully');
  } catch (error) {
    console.error('Error clearing user storage:', error);
  }
};

export default { testUserStorage, clearUserStorage };