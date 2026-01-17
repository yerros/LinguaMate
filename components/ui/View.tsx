import { View as RNView, ViewProps } from 'react-native';

export default function View({ children, className, ...props }: ViewProps & { children: React.ReactNode, className?: string }) {
    return <RNView {...props} className={className}>{children}</RNView>;
}