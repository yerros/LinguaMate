import { SignIn } from '@/components/clerk/SignIn';

export default function PublicScreen() {
    return (
        <SignIn scheme='linguamate' signUpUrl='/(public)/sign-up' homeUrl='/(protected)' />
    );
}