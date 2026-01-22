import { ClerkProvider, useAuth as useClerkAuth } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { Stack } from 'expo-router';
import { PressablesConfig } from 'pressto';

import LoadingScreen from '@/components/screen/LoadingScreen';
import { useAuth } from '@/hooks/use-auth';
import { initializeRevenueCat, logInRevenueCat } from '@/lib/revenuecat';
import { ElevenLabsProvider } from '@elevenlabs/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import '../global.css';

// Setup React Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});


function RootLayoutNav() {
  const { isSignedIn, isLoaded } = useClerkAuth();
  const { user, isLoading: isLoadingUser } = useAuth(); // Trigger user check when app opens

  // Initialize RevenueCat on app start
  useEffect(() => {
    const initRevenueCat = async () => {
      try {
        await initializeRevenueCat();
        console.log('[REVENUECAT] ✅ Initialized successfully');
      } catch (error) {
        console.error('[REVENUECAT] ❌ Initialization error:', error);
      }
    };

    initRevenueCat();
  }, []);

  // Log in to RevenueCat when user is available
  useEffect(() => {
    const loginRevenueCat = async () => {
      if (user?.clerkId && isSignedIn) {
        try {
          await logInRevenueCat(user.clerkId);
          console.log('[REVENUECAT] ✅ User logged in to RevenueCat');
        } catch (error) {
          console.error('[REVENUECAT] ❌ Login error:', error);
        }
      }
    };

    loginRevenueCat();
  }, [user?.clerkId, isSignedIn]);

  if (!isLoaded) {
    return <LoadingScreen />;
  }

  // Show loading while user is being fetched from Appwrite
  if (isSignedIn && isLoadingUser) {
    return <LoadingScreen />;
  }

  return (
    <ElevenLabsProvider>
      <Stack>
        <Stack.Protected guard={isSignedIn}>
          <Stack.Screen name='(protected)' options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={!isSignedIn}>
          <Stack.Screen name='(public)' options={{ headerShown: false }} />
        </Stack.Protected>
      </Stack>
    </ElevenLabsProvider>
  )
}


export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ClerkProvider tokenCache={tokenCache}>
        <GestureHandlerRootView>
          <PressablesConfig
            animationType="spring"
            animationConfig={{ damping: 30, stiffness: 200 }}
            config={{ minScale: 0.9, activeOpacity: 0.6 }}
          >
            <RootLayoutNav />
          </PressablesConfig>
        </GestureHandlerRootView>
      </ClerkProvider>
    </QueryClientProvider>
  );
}
