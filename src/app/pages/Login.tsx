import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { UserCircle, Lock, LogIn, HelpCircle, X, Eye, EyeOff } from 'lucide-react';
import { login, getSecurityQuestion, resetAdminPassword, checkAdminExists, registerAdmin } from '../services/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<'admin' | 'teacher'>('admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Admin registration state
  const [adminExists, setAdminExists] = useState<boolean | null>(null);
  const [showRegistration, setShowRegistration] = useState(false);
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regSecurityQuestion, setRegSecurityQuestion] = useState('');
  const [regSecurityAnswer, setRegSecurityAnswer] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Forgot Password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  useEffect(() => {
    if (showForgotPassword) {
      loadSecurityQuestion();
    }
  }, [showForgotPassword]);

  const checkAdminStatus = async () => {
    const result = await checkAdminExists();
    if (result.data) {
      setAdminExists(result.data.exists);
    }
  };

  const loadSecurityQuestion = async () => {
    const result = await getSecurityQuestion();
    if (result.data) {
      setSecurityQuestion(result.data.securityQuestion);
    } else {
      toast.error('No security question configured. Contact system administrator.');
      setShowForgotPassword(false);
    }
  };

  const handleAdminRegistration = async (e: React.FormEvent) => {
    e.preventDefault();

    if (regPassword !== regConfirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (regPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setRegLoading(true);

    const result = await registerAdmin(
      regUsername,
      regPassword,
      regSecurityQuestion || undefined,
      regSecurityAnswer || undefined
    );

    if (result.error) {
      toast.error(result.error);
      setRegLoading(false);
    } else {
      toast.success('Admin account created successfully! You can now login.');
      setShowRegistration(false);
      setAdminExists(true);
      setRegUsername('');
      setRegPassword('');
      setRegConfirmPassword('');
      setRegSecurityQuestion('');
      setRegSecurityAnswer('');
      setRegLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setResetLoading(true);

    const result = await resetAdminPassword(securityAnswer, newPassword);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Password reset successfully! You can now login with your new password.');
      setShowForgotPassword(false);
      setSecurityAnswer('');
      setNewPassword('');
      setConfirmPassword('');
    }

    setResetLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(userType, username, password);

      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      if (result.data?.success) {
        if (userType === 'admin') {
          navigate('/admin');
        } else if (userType === 'teacher' && result.data.teacher) {
          // Store teacher info in session
          sessionStorage.setItem('teacherId', result.data.teacher.teacherId);
          sessionStorage.setItem('teacherName', result.data.teacher.name);
          sessionStorage.setItem('teacherData', JSON.stringify(result.data.teacher));
          navigate('/teacher');
        }
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-green-600 rounded-full mb-4">
            <UserCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">NNHS QR Code-Based Student Attendance Monitoring System</h1>
          <p className="text-gray-600 font-semibold">Nahawan National High School</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* User Type Selection */}
          <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
            <button
              type="button"
              onClick={() => setUserType('admin')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                userType === 'admin'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => setUserType('teacher')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                userType === 'teacher'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Teacher
            </button>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Username
            </label>
            <div className="relative">
              <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-800 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                placeholder="Enter username"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border-2 border-gray-800 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            <LogIn className="w-5 h-5" />
            {loading ? 'Logging in...' : `Login as ${userType === 'admin' ? 'Admin' : 'Teacher'}`}
          </button>

          {userType === 'admin' && (
            <div className="text-center space-y-2">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-green-600 hover:text-green-800 font-medium flex items-center justify-center gap-1 mx-auto"
              >
                <HelpCircle className="w-4 h-4" />
                Forgot Password?
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowRegistration(true);
                  checkAdminStatus();
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center gap-1 mx-auto"
              >
                <UserCircle className="w-4 h-4" />
                Create Admin Account
              </button>
            </div>
          )}
        </form>

        {/* Forgot Password Modal */}
        <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">Reset Admin Password</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleForgotPassword} className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Security Question
                </label>
                <p className="text-gray-900 font-medium bg-gray-50 p-3 rounded-lg border">
                  {securityQuestion}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Answer
                </label>
                <input
                  type="text"
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  placeholder="Enter your answer"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setSecurityAnswer('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                >
                  {resetLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Admin Registration Modal */}
        <Dialog open={showRegistration} onOpenChange={setShowRegistration}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">Create Admin Account</DialogTitle>
              <p className="text-sm text-gray-600 mt-2">
                {adminExists === false
                  ? 'No admin account exists. Create the first admin account to get started.'
                  : 'Register as system administrator. Only one admin account is allowed.'}
              </p>
            </DialogHeader>

            <form onSubmit={handleAdminRegistration} className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  placeholder="Enter admin username"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showRegPassword ? "text" : "password"}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    placeholder="Enter password (min 6 characters)"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showRegConfirmPassword ? "text" : "password"}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    placeholder="Confirm password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 mb-3">
                  Security Question (Optional but recommended for password recovery)
                </p>

                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Security Question
                  </label>
                  <input
                    type="text"
                    value={regSecurityQuestion}
                    onChange={(e) => setRegSecurityQuestion(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    placeholder="e.g., What is your mother's maiden name?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Security Answer
                  </label>
                  <input
                    type="text"
                    value={regSecurityAnswer}
                    onChange={(e) => setRegSecurityAnswer(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    placeholder="Enter answer"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={regLoading}
                className="w-full px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
              >
                {regLoading ? 'Creating Account...' : 'Create Admin Account'}
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}