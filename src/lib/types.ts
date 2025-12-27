/**
 * =========================
 * Auth / User 공용 타입
 * =========================
 */

/**
 * Strapi User
 */
export interface User {
  id: number;
  username: string;
  email: string;
}

/**
 * 로그인 / 리프레시 공통 응답
 * (Strapi 기준 현실적인 구조)
 */
export interface AuthResponse {
  jwt: string;   // accessToken
  user: User;
}
