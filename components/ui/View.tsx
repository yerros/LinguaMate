import { View as RNView, StyleProp, ViewProps, ViewStyle } from 'react-native';

export default function View({ children, className, style, ...props }: ViewProps & { children: React.ReactNode, className?: string, style?: StyleProp<ViewStyle> }) {
    return <RNView {...props} className={className} style={style}>{children}</RNView>;
}