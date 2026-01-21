import Button from '@/components/clerk/components/Button';
import { View } from '@/components/ui/';
import { FontAwesome } from '@expo/vector-icons';
import { Alert } from 'react-native';

export default function HeaderButton() {
    return (
        <View className='flex-row items-center gap-4'>
            <Button onPress={() => Alert.alert('Not implemented')}>
                <FontAwesome name='bell-o' size={24} color='#fff' />
            </Button>
        </View>
    )
};