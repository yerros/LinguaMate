import { Layout, Text, View } from '@/components/ui/';
import { useConversation } from '@elevenlabs/react-native';
import { PressableScale } from 'pressto';
import { useState } from 'react';


export default function Voice() {
    const [isConnected, setIsConnected] = useState(false);
    const [isConversationStarted, setIsConversationStarted] = useState(false);

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
        try {
            await conversation.startSession({
                agentId: process.env.EXPO_PUBLIC_AGENT_ID,
            });
        } catch (error) {
            console.error('Error starting conversation:', error);
        }
    }

    const endConversation = async () => {
        try {
            await conversation.endSession();
        } catch (error) {
            console.error('Failed to end conversation:', error);
        }
    };


    return (
        <Layout>
            <View className='flex-1 items-center justify-center gap-8'>
                <Text className='text-2xl font-bold text-white'>Voice</Text>
                {isConnected ? (
                    <PressableScale onPress={endConversation}>
                        <Text>End Conversation</Text>
                    </PressableScale>
                ) : (
                    <PressableScale onPress={startConversation}>
                        <Text>Start Conversation</Text>
                    </PressableScale>
                )}
            </View>
        </Layout>
    );
}
