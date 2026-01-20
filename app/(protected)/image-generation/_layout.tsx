import { Stack } from "expo-router";

export default function ImageGenerationLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }} initialRouteName="index">
            <Stack.Screen name="index" />
        </Stack>
    );
}