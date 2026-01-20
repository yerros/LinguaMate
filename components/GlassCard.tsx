import { Text } from '@/components/ui/';
import { BlurView } from 'expo-blur';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface GlassCardProps {
    icon: any;
    title: string;
    subtitle: string;
    onPress?: () => void;
    iconColor?: string;
    iconSize?: number;
}

const GlassCard: React.FC<GlassCardProps> = ({
    icon,
    title,
    subtitle,
    onPress,
    iconColor = '#60A5FA',
    iconSize = 32
}) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    const handlePressIn = () => {
        scale.value = withSpring(0.95, {
            damping: 15,
            stiffness: 150,
        });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, {
            damping: 15,
            stiffness: 150,
        });
    };

    return (
        <AnimatedTouchable
            className="border border-gray-800/60 rounded-3xl p-8 w-48 overflow-hidden"
            style={[
                animatedStyle,
                {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: 0.5,
                    shadowRadius: 20,
                    elevation: 10,
                    backgroundColor: 'transparent',
                }
            ]}
            activeOpacity={1}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={onPress}
        >
            {/* BlurView background for glassmorphism effect */}
            <BlurView
                intensity={20}
                tint="dark"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: 24,
                }}
            />

            {/* Gradient overlay effect */}
            <View
                className="absolute inset-0 rounded-3xl opacity-20"
                style={{
                    backgroundColor: `${iconColor}10`,
                }}
            />

            {/* Icon */}
            <View className="mb-5">
                {icon}
            </View>

            {/* Title */}
            <Text
                className="text-white text-xl font-semibold mb-1.5 tracking-tight"
                style={{
                    fontWeight: '600',
                    letterSpacing: -0.3
                }}
            >
                {title}
            </Text>

            {/* Subtitle */}
            <Text
                className="text-gray-400 text-base"
                style={{
                    textDecorationLine: 'underline',
                    textDecorationColor: 'rgba(156, 163, 175, 0.6)',
                    letterSpacing: -0.2
                }}
            >
                {subtitle}
            </Text>
        </AnimatedTouchable>
    );
};



export default GlassCard;