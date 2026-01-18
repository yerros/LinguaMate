import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { Stack } from 'expo-router';
import { PressablesConfig } from 'pressto';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import '../global.css';


function RootLayoutNav() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return null
  }

  return (
    <Stack>
      <Stack.Protected guard={isSignedIn}>
        <Stack.Screen name='(protected)' options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name='(public)' options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  )
}


export default function RootLayout() {
  return (
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
  );
}
