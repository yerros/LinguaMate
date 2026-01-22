import { SubscriptionTier } from "./subscriptionsType";
export interface DailyUsage {
    $id?: string;
    userId: string;
    date: Date;
    conversationsCount: number;
    charactersUsed: number;
    minutesUsed: number;
    subscriptionTier: SubscriptionTier;
    limitReached: boolean;
    lastResetAt: Date;
    $createdAt: Date;
    $updatedAt: Date;
}