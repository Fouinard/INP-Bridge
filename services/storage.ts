import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

export class StorageManager {
    public static Secure = {
        async set(key: string, value: string): Promise<void> {
            try {
                await SecureStore.setItemAsync(key, value);
            } catch (error) {
                console.error(`[SecureStore] Error writing (${key}):`, error);
            }
        },

        async get(key: string): Promise<string | null> {
            try {
                return await SecureStore.getItemAsync(key);
            } catch (error) {
                console.error(`[SecureStore] Error reading (${key}):`, error);
                return null;
            }
        },

        async remove(key: string): Promise<void> {
            try {
                await SecureStore.deleteItemAsync(key);
            } catch (error) {
                console.error(`[SecureStore] Error removing (${key}):`, error);
            }
        }
    };

    public static Default = {
        async set<T = any>(key: string, value: T): Promise<void> {
            try {
                const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
                await AsyncStorage.setItem(key, stringValue);
            } catch (error) {
                console.error(`[AsyncStorage] Error writing (${key}):`, error);
            }
        },

        async get<T = any>(key: string): Promise<T | null> {
            try {
                const value = await AsyncStorage.getItem(key);
                if (value === null) return null;

                try {
                    return JSON.parse(value) as T;
                } catch {
                    return value as unknown as T;
                }
            } catch (error) {
                console.error(`[DefaultStorage] Error reading (${key}):`, error);
                return null;
            }
        },

        async remove(key: string): Promise<void> {
            try {
                await AsyncStorage.removeItem(key);
            } catch (error) {
                console.error(`[DefaultStorage] Error removing (${key}):`, error);
            }
        },

        async clearAll(): Promise<void> {
            try {
                await AsyncStorage.clear();
            } catch (error) {
                console.error(`[DefaultStorage] Error clearing everything:`, error);
            }
        }
    };
}