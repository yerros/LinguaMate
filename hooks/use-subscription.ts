import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import { getOrCreateSubscription, getUserSubscription } from "@/services/subscription";
import { Subscription } from "@/types/subscriptionsType";

/**
 * Hook to get or create user subscription
 * Automatically creates FREE subscription if user doesn't have one
 */
export const useSubscription = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const {
        data: subscription,
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: ['subscription', user?.clerkId],
        queryFn: async () => {
            if (!user?.clerkId) return null;
            // Get or create subscription (creates FREE if doesn't exist)
            return await getOrCreateSubscription(user.clerkId);
        },
        enabled: !!user?.clerkId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });

    /**
     * Refresh subscription data
     */
    const refreshSubscription = async () => {
        if (!user?.clerkId) return null;
        await queryClient.invalidateQueries({ queryKey: ['subscription', user.clerkId] });
        return await refetch();
    };

    /**
     * Get active subscription only (without creating if doesn't exist)
     */
    const getActiveSubscription = async (): Promise<Subscription | null> => {
        if (!user?.clerkId) return null;
        return await getUserSubscription(user.clerkId);
    };

    return {
        subscription,
        isLoading,
        error,
        refetch: refreshSubscription,
        getActiveSubscription,
    };
};
