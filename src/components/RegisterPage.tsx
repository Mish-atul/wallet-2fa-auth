import { useState } from 'react';
import { UserPlus, Mail, Lock, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { register } from '../services/auth';

interface RegisterPageProps {
  onSwitchToLogin: () => void;
}

export default function RegisterPage({ onSwitchToLogin }: RegisterPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await register(email, password, confirmPassword);
      setSuccess(response.message);
      
      // Clear form
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      
      // Auto-switch to login after 2 seconds
      setTimeout(() => {
        onSwitchToLogin();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full mb-6 shadow-lg">
              <UserPlus className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-3 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Create Account
            </h1>
            <p className="text-gray-300 text-lg">
              Join our secure wallet-based authentication system
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/30 rounded-xl flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-300 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-200">{success}</p>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-3">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-all duration-300 hover:bg-white/15"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-3">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-all duration-300 hover:bg-white/15"
                  placeholder="Create a strong password"
                  required
                  minLength={6}
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Password must be at least 6 characters long
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-3">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-all duration-300 hover:bg-white/15"
                  placeholder="Confirm your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus className="w-6 h-6" />
                  Create Account
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/20">
            <p className="text-center text-sm text-gray-300">
              Already have an account?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-emerald-400 hover:text-emerald-300 font-semibold transition duration-200 underline decoration-2 underline-offset-2"
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
