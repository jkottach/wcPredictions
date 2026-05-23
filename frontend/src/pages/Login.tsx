import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { useAuth } from '../hooks/useAuth';
import { GoogleLogin } from '@react-oauth/google';
import {
  fetchClientPrincipal,
  loginWithGoogle,
  needsProfileSetup,
  useAzureAuth,
} from '../services/swaAuth';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, authReady, isLoggedIn, user } = useAuth();
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';

  const [error, setError] = useState('');
  const [checkingSession, setCheckingSession] = useState(useAzureAuth);

  useEffect(() => {
    if (!authReady) return;

    if (isLoggedIn && user) {
      navigate(needsProfileSetup(user) ? '/profile-setup' : '/dashboard');
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
          needsProfileSetup(response.data) ? '/profile-setup' : '/dashboard'
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
      const profileUser = response.data.user;
      login(response.data.token, profileUser);

      if (needsProfileSetup(profileUser)) {
        navigate('/profile-setup');
      } else {
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      setError(message || 'Google Login failed');
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
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
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
                onError={() => setError('Google Login was unsuccessful. Please try again.')}
                theme="outline"
                text="continue_with"
                size="large"
                shape="pill"
                width="320"
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
