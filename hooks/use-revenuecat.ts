import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './use-auth';
import {
    getCustomerInfo,
    hasActiveEntitlement,
    getOfferings,
    purchasePackage,
    restorePurchases,
    getSubscriptionStatus,
    ENTITLEMENT_IDENTIFIER,
} from '@/lib/revenuecat';
import { handlePurchaseComplete, syncRevenueCatToAppwrite } from '@/services/revenuecat';
import type { CustomerInfo, PurchasesOffering, PurchasesPackage } from 'react-native-purchases';
import { useEffect } from 'react';

/**
 * Hook to manage RevenueCat purchases and subscriptions
 */
export const useRevenueCat = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // Get customer info
    const {
        data: customerInfo,
        isLoading: isLoadingCustomerInfo,
        refetch: refetchCustomerInfo,
    } = useQuery({
        queryKey: ['revenuecat-customer', user?.clerkId],
        queryFn: async () => {
            if (!user?.clerkId) return null;
            return await getCustomerInfo();
        },
        enabled: !!user?.clerkId,
        staleTime: 1 * 60 * 1000, // 1 minute
        gcTime: 5 * 60 * 1000, // 5 minutes
    });

    // Check entitlement status
    const {
        data: hasEntitlement,
        isLoading: isLoadingEntitlement,
        refetch: refetchEntitlement,
    } = useQuery({
        queryKey: ['revenuecat-entitlement', user?.clerkId],
        queryFn: async () => {
            if (!user?.clerkId) return false;
            return await hasActiveEntitlement();
        },
        enabled: !!user?.clerkId,
        staleTime: 1 * 60 * 1000, // 1 minute
    });

    // Get subscription status
    const {
        data: subscriptionStatus,
        isLoading: isLoadingStatus,
    } = useQuery({
        queryKey: ['revenuecat-status', user?.clerkId],
        queryFn: async () => {
            if (!user?.clerkId) return null;
            return await getSubscriptionStatus();
        },
        enabled: !!user?.clerkId,
        staleTime: 1 * 60 * 1000, // 1 minute
    });

    // Get offerings (products)
    const {
        data: offerings,
        isLoading: isLoadingOfferings,
        refetch: refetchOfferings,
    } = useQuery({
        queryKey: ['revenuecat-offerings'],
        queryFn: async () => {
            return await getOfferings();
        },
        staleTime: 5 * 60 * 1000, // 5 minutes - offerings don't change often
    });

    // Sync RevenueCat to Appwrite when customer info changes
    useEffect(() => {
        const syncSubscription = async () => {
            if (user?.clerkId && customerInfo) {
                try {
                    await syncRevenueCatToAppwrite(user.clerkId, customerInfo);
                    // Invalidate subscription queries to refresh
                    queryClient.invalidateQueries({ queryKey: ['subscription', user.clerkId] });
                    queryClient.invalidateQueries({ queryKey: ['subscriptionTier', user.clerkId] });
                } catch (error) {
                    console.error('[REVENUECAT] Error syncing subscription:', error);
                }
            }
        };

        syncSubscription();
    }, [customerInfo, user?.clerkId, queryClient]);

    /**
     * Purchase a package
     */
    const purchase = async (packageToPurchase: PurchasesPackage): Promise<CustomerInfo> => {
        if (!user?.clerkId) {
            throw new Error('User not authenticated');
        }

        try {
            const customerInfo = await purchasePackage(packageToPurchase);
            
            // Handle purchase completion
            await handlePurchaseComplete(user.clerkId, customerInfo);
            
            // Refetch customer info
            await refetchCustomerInfo();
            await refetchEntitlement();
            
            return customerInfo;
        } catch (error) {
            console.error('[REVENUECAT] Purchase error:', error);
            throw error;
        }
    };

    /**
     * Restore purchases
     */
    const restore = async (): Promise<CustomerInfo> => {
        if (!user?.clerkId) {
            throw new Error('User not authenticated');
        }

        try {
            const customerInfo = await restorePurchases();
            
            // Sync to Appwrite
            await syncRevenueCatToAppwrite(user.clerkId, customerInfo);
            
            // Refetch
            await refetchCustomerInfo();
            await refetchEntitlement();
            
            return customerInfo;
        } catch (error) {
            console.error('[REVENUECAT] Restore error:', error);
            throw error;
        }
    };

    /**
     * Refresh all RevenueCat data
     */
    const refresh = async () => {
        await Promise.all([
            refetchCustomerInfo(),
            refetchEntitlement(),
            refetchOfferings(),
        ]);
    };

    return {
        // Data
        customerInfo,
        hasEntitlement: hasEntitlement || false,
        subscriptionStatus,
        offerings,
        
        // Loading states
        isLoading: isLoadingCustomerInfo || isLoadingEntitlement || isLoadingStatus || isLoadingOfferings,
        
        // Actions
        purchase,
        restore,
        refresh,
        
        // Helpers
        isPro: hasEntitlement || false,
    };
};
