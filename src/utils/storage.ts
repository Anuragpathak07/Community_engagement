
/**
 * Storage utility to handle user-specific localStorage
 */

/**
 * Get a value from localStorage with user isolation
 */
export function getStorageItem<T>(key: string, userId: string, defaultValue: T): T {
  try {
    const userKey = `${key}_${userId}`;
    const item = localStorage.getItem(userKey);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error getting storage item:', error);
    return defaultValue;
  }
}

/**
 * Set a value in localStorage with user isolation
 */
export function setStorageItem<T>(key: string, userId: string, value: T): void {
  try {
    const userKey = `${key}_${userId}`;
    localStorage.setItem(userKey, JSON.stringify(value));
  } catch (error) {
    console.error('Error setting storage item:', error);
  }
}

/**
 * Remove a value from localStorage with user isolation
 */
export function removeStorageItem(key: string, userId: string): void {
  try {
    const userKey = `${key}_${userId}`;
    localStorage.removeItem(userKey);
  } catch (error) {
    console.error('Error removing storage item:', error);
  }
}

/**
 * Check if a storage item exists
 */
export function hasStorageItem(key: string, userId: string): boolean {
  try {
    const userKey = `${key}_${userId}`;
    return localStorage.getItem(userKey) !== null;
  } catch (error) {
    console.error('Error checking storage item:', error);
    return false;
  }
}

/**
 * Clear all storage items for a specific user
 */
export function clearUserStorage(userId: string): void {
  try {
    const keysToRemove: string[] = [];
    
    // Find all keys belonging to this user
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.endsWith(`_${userId}`)) {
        keysToRemove.push(key);
      }
    }
    
    // Remove all found keys
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.error('Error clearing user storage:', error);
  }
}

/**
 * Get all data for a specific user (useful for debugging)
 */
export function getAllUserData(userId: string): Record<string, any> {
  try {
    const userData: Record<string, any> = {};
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.endsWith(`_${userId}`)) {
        const baseKey = key.replace(`_${userId}`, '');
        const value = localStorage.getItem(key);
        userData[baseKey] = value ? JSON.parse(value) : null;
      }
    }
    
    return userData;
  } catch (error) {
    console.error('Error getting all user data:', error);
    return {};
  }
}
