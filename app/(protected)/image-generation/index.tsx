import { Layout, Text, View } from '@/components/ui/';
import { router } from 'expo-router';
import { PressableScale } from 'pressto';


export default function ImageGenerationScreen() {
    return (
        <Layout>
            <View className='flex-1 items-center justify-center'>
                <Text className='text-2xl font-bold text-white'>Image Generation</Text>
                <PressableScale onPress={() => router.push('/chat/history')}>
                    <Text>History</Text>
                </PressableScale>
            </View>
        </Layout>
    );
}
