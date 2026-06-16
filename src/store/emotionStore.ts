import { create } from "zustand";
import { apiClient } from "@/lib/apiClient";
import { parseAuthError } from "@/lib/parseAuthError";
import { StrapiListResponse, EmotionRecord, AIInsight } from "@/type";
import { useAuthStore } from "@/store/authStore";
import { getWeeklyStats, getTodayRecords, analyzeEmotionTrend } from "@/lib/emotion-utils";

interface EmotionState {
  /* state */
  records: EmotionRecord[]; //감정기록 리스트 저장될곳
  recordsTotalPages:number;
  recordsTotalLength:number;

  selectedRecord: EmotionRecord | null; // 추가

  aiInsight: AIInsight | null;
  aiInsights: AIInsight[];
  aiInsightsTotalPages:number;
  loading: boolean; //로딩 체크용
  error: string | null; //에러 체크용

  /* function */
  fetchRecords: (options?: {
    page?: number;
    pageSize?: number;
  }) => Promise<void>;

  fetchRecordById: (documentId: string) => Promise<void>;

  createRecord: (data: {
    emotion: string;
    intensity: number;
    content?: string;
  }) => Promise<EmotionRecord>;
  // deleteRecord: (id: number) => Promise<void>;
  deleteRecord: (documentId: string) => Promise<void>;
  createAIInsight: (period?: "daily" | "weekly") => Promise<AIInsight>;

  saveAIResult: (result: AIInsight) => Promise<void>;
  fetchAIInsights: (options?: {
    page?: number;
    pageSize?: number;
  }) => Promise<void>;

  clearRecords: () => void;
}

