import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { useAuth } from '../hooks/useAuth';
import { GoogleLogin } from '@react-oauth/google';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';

  const [error, setError] = useState('');

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse.credential) return;
    setError('');

    try {
      const response = await apiService.googleLogin(credentialResponse.credential);
      const user = response.data.user;
      login(response.data.token, user);

      // Check if user needs to complete profile (backend sets these to 'Not Set' for new Google users)
      if (user.city === 'Not Set' || user.state === 'Not Set' || user.country === 'Not Set') {
        navigate('/profile-setup');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Google Login failed');
    }
  };

  const handleGoogleError = () => {
    setError('Google Login was unsuccessful. Please try again.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 max-w-md w-full">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-primary mb-6">
          Sign in
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4 flex flex-col items-center mt-2">
          <div className="w-full flex justify-center">
            {googleClientId ? (
              <div className="origin-center" aria-label="Google login button">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap
                  theme="outline"
                  text="continue_with"
                  size="large"
                  shape="pill"
                  width="260"
                />
              </div>
            ) : (
              <div className="w-full text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-3 text-center">
                Google login is not configured. Set VITE_GOOGLE_CLIENT_ID in frontend env.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
