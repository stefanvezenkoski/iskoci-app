import * as SecureStore from 'expo-secure-store';

export const clerkTokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      // Session persistence is best effort on unsupported environments.
    }
  },
};
