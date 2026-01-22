import { Layout, Text, View } from '@/components/ui/';
import UsageLimitBanner from '@/components/UsageLimitBanner';
import { useAuth } from '@/hooks/use-auth';
import { useUsageLimit } from '@/hooks/use-usage-limit';
import { updateUserTotalUsage } from '@/services/usage';
import { useConversation } from '@elevenlabs/react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PressableScale } from 'pressto';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, View as RNView, StyleSheet } from 'react-native';
import Animated, {
    Easing,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function VoiceScreen() {
    const [isConnected, setIsConnected] = useState(false);
    const [isConversationStarted, setIsConversationStarted] = useState(false);
    const [isCheckingLimit, setIsCheckingLimit] = useState(false);
    const [conversationStartTime, setConversationStartTime] = useState<Date | null>(null);

    // Usage limits
    const { user } = useAuth();
    const { canPerformAction, recordUsage, isLoading: isLoadingUsage } = useUsageLimit();

    const AnimatedIcon = Animated.createAnimatedComponent(Ionicons);
    const AnimatedView = Animated.createAnimatedComponent(RNView);

    const scale = useSharedValue(1);
    const ripple1 = useSharedValue(0);
    const ripple2 = useSharedValue(0);
    const ripple3 = useSharedValue(0);

    // Refs to store timeout IDs
    const timeout2Ref = useRef<ReturnType<typeof setTimeout> | null>(null);
    const timeout3Ref = useRef<ReturnType<typeof setTimeout> | null>(null);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    const ripple1Style = useAnimatedStyle(() => {
        const opacity = interpolate(ripple1.value, [0, 1], [0.6, 0]);
        const scale = interpolate(ripple1.value, [0, 1], [1, 2.5]);
        return {
            opacity,
            transform: [{ scale }],
        };
    });

    const ripple2Style = useAnimatedStyle(() => {
        const opacity = interpolate(ripple2.value, [0, 1], [0.4, 0]);
        const scale = interpolate(ripple2.value, [0, 1], [1, 2.5]);
        return {
            opacity,
            transform: [{ scale }],
        };
    });

    const ripple3Style = useAnimatedStyle(() => {
        const opacity = interpolate(ripple3.value, [0, 1], [0.3, 0]);
        const scale = interpolate(ripple3.value, [0, 1], [1, 2.5]);
        return {
            opacity,
            transform: [{ scale }],
        };
    });

    useEffect(() => {
        if (isConnected) {
            // Icon animation: scale up to 1.15, then down to 1.0, repeat continuously
            scale.value = withRepeat(
                withSequence(
                    withTiming(1.15, {
                        duration: 1000,
                        easing: Easing.inOut(Easing.ease)
                    }),
                    withTiming(1.0, {
                        duration: 1000,
                        easing: Easing.inOut(Easing.ease)
                    })
                ),
                -1,
                false
            );

            // Ripple effect with different delays - reset to 0 after completion
            ripple1.value = withRepeat(
                withSequence(
                    withTiming(1, {
                        duration: 2000,
                        easing: Easing.out(Easing.ease)
                    }),
                    withTiming(0, { duration: 0 })
                ),
                -1,
                false
            );

            // Delay for ripple2
            timeout2Ref.current = setTimeout(() => {
                ripple2.value = withRepeat(
                    withSequence(
                        withTiming(1, {
                            duration: 2000,
                            easing: Easing.out(Easing.ease)
                        }),
                        withTiming(0, { duration: 0 })
                    ),
                    -1,
                    false
                );
            }, 667);

            // Delay for ripple3
            timeout3Ref.current = setTimeout(() => {
                ripple3.value = withRepeat(
                    withSequence(
                        withTiming(1, {
                            duration: 2000,
                            easing: Easing.out(Easing.ease)
                        }),
                        withTiming(0, { duration: 0 })
                    ),
                    -1,
                    false
                );
            }, 1334);
        } else {
            // Stop all animations and return to normal
            scale.value = withTiming(1, {
                duration: 300,
            });
            ripple1.value = withTiming(0, { duration: 300 });
            ripple2.value = withTiming(0, { duration: 300 });
            ripple3.value = withTiming(0, { duration: 300 });
        }

        return () => {
            // Cleanup: clear all active timeouts
            if (timeout2Ref.current !== null) {
                clearTimeout(timeout2Ref.current);
                timeout2Ref.current = null;
            }
            if (timeout3Ref.current !== null) {
                clearTimeout(timeout3Ref.current);
                timeout3Ref.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isConnected]);

    const conversation = useConversation({
        onConnect: () => setIsConnected(true),
        onDisconnect: () => setIsConnected(false),
        onMessage: (message) => console.log('Received message:', message),
        onError: (error) => console.error('Conversation error:', error),
        onModeChange: (mode) => console.log('Conversation mode changed:', mode),
        onStatusChange: (prop) => console.log('Conversation status changed:', prop.status),
        onCanSendFeedbackChange: (prop) =>
            console.log('Can send feedback changed:', prop.canSendFeedback),
        onUnhandledClientToolCall: (params) => console.log('Unhandled client tool call:', params),
    });

    const startConversation = async () => {
        if (!user?.clerkId) {
            Alert.alert('Error', 'User not authenticated');
            return;
        }

        setIsCheckingLimit(true);
        try {
            // Check if user can start a conversation
            const check = await canPerformAction({
                conversations: 1, // Will use 1 conversation
            });

            if (!check.allowed) {
                Alert.alert(
                    'Limit Reached',
                    check.reason || 'You have reached your daily conversation limit.',
                    [
                        { text: 'OK', style: 'cancel' },
                        {
                            text: 'Upgrade',
                            onPress: () => {
                                // Navigate to upgrade screen
                                console.log('Navigate to upgrade');
                            }
                        }
                    ]
                );
                setIsCheckingLimit(false);
                return;
            }

            // Start conversation
            await conversation.startSession({
                agentId: process.env.EXPO_PUBLIC_AGENT_ID,
            });

            // Record conversation start time for calculating minutes
            setConversationStartTime(new Date());
            setIsConversationStarted(true);
            console.log(conversation.status);
        } catch (error) {
            console.error('Error starting conversation:', error);
            Alert.alert('Error', 'Failed to start conversation. Please try again.');
        } finally {
            setIsCheckingLimit(false);
        }
    }

    const endConversation = async () => {
        if (!user?.clerkId) {
            Alert.alert('Error', 'User not authenticated');
            return;
        }

        try {
            console.log(conversation.status);
            await conversation.endSession();

            // Calculate minutes used
            let minutesUsed = 0;
            if (conversationStartTime) {
                const endTime = new Date();
                const diffMs = endTime.getTime() - conversationStartTime.getTime();
                minutesUsed = Math.ceil(diffMs / 60000); // Convert to minutes, round up
                minutesUsed = Math.max(1, minutesUsed); // At least 1 minute
            }

            // Record usage after conversation ends
            try {
                await recordUsage({
                    conversations: 1,
                    minutes: minutesUsed,
                });

                // Update total lifetime usage
                await updateUserTotalUsage(user.clerkId, {
                    conversations: 1,
                    minutes: minutesUsed,
                });
            } catch (usageError) {
                console.error('Error recording usage:', usageError);
                // Don't block the UI if usage recording fails
            }

            // Reset conversation state
            setConversationStartTime(null);
            setIsConversationStarted(false);
        } catch (error) {
            console.error('Failed to end conversation:', error);
            Alert.alert('Error', 'Failed to end conversation. Please try again.');
        }
    };


    return (
        <Layout>
            <View className='flex-1 items-center justify-center relative'>

                {/* Header Section */}
                <View className='absolute top-20 items-center gap-2 z-10'>
                    <Text size='xxxl' className='font-bold text-white mb-1'>Voice Assistant</Text>
                    <View className='flex-row items-center gap-2'>
                        <RNView
                            className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-gray-500'}`}
                            style={isConnected ? styles.pulse : undefined}
                        />
                        <Text size='sm' className='text-gray-400'>
                            {isConnected ? 'Connected' : 'Ready to connect'}
                        </Text>
                    </View>
                </View>

                {/* Mic Icon dengan Ripple Effect - Centered */}
                <View
                    className='absolute items-center justify-center'
                    style={styles.micContainer}
                >
                    {/* Ripple circles */}
                    {isConnected && (
                        <>
                            <AnimatedView
                                className='absolute rounded-full border-2 border-red-400'
                                style={[
                                    styles.rippleCircle,
                                    ripple1Style
                                ]}
                            >
                                <RNView />
                            </AnimatedView>
                            <AnimatedView
                                className='absolute rounded-full border-2 border-red-400'
                                style={[
                                    styles.rippleCircle,
                                    ripple2Style
                                ]}
                            >
                                <RNView />
                            </AnimatedView>
                            <AnimatedView
                                className='absolute rounded-full border-2 border-red-400'
                                style={[
                                    styles.rippleCircle,
                                    ripple3Style
                                ]}
                            >
                                <RNView />
                            </AnimatedView>
                        </>
                    )}

                    {/* Mic Icon Container */}
                    <View
                        className='items-center justify-center bg-gray-900/50 rounded-full'
                        style={styles.micIconContainer}
                    >
                        <AnimatedIcon
                            name='mic'
                            size={60}
                            color={isConnected ? '#ef4444' : '#9ca3af'}
                            style={animatedStyle}
                        />
                    </View>
                </View>

                {/* Status Text */}
                <View className='absolute bottom-40 items-center gap-4'>
                    <Text size='md' className='text-gray-300 text-center px-8'>
                        {isConnected
                            ? 'Listening... Speak naturally'
                            : 'Tap the button below to start a conversation'}
                    </Text>

                    {/* Action Button */}
                    <PressableScale
                        onPress={() => {
                            if (isCheckingLimit || isLoadingUsage) return;
                            if (isConnected) {
                                endConversation();
                            } else {
                                startConversation();
                            }
                        }}
                        style={[
                            styles.buttonContainer,
                            (isCheckingLimit || isLoadingUsage) && { opacity: 0.6 }
                        ]}
                    >
                        <LinearGradient
                            colors={isConnected ? ['#dc2626', '#991b1b'] : ['#3b82f6', '#2563eb']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.buttonGradient}
                        >
                            <View className='flex-row items-center gap-3'>
                                {isCheckingLimit || isLoadingUsage ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <Ionicons
                                        name={isConnected ? 'stop-circle' : 'mic'}
                                        size={24}
                                        color='white'
                                    />
                                )}
                                <Text size='lg' className='font-semibold text-white'>
                                    {isCheckingLimit || isLoadingUsage
                                        ? 'Checking...'
                                        : isConnected
                                            ? 'End Conversation'
                                            : 'Start Conversation'
                                    }
                                </Text>
                            </View>
                        </LinearGradient>
                    </PressableScale>
                    <UsageLimitBanner />
                </View>
            </View>
        </Layout>
    );
}

const styles = StyleSheet.create({
    pulse: {
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 8,
        elevation: 8,
    },
    micContainer: {
        width: 200,
        height: 200,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        // Centering yang tepat: tengah layar dikurangi setengah ukuran container
        // Parent View memiliki width = SCREEN_WIDTH - 48 (padding Layout 24px kiri + kanan)
        top: (SCREEN_HEIGHT / 2) - 200, // Lebih ke atas dari tengah
        left: ((SCREEN_WIDTH - 48) / 2) - 100, // Tepat di tengah horizontal
    },
    rippleCircle: {
        width: 120,
        height: 120,
        top: 40,
        left: 40,
    },
    micIconContainer: {
        width: 120,
        height: 120,
        position: 'absolute',
        top: 40,
        left: 40,
    },
    buttonContainer: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    buttonGradient: {
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 16,
    },
});
