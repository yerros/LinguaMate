import { checkUsageLimit } from "@/services/usage";
import { getUserSubscriptionTier } from "@/services/subscription";
import { SubscriptionTier } from "@/types/subscriptionsType";

/**
 * Guard function to check usage before performing an action
 * Throws error if limit is reached
 * @param clerkId - The Clerk user ID (used as userId in database)
 */
export async function guardUsage(
    clerkId: string,
    action: {
        conversations?: number;
        characters?: number;
        minutes?: number;
    }
): Promise<void> {
    const subscriptionTier = await getUserSubscriptionTier(clerkId);
    const result = await checkUsageLimit(clerkId, subscriptionTier, action);

    if (!result.allowed) {
        throw new Error(result.reason || 'Usage limit reached');
    }
}

/**
 * Wrapper function to execute an action with usage checking
 * @param clerkId - The Clerk user ID (used as userId in database)
 */
export async function withUsageGuard<T>(
    clerkId: string,
    action: {
        conversations?: number;
        characters?: number;
        minutes?: number;
    },
    fn: () => Promise<T>
): Promise<T> {
    // Check before executing
    await guardUsage(clerkId, action);

    // Execute the function
    const result = await fn();

    return result;
}
