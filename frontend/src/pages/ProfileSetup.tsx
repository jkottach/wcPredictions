import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { useAuth } from '../hooks/useAuth';
import { useAzureAuth } from '../services/swaAuth';
import AuthCard from '../components/AuthCard';
import { alertError, btnPrimary, input, label } from '../theme';

const ProfileSetup: React.FC = () => {
  const navigate = useNavigate();
  const { user, login, token } = useAuth();

  const [formData, setFormData] = useState({
    city: '',
    state: '',
    country: '',
    phoneNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && user.city !== 'Not Set' && user.country !== 'Not Set') {
      navigate('/dashboard');
    }

    if (user) {
      setFormData((prev) => ({
        ...prev,
        city: user.city === 'Not Set' ? '' : user.city || '',
        state: user.state === 'Not Set' ? '' : user.state || '',
        country: user.country === 'Not Set' ? '' : user.country || '',
        phoneNumber: user.phoneNumber || '',
      }));
    }
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.phoneNumber.trim()) {
      setError('Phone number is required.');
      setLoading(false);
      return;
    }

    try {
      const response = await apiService.updateProfile(formData);
      if (useAzureAuth) {
        login(response.data.user);
      } else {
        login(token || localStorage.getItem('token') || '', response.data.user);
      }
      navigate('/dashboard');
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      setError(message || 'Profile setup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Complete your profile"
      subtitle={
        user?.firstName
          ? `Welcome, ${user.firstName}! Add a few details to get started.`
          : 'Add a few details to get started.'
      }
    >
      {error && <div className={alertError}>{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={label}>
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="+1234567890"
            className={input}
            required
          />
        </div>

        <div className="space-y-4">
          <div>
            <label className={label}>
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className={input}
              required
            />
          </div>
          <div>
            <label className={label}>
              State <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className={input}
              required
            />
          </div>
        </div>

        <div>
          <label className={label}>
            Country <span className="text-red-500">*</span>
          </label>
          <select
            name="country"
            value={formData.country}
            onChange={handleChange}
            className={input}
            required
          >
            <option value="">Select Country</option>
            <option value="USA">USA</option>
            <option value="Canada">Canada</option>
          </select>
        </div>

        <button type="submit" disabled={loading} className={btnPrimary}>
          {loading ? 'Saving...' : 'Finish setup'}
        </button>
      </form>
    </AuthCard>
  );
};

export default ProfileSetup;
