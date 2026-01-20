import { Stack } from "expo-router";

export default function ChatLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }} initialRouteName="chat">
            <Stack.Screen name="chat" />
            <Stack.Screen name="history" />
        </Stack>
    );
}