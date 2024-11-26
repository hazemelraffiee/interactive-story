import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { BookOpen, ArrowLeft, Lock } from 'lucide-react';
import NotificationToast from '../../components/common/NotificationToast';
import { authService } from '../../services/authService';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await authService.resetPassword(token, password);
      navigate('/login', { 
        state: { message: 'Password has been reset successfully. Please login with your new password.' }
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {error && (
        <NotificationToast
          title="Error"
          message={error}
          onClose={() => setError('')}
        />
      )}
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 md:p-6">
        <Link to="/login" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5" />
          <span>Back to login</span>
        </Link>
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-purple-600" />
          <span className="text-xl font-bold text-gray-900">StoryLab</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Reset your password
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter your new password below
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                  />
                  <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    className="block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={6}
                  />
                  <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;