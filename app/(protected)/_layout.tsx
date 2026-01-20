import { Icon, NativeTabs } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
    return (
        <NativeTabs
        >
            <NativeTabs.Trigger name="index">
                <Icon sf={{ default: 'house', selected: 'house.fill' }} drawable="custom_home_drawable" />
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="chat">
                <Icon sf={{ default: 'message', selected: 'message.fill' }} drawable="custom_chat_drawable" />
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="settings">
                <Icon sf={{ default: 'gear', selected: 'gear' }} drawable="custom_settings_drawable" />
            </NativeTabs.Trigger>
        </NativeTabs>
    );
}
