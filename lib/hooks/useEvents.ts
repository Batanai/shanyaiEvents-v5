import { useQuery } from '@tanstack/react-query';
import { eventsApi } from '../api/events';
import { useAuthStore } from '../store/authStore';
import Toast from 'react-native-toast-message';

export const useFetchEvents = () => {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: ['events', token],
    queryFn: async () => {
      if (!token) throw new Error('No token available');
      const response = await eventsApi.fetchEvents(token);
      
      if (response.status === 'SUCCESS') {
        Toast.show({
          type: 'success',
          text1: 'Events Fetched',
          text2: 'Events data has been successfully loaded.',
          visibilityTime: 4000,
          position: 'top',
        });
        return response.events || [];
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error Fetching Events',
          text2: response.msg || 'Please try again.',
          visibilityTime: 4000,
          position: 'top',
        });
        throw new Error(response.msg || 'Failed to fetch events');
      }
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });
};
