import { Image } from "expo-image";
import { ActivityIndicator, View } from "react-native";

export default function LoadingScreen() {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000' }}>
            <Image source={require('../../assets/images/splash.png')} style={{ width: '100%', height: '100%' }} />
            <ActivityIndicator size="large" color="#ffffff" />
        </View>
    );
}