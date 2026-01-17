import { SignIn } from '@/components/clerk/SignIn';

export default function PublicScreen() {
    return (
        <SignIn scheme='linguamate' signUpUrl='/sign-up' homeUrl='/(protected)' />
    );
}