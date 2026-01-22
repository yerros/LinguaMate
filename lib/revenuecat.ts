import Purchases, { CustomerInfo, PurchasesOffering, PurchasesPackage } from 'react-native-purchases';
import { Platform } from 'react-native';

// RevenueCat API Key
const REVENUECAT_API_KEY = 'test_CKurQTyzciMMuUqpcTgoeDQPaUD';

// Entitlement identifier
export const ENTITLEMENT_IDENTIFIER = 'LinguaMate Pro';

// Product identifiers
export const PRODUCT_IDENTIFIERS = {
    MONTHLY: 'monthly',
    YEARLY: 'yearly',
} as const;

/**
 * Initialize RevenueCat SDK
 * Should be called once when app starts
 */
export async function initializeRevenueCat(userId?: string): Promise<void> {
    try {
        console.log('[REVENUECAT] Initializing RevenueCat SDK...');
        
        // Configure RevenueCat
        if (Platform.OS === 'ios') {
            await Purchases.configure({ apiKey: REVENUECAT_API_KEY });
        } else if (Platform.OS === 'android') {
            await Purchases.configure({ apiKey: REVENUECAT_API_KEY });
        }

        console.log('[REVENUECAT] ✅ SDK configured successfully');

        // Set user ID if provided
        if (userId) {
            await Purchases.logIn(userId);
            console.log('[REVENUECAT] ✅ User logged in:', userId);
        }

        // Enable debug logs in development
        if (process.env.NODE_ENV === 'development') {
            Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
        }
    } catch (error) {
        console.error('[REVENUECAT] ❌ Error initializing RevenueCat:', error);
        throw error;
    }
}

/**
 * Get current customer info
 */
export async function getCustomerInfo(): Promise<CustomerInfo> {
    try {
        console.log('[REVENUECAT] Fetching customer info...');
        const customerInfo = await Purchases.getCustomerInfo();
        console.log('[REVENUECAT] ✅ Customer info retrieved:', {
            entitlements: Object.keys(customerInfo.entitlements.active),
            activeSubscriptions: customerInfo.activeSubscriptions,
        });
        return customerInfo;
    } catch (error) {
        console.error('[REVENUECAT] ❌ Error getting customer info:', error);
        throw error;
    }
}

/**
 * Check if user has active entitlement
 */
export async function hasActiveEntitlement(): Promise<boolean> {
    try {
        const customerInfo = await getCustomerInfo();
        const hasEntitlement = customerInfo.entitlements.active[ENTITLEMENT_IDENTIFIER] !== undefined;
        console.log('[REVENUECAT] Entitlement check:', {
            hasEntitlement,
            entitlement: ENTITLEMENT_IDENTIFIER,
        });
        return hasEntitlement;
    } catch (error) {
        console.error('[REVENUECAT] ❌ Error checking entitlement:', error);
        return false;
    }
}

/**
 * Get available offerings (products)
 */
export async function getOfferings(): Promise<PurchasesOffering | null> {
    try {
        console.log('[REVENUECAT] Fetching offerings...');
        const offerings = await Purchases.getOfferings();
        
        if (offerings.current === null) {
            console.log('[REVENUECAT] ⚠️ No current offering available');
            return null;
        }

        console.log('[REVENUECAT] ✅ Offerings retrieved:', {
            identifier: offerings.current.identifier,
            packages: offerings.current.availablePackages.map(pkg => ({
                identifier: pkg.identifier,
                product: pkg.product.identifier,
            })),
        });

        return offerings.current;
    } catch (error) {
        console.error('[REVENUECAT] ❌ Error getting offerings:', error);
        throw error;
    }
}

/**
 * Purchase a package
 */
export async function purchasePackage(packageToPurchase: PurchasesPackage): Promise<CustomerInfo> {
    try {
        console.log('[REVENUECAT] Purchasing package:', {
            identifier: packageToPurchase.identifier,
            product: packageToPurchase.product.identifier,
        });

        const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
        
        console.log('[REVENUECAT] ✅ Purchase successful:', {
            entitlements: Object.keys(customerInfo.entitlements.active),
        });

        return customerInfo;
    } catch (error: any) {
        console.error('[REVENUECAT] ❌ Purchase error:', error);
        
        // Handle user cancellation
        if (error.userCancelled) {
            throw new Error('Purchase was cancelled');
        }
        
        throw error;
    }
}

/**
 * Restore purchases
 */
export async function restorePurchases(): Promise<CustomerInfo> {
    try {
        console.log('[REVENUECAT] Restoring purchases...');
        const customerInfo = await Purchases.restorePurchases();
        
        console.log('[REVENUECAT] ✅ Purchases restored:', {
            entitlements: Object.keys(customerInfo.entitlements.active),
        });

        return customerInfo;
    } catch (error) {
        console.error('[REVENUECAT] ❌ Error restoring purchases:', error);
        throw error;
    }
}

/**
 * Log in user to RevenueCat
 */
export async function logInRevenueCat(userId: string): Promise<CustomerInfo> {
    try {
        console.log('[REVENUECAT] Logging in user:', userId);
        const { customerInfo } = await Purchases.logIn(userId);
        
        console.log('[REVENUECAT] ✅ User logged in successfully:', {
            userId,
            entitlements: Object.keys(customerInfo.entitlements.active),
        });

        return customerInfo;
    } catch (error) {
        console.error('[REVENUECAT] ❌ Error logging in:', error);
        throw error;
    }
}

/**
 * Log out user from RevenueCat
 */
export async function logOutRevenueCat(): Promise<CustomerInfo> {
    try {
        console.log('[REVENUECAT] Logging out user...');
        const customerInfo = await Purchases.logOut();
        
        console.log('[REVENUECAT] ✅ User logged out successfully');
        return customerInfo;
    } catch (error) {
        console.error('[REVENUECAT] ❌ Error logging out:', error);
        throw error;
    }
}

/**
 * Get subscription status details
 */
export async function getSubscriptionStatus(): Promise<{
    hasActiveSubscription: boolean;
    isPro: boolean;
    activeSubscriptions: string[];
    expirationDate: Date | null;
}> {
    try {
        const customerInfo = await getCustomerInfo();
        const entitlement = customerInfo.entitlements.active[ENTITLEMENT_IDENTIFIER];
        
        const hasActiveSubscription = entitlement !== undefined;
        const expirationDate = entitlement?.expirationDate 
            ? new Date(entitlement.expirationDate) 
            : null;

        return {
            hasActiveSubscription,
            isPro: hasActiveSubscription,
            activeSubscriptions: customerInfo.activeSubscriptions,
            expirationDate,
        };
    } catch (error) {
        console.error('[REVENUECAT] ❌ Error getting subscription status:', error);
        return {
            hasActiveSubscription: false,
            isPro: false,
            activeSubscriptions: [],
            expirationDate: null,
        };
    }
}
