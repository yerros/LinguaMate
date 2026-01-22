import { useAuth } from '@/hooks/use-auth';
import { Icon, NativeTabs } from 'expo-router/unstable-native-tabs';
import { ActivityIndicator, Platform, View } from 'react-native';

const icon = {
    home: require('../../assets/images/home_icon.png'),
    chat: require('../../assets/images/chat_icon.png'),
    settings: require('../../assets/images/user_icon.png'),
}

export default function TabLayout() {
    // Ensure user is fetched when protected area is opened
    const { isLoading, user } = useAuth();

    // Show loading while user is being fetched
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
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
                <NativeTabs.Trigger name="chat">
                    {Platform.select({
                        ios: <Icon sf={{ default: 'message', selected: 'message.fill' }} />,
                        android: <Icon src={icon.chat} />
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
