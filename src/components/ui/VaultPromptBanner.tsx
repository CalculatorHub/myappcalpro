import React from 'react';
import { Database, Lock, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface VaultPromptBannerProps {
  moduleLabel: string;
}

export const VaultPromptBanner: React.FC<VaultPromptBannerProps> = ({ moduleLabel }) => {
  const { user, openAuthModal } = useAuth();

  if (user) {
    return (
      <div className="aurora-subcard flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-xs">
        <span className="inline-flex items-center gap-2 text-[#94A3B8]">
          <Database className="h-3.5 w-3.5 text-[#10B981]" aria-hidden="true" />
          <span>
            SQLite Synced for <strong className="text-[#F8FAFC]">{user.name}</strong> ·{' '}
            {moduleLabel} records are private to your account.
          </span>
        </span>
        <button
          type="button"
          onClick={() => openAuthModal('login')}
          className="font-semibold text-[#38BDF8] hover:text-[#F8FAFC] cursor-pointer"
        >
          Account &amp; Admin
        </button>
      </div>
    );
  }

  return (
    <div className="aurora-subcard flex flex-wrap items-center justify-between gap-3 border-[#6366F1]/35 bg-gradient-to-r from-[#2563EB]/12 via-[#6366F1]/10 to-[#A855F7]/12 px-4 py-3 text-xs">
      <div className="flex items-center gap-2.5 text-[#E2E8F0]">
        <Lock className="h-4 w-4 text-[#38BDF8] shrink-0" aria-hidden="true" />
        <span>
          <strong>Live Sandbox Active:</strong> Sign in or create a free SQLite account to save,
          edit, and delete your personal {moduleLabel} records across sessions.
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => openAuthModal('register')}
          className="aurora-btn-primary inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold cursor-pointer"
        >
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Create Vault</span>
        </button>
        <button
          type="button"
          onClick={() => openAuthModal('login')}
          className="rounded-xl border border-[#6366F1]/35 bg-[#080D1B]/70 px-3 py-1.5 text-xs font-medium text-[#F8FAFC] hover:border-[#06B6D4] cursor-pointer"
        >
          Sign In
        </button>
      </div>
    </div>
  );
};
