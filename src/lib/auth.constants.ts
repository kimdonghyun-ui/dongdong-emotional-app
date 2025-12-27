// src/lib/auth.constants.ts

/**
 * 🔒 로그인해야 접근 가능한 경로 목록
 *
 * - proxy / Providers에서 공통 사용
 * - 정확 경로 + 하위 경로까지 보호
 */
export const PROTECTED_PATHS = [
    "/",
    "/users",
    "/about",
  ];
  