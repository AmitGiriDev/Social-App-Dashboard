import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  THEME: 'app_theme',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  BIOMETRIC_ENABLED: 'biometric_enabled',
  POSTS_CACHE: 'posts_cache',
  USERS_CACHE: 'users_cache',
  LAST_SYNC: 'last_sync',
};

export const storage = {
  setItem: async <T>(key: string, value: T): Promise<void> => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error('Error storing data:', error);
    }
  },

  getItem: async <T>(key: string): Promise<T | null> => {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue !== null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Error retrieving data:', error);
      return null;
    }
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing data:', error);
    }
  },

  clear: async (): Promise<void> => {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  },

  multiGet: async (keys: string[]): Promise<Record<string, any>> => {
    try {
      const result = await AsyncStorage.multiGet(keys);
      return result.reduce((acc, [key, value]) => {
        if (value) {
          acc[key] = JSON.parse(value);
        }
        return acc;
      }, {} as Record<string, any>);
    } catch (error) {
      console.error('Error multi-getting data:', error);
      return {};
    }
  },

  multiSet: async (keyValuePairs: Record<string, any>): Promise<void> => {
    try {
      const pairs = Object.entries(keyValuePairs).map(([key, value]) => [
        key,
        JSON.stringify(value),
      ]);
      await AsyncStorage.multiSet(pairs as [string, string][]);
    } catch (error) {
      console.error('Error multi-setting data:', error);
    }
  },
};

export default storage;
