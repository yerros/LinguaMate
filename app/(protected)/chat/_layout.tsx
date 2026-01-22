import HeaderBackButton from "@/components/HeaderBackButton";


import { Stack } from "expo-router";


export default function ChatLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }} initialRouteName="index">
            <Stack.Screen name="index" />
            <Stack.Screen name="voice" options={{ headerShown: true, headerTransparent: true, presentation: 'fullScreenModal', title: '', headerLeft: () => <HeaderBackButton /> }} />
            <Stack.Screen name="history" options={{ headerShown: true, headerTransparent: true, title: '', headerLeft: () => <HeaderBackButton /> }} />
        </Stack>
    );
}