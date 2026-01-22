import LoadingScreen from '@/components/screen/LoadingScreen';
import { useAuth } from '@/hooks/use-auth';
import { useSubscription } from '@/hooks/use-subscription';
import { Icon, NativeTabs } from 'expo-router/unstable-native-tabs';
import { Platform } from 'react-native';

const icon = {
    home: require('../../assets/images/home_icon.png'),
    voice: require('../../assets/images/microphone.png'),
    settings: require('../../assets/images/user_icon.png'),
}

export default function TabLayout() {
    // Ensure user is fetched when protected area is opened
    const { isLoading, user } = useAuth();
    // Ensure subscription is checked/created when protected area is opened
    const { isLoading: isLoadingSubscription } = useSubscription();

    // Show loading while user or subscription is being fetched
    if (isLoading || isLoadingSubscription) {
        return <LoadingScreen />;
    }

    return (
        <>
            <NativeTabs
            >
                <NativeTabs.Trigger name="index">
                    {Platform.select({
                        ios: <Icon sf={{ default: 'house', selected: 'house.fill' }} />,
                        android: <Icon src={icon.home} />
                    })}
                </NativeTabs.Trigger>
                <NativeTabs.Trigger name="voice">
                    {Platform.select({
                        ios: <Icon sf={{ default: 'mic', selected: 'mic.fill' }} />,
                        android: <Icon src={icon.voice} />
                    })}
                </NativeTabs.Trigger>
                <NativeTabs.Trigger name="settings">
                    {Platform.select({
                        ios: <Icon sf={{ default: 'gear', selected: 'gear' }} />,
                        android: <Icon src={icon.settings} />
                    })}
                </NativeTabs.Trigger>
            </NativeTabs>
        </>
    );
}
