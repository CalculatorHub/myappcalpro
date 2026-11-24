import React, { useEffect, useState } from 'react';
import {
  Database,
  KeyRound,
  Lock,
  LogOut,
  ShieldCheck,
  UserPlus,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../utils/api';
import { StatusBanner } from '../ui/StatusBanner';

interface AdminStatsPayload {
  usersCount: number;
  activeSessionsCount: number;
  investmentsCount: number;
  loansCount: number;
  goalsCount: number;
  transactionsCount: number;
  taxPlansCount: number;
  retirementPlansCount: number;
  glossaryTermsCount: number;
  educationLessonsCount: number;
  timestamp: string;
}

export const AccountVaultModal: React.FC = () => {
  const {
    user,
    adminStatus,
    authModalOpen,
    authModalInitialTab,
    closeAuthModal,
    login,
    register,
    logout,
    claimAdmin,
    unlockAdmin,
  } = useAuth();

  const [tab, setTab] = useState<'login' | 'register' | 'admin'>(authModalInitialTab);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminPasscode, setAdminPasscode] = useState('');
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [adminStats, setAdminStats] = useState<AdminStatsPayload | null>(null);

  useEffect(() => {
    if (authModalOpen) {
      setTab(authModalInitialTab);
      setErrorMsg(null);
      setStatusMsg(null);
    }
  }, [authModalOpen, authModalInitialTab]);

  useEffect(() => {
    if (!authModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAuthModal();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [authModalOpen, closeAuthModal]);

  useEffect(() => {
    if (authModalOpen && tab === 'admin' && adminStatus.isAdminSession) {
      apiRequest<AdminStatsPayload>('/api/admin/stats')
        .then(setAdminStats)
        .catch(() => setAdminStats(null));
    }
  }, [authModalOpen, tab, adminStatus.isAdminSession]);

  if (!authModalOpen) return null;

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setStatusMsg(null);
    setBusy(true);
    try {
      if (tab === 'register') {
        await register(name, email, password);
        setStatusMsg('SQLite account created and signed in.');
      } else {
        await login(email, password);
        setStatusMsg('Signed in securely.');
      }
      setPassword('');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setBusy(false);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setStatusMsg(null);
    setBusy(true);
    try {
      if (adminStatus.canClaim) {
        await claimAdmin(adminPasscode);
        setStatusMsg('Admin passcode claimed and console unlocked.');
      } else {
        await unlockAdmin(adminPasscode);
        setStatusMsg('Admin console unlocked for this session.');
      }
      setAdminPasscode('');
      const stats = await apiRequest<AdminStatsPayload>('/api/admin/stats');
      setAdminStats(stats);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Admin verification failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="vault-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#080D1B]/85 backdrop-blur-md p-4 no-print"
    >
      <div className="aurora-card-accent w-full max-w-lg p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3 border-b border-[#6366F1]/25 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#2563EB] via-[#6366F1] to-[#A855F7] text-[#F8FAFC]">
              <Database className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h3 id="vault-modal-title" className="text-base font-bold text-[#F8FAFC]">
                SQLite Personal Vault &amp; Admin
              </h3>
              <p className="text-xs text-[#94A3B8]">
                {user
                  ? `Signed in as ${user.name} (${user.email})`
                  : 'Create an account or sign in to save, edit & delete personal records'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeAuthModal}
            aria-label="Close modal"
            className="rounded-lg border border-[#6366F1]/30 p-1.5 text-[#94A3B8] hover:text-[#F8FAFC] cursor-pointer"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="grid grid-cols-3 gap-1 rounded-xl border border-[#6366F1]/25 bg-[#080D1B] p-1">
          {!user ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setTab('register');
                  setErrorMsg(null);
                }}
                className={`rounded-lg py-2 text-xs font-semibold transition-colors cursor-pointer ${
                  tab === 'register'
                    ? 'bg-gradient-to-r from-[#2563EB] via-[#6366F1] to-[#8B5CF6] text-[#F8FAFC]'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('login');
                  setErrorMsg(null);
                }}
                className={`rounded-lg py-2 text-xs font-semibold transition-colors cursor-pointer ${
                  tab === 'login'
                    ? 'bg-gradient-to-r from-[#2563EB] via-[#6366F1] to-[#8B5CF6] text-[#F8FAFC]'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                Sign In
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setErrorMsg(null);
              }}
              className={`col-span-2 rounded-lg py-2 text-xs font-semibold transition-colors cursor-pointer ${
                tab !== 'admin'
                  ? 'bg-gradient-to-r from-[#06B6D4] via-[#2563EB] to-[#6366F1] text-[#F8FAFC]'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              My Account
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setTab('admin');
              setErrorMsg(null);
            }}
            className={`rounded-lg py-2 text-xs font-semibold transition-colors cursor-pointer ${
              tab === 'admin'
                ? 'bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#D946EF] text-[#F8FAFC]'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            Admin Console
          </button>
        </div>

        <StatusBanner error={errorMsg} feedback={statusMsg} />

        {/* Signed-in User Account Overview */}
        {user && tab !== 'admin' && (
          <div className="space-y-4">
            <div className="aurora-subcard p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8]">Account Holder</span>
                <span className="font-semibold text-[#F8FAFC]">{user.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8]">Email</span>
                <span className="font-mono text-[#38BDF8]">{user.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8]">Data Isolation</span>
                <span className="font-semibold text-[#10B981]">
                  Scoped strictly to your SQLite User ID #{user.id}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={closeAuthModal}
                className="aurora-btn-primary rounded-xl px-4 py-2 text-xs font-semibold cursor-pointer"
              >
                Continue to Workspace
              </button>
              <button
                type="button"
                onClick={() => void logout()}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-400/35 bg-red-500/10 px-3.5 py-2 text-xs font-medium text-red-200 hover:bg-red-500/20 cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Register / Sign In Forms */}
        {!user && tab !== 'admin' && (
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {tab === 'register' && (
              <div className="space-y-1.5">
                <label htmlFor="auth-name" className="block text-xs font-medium text-[#F8FAFC]">
                  Full Name
                </label>
                <input
                  id="auth-name"
                  type="text"
                  required
                  minLength={2}
                  maxLength={80}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Aarav Sharma"
                  className="aurora-input w-full px-3.5 py-2.5 text-sm text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="auth-email" className="block text-xs font-medium text-[#F8FAFC]">
                Email Address
              </label>
              <input
                id="auth-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="aurora-input w-full px-3.5 py-2.5 text-sm text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="auth-password" className="block text-xs font-medium text-[#F8FAFC]">
                Password (min 8 characters)
              </label>
              <input
                id="auth-password"
                type="password"
                required
                minLength={8}
                maxLength={128}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="aurora-input w-full px-3.5 py-2.5 text-sm text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="aurora-btn-primary w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold cursor-pointer disabled:opacity-60"
            >
              {tab === 'register' ? (
                <>
                  <UserPlus className="h-4 w-4" aria-hidden="true" />
                  <span>{busy ? 'Creating SQLite Vault...' : 'Create Personal Account'}</span>
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4" aria-hidden="true" />
                  <span>{busy ? 'Verifying...' : 'Sign In'}</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Admin Console Tab */}
        {tab === 'admin' && (
          <div className="space-y-4">
            {!user ? (
              <div className="aurora-subcard p-4 space-y-2 text-xs text-[#94A3B8]">
                <p className="font-semibold text-[#F8FAFC]">Sign in required first</p>
                <p>
                  Sign in or create a personal account first, then unlock the Admin Console using
                  your configured passcode to manage Glossary &amp; Education content and inspect
                  SQLite health metrics.
                </p>
              </div>
            ) : adminStatus.isAdminSession ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 rounded-xl border border-[#10B981]/35 bg-[#10B981]/10 px-3.5 py-2.5 text-xs text-[#34D399]">
                  <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>
                    Admin session verified. Protected Glossary &amp; Education editor tools are
                    active across Learn tabs.
                  </span>
                </div>

                {adminStats && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                    {[
                      { label: 'Users', val: adminStats.usersCount },
                      { label: 'Investments', val: adminStats.investmentsCount },
                      { label: 'Loans', val: adminStats.loansCount },
                      { label: 'Savings Goals', val: adminStats.goalsCount },
                      { label: 'Transactions', val: adminStats.transactionsCount },
                      { label: 'Tax Plans', val: adminStats.taxPlansCount },
                      { label: 'Retirement Plans', val: adminStats.retirementPlansCount },
                      { label: 'Glossary Terms', val: adminStats.glossaryTermsCount },
                      { label: 'Lessons', val: adminStats.educationLessonsCount },
                    ].map((stat) => (
                      <div key={stat.label} className="aurora-subcard p-3">
                        <p className="text-[11px] text-[#94A3B8]">{stat.label}</p>
                        <p className="mt-1 font-mono text-base font-bold text-[#F8FAFC] tabular-nums">
                          {stat.val}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleAdminSubmit} className="space-y-3">
                <div className="aurora-subcard p-3.5 text-xs text-[#94A3B8] space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-[#C084FC]">
                    <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>
                      {adminStatus.canClaim
                        ? 'First-Run Admin Setup (Claim Passcode)'
                        : 'Unlock Protected Admin Console'}
                    </span>
                  </div>
                  <p>
                    {adminStatus.canClaim
                      ? 'No ADMIN_PASSCODE secret is set yet. Choose a strong initial admin passcode (min 8 chars) to lock admin management to authorized sessions.'
                      : 'Enter the server Admin Passcode to unlock SQLite curriculum management and anonymized system metrics.'}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="admin-passcode" className="block text-xs font-medium text-[#F8FAFC]">
                    Admin Passcode
                  </label>
                  <input
                    id="admin-passcode"
                    type="password"
                    required
                    minLength={8}
                    maxLength={128}
                    value={adminPasscode}
                    onChange={(e) => setAdminPasscode(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="aurora-input w-full px-3.5 py-2.5 text-sm text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="aurora-btn-primary w-full rounded-xl px-4 py-2.5 text-xs font-semibold cursor-pointer disabled:opacity-60"
                >
                  {busy
                    ? 'Verifying...'
                    : adminStatus.canClaim
                    ? 'Claim Admin Passcode & Unlock'
                    : 'Verify & Unlock Admin'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
