import { 
    getCustomerInfo, 
    hasActiveEntitlement, 
    getOfferings, 
    purchasePackage,
    restorePurchases,
    logInRevenueCat,
    getSubscriptionStatus,
    ENTITLEMENT_IDENTIFIER,
} from '@/lib/revenuecat';
import { upsertSubscription } from './subscription';
import { SubscriptionTier } from '@/types/subscriptionsType';
import type { CustomerInfo } from 'react-native-purchases';

/**
 * Sync RevenueCat subscription to Appwrite database
 */
export async function syncRevenueCatToAppwrite(
    clerkId: string,
    customerInfo: CustomerInfo
): Promise<void> {
    console.log('[REVENUECAT SYNC] Syncing RevenueCat subscription to Appwrite:', {
        clerkId,
        entitlements: Object.keys(customerInfo.entitlements.active),
    });

    try {
        const entitlement = customerInfo.entitlements.active[ENTITLEMENT_IDENTIFIER];
        
        if (!entitlement) {
            console.log('[REVENUECAT SYNC] No active entitlement found, user is on FREE tier');
            return;
        }

        // Determine tier based on product identifier
        const productIdentifier = entitlement.productIdentifier;
        let tier: SubscriptionTier = SubscriptionTier.FREE;
        
        if (productIdentifier.includes('yearly') || productIdentifier.includes('annual')) {
            tier = SubscriptionTier.PRO_PLUS;
        } else if (productIdentifier.includes('monthly')) {
            tier = SubscriptionTier.PRO;
        }

        const expirationDate = entitlement.expirationDate 
            ? new Date(entitlement.expirationDate) 
            : new Date();
        
        const now = new Date();
        const daysRemaining = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        // Sync to Appwrite
        await upsertSubscription({
            userId: clerkId,
            tier: tier,
            stripeCustomerId: customerInfo.originalAppUserId || '',
            stripeSubscriptionId: entitlement.originalTransactionIdentifier || '',
            currentPeriodStart: entitlement.originalPurchaseDate 
                ? new Date(entitlement.originalPurchaseDate) 
                : new Date(),
            currentPeriodEnd: expirationDate,
            isActive: entitlement.willRenew !== false,
            daysRemaining: Math.max(0, daysRemaining),
            $createdAt: entitlement.originalPurchaseDate 
                ? new Date(entitlement.originalPurchaseDate) 
                : new Date(),
            $updatedAt: new Date(),
        });

        console.log('[REVENUECAT SYNC] ✅ Subscription synced to Appwrite:', {
            tier,
            expirationDate,
            daysRemaining,
        });
    } catch (error) {
        console.error('[REVENUECAT SYNC] ❌ Error syncing subscription:', error);
        throw error;
    }
}

/**
 * Get subscription tier from RevenueCat
 */
export async function getSubscriptionTierFromRevenueCat(clerkId: string): Promise<SubscriptionTier> {
    try {
        const status = await getSubscriptionStatus();
        
        if (!status.isPro) {
            return SubscriptionTier.FREE;
        }

        // Get customer info to determine tier
        const customerInfo = await getCustomerInfo();
        const entitlement = customerInfo.entitlements.active[ENTITLEMENT_IDENTIFIER];
        
        if (!entitlement) {
            return SubscriptionTier.FREE;
        }

        const productIdentifier = entitlement.productIdentifier;
        
        if (productIdentifier.includes('yearly') || productIdentifier.includes('annual')) {
            return SubscriptionTier.PRO_PLUS;
        } else if (productIdentifier.includes('monthly')) {
            return SubscriptionTier.PRO;
        }

        return SubscriptionTier.PRO; // Default to PRO if unknown
    } catch (error) {
        console.error('[REVENUECAT SYNC] ❌ Error getting tier from RevenueCat:', error);
        return SubscriptionTier.FREE;
    }
}

/**
 * Handle purchase completion and sync
 */
export async function handlePurchaseComplete(
    clerkId: string,
    customerInfo: CustomerInfo
): Promise<void> {
    console.log('[REVENUECAT SYNC] Handling purchase completion...');
    
    try {
        // Sync to Appwrite
        await syncRevenueCatToAppwrite(clerkId, customerInfo);
        
        console.log('[REVENUECAT SYNC] ✅ Purchase handling completed');
    } catch (error) {
        console.error('[REVENUECAT SYNC] ❌ Error handling purchase:', error);
        throw error;
    }
}
