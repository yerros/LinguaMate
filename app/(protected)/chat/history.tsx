import { Layout, Text, View } from '@/components/ui/';
import { router } from 'expo-router';
import { PressableScale } from 'pressto';


export default function HistoryScreen() {
    return (
        <Layout>
            <View className='flex-1 items-center justify-center'>
                <Text className='text-2xl font-bold text-white'>History</Text>
                <PressableScale onPress={() => router.push('/(protected)/chat/chat')}>
                    <Text>go to chat</Text>
                </PressableScale>
                <PressableScale onPress={() => router.back()}>
                    <Text>Back</Text>
                </PressableScale>
            </View>
        </Layout>
    );
}
