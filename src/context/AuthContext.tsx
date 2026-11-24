import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  apiRequest,
  EMPTY_WORKSPACE,
  setInMemoryToken,
  type AdminStatus,
  type ApiUser,
  type WorkspaceSummary,
} from '../utils/api';

interface AuthContextValue {
  user: ApiUser | null;
  adminStatus: AdminStatus;
  workspace: WorkspaceSummary;
  workspaceLoading: boolean;
  authModalOpen: boolean;
  authModalInitialTab: 'login' | 'register' | 'admin';
  openAuthModal: (tab?: 'login' | 'register' | 'admin') => void;
  closeAuthModal: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  claimAdmin: (passcode: string) => Promise<void>;
  unlockAdmin: (passcode: string) => Promise<void>;
  refreshWorkspace: () => Promise<void>;
  refreshAdminStatus: () => Promise<void>;
}

const DEFAULT_ADMIN_STATUS: AdminStatus = {
  configured: false,
  envConfigured: false,
  claimedInDb: false,
  canClaim: true,
  isAdminSession: false,
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [adminStatus, setAdminStatus] = useState<AdminStatus>(DEFAULT_ADMIN_STATUS);
  const [workspace, setWorkspace] = useState<WorkspaceSummary>(EMPTY_WORKSPACE);
  const [workspaceLoading, setWorkspaceLoading] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalInitialTab, setAuthModalInitialTab] = useState<'login' | 'register' | 'admin'>(
    'register'
  );

  const refreshAdminStatus = useCallback(async () => {
    try {
      const status = await apiRequest<AdminStatus>('/api/admin/status');
      setAdminStatus(status);
    } catch {
      // Ignore transient offline status
    }
  }, []);

  const refreshWorkspace = useCallback(async () => {
    if (!user) {
      setWorkspace(EMPTY_WORKSPACE);
      return;
    }
    setWorkspaceLoading(true);
    try {
      const data = await apiRequest<WorkspaceSummary>('/api/workspace/summary');
      setWorkspace(data);
    } finally {
      setWorkspaceLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void refreshAdminStatus();
  }, [refreshAdminStatus]);

  useEffect(() => {
    if (user) {
      void refreshWorkspace();
    } else {
      setWorkspace(EMPTY_WORKSPACE);
    }
  }, [user, refreshWorkspace]);

  const openAuthModal = useCallback((tab: 'login' | 'register' | 'admin' = 'register') => {
    setAuthModalInitialTab(tab);
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await apiRequest<{ token: string; user: ApiUser }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setInMemoryToken(res.token);
      setUser(res.user);
      await refreshAdminStatus();
    },
    [refreshAdminStatus]
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await apiRequest<{ token: string; user: ApiUser }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      setInMemoryToken(res.token);
      setUser(res.user);
      await refreshAdminStatus();
    },
    [refreshAdminStatus]
  );

  const logout = useCallback(async () => {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } catch {
      // Clear local session regardless
    }
    setInMemoryToken(null);
    setUser(null);
    setWorkspace(EMPTY_WORKSPACE);
    await refreshAdminStatus();
  }, [refreshAdminStatus]);

  const claimAdmin = useCallback(
    async (passcode: string) => {
      await apiRequest('/api/admin/claim', {
        method: 'POST',
        body: JSON.stringify({ passcode }),
      });
      setUser((prev) => (prev ? { ...prev, isAdminSession: true } : prev));
      await refreshAdminStatus();
    },
    [refreshAdminStatus]
  );

  const unlockAdmin = useCallback(
    async (passcode: string) => {
      await apiRequest('/api/admin/unlock', {
        method: 'POST',
        body: JSON.stringify({ passcode }),
      });
      setUser((prev) => (prev ? { ...prev, isAdminSession: true } : prev));
      await refreshAdminStatus();
    },
    [refreshAdminStatus]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        adminStatus,
        workspace,
        workspaceLoading,
        authModalOpen,
        authModalInitialTab,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout,
        claimAdmin,
        unlockAdmin,
        refreshWorkspace,
        refreshAdminStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
