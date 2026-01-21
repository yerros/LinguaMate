import HeaderBackButton from "@/components/HeaderBackButton";
import { Stack } from "expo-router";

import { FontAwesome } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { PressableOpacity } from 'pressto';
import { View } from "react-native";

//  for back button
const HeaderBackButton = () => {
    return (
        <PressableOpacity onPress={() => router.back()} >
            <View className="items-center justify-center w-10 h-10">
                <FontAwesome name='arrow-left' size={24} color='#fff' />
            </View>
        </PressableOpacity>
    )
}
export default function ChatLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }} initialRouteName="index">
            <Stack.Screen name="index" />
            <Stack.Screen name="history" />
            <Stack.Screen name="voice" options={{ headerShown: true,headerTransparent: true, presentation: 'fullScreenModal', title: '', headerLeft: () => <HeaderBackButton /> }} />
            <Stack.Screen name="history" options={{ headerShown: true, headerTransparent: true, title: '', headerLeft: () => <HeaderBackButton /> }} />
        </Stack>
    );
}