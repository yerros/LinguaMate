import HeaderBackButton from '@/components/HeaderBackButton';
import Paywall from '@/components/Paywall';
import { Layout, Text, View } from '@/components/ui/';
import { router } from 'expo-router';
import { View as RNView } from 'react-native';

export default function PaywallScreen() {
    return (
        <Layout>
            <View className='flex-1'>
                {/* Header */}
                <View className='flex-row items-center justify-between mb-6'>
                    <HeaderBackButton />
                    <Text size='xxl' className='text-white font-bold'>Upgrade to Pro</Text>
                    <RNView style={{ width: 40 }} /> {/* Spacer for centering */}
                </View>

                {/* Paywall Content */}
                <View className='flex-1 justify-center px-6'>
                    <Paywall
                        onDismiss={() => router.back()}
                        onPurchaseComplete={() => {
                            // Refresh subscription data
                            router.back();
                        }}
                    />
                </View>
            </View>
        </Layout>
    );
}
