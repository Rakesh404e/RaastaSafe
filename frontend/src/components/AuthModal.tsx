import React, { useState } from 'react';
import { api, setAuthToken, clearAuthToken } from '../services/api';
import type { UserRole } from '../types';
import { Lock, LogIn, LogOut, ShieldCheck, UserCheck, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserRole: UserRole;
  currentUsername: string | null;
  onAuthChange: (role: UserRole, username: string | null) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUserRole,
  currentUsername,
  onAuthChange
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await api.login(username, password);
      setAuthToken(data.access_token, data.role, data.username);
      onAuthChange(data.role, data.username);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRole = async (targetUser: string, targetPass: string) => {
    setUsername(targetUser);
    setPassword(targetPass);
    setError(null);
    setLoading(true);
    try {
      const data = await api.login(targetUser, targetPass);
      setAuthToken(data.access_token, data.role, data.username);
      onAuthChange(data.role, data.username);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuthToken();
    onAuthChange('public_visitor', null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-civic-950/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-civic-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-civic-900 px-6 py-5 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-civic-800 rounded-lg text-transit-indigo">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Role & Access Control</h3>
              <p className="text-xs text-civic-400">RaastaSafe Administrative Authentication</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-civic-400 hover:text-white text-lg font-bold p-1"
          >
            &times;
          </button>
        </div>

        <div className="p-6">
          {currentUsername ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-emerald-900 text-sm">
                    Currently Logged In as: <span className="underline">{currentUsername}</span>
                  </div>
                  <div className="text-xs text-emerald-700 capitalize mt-0.5">
                    Assigned Role: <b>{currentUserRole.replace('_', ' ')}</b>
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-sm rounded-xl border border-red-200 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Switch to Public Visitor (Logout)
              </button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-civic-700 uppercase mb-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin or reviewer"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-civic-300 focus:outline-none focus:ring-2 focus:ring-transit-indigo focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-civic-700 uppercase mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="admin123 or reviewer123"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-civic-300 focus:outline-none focus:ring-2 focus:ring-transit-indigo focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-transit-indigo hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-civic-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-civic-500 font-medium">Quick 1-Click Role Switch (Demo)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickRole('reviewer', 'reviewer123')}
                  className="p-2.5 bg-civic-100 hover:bg-civic-200 text-civic-800 text-xs font-medium rounded-xl border border-civic-300 text-center flex flex-col items-center gap-1 transition-colors"
                >
                  <UserCheck className="w-4 h-4 text-transit-teal" />
                  <span>Field Reviewer</span>
                  <span className="text-[10px] text-civic-500 font-mono">reviewer123</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickRole('admin', 'admin123')}
                  className="p-2.5 bg-civic-100 hover:bg-civic-200 text-civic-800 text-xs font-medium rounded-xl border border-civic-300 text-center flex flex-col items-center gap-1 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-transit-indigo" />
                  <span>Administrator</span>
                  <span className="text-[10px] text-civic-500 font-mono">admin123</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
