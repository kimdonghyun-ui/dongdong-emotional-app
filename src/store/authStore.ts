import { create } from "zustand";
import { apiClient } from "@/lib/apiClient";
import type { User } from "@/lib/types";
import { parseAuthError } from "@/lib/parseAuthError";

interface AuthState {
  accessToken: string | null;
  user: User | null;
  authReady: boolean;
  error: string | null;

  setAccessToken: (token: string | null) => void;
  clearError: () => void;
  login: (identifier: string, password: string) => Promise<void>;
  restoreSession: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  authReady: false,
  error: null,

  setAccessToken: (token) => set({ accessToken: token }),
  clearError: () => set({ error: null }),

  /**
   * 🔐 로그인
   */
login: async (identifier, password) => {
  try {
    const data = await apiClient("/api/session/login", {
      method: "POST",
      body: JSON.stringify({ identifier, password }),
    });

    set({
      accessToken: data.jwt,
      user: data.user,
      authReady: true,
      error: null,
    });
  } catch (err) {
    set({
      accessToken: null,
      user: null,
      authReady: true,
      error: parseAuthError(err),
    });

    throw err;
  }
},


  /**
   * 🔄 새로고침 시 로그인 복구
   * - refreshToken(HttpOnly 쿠키) 기반
   */
  restoreSession: async () => {
    try {
          // 🔥 테스트용 딜레이
    await new Promise((r) => setTimeout(r, 500)); // 일부러 0.5초 기다리기
      const data = await apiClient("/api/session/refresh", {
        method: "POST",
      });

      set({
        accessToken: data.jwt,
        user: data.user,
        authReady: true,
        error: null,
      });
    } catch {
      // 🔥 핵심: 세션 종료 확정
      set({
        accessToken: null,
        user: null,
        authReady: true,
        error: null,
      });
    }
  },

  /**
   * 🚪 로그아웃
   */
  logout: async () => {
    try {
      await apiClient("/api/session/logout", {
        method: "POST",
      });
    } catch {
      // 서버 실패해도 클라이언트 정리는 진행
    } finally {
      set({
        accessToken: null,
        user: null,
        authReady: true,
        error: null,
      });
    }
  },
}));
