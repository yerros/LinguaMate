import { Icon, NativeTabs } from 'expo-router/unstable-native-tabs';
import { Platform } from 'react-native';


const icon = {
    home: require('../../assets/images/home_icon.png'),
    chat: require('../../assets/images/chat_icon.png'),
    settings: require('../../assets/images/user_icon.png'),
}

export default function TabLayout() {
    return (
        <>
            <NativeTabs
            >
                <NativeTabs.Trigger name="index">
                    {Platform.select({
                        ios: <Icon sf={{ default: 'house', selected: 'house.fill' }} />,
                        android: <Icon src={icon.home} style={{ width: 24, height: 24 }} />
                    })}
                </NativeTabs.Trigger>
                <NativeTabs.Trigger name="chat">
                    {Platform.select({
                        ios: <Icon sf={{ default: 'message', selected: 'message.fill' }} />,
                        android: <Icon src={icon.chat} style={{ width: 24, height: 24 }} />
                    })}
                </NativeTabs.Trigger>
                <NativeTabs.Trigger name="settings">
                    {Platform.select({
                        ios: <Icon sf={{ default: 'gear', selected: 'gear' }} />,
                        android: <Icon src={icon.settings} style={{ width: 24, height: 24 }} />
                    })}
                </NativeTabs.Trigger>
            </NativeTabs>
        </>
    );
}
