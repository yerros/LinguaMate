export enum SubscriptionTier {
    FREE = 'free',
    PRO = 'pro',
    PRO_PLUS = 'pro_plus',
}

export interface Subscription {
    $id?: string;
    userId: string;
    tier: SubscriptionTier;
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    isActive: boolean;
    daysRemaining: number;
    $createdAt: Date;
    $updatedAt: Date;
}