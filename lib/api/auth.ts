import { apiClient } from './client';

export interface LoginRequest {
  user: string;
  pass: string;
}

export interface LoginResponse {
  status: 'SUCCESS' | 'ERROR';
  msg?: string;
  token?: string;
}

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>(
      '/wp-json/meup/v1/login',
      credentials
    );
    return response.data;
  },
};
