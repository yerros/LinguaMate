import { tablesDB } from "@/lib/appwrite";
import { DailyUsage } from "@/types/dailyUsageType";
import { SubscriptionTier } from "@/types/subscriptionsType";
import { getUsageLimits, isWithinLimit } from "@/utils/usage-limits";
import { Query } from "appwrite";

/**
 * Get today's date string in YYYY-MM-DD format
 */
function getTodayDateString(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

/**
 * Format date to ISO string for Appwrite
 */
function formatDateForAppwrite(date: Date): string {
    return date.toISOString();
}

/**
 * Get or create daily usage record for today
 * @param clerkId - The Clerk user ID (used as userId in database)
 */
export async function getDailyUsage(
    clerkId: string,
    subscriptionTier: SubscriptionTier = SubscriptionTier.FREE
): Promise<DailyUsage> {
    const today = getTodayDateString();
    console.log('[USAGE SERVICE] Getting daily usage:', {
        clerkId,
        date: today,
        tier: subscriptionTier,
    });

    try {
        // Query for today's usage
        const result = await tablesDB.listRows({
            databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
            tableId: 'daily_usage',
            queries: [
                Query.equal('userId', clerkId), // userId column stores clerkId value
                Query.equal('date', today),
                Query.limit(1)
            ]
        });

        console.log('[USAGE SERVICE] Query result:', {
            total: result.total,
            found: result.total > 0,
        });

        // If usage record exists, return it
        if (result.total > 0) {
            const usage = result.rows[0] as unknown as DailyUsage;
            console.log('[USAGE SERVICE] ✅ Usage record found:', {
                usageId: usage.$id,
                userId: usage.userId,
                date: usage.date,
                conversations: usage.conversationsCount,
                characters: usage.charactersUsed,
                minutes: usage.minutesUsed,
                conversationsType: typeof usage.conversationsCount,
                limitReached: usage.limitReached,
                lastResetAt: usage.lastResetAt,
            });

            // Check if we need to reset (if it's a new day)
            const lastReset = new Date(usage.lastResetAt);
            const now = new Date();
            const todayDateString = now.toDateString();
            const lastResetDateString = lastReset.toDateString();
            const isNewDay = lastResetDateString !== todayDateString;

            console.log('[USAGE SERVICE] Date check for reset:', {
                today: todayDateString,
                lastReset: lastResetDateString,
                isNewDay,
                lastResetAt: usage.lastResetAt,
                recordDate: usage.date,
            });

            if (isNewDay) {
                console.log('[USAGE SERVICE] New day detected, resetting usage...');
                // Reset daily usage
                return await resetDailyUsage(clerkId, subscriptionTier);
            }

            return usage as unknown as DailyUsage;
        }

        // Create new daily usage record
        console.log('[USAGE SERVICE] No usage record found, creating new one...');
        return await createDailyUsage(clerkId, subscriptionTier);
    } catch (error) {
        console.error('[USAGE SERVICE] ❌ Error getting daily usage:', error);
        throw error;
    }
}

/**
 * Create a new daily usage record
 * @param clerkId - The Clerk user ID (used as userId in database)
 */
async function createDailyUsage(
    clerkId: string,
    subscriptionTier: SubscriptionTier
): Promise<DailyUsage> {
    const today = getTodayDateString();
    const now = new Date();

    console.log('[USAGE SERVICE] Creating new daily usage record:', {
        clerkId,
        date: today,
        tier: subscriptionTier,
    });

    try {
        const newUsage = await tablesDB.createRow({
            databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
            tableId: 'daily_usage',
            rowId: crypto.randomUUID(),
            data: {
                userId: clerkId, // userId column stores clerkId value
                date: today,
                conversationsCount: 0,
                charactersUsed: 0,
                minutesUsed: 0,
                subscriptionTier: subscriptionTier,
                limitReached: false,
                lastResetAt: formatDateForAppwrite(now),
            }
        });

        console.log('[USAGE SERVICE] ✅ Daily usage record created:', {
            usageId: newUsage.$id,
            clerkId,
            date: today,
        });

        return newUsage as unknown as DailyUsage;
    } catch (error) {
        console.error('[USAGE SERVICE] ❌ Error creating daily usage:', error);
        throw error;
    }
}

/**
 * Reset daily usage (for new day)
 * @param clerkId - The Clerk user ID (used as userId in database)
 */
async function resetDailyUsage(
    clerkId: string,
    subscriptionTier: SubscriptionTier
): Promise<DailyUsage> {
    const today = getTodayDateString();
    const now = new Date();

    console.log('[USAGE SERVICE] Resetting daily usage:', {
        clerkId,
        date: today,
    });

    try {
        // Get existing record
        const result = await tablesDB.listRows({
            databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
            tableId: 'daily_usage',
            queries: [
                Query.equal('userId', clerkId), // userId column stores clerkId value
                Query.equal('date', today),
                Query.limit(1)
            ]
        });

        if (result.total > 0) {
            console.log('[USAGE SERVICE] Updating existing record for reset...');
            // Update existing record
            const updated = await tablesDB.updateRow({
                databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
                tableId: 'daily_usage',
                rowId: result.rows[0].$id,
                data: {
                    conversationsCount: 0,
                    charactersUsed: 0,
                    minutesUsed: 0,
                    subscriptionTier: subscriptionTier,
                    limitReached: false,
                    lastResetAt: formatDateForAppwrite(now),
                }
            });

            console.log('[USAGE SERVICE] ✅ Daily usage reset successfully:', {
                usageId: updated.$id,
            });

            return updated as unknown as DailyUsage;
        }

        // Create new if doesn't exist
        console.log('[USAGE SERVICE] No record found, creating new one...');
        return await createDailyUsage(clerkId, subscriptionTier);
    } catch (error) {
        console.error('[USAGE SERVICE] ❌ Error resetting daily usage:', error);
        throw error;
    }
}

/**
 * Check if user can perform an action based on usage limits
 * @param clerkId - The Clerk user ID (used as userId in database)
 */
export async function checkUsageLimit(
    clerkId: string,
    subscriptionTier: SubscriptionTier,
    action: {
        conversations?: number;
        characters?: number;
        minutes?: number;
    }
): Promise<{ allowed: boolean; reason?: string; usage?: DailyUsage }> {
    console.log('[USAGE SERVICE] Checking usage limit:', {
        clerkId,
        tier: subscriptionTier,
        action,
    });

    try {
        const usage = await getDailyUsage(clerkId, subscriptionTier);
        const limits = getUsageLimits(subscriptionTier);

        // Ensure proper number conversion
        const currentConversations = Number(usage.conversationsCount) || 0;
        const currentCharacters = Number(usage.charactersUsed) || 0;
        const currentMinutes = Number(usage.minutesUsed) || 0;

        console.log('[USAGE SERVICE] Current usage vs limits:', {
            current: {
                conversations: currentConversations,
                characters: currentCharacters,
                minutes: currentMinutes,
            },
            raw: {
                conversations: usage.conversationsCount,
                characters: usage.charactersUsed,
                minutes: usage.minutesUsed,
            },
            limits: {
                conversations: limits.dailyConversations,
                characters: limits.dailyCharacters,
                minutes: limits.dailyMinutes,
            },
            subscriptionTier,
        });

        // Check conversations limit
        if (action.conversations !== undefined) {
            // Ensure numbers are properly converted
            const currentConversations = Number(usage.conversationsCount) || 0;
            const addingConversations = Number(action.conversations) || 0;
            const newConversations = currentConversations + addingConversations;
            const conversationLimit = Number(limits.dailyConversations) || 0;

            console.log('[USAGE SERVICE] Conversation limit check details:', {
                currentConversations,
                addingConversations,
                newConversations,
                conversationLimit,
                isWithinLimit: isWithinLimit(newConversations, conversationLimit),
                calculation: `${newConversations} <= ${conversationLimit} = ${newConversations <= conversationLimit}`,
            });

            if (!isWithinLimit(newConversations, conversationLimit)) {
                console.log('[USAGE SERVICE] ❌ Conversation limit reached:', {
                    current: currentConversations,
                    adding: addingConversations,
                    newTotal: newConversations,
                    limit: conversationLimit,
                    check: `${newConversations} <= ${conversationLimit} = ${newConversations <= conversationLimit}`,
                });
                return {
                    allowed: false,
                    reason: `Daily conversation limit reached (${conversationLimit} conversations). You have used ${currentConversations} of ${conversationLimit} conversations.`,
                    usage
                };
            }
        }

        // Check characters limit
        if (action.characters !== undefined) {
            const currentCharacters = Number(usage.charactersUsed) || 0;
            const addingCharacters = Number(action.characters) || 0;
            const newCharacters = currentCharacters + addingCharacters;
            const characterLimit = Number(limits.dailyCharacters) || 0;

            if (!isWithinLimit(newCharacters, characterLimit)) {
                console.log('[USAGE SERVICE] ❌ Character limit reached:', {
                    current: currentCharacters,
                    adding: addingCharacters,
                    newTotal: newCharacters,
                    limit: characterLimit,
                    check: `${newCharacters} <= ${characterLimit} = ${newCharacters <= characterLimit}`,
                });
                return {
                    allowed: false,
                    reason: `Daily character limit reached (${characterLimit} characters). You have used ${currentCharacters} of ${characterLimit} characters.`,
                    usage
                };
            }
        }

        // Check minutes limit
        if (action.minutes !== undefined) {
            const currentMinutes = Number(usage.minutesUsed) || 0;
            const addingMinutes = Number(action.minutes) || 0;
            const newMinutes = currentMinutes + addingMinutes;
            const minutesLimit = Number(limits.dailyMinutes) || 0;

            if (!isWithinLimit(newMinutes, minutesLimit)) {
                console.log('[USAGE SERVICE] ❌ Minutes limit reached:', {
                    current: currentMinutes,
                    adding: addingMinutes,
                    newTotal: newMinutes,
                    limit: minutesLimit,
                    check: `${newMinutes} <= ${minutesLimit} = ${newMinutes <= minutesLimit}`,
                });
                return {
                    allowed: false,
                    reason: `Daily minutes limit reached (${minutesLimit} minutes). You have used ${currentMinutes} of ${minutesLimit} minutes.`,
                    usage
                };
            }
        }

        console.log('[USAGE SERVICE] ✅ Usage limit check passed');
        return { allowed: true, usage };
    } catch (error) {
        console.error('[USAGE SERVICE] ❌ Error checking usage limit:', error);
        throw error;
    }
}

/**
 * Increment usage for a user
 * @param clerkId - The Clerk user ID (used as userId in database)
 */
export async function incrementUsage(
    clerkId: string,
    subscriptionTier: SubscriptionTier,
    usage: {
        conversations?: number;
        characters?: number;
        minutes?: number;
    }
): Promise<DailyUsage> {
    console.log('[USAGE SERVICE] Incrementing usage:', {
        clerkId,
        tier: subscriptionTier,
        usage,
    });

    try {
        const dailyUsage = await getDailyUsage(clerkId, subscriptionTier);
        const limits = getUsageLimits(subscriptionTier);

        const newConversations = dailyUsage.conversationsCount + (usage.conversations || 0);
        const newCharacters = dailyUsage.charactersUsed + (usage.characters || 0);
        const newMinutes = dailyUsage.minutesUsed + (usage.minutes || 0);

        console.log('[USAGE SERVICE] Usage calculation:', {
            current: {
                conversations: dailyUsage.conversationsCount,
                characters: dailyUsage.charactersUsed,
                minutes: dailyUsage.minutesUsed,
            },
            new: {
                conversations: newConversations,
                characters: newCharacters,
                minutes: newMinutes,
            },
            limits: {
                conversations: limits.dailyConversations,
                characters: limits.dailyCharacters,
                minutes: limits.dailyMinutes,
            },
        });

        // Check if any limit is reached
        const limitReached =
            (!isWithinLimit(newConversations, limits.dailyConversations)) ||
            (!isWithinLimit(newCharacters, limits.dailyCharacters)) ||
            (!isWithinLimit(newMinutes, limits.dailyMinutes));

        const updated = await tablesDB.updateRow({
            databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
            tableId: 'daily_usage',
            rowId: dailyUsage.$id!,
            data: {
                conversationsCount: newConversations,
                charactersUsed: newCharacters,
                minutesUsed: newMinutes,
                limitReached: limitReached,
            }
        });

        console.log('[USAGE SERVICE] ✅ Usage incremented successfully:', {
            usageId: updated.$id,
            limitReached,
            newValues: {
                conversations: newConversations,
                characters: newCharacters,
                minutes: newMinutes,
            },
        });

        return updated as unknown as DailyUsage;
    } catch (error) {
        console.error('[USAGE SERVICE] ❌ Error incrementing usage:', error);
        throw error;
    }
}

/**
 * Update user's total usage (lifetime stats)
 * @param clerkId - The Clerk user ID (used to find user by clerkId)
 */
export async function updateUserTotalUsage(
    clerkId: string,
    usage: {
        conversations?: number;
        characters?: number;
        minutes?: number;
    }
): Promise<void> {
    console.log('[USAGE SERVICE] Updating total usage:', {
        clerkId,
        usage,
    });

    try {
        // Get current user by clerkId
        const userResult = await tablesDB.listRows({
            databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
            tableId: 'user',
            queries: [
                Query.equal('clerkId', clerkId), // Find user by clerkId
                Query.limit(1)
            ]
        });

        if (userResult.total === 0) {
            console.error('[USAGE SERVICE] ❌ User not found:', clerkId);
            throw new Error('User not found');
        }

        const user = userResult.rows[0];
        const currentConversations = (user.totalConversations as number) || 0;
        const currentCharacters = (user.totalCharactersUsed as number) || 0;
        const currentMinutes = (user.totalMinutesUsed as number) || 0;

        const newTotalConversations = currentConversations + (usage.conversations || 0);
        const newTotalCharacters = currentCharacters + (usage.characters || 0);
        const newTotalMinutes = currentMinutes + (usage.minutes || 0);

        console.log('[USAGE SERVICE] Total usage update:', {
            current: {
                conversations: currentConversations,
                characters: currentCharacters,
                minutes: currentMinutes,
            },
            new: {
                conversations: newTotalConversations,
                characters: newTotalCharacters,
                minutes: newTotalMinutes,
            },
        });

        await tablesDB.updateRow({
            databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
            tableId: 'user',
            rowId: user.$id, // Use Appwrite user ID for update
            data: {
                totalConversations: newTotalConversations,
                totalCharactersUsed: newTotalCharacters,
                totalMinutesUsed: newTotalMinutes,
            }
        });

        console.log('[USAGE SERVICE] ✅ Total usage updated successfully');
    } catch (error) {
        console.error('[USAGE SERVICE] ❌ Error updating total usage:', error);
        throw error;
    }
}
