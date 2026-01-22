import { SubscriptionTier } from "@/types/subscriptionsType";

/**
 * Usage limits per subscription tier
 */
export const USAGE_LIMITS = {
    [SubscriptionTier.FREE]: {
        dailyConversations: 3,
        dailyCharacters: 5000,
        dailyMinutes: 5,
    },
    [SubscriptionTier.PRO]: {
        dailyConversations: 100,
        dailyCharacters: 50000,
        dailyMinutes: 60,
    },
    [SubscriptionTier.PRO_PLUS]: {
        dailyConversations: -1, // Unlimited
        dailyCharacters: -1, // Unlimited
        dailyMinutes: -1, // Unlimited
    },
} as const;

/**
 * Get usage limits for a subscription tier
 */
export function getUsageLimits(tier: SubscriptionTier) {
    return USAGE_LIMITS[tier] || USAGE_LIMITS[SubscriptionTier.FREE];
}

/**
 * Check if a value is within the limit (-1 means unlimited)
 * If limit is 3, user can use 0, 1, 2, or 3 (inclusive)
 */
export function isWithinLimit(used: number, limit: number): boolean {
    if (limit === -1) return true; // Unlimited
    return used <= limit; // Changed from < to <= to allow usage up to the limit
}

/**
 * Get remaining usage
 */
export function getRemainingUsage(used: number, limit: number): number {
    if (limit === -1) return -1; // Unlimited
    return Math.max(0, limit - used);
}
