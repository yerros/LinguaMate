import Button from '@/components/clerk/components/Button';
import GlassCard from '@/components/GlassCard';
import HeaderButton from '@/components/HeaderButton';
import { Layout, Text, View } from '@/components/ui/';
import { FontAwesome } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Dimensions, ScrollView } from 'react-native';

const { width } = Dimensions.get('screen')


export default function HomeScreen() {
    return (
        <Layout>
            <ScrollView className='flex-1'>
                {/* Logo and Header Buttons */}
                <View className='mb-10 flex-row items-center justify-between'>
                    <View className='flex-row items-center gap-1'>
                        <Image source={require('@/assets/images/icon.png')} style={{ width: 52, height: 52 }} />
                        <Text size='xxl' className='text-white font-bold'>AI Learning App</Text>
                    </View>
                    <HeaderButton />
                </View>
                {/* Hero Section */}
                <View className='mb-14 flex-1 items-center gap-8 w-full'>
                    <Image source={require('@/assets/images/hero-bg.png')} contentFit='contain' style={{ width: width, height: 170 }} />
                    <View className='gap-4'>
                        <Text size='xxxl' className='font-bold '>Hi, I'm Linguamate</Text>
                        <Text size='md' >What would you like to learn today?</Text>
                    </View>
                    <Button className='items-center gap-2 pt-5' onPress={() => console.log('Voice pressed')}>
                        <Image
                            source={require('@/assets/images/voice.png')}
                            style={{ width: 72, height: 72 }}
                            contentFit='contain'
                        />
                        <Text size='md' className='underline'>Tap to speak</Text>
                    </Button>
                </View>
                {/* Menu Section */}
                <View className='flex-row gap-4 items-center justify-center flex-wrap'>
                    <GlassCard
                        icon={<FontAwesome name='comments' size={24} color='#fff' />}
                        title="Chat Assistant"
                        subtitle="Start a conversation"
                        onPress={() => console.log('Chat pressed')}
                        iconColor="#60A5FA"
                    />
                    <GlassCard
                        icon={<FontAwesome name='image' size={24} color='#fff' />}
                        title="Image Generation"
                        subtitle="Create Artwork"
                        onPress={() => console.log('Chat pressed')}
                        iconColor="#60A5FA"
                    />
                    <GlassCard
                        icon={<FontAwesome name='comments' size={24} color='#fff' />}
                        title="Voice Assistant"
                        subtitle="Voice Commands"
                        onPress={() => console.log('Chat pressed')}
                        iconColor="#60A5FA"
                    />
                    <GlassCard
                        icon={<FontAwesome name='comments' size={24} color='#fff' />}
                        title="AI Tools"
                        subtitle="Tools for your work"
                        onPress={() => console.log('Chat pressed')}
                        iconColor="#60A5FA"
                    />
                </View>
            </ScrollView>
        </Layout>
    );
}
