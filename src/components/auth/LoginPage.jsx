import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import ForgotPasswordModal from './ForgotPasswordModal';
import { 
  Shield, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  Lock, 
  Mail, 
  Sparkles,
  ShieldAlert 
} from 'lucide-react';

export default function LoginPage({ onSwitchToRegister }) {
  const { login } = useAuth();
  const { setCurrentView, showToast } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password, rememberMe);
      showToast(`Welcome back, ${user.full_name}!`, 'success');
      
      if (user.role === 'admin') {
        setCurrentView('admin');
      } else {
        setCurrentView('overview');
      }
    } catch (err) {
      setError(err.message || 'Failed to authenticate. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-6 px-4">
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm max-w-md w-full p-6 sm:p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md shadow-blue-600/30">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#172033] tracking-tight font-heading">
            Sign In to ScamShield
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Enter your credentials to access your merchant or admin portal.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* 1-Click Demo Credentials for Evaluators */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>1-Click Evaluator Credentials:</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => handleQuickDemoFill('ankit.seller@example.np', 'SellerPassword@2026')}
              className="p-2 rounded-lg bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-left transition-all"
            >
              <div className="font-bold text-slate-800">Merchant User</div>
              <div className="text-[10px] text-slate-400 truncate">ankit.seller@example.np</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoFill('admin@scamshield.np', 'AdminSecurePassword@2026')}
              className="p-2 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-left transition-all"
            >
              <div className="font-bold text-indigo-700 flex items-center gap-1">
                <span>Admin Portal</span>
                <ShieldAlert className="w-3 h-3" />
              </div>
              <div className="text-[10px] text-slate-400 truncate">admin@scamshield.np</div>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ankit.seller@example.np"
                className="w-full bg-slate-50/70 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-[11px] font-semibold text-blue-600 hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-slate-50/70 border border-slate-200 rounded-lg pl-9 pr-9 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs text-slate-600">Remember me for 30 days</span>
            </label>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-[#2563EB] hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Switch to Register */}
        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Don't have an account yet?{' '}
            <button
              type="button"
              onClick={() => {
                if (onSwitchToRegister) onSwitchToRegister();
                else setCurrentView('register');
              }}
              className="font-bold text-blue-600 hover:text-blue-700 hover:underline"
            >
              Register here
            </button>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        onPasswordResetSuccess={() => {
          showToast('Password updated! Please log in with your new credentials.', 'success');
        }}
      />
    </div>
  );
}
