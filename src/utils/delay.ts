/**
 * ⏱️ 지정한 시간(ms)만큼 지연시키는 함수
 *
 * 사용 목적:
 * - API 요청 인위적 지연 (로딩 UI 테스트)
 * - debounce / throttling 테스트
 * - 비동기 흐름 제어
 *
 * @param ms - 지연 시간 (밀리초)
 *
 * @example
 * await delay(2000); // 2초 대기
 */
export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}