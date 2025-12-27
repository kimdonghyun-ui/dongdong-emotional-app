import { create } from "zustand";
import { apiClient } from "@/lib/apiClient";
import type { User } from "@/lib/types";
import { parseAuthError } from "@/lib/parseAuthError";

interface UserState {
  users: User[];
  loading: boolean;
  error: string | null;

  fetchUsers: () => Promise<void>;
  clearUsers: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  loading: false,
  error: null,

  /**
   * 👥 유저 리스트 조회
   * - 인증 필요 (auth: true)
   */
  fetchUsers: async () => {
    set({ loading: true, error: null });

    try {
      const data = await apiClient("/api/users", {
        method: "GET",
        auth: true,
      });

      set({
        users: data,
        loading: false,
      });
    } catch (err) {
      set({
        loading: false,
        error: parseAuthError(err),
      });
    }
  },

  /**
   * 🧹 로그아웃 시 유저 데이터 정리용
   */
  clearUsers: () => {
    set({
      users: [],
      loading: false,
      error: null,
    });
  },
}));
