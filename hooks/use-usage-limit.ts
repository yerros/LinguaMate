import { getOrCreateSubscription } from "@/services/subscription";
import { checkUsageLimit, getDailyUsage, incrementUsage } from "@/services/usage";
import { SubscriptionTier } from "@/types/subscriptionsType";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./use-auth";

/**
 * Hook to check and manage user usage limits
 */
export const useUsageLimit = () => {
    const { user } = useAuth();

    // Get subscription tier (automatically creates subscription if doesn't exist)
    const { data: subscriptionTier, isLoading: isLoadingTier } = useQuery({
        queryKey: ['subscriptionTier', user?.clerkId],
        queryFn: async () => {
            if (!user?.clerkId) return SubscriptionTier.FREE;
            // Get or create subscription, then return tier
            const subscription = await getOrCreateSubscription(user.clerkId);
            return subscription.tier;
        },
        enabled: !!user?.clerkId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Get daily usage
    const { data: dailyUsage, isLoading: isLoadingUsage, refetch: refetchUsage } = useQuery({
        queryKey: ['dailyUsage', user?.clerkId, subscriptionTier],
        queryFn: async () => {
            if (!user?.clerkId || !subscriptionTier) return null;
            return await getDailyUsage(user.clerkId, subscriptionTier);
        },
        enabled: !!user?.clerkId && !!subscriptionTier,
        staleTime: 1 * 60 * 1000, // 1 minute - usage changes frequently
    });

    /**
     * Check if user can perform an action
     */
    const canPerformAction = async (action: {
        conversations?: number;
        characters?: number;
        minutes?: number;
    }): Promise<{ allowed: boolean; reason?: string }> => {
        if (!user?.clerkId || !subscriptionTier) {
            return { allowed: false, reason: 'User not authenticated' };
        }

        const result = await checkUsageLimit(user.clerkId, subscriptionTier, action);
        return result;
    };

    /**
     * Record usage increment
     */
    const recordUsage = async (usage: {
        conversations?: number;
        characters?: number;
        minutes?: number;
    }): Promise<void> => {
        if (!user?.clerkId || !subscriptionTier) {
            throw new Error('User not authenticated');
        }

        await incrementUsage(user.clerkId, subscriptionTier, usage);
        // Refetch to update UI
        await refetchUsage();
    };

    return {
        dailyUsage,
        subscriptionTier: subscriptionTier || SubscriptionTier.FREE,
        isLoading: isLoadingTier || isLoadingUsage,
        canPerformAction,
        recordUsage,
        refetchUsage,
    };
};
