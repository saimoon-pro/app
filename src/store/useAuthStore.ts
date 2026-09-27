import { create } from 'zustand';
import type { AuthUser } from '@/services/auth';

interface AuthState {
  // Current logged in user
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;

  // Real-time user profile (credit balance, phone, etc.)
  profile: AuthUser | null;
  setProfile: (profile: AuthUser | null) => void;

  // Loading state during auth check
  authLoading: boolean;
  setAuthLoading: (loading: boolean) => void;

  // Auth modal open/closed and active tab
  authModalOpen: boolean;
  authModalTab: 'login' | 'signup' | 'forgot';
  openAuthModal: (tab?: 'login' | 'signup' | 'forgot') => void;
  closeAuthModal: () => void;

  // CV Maker Workspace active state (full screen app overlay)
  workspaceOpen: boolean;
  setWorkspaceOpen: (open: boolean) => void;

  // Legal Modal / View state
  legalModalPage: 'terms' | 'privacy' | null;
  setLegalModalPage: (page: 'terms' | 'privacy' | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),

  profile: null,
  setProfile: (profile) => set({ profile }),

  authLoading: true,
  setAuthLoading: (loading) => set({ authLoading: loading }),

  authModalOpen: false,
  authModalTab: 'signup',
  openAuthModal: (tab = 'signup') => set({ authModalOpen: true, authModalTab: tab }),
  closeAuthModal: () => set({ authModalOpen: false }),

  workspaceOpen: false,
  setWorkspaceOpen: (open) => set({ workspaceOpen: open }),

  legalModalPage: null,
  setLegalModalPage: (page) => set({ legalModalPage: page }),
}));
