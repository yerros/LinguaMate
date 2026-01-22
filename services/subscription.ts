import { tablesDB } from "@/lib/appwrite";
import { Subscription, SubscriptionTier } from "@/types/subscriptionsType";
import { Query } from "appwrite";

/**
 * Get user's active subscription
 * @param clerkId - The Clerk user ID (used as userId in database)
 */
export async function getUserSubscription(clerkId: string): Promise<Subscription | null> {
    console.log('[SUBSCRIPTION SERVICE] Getting active subscription for clerkId:', clerkId);

    try {
        const result = await tablesDB.listRows({
            databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
            tableId: 'subscriptions',
            queries: [
                Query.equal('userId', clerkId), // userId column stores clerkId value
                Query.equal('isActive', true),
                Query.limit(1)
            ]
        });

        console.log('[SUBSCRIPTION SERVICE] Query result:', {
            total: result.total,
            found: result.total > 0,
        });

        if (result.total === 0) {
            console.log('[SUBSCRIPTION SERVICE] No active subscription found');
            return null;
        }

        const subscription = result.rows[0] as unknown as Subscription;
        console.log('[SUBSCRIPTION SERVICE] ✅ Active subscription found:', {
            subscriptionId: subscription.$id,
            tier: subscription.tier,
            isActive: subscription.isActive,
        });

        return subscription;
    } catch (error) {
        console.error('[SUBSCRIPTION SERVICE] ❌ Error getting subscription:', error);
        throw error;
    }
}

/**
 * Get all subscriptions for a user (including inactive)
 * @param clerkId - The Clerk user ID (used as userId in database)
 */
export async function getAllUserSubscriptions(clerkId: string): Promise<Subscription[]> {
    console.log('[SUBSCRIPTION SERVICE] Getting all subscriptions for clerkId:', clerkId);

    try {
        const result = await tablesDB.listRows({
            databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
            tableId: 'subscriptions',
            queries: [
                Query.equal('userId', clerkId), // userId column stores clerkId value
                Query.limit(10)
            ]
        });

        console.log('[SUBSCRIPTION SERVICE] Found subscriptions:', {
            total: result.total,
        });

        return result.rows as unknown as Subscription[];
    } catch (error) {
        console.error('[SUBSCRIPTION SERVICE] ❌ Error getting all subscriptions:', error);
        throw error;
    }
}

/**
 * Create a default FREE subscription for a user
 * @param clerkId - The Clerk user ID (used as userId in database)
 */
export async function createDefaultSubscription(clerkId: string): Promise<Subscription> {
    console.log('[SUBSCRIPTION SERVICE] Creating default FREE subscription for clerkId:', clerkId);

    const now = new Date();
    const thirtyDaysLater = new Date(now);
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

    const defaultSubscription: Omit<Subscription, '$id' | '$createdAt' | '$updatedAt'> = {
        userId: clerkId, // userId column stores clerkId value
        tier: SubscriptionTier.FREE,
        stripeCustomerId: '', // Empty for free tier
        stripeSubscriptionId: '', // Empty for free tier
        currentPeriodStart: now,
        currentPeriodEnd: thirtyDaysLater,
        isActive: true,
        daysRemaining: 30,
    };

    try {
        const created = await tablesDB.createRow({
            databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
            tableId: 'subscriptions',
            rowId: crypto.randomUUID(),
            data: {
                ...defaultSubscription,
                currentPeriodStart: defaultSubscription.currentPeriodStart.toISOString(),
                currentPeriodEnd: defaultSubscription.currentPeriodEnd.toISOString(),
            }
        });

        console.log('[SUBSCRIPTION SERVICE] ✅ Default subscription created successfully:', {
            subscriptionId: created.$id,
            tier: defaultSubscription.tier,
            clerkId: clerkId,
        });

        return created as unknown as Subscription;
    } catch (error) {
        console.error('[SUBSCRIPTION SERVICE] ❌ Error creating default subscription:', error);
        throw error;
    }
}

