import HeaderButton from '@/components/HeaderButton';
import { Layout, Text, View } from '@/components/ui/';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { PressableScale } from 'pressto';
import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('screen')


export default function HomeScreen() {
    return (
        <Layout>
            <View className='flex-1'>
                {/* Logo and Header Buttons */}
                <View className='flex-row items-center justify-between mb-12'>
                    <View className='flex-row items-center gap-1'>
                        <Image source={require('@/assets/images/icon.png')} style={{ width: 52, height: 52 }} />
                        <Text size='xxl' className='text-white font-bold'>LinguaMate</Text>
                    </View>
                    <HeaderButton />
                </View>
                {/* Hero Section */}
                <View className='flex items-center gap-8 w-full mb-12'>
                    <Image source={require('@/assets/images/hero-bg.png')} contentFit='contain' style={{ width: width, height: 170 }} />
                    <View className='gap-4'>
                        <Text size='xxxl' className='font-bold '>Hi, I'm Linguamate</Text>
                        <Text size='md' >What would you like to learn today?</Text>
                    </View>
                    <PressableScale onPress={() => router.push('/voice')} style={styles.buttonSpeak}>
                        <Image
                            source={require('@/assets/images/voice.png')}
                            style={{ width: 72, height: 72 }}
                            contentFit='contain'
                        />
                        <Text size='md' className='underline'>Tap to speak</Text>
                    </PressableScale>
                </View>
            </View>
        </Layout>
    );
}

const styles = StyleSheet.create({
    buttonSpeak: {
        alignItems: 'center',
        gap: 8,
    },
});
