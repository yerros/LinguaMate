import { ImageBackground, StyleSheet, View } from "react-native";

export default function Layout({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <View className={`flex-1 bg-black ${className || ''}`}>
            <ImageBackground source={require('@/assets/images/bg-gradient.png')} style={styles.gradient}></ImageBackground>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    gradient: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: 300,
        height: 300,
        borderRadius: 50,
    }
});