import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PROTECTED_PATHS } from "@/lib/auth.constants";

/**
 * 🔒 보호가 필요한 경로 목록
 *
 * - 이 배열에 포함된 경로는 "로그인한 사용자만" 접근 가능
 * - 정확 경로 + 하위 경로까지 모두 보호
 *
 * 예:
 *  "/"            → 보호됨
 *  "/users"       → 보호됨
 *  "/users/1"     → 보호됨
 *  "/users/edit"  → 보호됨
 *
 * ❗ 주의
 * - proxy는 "항상 실행"되므로
 *   너무 많은 경로를 넣으면 불필요한 redirect가 잦아질 수 있음
 */


/**
 * 🚪 요청 프록시 (middleware 역할)
 *
 * 이 함수는 다음 경우마다 실행된다:
 * - 새로고침
 * - 주소창 직접 접근
 * - App Router 페이지 이동 시 발생하는 RSC fetch
 * - layout / server component 요청
 *
 * 👉 따라서 "항상 실행된다"고 생각하고
 *    매우 단순하고 안전하게 작성해야 함
 */
export function proxy(req: NextRequest) {
  /**
   * 현재 요청 경로
   * 예: "/", "/users", "/users/1"
   */
  const { pathname } = req.nextUrl;

  /**
   * 🔑 refreshToken 쿠키 조회
   *
   * - HttpOnly 쿠키이므로 JS에서는 접근 불가
   * - proxy(middleware)는 서버에서 실행되므로 접근 가능
   *
   * ❗ 여기서는 "유효성"을 검사하지 않음
   *    오직 "존재 여부"만 본다
   */
  const refreshToken = req.cookies.get("refreshToken")?.value;

  /**
   * refreshToken이 존재하는지 여부
   *
   * ⚠️ 주의
   * - hasRefreshToken === true
   *   → "로그인 상태"를 의미하지는 않음
   *   → 단지 "서버가 판단을 보류할 수 있는 상태"
   */
  const hasRefreshToken = Boolean(refreshToken);

  /**
   * 현재 요청 경로가 보호 대상인지 판단
   *
   * - 정확히 일치하거나
   * - 하위 경로로 시작하면 보호 대상
   */
  const isProtectedPath = PROTECTED_PATHS.some(
    (path) =>
      pathname === path || pathname.startsWith(`${path}/`)
  );

  /**
   * ❌ 비로그인 상태(hasRefreshToken === false)에서
   *    보호된 경로에 접근하려는 경우
   *
   * → 로그인 페이지로 강제 이동
   *
   * 🔁 redirect 파라미터:
   * - 사용자가 원래 가려던 경로를 보존
   * - 로그인 성공 후 해당 경로로 복귀하기 위함
   *
   * 예:
   *  /users → /login?redirect=/users
   */
  if (!hasRefreshToken && isProtectedPath) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);

    return NextResponse.redirect(loginUrl);
  }

  /**
   * ✅ 그 외 모든 요청은 그대로 통과
   *
   * 포함되는 경우:
   * - 로그인 페이지 접근
   * - 퍼블릭 페이지 접근
   * - refreshToken이 있지만 유효성은 모르는 상태
   *
   * ❗ 로그인 여부의 "최종 판단"은
   *    클라이언트 Providers / restoreSession에서 수행
   */
  return NextResponse.next();
}

/**
 * ⚙️ middleware 실행 대상 설정
 *
 * - API 요청 제외
 * - Next 내부 정적 리소스 제외
 * - 이미지 최적화 요청 제외
 * - favicon 요청 제외
 *
 * 👉 불필요한 proxy 실행을 줄여
 *    성능 + 안정성 + 디버깅 가독성 확보
 */
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
