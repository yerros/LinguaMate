import { ImageBackground, StyleSheet, View } from "react-native";

export default function Layout({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <View className={`flex-1 pt-20 px-6 pb-20 bg-black ${className || ''}`}>
            <ImageBackground source={require('@/assets/images/bg-gradient.png')} style={styles.gradient}></ImageBackground>
            {children}
            <ImageBackground source={require('@/assets/images/bg-bottom.png')} style={styles.bottom}></ImageBackground>
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
        pointerEvents: 'none',
    },
    bottom: {
        zIndex: 1,
        position: 'absolute',
        bottom: -300,
        left: 0,
        width: 500,
        height: '100%',
        borderRadius: 50,
        pointerEvents: 'none',
    }
});