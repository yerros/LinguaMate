import { Text as RNText, StyleSheet, TextProps } from 'react-native';

const SizeProps = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
};

export default function Text({ children, size = 'md', color = '#fff', className, ...props }: TextProps & { size?: keyof typeof SizeProps, color?: string, className?: string }) {
    return (
        <RNText {...props} style={[styles.text, { fontSize: SizeProps[size], color }]} className={className}>
            {children}
        </RNText>
    );
}

const styles = StyleSheet.create({
    text: {
        fontFamily: 'Inter',
    }
});