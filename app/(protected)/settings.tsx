import SignOutButton from '@/components/clerk/SignOutButton';
import CustomerCenter from '@/components/CustomerCenter';
import Paywall from '@/components/Paywall';
import { Layout, Text, View } from '@/components/ui/';
import { useAuth } from '@/hooks/use-auth';
import { useRevenueCat } from '@/hooks/use-revenuecat';
import { Ionicons } from '@expo/vector-icons';
import { PressableScale } from 'pressto';
import { useState } from 'react';
import { Modal, ScrollView } from 'react-native';

export default function SettingsScreen() {
    const { user } = useAuth();
    const { isPro, subscriptionStatus, isLoading } = useRevenueCat();
    const [showPaywall, setShowPaywall] = useState(false);
    const [showCustomerCenter, setShowCustomerCenter] = useState(false);

    return (
        <Layout>
            <ScrollView className='flex-1'>
                <View className='px-6 py-8'>
                    {/* Header */}
                    <View className='mb-8'>
                        <Text size='xxxl' className='font-bold text-white mb-2'>Settings</Text>
                        <Text size='sm' className='text-gray-400'>
                            Manage your account and subscription
                        </Text>
                    </View>

                    {/* Subscription Section */}
                    <View className='bg-gray-800/50 rounded-xl p-5 mb-6'>
                        <View className='flex-row items-center justify-between mb-4'>
                            <View>
                                <Text size='lg' className='font-semibold text-white mb-1'>
                                    Subscription
                                </Text>
                                <Text size='sm' className='text-gray-400'>
                                    {isPro ? 'Pro Plan Active' : 'Free Plan'}
                                </Text>
                            </View>
                            <View className={`px-3 py-1 rounded-full ${isPro ? 'bg-green-500/20' : 'bg-gray-500/20'}`}>
                                <Text size='xs' className={`font-semibold ${isPro ? 'text-green-400' : 'text-gray-400'}`}>
                                    {isPro ? 'PRO' : 'FREE'}
                                </Text>
                            </View>
                        </View>

                        {subscriptionStatus?.expirationDate && (
                            <View className='mb-4'>
                                <Text size='sm' className='text-gray-400 mb-1'>
                                    Expires on
                                </Text>
                                <Text size='md' className='text-white'>
                                    {subscriptionStatus.expirationDate.toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </Text>
                            </View>
                        )}

                        <View className='gap-3'>
                            {!isPro && (
                                <PressableScale onPress={() => setShowPaywall(true)}>
                                    <View className='bg-blue-500 rounded-xl p-4 flex-row items-center justify-between'>
                                        <View className='flex-row items-center gap-3'>
                                            <Ionicons name='star' size={24} color='white' />
                                            <Text size='md' className='font-semibold text-white'>
                                                Upgrade to Pro
                                            </Text>
                                        </View>
                                        <Ionicons name='chevron-forward' size={20} color='white' />
                                    </View>
                                </PressableScale>
                            )}

                            <PressableScale onPress={() => setShowCustomerCenter(true)}>
                                <View className='bg-gray-700 rounded-xl p-4 flex-row items-center justify-between'>
                                    <View className='flex-row items-center gap-3'>
                                        <Ionicons name='person-circle' size={24} color='#9ca3af' />
                                        <Text size='md' className='font-semibold text-gray-300'>
                                            Manage Subscription
                                        </Text>
                                    </View>
                                    <Ionicons name='chevron-forward' size={20} color='#9ca3af' />
                                </View>
                            </PressableScale>
                        </View>
                    </View>

                    {/* Account Section */}
                    <View className='bg-gray-800/50 rounded-xl p-5 mb-6'>
                        <Text size='lg' className='font-semibold text-white mb-4'>
                            Account
                        </Text>
                        <View className='gap-3'>
                            <View className='flex-row items-center justify-between py-3'>
                                <Text size='md' className='text-gray-300'>
                                    Email
                                </Text>
                                <Text size='md' className='text-white'>
                                    {user?.email || 'N/A'}
                                </Text>
                            </View>
                            <View className='flex-row items-center justify-between py-3 border-t border-gray-700'>
                                <Text size='md' className='text-gray-300'>
                                    Name
                                </Text>
                                <Text size='md' className='text-white'>
                                    {user?.fullName || 'N/A'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Sign Out */}
                    <View className='mb-6'>
                        <SignOutButton />
                    </View>
                </View>
            </ScrollView>

            {/* Paywall Modal */}
            <Modal
                visible={showPaywall}
                animationType='slide'
                presentationStyle='pageSheet'
                onRequestClose={() => setShowPaywall(false)}
            >
                <View className='flex-1 bg-gray-900'>
                    <ScrollView className='flex-1' contentContainerClassName='p-6 justify-center'>
                        <Paywall
                            onDismiss={() => setShowPaywall(false)}
                            onPurchaseComplete={() => {
                                setShowPaywall(false);
                            }}
                        />
                    </ScrollView>
                </View>
            </Modal>

            {/* Customer Center Modal */}
            <Modal
                visible={showCustomerCenter}
                animationType='slide'
                presentationStyle='pageSheet'
                onRequestClose={() => setShowCustomerCenter(false)}
            >
                <View className='flex-1 bg-gray-900'>
                    <ScrollView className='flex-1' contentContainerClassName='p-6 justify-center'>
                        <CustomerCenter onDismiss={() => setShowCustomerCenter(false)} />
                    </ScrollView>
                </View>
            </Modal>
        </Layout>
    );
}
