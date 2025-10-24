import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { authApi } from '@/lib/api/endpoints';
import type { User, LoginRequest, RegisterRequest } from '@/types/api';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
  clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(credentials);
          const responseData = response.data.data;

          if (
            !responseData ||
            !('user' in responseData) ||
            !('access_token' in responseData) ||
            !('refresh_token' in responseData)
          ) {
            throw new Error('Respons login tidak valid');
          }

          const { user, access_token, refresh_token } = responseData;

          set({
            user,
            accessToken: access_token,
            refreshToken: refresh_token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: unknown) {
          const errorMessage =
            (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || 'Login gagal. Coba lagi.';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      register: async (data: RegisterRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.register(data);
          const responseData = response.data.data;

          if (
            !responseData ||
            !('user' in responseData) ||
            !('access_token' in responseData) ||
            !('refresh_token' in responseData)
          ) {
            throw new Error('Respons registrasi tidak valid');
          }

          const { user, access_token, refresh_token } = responseData;

          set({
            user,
            accessToken: access_token,
            refreshToken: refresh_token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: unknown) {
          const errorMessage =
            (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || 'Registrasi gagal. Coba lagi.';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      logout: () => {
        // Call logout API (optional, fire and forget)
        authApi.logout().catch(() => {});

        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });
      },

      refreshAuth: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        try {
          const response = await authApi.refresh(refreshToken);
          const responseData = response.data.data;

          if (
            !responseData ||
            !('access_token' in responseData) ||
            !('refresh_token' in responseData)
          ) {
            throw new Error('Respons refresh tidak valid');
          }

          const { access_token, refresh_token } = responseData;

          set({
            accessToken: access_token,
            refreshToken: refresh_token,
          });
        } catch (error) {
          // Refresh failed, logout
          get().logout();
          throw error;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: state => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
