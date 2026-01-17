import { Text, View } from 'react-native';

export default function ProtectedScreen() {
    return (
        <View className='flex-1 items-center justify-center'>
            <Text className='text-2xl font-bold'>Protected</Text>
        </View>
    );
}