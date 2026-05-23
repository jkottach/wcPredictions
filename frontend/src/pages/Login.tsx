import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { useAuth } from '../hooks/useAuth';
import { GoogleLogin } from '@react-oauth/google';
import {
  consumePreventGoogleAutoselect,
  disableGoogleAutoSelect,
} from '../services/googleAuth';
import {
  fetchClientPrincipal,
  loginWithGoogle,
  needsProfileSetup,
  useAzureAuth,
} from '../services/swaAuth';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, authReady, isLoggedIn, user } = useAuth();
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';

  const [error, setError] = useState('');
  const [checkingSession, setCheckingSession] = useState(useAzureAuth);

  useEffect(() => {
    if (searchParams.get('signed_out') === '1' || consumePreventGoogleAutoselect()) {
      disableGoogleAutoSelect();
    }
  }, [searchParams]);

  useEffect(() => {
    if (!authReady) return;

    if (isLoggedIn && user) {
      navigate(needsProfileSetup(user) ? '/profile-setup' : '/dashboard', { replace: true });
      return;
    }

    if (!useAzureAuth) {
      setCheckingSession(false);
      return;
    }

    void (async () => {
      const principal = await fetchClientPrincipal();
      if (!principal) {
        setCheckingSession(false);
        return;
      }
      try {
        const response = await apiService.getProfile();
        login(response.data);
        navigate(
          needsProfileSetup(response.data) ? '/profile-setup' : '/dashboard',
          { replace: true }
        );
      } catch {
        setCheckingSession(false);
      }
    })();
  }, [authReady, isLoggedIn, user, login, navigate]);

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) return;
    setError('');

    try {
      const response = await apiService.googleLogin(credentialResponse.credential);
      const token = response.data?.token;
      const profileUser = response.data?.user;

      if (!token || !profileUser) {
        setError('Sign-in succeeded but the server returned an invalid response.');
        return;
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(profileUser));

      const profileCheck = await apiService.getProfile();
      login(token, profileCheck.data);

      navigate(needsProfileSetup(profileCheck.data) ? '/profile-setup' : '/dashboard', {
        replace: true,
      });
    } catch (err: unknown) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      const data =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: string; hint?: string } } }).response?.data
          : undefined;
      setError(
        [data?.error, data?.hint].filter(Boolean).join(' — ') || 'Google sign-in failed. Please try again.'
      );
    }
  };

  const handleAzureSignIn = () => {
    loginWithGoogle('/dashboard');
  };

  if (useAzureAuth && checkingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4">
        <p className="text-white text-lg">Checking sign-in…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full">
        <h2 className="text-2xl font-bold text-center text-primary mb-6">
          Sign in
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>
        )}

        <div className="space-y-4 flex flex-col items-center mt-2">
          {useAzureAuth ? (
            <button
              type="button"
              onClick={handleAzureSignIn}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 border border-gray-300 rounded-full bg-white text-gray-800 font-medium hover:bg-gray-50 transition min-h-[48px]"
            >
              <span className="text-lg" aria-hidden>
                G
              </span>
              Continue with Google
            </button>
          ) : googleClientId ? (
            <div className="w-full flex justify-center" aria-label="Google login button">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google sign-in was unsuccessful. Please try again.')}
                theme="outline"
                text="continue_with"
                size="large"
                shape="pill"
                width="320"
                auto_select={false}
              />
            </div>
          ) : (
            <div className="w-full text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-3 text-center">
              Google login is not configured. Set VITE_GOOGLE_CLIENT_ID in frontend env, or
              VITE_USE_AZURE_AUTH=true for Azure sign-in.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
