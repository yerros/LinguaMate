import { Text, View } from '@/components/ui/';
import { useUsageLimit } from '@/hooks/use-usage-limit';
import { getRemainingUsage, getUsageLimits } from '@/utils/usage-limits';
import { Alert, Pressable } from 'react-native';

/**
 * Component to display usage limit banner
 */
export default function UsageLimitBanner() {
    const { dailyUsage, subscriptionTier, isLoading } = useUsageLimit();

    if (isLoading || !dailyUsage) {
        return null;
    }

    const limits = getUsageLimits(subscriptionTier);
    const remainingConversations = getRemainingUsage(
        dailyUsage.conversationsCount,
        limits.dailyConversations
    );
    const remainingCharacters = getRemainingUsage(
        dailyUsage.charactersUsed,
        limits.dailyCharacters
    );
    const remainingMinutes = getRemainingUsage(
        dailyUsage.minutesUsed,
        limits.dailyMinutes
    );

    // Don't show if all limits are unlimited or not reached
    // Use number type to allow -1 (unlimited) comparison
    const conversationsLimit: number = limits.dailyConversations;
    const charactersLimit: number = limits.dailyCharacters;
    const minutesLimit: number = limits.dailyMinutes;

    if (
        (conversationsLimit === -1 || remainingConversations > 0) &&
        (charactersLimit === -1 || remainingCharacters > 0) &&
        (minutesLimit === -1 || remainingMinutes > 0)
    ) {
        return null;
    }

    const showUpgrade = () => {
        Alert.alert(
            'Limit Reached',
            'You have reached your daily usage limit. Upgrade to Pro or Pro Plus for more usage.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Upgrade', onPress: () => {
                        // Navigate to upgrade screen
                        console.log('Navigate to upgrade');
                    }
                }
            ]
        );
    };

    return (
        <Pressable onPress={showUpgrade}>
            <View className='bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4'>
                <Text size='xs' className='text-yellow-400 font-semibold'>
                    Daily Limit Reached
                </Text>
            </View>
        </Pressable>
    );
}
