import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { useEffect } from 'react';
import { SplashScreen } from 'expo-router';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Get Started' }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="events" options={{ title: 'Events' }} />
        <Stack.Screen name="list-tickets" options={{ title: 'Ticket' }} />
        <Stack.Screen
          name="scan-barcode"
          options={{ title: 'Scan QR Code', headerLeft: () => null }}
        />
      </Stack>
      <Toast />
    </QueryClientProvider>
  );
}
