import { useAuth0 } from '@auth0/auth0-react';
import toast from 'react-hot-toast';

export default function Auth0LoginButton({ hasAuth0Config, loading }) {
    const { loginWithRedirect } = useAuth0();

    return (
        <button
            type="button"
            onClick={() => {
                if (!hasAuth0Config) {
                    toast.error('Auth0 is not configured. Check VITE_AUTH0_DOMAIN and VITE_AUTH0_CLIENT_ID.');
                    return;
                }
                loginWithRedirect();
            }}
            className="btn-primary w-full flex items-center justify-center gap-2 py-2.5"
            disabled={!hasAuth0Config || loading}
        >
            {loading ? (
                <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
                'Continue with Auth0'
            )}
        </button>
    );
}

