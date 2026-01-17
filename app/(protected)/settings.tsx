import SignOutButton from '@/components/clerk/SignOutButton';
import { Layout, Text, View } from '@/components/ui/';


export default function SettingsScreen() {
    return (
        <Layout>
            <View className='flex-1 items-center justify-center'>
                <Text className='text-2xl font-bold text-white'>Settings</Text>
            </View>
            <SignOutButton />
        </Layout>
    );
}
