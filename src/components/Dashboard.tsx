import { CheckCircle, LogOut, Wallet, Mail, Shield } from 'lucide-react';

interface DashboardProps {
  email: string;
  walletAddress: string;
  onLogout: () => void;
}

export default function Dashboard({ email, walletAddress, onLogout }: DashboardProps) {
  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <span className="text-white font-bold text-xl bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">Secure Portal</span>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-violet-600 to-purple-700 px-8 py-16 text-center relative">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/80 to-purple-700/80 backdrop-blur-sm"></div>
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-lg rounded-full mb-6 shadow-lg">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">
                🎉 Authentication Complete!
              </h1>
              <p className="text-violet-100 text-lg">
                Your identity has been verified with 2FA wallet signature
              </p>
            </div>
          </div>

          <div className="p-8">
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  Account Information
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex-shrink-0 shadow-lg">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-300 mb-2">
                        Email Address
                      </p>
                      <p className="text-lg font-semibold text-white break-all">
                        {email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex-shrink-0 shadow-lg">
                      <Wallet className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-300 mb-2">
                        Verified Wallet
                      </p>
                      <p className="text-lg font-semibold text-white font-mono break-all bg-black/20 p-3 rounded-lg border border-white/10">
                        {walletAddress}
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        Short: <span className="font-mono text-white">{formatWalletAddress(walletAddress)}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/20">
                <div className="flex items-start gap-4 p-6 bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/30 rounded-xl">
                  <div className="p-2 bg-emerald-500/30 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-emerald-300" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-emerald-200 mb-2">
                      🔐 Authentication Successful
                    </p>
                    <p className="text-emerald-300 leading-relaxed">
                      Your session is secured with wallet-based 2FA. You have full access to all protected resources and can safely interact with the application.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white/5 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            Security Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="p-2 bg-emerald-500/30 rounded-lg">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="font-semibold text-white mb-1">Email & Password</p>
                <p className="text-sm text-gray-300">Traditional authentication layer</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="p-2 bg-emerald-500/30 rounded-lg">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="font-semibold text-white mb-1">Wallet 2FA</p>
                <p className="text-sm text-gray-300">MetaMask signature verification</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="p-2 bg-emerald-500/30 rounded-lg">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="font-semibold text-white mb-1">SIWE Protocol</p>
                <p className="text-sm text-gray-300">Sign-In With Ethereum standard</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="p-2 bg-emerald-500/30 rounded-lg">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="font-semibold text-white mb-1">Time-Limited Nonce</p>
                <p className="text-sm text-gray-300">2-minute session validation</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
