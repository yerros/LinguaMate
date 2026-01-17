import { SignUp } from '@/components/clerk/SignUp';

export default function SignUpScreen() {
    return (
        <SignUp scheme='linguamate' signInUrl='/(public)' homeUrl='/(protected)' />
    );
}