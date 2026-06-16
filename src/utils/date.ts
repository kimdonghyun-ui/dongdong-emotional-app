// utils/date.ts

/**
 * 특정 날짜 기준 "오늘 데이터인지" 판단
 */
export function isToday(dateString: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const target = new Date(dateString);

  return target >= today && target < tomorrow;
}


/**
 * 이번 주 범위 데이터 필터
 */
// export function filterThisWeek<T>(
//   items: T[],
//   getDate: (item: T) => string
// ) {
//   const now = new Date();
//   const day = now.getDay();

//   const start = new Date(now);
//   start.setDate(now.getDate() - day);
//   start.setHours(0, 0, 0, 0);

//   const end = new Date(start);
//   end.setDate(start.getDate() + 7);

//   return items.filter((item) => {
//     const d = new Date(getDate(item));
//     return d >= start && d < end;
//   });
// }
export function filterThisWeek<T>(
  items: T[],
  getDate: (item: T) => string
) {
  const now = new Date();
  const day = now.getDay() || 7;

  const start = new Date(now);
  start.setDate(now.getDate() - day + 1);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 7);

  return items.filter((item) => {
    const d = new Date(getDate(item));
    return d >= start && d < end;
  });
}