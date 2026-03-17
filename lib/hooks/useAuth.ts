import { useMutation } from '@tanstack/react-query';
import { authApi, LoginRequest } from '../api/auth';
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';

export const useLogin = () => {
  const router = useRouter();
  const setToken = useAuthStore((state) => state.setToken);

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authApi.login(credentials),
    onSuccess: (data) => {
      if (data.status === 'SUCCESS' && data.token) {
        setToken(data.token);
        Toast.show({
          type: 'success',
          text1: 'Login Successful',
          text2: 'Welcome back!',
          visibilityTime: 4000,
          position: 'top',
        });
        router.replace('/events');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Login Failed',
          text2: data.msg || 'Please try again.',
          visibilityTime: 4000,
          position: 'top',
        });
      }
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Login Error',
        text2: error.message || 'Please try again.',
        visibilityTime: 4000,
        position: 'top',
      });
    },
  });
};
