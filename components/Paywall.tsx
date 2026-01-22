import { View, Text } from '@/components/ui/';
import { useRevenueCat } from '@/hooks/use-revenuecat';
import { PressableScale } from 'pressto';
import { useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { PurchasesPackage } from 'react-native-purchases';

interface PaywallProps {
    onDismiss?: () => void;
    onPurchaseComplete?: () => void;
}

/**
 * RevenueCat Paywall Component
 * Displays available subscription packages
 */
export default function Paywall({ onDismiss, onPurchaseComplete }: PaywallProps) {
    const { offerings, purchase, restore, isLoading, isPro } = useRevenueCat();
    const [purchasingPackageId, setPurchasingPackageId] = useState<string | null>(null);

    // If user already has pro, show message
    if (isPro) {
        return (
            <View className='bg-gray-900/95 rounded-2xl p-6 items-center gap-4'>
                <Ionicons name='checkmark-circle' size={64} color='#10b981' />
                <Text size='xl' className='font-bold text-white text-center'>
                    You're already subscribed!
                </Text>
                <Text size='sm' className='text-gray-400 text-center'>
                    You have access to all premium features.
                </Text>
                {onDismiss && (
                    <PressableScale onPress={onDismiss}>
                        <View className='bg-blue-500 px-6 py-3 rounded-lg mt-4'>
                            <Text className='text-white font-semibold'>Close</Text>
                        </View>
                    </PressableScale>
                )}
            </View>
        );
    }

    // If no offerings available
    if (!offerings) {
        return (
            <View className='bg-gray-900/95 rounded-2xl p-6 items-center gap-4'>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text className='text-gray-400'>Loading subscription options...</Text>
            </View>
        );
    }

    const handlePurchase = async (packageToPurchase: PurchasesPackage) => {
        if (purchasingPackageId) return; // Prevent double purchase

        setPurchasingPackageId(packageToPurchase.identifier);
        
        try {
            await purchase(packageToPurchase);
            
            Alert.alert(
                'Success!',
                'Your subscription is now active. Enjoy all premium features!',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            onPurchaseComplete?.();
                            onDismiss?.();
                        }
                    }
                ]
            );
        } catch (error: any) {
            console.error('Purchase error:', error);
            
            if (error.message === 'Purchase was cancelled') {
                // User cancelled, don't show error
                return;
            }
            
            Alert.alert(
                'Purchase Failed',
                error.message || 'An error occurred during purchase. Please try again.',
                [{ text: 'OK' }]
            );
        } finally {
            setPurchasingPackageId(null);
        }
    };

    const formatPrice = (price: string, currencyCode: string) => {
        // Simple formatting - you can enhance this
        return `${currencyCode} ${price}`;
    };

    const getPackageDisplayName = (packageIdentifier: string) => {
        if (packageIdentifier.includes('monthly')) {
            return 'Monthly';
        } else if (packageIdentifier.includes('yearly') || packageIdentifier.includes('annual')) {
            return 'Yearly';
        }
        return packageIdentifier;
    };

    const getPackageDescription = (packageIdentifier: string) => {
        if (packageIdentifier.includes('yearly') || packageIdentifier.includes('annual')) {
            return 'Best value - Save up to 50%';
        }
        return 'Flexible monthly billing';
    };

    return (
        <View className='bg-gray-900/95 rounded-2xl p-6'>
            {/* Header */}
            <View className='items-center mb-6'>
                <Text size='xxxl' className='font-bold text-white mb-2'>
                    Upgrade to Pro
                </Text>
                <Text size='sm' className='text-gray-400 text-center'>
                    Unlock unlimited conversations, characters, and minutes
                </Text>
            </View>

            {/* Packages */}
            <View className='gap-4 mb-6'>
                {offerings.availablePackages.map((pkg) => {
                    const isPurchasing = purchasingPackageId === pkg.identifier;
                    const isMonthly = pkg.identifier.includes('monthly');
                    const isYearly = pkg.identifier.includes('yearly') || pkg.identifier.includes('annual');
                    
                    return (
                        <Pressable
                            key={pkg.identifier}
                            onPress={() => {
                                if (isPurchasing || isLoading) return;
                                handlePurchase(pkg);
                            }}
                            disabled={isPurchasing || isLoading}
                        >
                            <LinearGradient
                                colors={isYearly 
                                    ? ['#10b981', '#059669'] 
                                    : ['#3b82f6', '#2563eb']
                                }
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                className='rounded-xl p-5'
                                style={{ opacity: (isPurchasing || isLoading) ? 0.6 : 1 }}
                            >
                                <View className='flex-row items-center justify-between' pointerEvents="none">
                                    <View className='flex-1' pointerEvents="none">
                                        <View className='flex-row items-center gap-2 mb-1' pointerEvents="none">
                                            <Text size='lg' className='font-bold text-white'>
                                                {getPackageDisplayName(pkg.identifier)}
                                            </Text>
                                            {isYearly && (
                                                <View className='bg-yellow-500 px-2 py-0.5 rounded' pointerEvents="none">
                                                    <Text size='xs' className='text-black font-bold'>
                                                        BEST VALUE
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                        <Text size='sm' className='text-white/80 mb-2'>
                                            {getPackageDescription(pkg.identifier)}
                                        </Text>
                                        <Text size='xl' className='font-bold text-white'>
                                            {pkg.product.priceString}
                                        </Text>
                                        {isYearly && (
                                            <Text size='xs' className='text-white/70 mt-1'>
                                                {pkg.product.introPrice
                                                    ? `Then ${pkg.product.priceString}/year`
                                                    : 'Billed annually'
                                                }
                                            </Text>
                                        )}
                                    </View>
                                    <View pointerEvents="none">
                                        {isPurchasing ? (
                                            <ActivityIndicator size="small" color="white" />
                                        ) : (
                                            <Ionicons name='chevron-forward' size={24} color='white' />
                                        )}
                                    </View>
                                </View>
                            </LinearGradient>
                        </Pressable>
                    );
                })}
            </View>

            {/* Features */}
            <View className='gap-3 mb-6'>
                <View className='flex-row items-center gap-3'>
                    <Ionicons name='checkmark-circle' size={20} color='#10b981' />
                    <Text size='sm' className='text-gray-300'>
                        Unlimited conversations per day
                    </Text>
                </View>
                <View className='flex-row items-center gap-3'>
                    <Ionicons name='checkmark-circle' size={20} color='#10b981' />
                    <Text size='sm' className='text-gray-300'>
                        Unlimited characters and minutes
                    </Text>
                </View>
                <View className='flex-row items-center gap-3'>
                    <Ionicons name='checkmark-circle' size={20} color='#10b981' />
                    <Text size='sm' className='text-gray-300'>
                        Priority support
                    </Text>
                </View>
                <View className='flex-row items-center gap-3'>
                    <Ionicons name='checkmark-circle' size={20} color='#10b981' />
                    <Text size='sm' className='text-gray-300'>
                        Cancel anytime
                    </Text>
                </View>
            </View>

            {/* Restore & Dismiss */}
            <View className='gap-3'>
                <PressableScale
                    onPress={async () => {
                        if (isLoading) return;
                        try {
                            await restore();
                            Alert.alert('Success', 'Purchases restored successfully!');
                            onPurchaseComplete?.();
                            onDismiss?.();
                        } catch (error: any) {
                            Alert.alert('Error', error.message || 'Failed to restore purchases');
                        }
                    }}
                >
                    <Text size='sm' className='text-blue-400 text-center underline'>
                        Restore Purchases
                    </Text>
                </PressableScale>
                
                {onDismiss && (
                    <PressableScale onPress={onDismiss}>
                        <Text size='sm' className='text-gray-500 text-center'>
                            Maybe Later
                        </Text>
                    </PressableScale>
                )}
            </View>

            {/* Legal text */}
            <Text size='xs' className='text-gray-600 text-center mt-4'>
                Payment will be charged to your {Platform.OS === 'ios' ? 'Apple' : 'Google'} account. 
                Subscription automatically renews unless cancelled at least 24 hours before the end of the current period.
            </Text>
        </View>
    );
}
