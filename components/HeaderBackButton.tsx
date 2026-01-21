import { Entypo } from "@expo/vector-icons";
import { router } from "expo-router";
import { PressableScale } from "pressto";
import { View } from "react-native";

export default function HeaderBackButton() {
    return (
        <PressableScale onPress={() => router.back()}>
            <View className="items-center justify-center w-10 h-10">
                <Entypo name='chevron-thin-left' size={24} color='#fff' />
            </View>
        </PressableScale>
    );
}