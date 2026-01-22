import { useAuth } from "@clerk/clerk-expo";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { logOutRevenueCat } from "@/lib/revenuecat";
import Text from "../ui/Text";
import { Button } from "./components/Button";

interface Props {
  redirectUrl?: string;
}

export function SignOutButton({ redirectUrl = "/(public)" }: Props) {
  const { signOut } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();

  async function onSignOutPress() {
    try {
      console.log('[SIGNOUT] Starting sign out process...');
      
      // Logout from RevenueCat first
      try {
        await logOutRevenueCat();
        console.log('[SIGNOUT] ✅ Logged out from RevenueCat');
      } catch (error) {
        console.error('[SIGNOUT] Error logging out from RevenueCat:', error);
      }

      // Clear all query cache
      queryClient.clear();
      console.log('[SIGNOUT] ✅ Cleared query cache');

      // Sign out from Clerk
      await signOut();
      console.log('[SIGNOUT] ✅ Signed out from Clerk');
      
      // Manual redirect as fallback (Stack.Protected should handle automatically)
      setTimeout(() => {
        router.replace(redirectUrl as any);
        console.log('[SIGNOUT] ✅ Redirected to:', redirectUrl);
      }, 300);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  }

  return (
    <Button onPress={onSignOutPress} variant="secondary">
      <Text size='md' className='font-semibold text-white'>Sign out</Text>
    </Button>
  );
}

export default SignOutButton;