/**
 * Get or create subscription for a user
 * If no subscription exists, creates a default FREE subscription
 * @param clerkId - The Clerk user ID (used as userId in database)
 */
export async function getOrCreateSubscription(clerkId: string): Promise<Subscription> {
    console.log('[SUBSCRIPTION SERVICE] Get or create subscription for clerkId:', clerkId);

    try {
        // First, try to get active subscription
        const activeSubscription = await getUserSubscription(clerkId);
        if (activeSubscription) {
            console.log('[SUBSCRIPTION SERVICE] ✅ Using existing active subscription');
            return activeSubscription;
        }

        // Check if there are any subscriptions (including inactive)
        const allSubscriptions = await getAllUserSubscriptions(clerkId);
        if (allSubscriptions.length > 0) {
            console.log('[SUBSCRIPTION SERVICE] ✅ Using existing subscription (inactive):', {
                subscriptionId: allSubscriptions[0].$id,
                tier: allSubscriptions[0].tier,
            });
            // Return the most recent one (even if inactive)
            return allSubscriptions[0];
        }

        // No subscription exists, create default FREE subscription
        console.log('[SUBSCRIPTION SERVICE] No subscription found, creating default FREE subscription...');
        return await createDefaultSubscription(clerkId);
    } catch (error) {
        console.error('[SUBSCRIPTION SERVICE] ❌ Error in getOrCreateSubscription:', error);
        throw error;
    }
}

/**
 * Get subscription tier for a user (defaults to FREE)
 * Automatically creates subscription if it doesn't exist
 * @param clerkId - The Clerk user ID (used as userId in database)
 */
export async function getUserSubscriptionTier(clerkId: string): Promise<SubscriptionTier> {
    const subscription = await getOrCreateSubscription(clerkId);
    return subscription?.tier || SubscriptionTier.FREE;
}

/**
 * Create or update subscription
 */
export async function upsertSubscription(subscription: Subscription): Promise<Subscription> {
    // Check if subscription exists
    const existing = await tablesDB.listRows({
        databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
        tableId: 'subscriptions',
        queries: [
            Query.equal('userId', subscription.userId),
            Query.equal('stripeSubscriptionId', subscription.stripeSubscriptionId),
            Query.limit(1)
        ]
    });

    if (existing.total > 0) {
        // Update existing
        const updated = await tablesDB.updateRow({
            databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
            tableId: 'subscriptions',
            rowId: existing.rows[0].$id,
            data: {
                tier: subscription.tier,
                currentPeriodStart: subscription.currentPeriodStart instanceof Date
                    ? subscription.currentPeriodStart.toISOString()
                    : subscription.currentPeriodStart,
                currentPeriodEnd: subscription.currentPeriodEnd instanceof Date
                    ? subscription.currentPeriodEnd.toISOString()
                    : subscription.currentPeriodEnd,
                isActive: subscription.isActive,
                daysRemaining: subscription.daysRemaining,
            }
        });
        return updated as unknown as Subscription;
    }

    // Create new - convert Date to ISO string for Appwrite
    const subscriptionData = {
        userId: subscription.userId,
        tier: subscription.tier,
        stripeCustomerId: subscription.stripeCustomerId,
        stripeSubscriptionId: subscription.stripeSubscriptionId,
        currentPeriodStart: subscription.currentPeriodStart instanceof Date
            ? subscription.currentPeriodStart.toISOString()
            : subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd instanceof Date
            ? subscription.currentPeriodEnd.toISOString()
            : subscription.currentPeriodEnd,
        isActive: subscription.isActive,
        daysRemaining: subscription.daysRemaining,
    };

    const created = await tablesDB.createRow({
        databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
        tableId: 'subscriptions',
        rowId: crypto.randomUUID(),
        data: subscriptionData
    });
    return created as unknown as Subscription;
}
