import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Save, Lock, User } from 'lucide-react';
import { toast } from 'sonner';
import * as api from '../services/api';

export default function AdminSettings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentUsername, setCurrentUsername] = useState('');

  useEffect(() => {
    loadAdminAccount();
  }, []);

  const loadAdminAccount = async () => {
    const result = await api.getAdminAccount();
    if (result.data) {
      setCurrentUsername(result.data.username);
      setNewUsername(result.data.username);
    } else if (result.error) {
      toast.error(result.error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error('Current password is required');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword && newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const result = await api.updateAdminAccount(
      currentPassword,
      newUsername !== currentUsername ? newUsername : undefined,
      newPassword || undefined
    );

    if (result.data) {
      toast.success('Admin account updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      loadAdminAccount();
    } else if (result.error) {
      toast.error(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin')}
              className="p-2 hover:bg-green-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Admin Settings</h1>
              <p className="text-green-100 text-sm">Manage administrator account</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Update Admin Credentials</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Username Display */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Current Username:</p>
              <p className="text-lg font-semibold text-gray-900">{currentUsername}</p>
            </div>

            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Current Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  placeholder="Enter current password"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Required to verify your identity</p>
            </div>

            {/* New Username */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                New Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  placeholder="Enter new username"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Leave unchanged to keep current username</p>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  placeholder="Enter new password"
                  minLength={6}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Minimum 6 characters. Leave empty to keep current password</p>
            </div>

            {/* Confirm New Password */}
            {newPassword && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    placeholder="Re-enter new password"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {loading ? 'Updating...' : 'Update Account'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Security Notice:</strong> After changing your credentials, you will need to log in again with your new username and password.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
