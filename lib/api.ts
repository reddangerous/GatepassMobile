import axios, { AxiosInstance, AxiosError } from 'axios';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

// API Configuration
// IMPORTANT: Use your server's IP address, NOT localhost!
// localhost only works in emulator, not on physical devices
const API_URL = Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.106:3005/api';

class ApiService {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        console.log('API Request:', config.method?.toUpperCase(), config.baseURL + config.url);
        if (!this.token) {
          this.token = await SecureStore.getItemAsync('authToken');
        }
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        console.log('API Response:', response.status, response.config.url);
        // Check if response data is undefined
        if (response.data === undefined) {
          console.warn('Received undefined response data from:', response.config.url);
        }
        return response;
      },
      async (error: AxiosError) => {
        console.error('API Response Error:', error.response?.status, error.response?.data);
        if (error.response?.status === 401) {
          // Token expired or invalid
          await this.clearToken();
        }
        return Promise.reject(error);
      }
    );
  }

  async setToken(token: string) {
    this.token = token;
    await SecureStore.setItemAsync('authToken', token);
  }

  async clearToken() {
    this.token = null;
    await SecureStore.deleteItemAsync('authToken');
  }

  getToken() {
    return this.token;
  }

  // Generic request methods
  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.client.get<T>(url, { params });
    if (response.data === undefined) {
      throw new Error('Received undefined response from server');
    }
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.put<T>(url, data);
    return response.data;
  }

  async patch<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.patch<T>(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<T>(url);
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
