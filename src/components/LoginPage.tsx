import { useState } from 'react';
import { Wallet, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { login, connectWallet, signMessage, verify2FA, isMetaMaskInstalled } from '../services/auth';
import { SiweMessage as SiweMessageType } from '../types';

interface LoginPageProps {
  onLoginSuccess: (token: string, email: string, walletAddress: string) => void;
  onSwitchToRegister: () => void;
}

export default function LoginPage({ onLoginSuccess, onSwitchToRegister }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginId, setLoginId] = useState<string | null>(null);
  const [siweMessage, setSiweMessage] = useState<SiweMessageType | null>(null);
  const [step, setStep] = useState<'login' | 'wallet'>('login');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(email, password);
      setLoginId(response.loginId);
      setSiweMessage(response.siweMessage);
      setStep('wallet');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleWalletSign = async () => {
    if (!loginId || !siweMessage) return;

    setError('');
    setLoading(true);

    try {
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Wallet connection timed out. Please try again.')), 30000)
      );

      const walletAddress = await Promise.race([
        connectWallet(),
        timeoutPromise
      ]) as string;

      const signature = await Promise.race([
        signMessage(siweMessage, walletAddress),
        timeoutPromise
      ]) as string;

      const updatedMessage = { ...siweMessage, address: walletAddress };
      const messageString = createSiweMessageString(updatedMessage);

      const response = await Promise.race([
        verify2FA(loginId, signature, messageString),
        timeoutPromise
      ]) as any;

      onLoginSuccess(response.token, response.user.email, response.user.walletAddress);
    } catch (err) {
      if (err instanceof Error) {
        // Enhanced error messages for common issues
        if (err.message.includes('User rejected')) {
          setError('MetaMask signature was rejected. Please try again and approve the signature request.');
        } else if (err.message.includes('Wallet mismatch')) {
          setError(err.message);
        } else if (err.message.includes('timed out')) {
          setError('Connection timed out. Please check your MetaMask connection and try again.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Wallet verification failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const createSiweMessageString = (message: SiweMessageType): string => {
    return `${message.domain} wants you to sign in with your Ethereum account:
${message.address}

${message.statement}

URI: ${message.uri}
Version: ${message.version}
Chain ID: ${message.chainId}
Nonce: ${message.nonce}
Issued At: ${message.issuedAt}
Expiration Time: ${message.expirationTime}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6 shadow-lg">
              <Lock className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Secure Login
            </h1>
            <p className="text-gray-300 text-lg">
              Wallet-based 2FA Authentication
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          {step === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-6">
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
                    className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-300 hover:bg-white/15"
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
                    className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-300 hover:bg-white/15"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify'
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-xl p-5">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-blue-500/30 rounded-lg">
                    <Wallet className="w-6 h-6 text-blue-300" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-200 mb-2">
                      Wallet Signature Required
                    </p>
                    <p className="text-sm text-blue-300 leading-relaxed">
                      Connect your wallet and sign the message to complete the 2FA process.
                      {!isMetaMaskInstalled() && ' Please install MetaMask to continue.'}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleWalletSign}
                disabled={loading || !isMetaMaskInstalled()}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Signing...
                  </>
                ) : (
                  <>
                    <Wallet className="w-6 h-6" />
                    {isMetaMaskInstalled() ? 'Sign with MetaMask' : 'MetaMask Not Installed'}
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setStep('login');
                  setLoginId(null);
                  setSiweMessage(null);
                  setError('');
                }}
                disabled={loading}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-white/20"
              >
                Back to Login
              </button>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-white/20">
            <p className="text-center text-sm text-gray-300 mb-4">
              Don't have an account?{' '}
              <button
                onClick={onSwitchToRegister}
                className="text-blue-400 hover:text-blue-300 font-semibold transition duration-200 underline decoration-2 underline-offset-2"
              >
                Create one here
              </button>
            </p>
            
          </div>
        </div>
      </div>
    </div>
  );
}
