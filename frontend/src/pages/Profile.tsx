import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { User } from '../types';

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editLoading, setEditLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    phoneNumber: '',
    city: '',
    state: '',
    country: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const profileRes = await apiService.getProfile();
      const p = profileRes.data as User;
      setProfile(p);
      setFormData({
        phoneNumber: p.phoneNumber || '',
        city: p.city || '',
        state: p.state || '',
        country: p.country || '',
      });
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      setError(message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    if (!formData.phoneNumber.trim()) {
      setError('Phone number is required.');
      return;
    }

    try {
      setEditLoading(true);
      setError('');
      setSuccess('');
      await apiService.updateProfile(formData);
      setSuccess('Profile updated successfully');
      setIsEditing(false);
      fetchData();
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      setError(message || 'Failed to update profile');
    } finally {
      setEditLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="px-4 py-6">
      {success && (
        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg text-sm">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-primary to-blue-900 px-6 py-8 text-white">
          <h1 className="text-2xl font-bold">
            {profile.firstName} {profile.lastName}
          </h1>
          <p className="text-blue-200 mt-1 text-sm">{profile.email}</p>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-primary">Your details</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm font-bold text-secondary hover:underline min-h-[44px] px-2"
              >
                Edit
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base"
                  required
                />
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base"
                >
                  <option value="">Select</option>
                  <option value="USA">USA</option>
                  <option value="Canada">Canada</option>
                </select>
              </div>
              <div className="flex flex-col gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-3 rounded-lg font-bold text-gray-600 hover:bg-gray-100 min-h-[48px]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={editLoading}
                  className="flex-1 py-3 rounded-lg font-bold bg-secondary text-white hover:bg-blue-600 disabled:opacity-50 min-h-[48px]"
                >
                  {editLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <dl className="space-y-4">
              <div>
                <dt className="text-xs font-bold text-gray-400 uppercase">Phone</dt>
                <dd className="text-gray-800 font-medium">{profile.phoneNumber || '—'}</dd>
              </div>
              <div className="space-y-4">
                <div>
                  <dt className="text-xs font-bold text-gray-400 uppercase">City</dt>
                  <dd className="text-gray-800 font-medium">{profile.city || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold text-gray-400 uppercase">State</dt>
                  <dd className="text-gray-800 font-medium">{profile.state || '—'}</dd>
                </div>
              </div>
              <div>
                <dt className="text-xs font-bold text-gray-400 uppercase">Country</dt>
                <dd className="text-gray-800 font-medium">{profile.country || '—'}</dd>
              </div>
            </dl>
          )}
        </div>

        <div className="bg-gray-50 px-6 py-3 text-xs text-gray-500">
          Status:{' '}
          <span className="text-green-600 font-bold uppercase">
            {profile.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Profile;
