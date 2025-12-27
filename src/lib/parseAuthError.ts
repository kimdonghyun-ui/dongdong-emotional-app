// lib/parseAuthError.ts
export function parseAuthError(err: unknown): string {
    if (!(err instanceof Error)) {
      return "알 수 없는 에러가 발생했습니다.";
    }
  
    switch (err.message) {
      case "AUTH_REQUIRED":
        return "로그인이 필요합니다.";
      default:
        return err.message || "요청에 실패했습니다.";
    }
  }
  