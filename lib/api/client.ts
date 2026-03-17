import axios from 'axios';

export const BASE_URL = 'https://shanyai.events';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ApiResponse<T = any> {
  status: 'SUCCESS' | 'ERROR';
  msg?: string;
  data?: T;
}
