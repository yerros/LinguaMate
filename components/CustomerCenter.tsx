import { Text, View } from '@/components/ui/';
import { useRevenueCat } from '@/hooks/use-revenuecat';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Alert, Linking, Platform, Pressable } from 'react-native';

interface CustomerCenterProps {
    onDismiss?: () => void;
}

/**
 * Customer Center Component
 * Allows users to manage their subscription
 */
export default function CustomerCenter({ onDismiss }: CustomerCenterProps) {
    const { customerInfo, subscriptionStatus, restore, isLoading, refresh } = useRevenueCat();
    const [isRestoring, setIsRestoring] = useState(false);

    const handleRestore = async () => {
        setIsRestoring(true);
        try {
            await restore();
            Alert.alert('Success', 'Purchases restored successfully!');
            await refresh();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to restore purchases');
        } finally {
            setIsRestoring(false);
        }
    };

    const handleManageSubscription = async () => {
        try {
            // Open platform-specific subscription management
            if (Platform.OS === 'ios') {
                // iOS: Open App Store subscription management
                await Linking.openURL('https://apps.apple.com/account/subscriptions');
            } else if (Platform.OS === 'android') {
                // Android: Open Google Play subscription management
                await Linking.openURL('https://play.google.com/store/account/subscriptions');
            }
        } catch (error) {
            console.error('Error opening subscription management:', error);
            Alert.alert(
                'Error',
                'Unable to open subscription management. Please visit your device settings.'
            );
        }
    };

    if (isLoading && !customerInfo) {
        return (
            <View className='bg-gray-900/95 rounded-2xl p-6 items-center gap-4'>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text className='text-gray-400'>Loading subscription information...</Text>
            </View>
        );
    }

    const hasActiveSubscription = subscriptionStatus?.hasActiveSubscription || false;
    const expirationDate = subscriptionStatus?.expirationDate;

    return (
        <View className='bg-gray-900/95 rounded-2xl p-6'>
            {/* Header */}
            <View className='items-center mb-6'>
                <Ionicons name='person-circle' size={64} color='#3b82f6' />
                <Text size='xxl' className='font-bold text-white mt-2 mb-1'>
                    Account & Subscription
                </Text>
            </View>

            {/* Subscription Status */}
            <View className='bg-gray-800/50 rounded-xl p-4 mb-4'>
                <View className='flex-row items-center justify-between mb-3'>
                    <Text size='md' className='font-semibold text-white'>
                        Subscription Status
                    </Text>
                    <View className={`px-3 py-1 rounded-full ${hasActiveSubscription ? 'bg-green-500/20' : 'bg-gray-500/20'}`}>
                        <Text size='xs' className={`font-semibold ${hasActiveSubscription ? 'text-green-400' : 'text-gray-400'}`}>
                            {hasActiveSubscription ? 'ACTIVE' : 'FREE'}
                        </Text>
                    </View>
                </View>

                {hasActiveSubscription && expirationDate && (
                    <View className='mt-2'>
                        <Text size='sm' className='text-gray-400 mb-1'>
                            Expires on
                        </Text>
                        <Text size='md' className='text-white font-semibold'>
                            {expirationDate.toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </Text>
                    </View>
                )}

                {!hasActiveSubscription && (
                    <Text size='sm' className='text-gray-400 mt-2'>
                        You're currently on the free plan with limited usage.
                    </Text>
                )}
            </View>

            {/* Active Subscriptions */}
            {customerInfo && customerInfo.activeSubscriptions.length > 0 && (
                <View className='bg-gray-800/50 rounded-xl p-4 mb-4'>
                    <Text size='md' className='font-semibold text-white mb-2'>
                        Active Subscriptions
                    </Text>
                    {customerInfo.activeSubscriptions.map((subscriptionId) => (
                        <View key={subscriptionId} className='flex-row items-center gap-2 mb-1'>
                            <Ionicons name='checkmark-circle' size={16} color='#10b981' />
                            <Text size='sm' className='text-gray-300'>
                                {subscriptionId}
                            </Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Actions */}
            <View className='gap-3'>
                {hasActiveSubscription && (
                    <Pressable onPress={handleManageSubscription}>
                        <View className='bg-blue-500 rounded-xl p-4 flex-row items-center justify-between' pointerEvents="none">
                            <View className='flex-row items-center gap-3' pointerEvents="none">
                                <Ionicons name='settings' size={24} color='white' />
                                <Text size='md' className='font-semibold text-white'>
                                    Manage Subscription
                                </Text>
                            </View>
                            <Ionicons name='chevron-forward' size={20} color='white' />
                        </View>
                    </Pressable>
                )}

                <Pressable
                    onPress={() => {
                        if (isRestoring) return;
                        handleRestore();
                    }}
                    disabled={isRestoring}
                >
                    <View
                        className='bg-gray-700 rounded-xl p-4 flex-row items-center justify-between'
                        style={{ opacity: isRestoring ? 0.6 : 1 }}
                        pointerEvents="none"
                    >
                        <View className='flex-row items-center gap-3' pointerEvents="none">
                            {isRestoring ? (
                                <ActivityIndicator size="small" color="#9ca3af" />
                            ) : (
                                <Ionicons name='refresh' size={24} color='#9ca3af' />
                            )}
                            <Text size='md' className='font-semibold text-gray-300'>
                                Restore Purchases
                            </Text>
                        </View>
                    </View>
                </Pressable>

                {onDismiss && (
                    <Pressable onPress={onDismiss}>
                        <View className='bg-gray-800 rounded-xl p-4' pointerEvents="none">
                            <Text size='md' className='font-semibold text-gray-400 text-center'>
                                Close
                            </Text>
                        </View>
                    </Pressable>
                )}
            </View>

            {/* Customer Info */}
            {customerInfo && (
                <View className='mt-4 pt-4 border-t border-gray-700'>
                    <Text size='xs' className='text-gray-500 text-center'>
                        Customer ID: {customerInfo.originalAppUserId}
                    </Text>
                </View>
            )}
        </View>
    );
}