export const useEmotionStore = create<EmotionState>((set, get) => ({
  records: [],
  recordsTotalPages:0,
  recordsTotalLength:0,
  selectedRecord: null,
  aiInsight: null,
  aiInsights: [],
  aiInsightsTotalPages:0,
  loading: false,
  error: null,

  /**
   * 📥 감정 기록 리스트 조회
   */
  fetchRecords: async (options: {
    page?: number;
    pageSize?: number;
  } = {}) => {
    const { page = 1, pageSize = 10 } = options;
    const user = useAuthStore.getState().user; //로그인한 사용자의 user정보 불러오기

    set({ loading: true, error: null });

    // 📌 API 요청 설명
    // --------------------------------------------------
    // 1️⃣ filters[user][id][$eq]=${user?.id}
    // → 현재 로그인한 사용자(user.id)와 연결된 데이터만 조회
    // → 즉, "내가 작성한 감정 기록만 가져오기" 위한 필터 조건

    // 2️⃣ sort=createdAt:desc
    // → createdAt 기준으로 내림차순 정렬
    // → 최신 데이터가 먼저 오도록 정렬 (최근 기록 먼저 보기)

    // 3️⃣ populate=*
    // → 관계형 데이터까지 함께 조회
    // → 예: user, 이미지, 다른 relation 필드들을 포함해서 응답
    // → 없으면 id만 오고, 실제 데이터는 안 딸려옴

    // ⚠️ 참고
    // populate=* 는 편하지만 성능에 부담될 수 있음
    // → 실제 서비스에서는 필요한 필드만 명시적으로 populate 권장
    // 예: populate=user,comments
    try {
      
      const query = `&pagination[page]=${page}&pagination[pageSize]=${pageSize}`;
      const res = await apiClient<StrapiListResponse<EmotionRecord>>(
        `/api/emotion-entries?filters[user][id][$eq]=${user?.id}&sort=createdAt:desc&populate=user${query}`,
        {
          method: "GET",
          auth: true,
          delayMs: 500, // ⏱️delayMs = 테스트용 지연 (로딩 UI 확인용)
        }
      );
      set({
          records: res.data,
          recordsTotalPages: res.meta.pagination.pageCount,
          recordsTotalLength: res.meta.pagination.total,
          loading: false,
        });
    } catch (err) {
      set({
        loading: false,
        error: parseAuthError(err),
      });
    } finally{
      set({
        loading: false,
      });
    }
  },


  /**
   * 📥 감정 기록 상세 조회
   */
  fetchRecordById: async (documentId: string) => {
    set({
      loading: true,
      error: null,
    });

    try {
      const res = await apiClient<{ data: EmotionRecord }>(
        `/api/emotion-entries/${documentId}?populate=user`,
        {
          method: "GET",
          auth: true,
        }
      );

      set({
        selectedRecord: res.data,
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
   * ➕ 감정 기록 생성
   */
  createRecord: async (data) => {
    set({
      loading: true,
      error: null,
    });
        const user = useAuthStore.getState().user; //로그인한 사용자의 user정보 불러오기
    try {
      const res = await apiClient<{ data: EmotionRecord }>("/api/emotion-entries", {
        method: "POST",
        body: JSON.stringify({
          data: {
            ...data,
            user: user?.id,
          },
        }),
        auth: true,
      });

      // 👉 생성 후 다시 조회 (제일 안정적)
      await get().fetchRecords();

      set({
        loading: false,
      });
      return res.data;
    } catch (err) {
      set({
        loading: false,
        error: parseAuthError(err),
      });
      throw err;
    }
  },

  /**
   * ❌ 감정 기록 삭제
   */
  deleteRecord: async (documentId: string) => {
    set({
      loading: true,
      error: null,
    });
    try {
      await apiClient(`/api/emotion-entries/${documentId}`, {
        method: "DELETE",
        auth: true,
      });

      // 👉 삭제 후 상태 업데이트
      set((state) => ({
        records: state.records.filter((r) => r.documentId !== documentId),
        selectedRecord: null,
        loading: false,
      }));

    } catch (err) {
      set({
        error: parseAuthError(err),
        loading: false,
      });
    }
  },

  /**
   * ➕ AI 분석 결과 받기(GPT API 사용함)
   */
  createAIInsight: async (period: "daily" | "weekly" = "weekly") => {
    const records = get().records;

    const stats = getWeeklyStats(records);
    const todayRecords = getTodayRecords(records);
    const trend = analyzeEmotionTrend(stats);

    const data = {
      stats,
      todayRecords,
    };

    set({ loading: true, error: null });

    try {
      const res = await fetch("/api/ai-insight", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      //apiClient는 무조건 strapi보게 되어있어서 외부 api인경우는 fetch그대로 쓰기때문에 아래 res.ok 확인이 필요하다.(apiClient안에는 이미 되어있음)
      if (!res.ok) {
        throw new Error("API 요청 실패");
      }

      const result = await res.json();

      if (result.fallback) {
        console.error('AI 서버 연결 실패')
        set({
          error: result.summary,
          loading: false,
        });

        return result;
      }

      // ✅ 여기서 가공
      const insight = {
        period: period,
        summary: result.summary,
        patterns: result.patterns,
        suggestions: result.suggestions,
        emotionalTrend: trend,
        fallback:false
      };

      await get().saveAIResult(insight); //ai응답 받고나서 바로 저장되는건 고정이기때문에 여기다 선언!
      return result;
    } catch (err) {
      console.error("AI 요청 실패", err);
      set({
        error: "AI 분석 실패",
        loading: false,
      });

      return {
        fallback: true,
        summary: "AI 분석에 실패했어요.",
      };
    }
  },


  /**
   * ➕ AI 분석 결과 저장하기
   */
  saveAIResult: async (result: AIInsight) => {
    const user = useAuthStore.getState().user; //로그인한 사용자의 user정보 불러오기

    set({ loading: true, error: null });

    try {
      await apiClient(
        `/api/ai-insights`,
        {
          method: "POST",
          body: JSON.stringify({
            data:{
              summary:result.summary,
              patterns:result.patterns,
              suggestions:result.suggestions,
              emotionalTrend:result.emotionalTrend,
              period:result.period,
              user: user?.id,
            },
          }),
          auth: true,
        }
      );

      set({
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
   * 📥 AI 분석 결과 리스트 조회
   */
  fetchAIInsights: async (options: {
    page?: number;
    pageSize?: number;
  } = {}) => {
    const { page = 1, pageSize = 10 } = options;
    const user = useAuthStore.getState().user; //로그인한 사용자의 user정보 불러오기

    set({ loading: true, error: null });
    try {
      const query = `&pagination[page]=${page}&pagination[pageSize]=${pageSize}`;
      const res = await apiClient<StrapiListResponse<AIInsight>>(
        `/api/ai-insights?filters[user][id][$eq]=${user?.id}&sort=createdAt:desc&populate=user${query}`,
        {
          method: "GET",
          auth: true,
          delayMs: 500,
        }
      );

      set((state) => {
        if (res.data.length === 0 && state.aiInsights.length === 0) {
          return state; // 🔥 업데이트 안함
        }
        return {
          aiInsight: res.data[0],
          aiInsights: res.data,
          aiInsightsTotalPages: res.meta.pagination.pageCount,
          loading: false,
        };
      });
    } catch (err) {
      set({
        loading: false,
        error: parseAuthError(err),
      });
    }
  },









  /**
   * 🧹 초기화 (로그아웃용)
   */
  clearRecords: () => {
    set({
      records: [],
      loading: false,
      error: null,
    });
  },
}));