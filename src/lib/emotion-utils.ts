// lib/emotion-utils.ts
import { EmotionRecord, WeeklyStats, AIInsight, EmotionType, DailyStats } from "@/type";

// 긍정 / 부정 기준
const POSITIVE_EMOTIONS: EmotionType[] = ["happy", "excited", "peaceful"];
const NEGATIVE_EMOTIONS: EmotionType[] = [
  "sad",
  "anxious",
  "angry",
  "tired",
  "confused",
];


/**
 * 📌 주간 통계 계산
 */
import { filterThisWeek } from "@/utils/date";

export function getChartData(records: EmotionRecord[]) {
  
  const weekRecords = filterThisWeek(records, (r) => r.createdAt);

  if (!weekRecords.length) return null;

  const total = weekRecords.length;

  const emotionCount: Record<string, number> = {};

  weekRecords.forEach((r) => {
    emotionCount[r.emotion] = (emotionCount[r.emotion] || 0) + 1;
  });

  const emotionDistribution = Object.entries(emotionCount).map(
    ([emotion, count]) => ({
      emotion: emotion as EmotionType,
      count,
      percentage: (count / total) * 100,
    })
  );

  return {
    totalRecords: total,
    emotionDistribution,
  };
}


export function getRecordsByDateRange(records: EmotionRecord[], startDate: Date, endDate: Date): EmotionRecord[] {
  return records.filter(r => {
    const recordDate = new Date(r.createdAt)
    return recordDate >= startDate && recordDate <= endDate
  })
}

export function getDailyStats(records: EmotionRecord[],date: Date = new Date()): DailyStats {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(startOfDay)
  endOfDay.setDate(endOfDay.getDate() + 1)
  
  const record_list = getRecordsByDateRange(records, startOfDay, endOfDay)
  
  const emotionCounts = record_list.reduce((acc, r) => {
    acc[r.emotion] = (acc[r.emotion] || 0) + 1
    return acc
  }, {} as Record<EmotionType, number>)
  
  const emotions = Object.entries(emotionCounts).map(([emotion, count]) => ({
    emotion: emotion as EmotionType,
    count,
  }))
  
  const averageIntensity = record_list.length > 0
    ? record_list.reduce((sum, r) => sum + r.intensity, 0) / record_list.length
    : 0
  
  return {
    date: startOfDay.toISOString().split('T')[0],
    emotions,
    averageIntensity,
    totalRecords: record_list.length,
  }
}




/**
 * 📌 오늘 기록 가져오기
 */
export function getTodayRecords(records: EmotionRecord[]): EmotionRecord[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return records.filter((r) => {
    const d = new Date(r.createdAt);
    return d >= today && d < tomorrow;
  });
}

/**
 * 📌 주간 통계 계산
 */
export function getWeeklyStats(records: EmotionRecord[]): WeeklyStats {
  /*
  [함수 핵심 정리]
  이번 주 데이터만 추리고
  감정별 개수 계산하고
  비율 구하고
  가장 많은 감정까지 뽑는 “주간 감정 리포트 핵심 로직”
  */

  //1️⃣ 이번 주 기간 계산
  const today = new Date();
  const day = today.getDay();

  const start = new Date(today);
  start.setDate(today.getDate() - day);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 7);

  //2️⃣ 이번 주 데이터만 필터링
  const weekRecords = records.filter((r) => {
    const d = new Date(r.createdAt);
    return d >= start && d < end;
  });

  //3️⃣ 총 개수
  const total = weekRecords.length;

  //4️⃣ 감정별 개수 집계
  const emotionCount: Record<string, number> = {};
  weekRecords.forEach((r) => {
    emotionCount[r.emotion] = (emotionCount[r.emotion] || 0) + 1;
  });
  // 위의 forEach 통해서 아래처럼 예시처럼 결과값이 나옴
  // emotionCount = {
  //   happy: 3,
  //   sad: 2,
  //   angry: 1
  // }

  //5️⃣ 퍼센트 계산 + 배열로 변환
  const emotionDistribution = Object.entries(emotionCount).map(
    ([emotion, count]) => ({
      emotion: emotion as EmotionType,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    })
  );
  // 위의 결과값 예시)
  // emotionDistribution = [
  //   { emotion: "happy", count: 3, percentage: 50 },
  //   { emotion: "sad", count: 2, percentage: 33.3 },
  // ]

  const dailyAverages: WeeklyStats['dailyAverages'] = []

    for (let i = 0; i < 7; i++) {
      const day = new Date(start)
      day.setDate(start.getDate() + i)
      const stats = getDailyStats(records,day)
      
      const dayEmotionCounts = stats.emotions.reduce((acc, e) => {
        acc[e.emotion] = e.count
        return acc
      }, {} as Record<EmotionType, number>)
      
      const dominantEmotion = Object.entries(dayEmotionCounts)
        .sort(([, a], [, b]) => b - a)[0]?.[0] as EmotionType | undefined
      
      dailyAverages.push({
        date: stats.date,
        averageIntensity: stats.averageIntensity,
        dominantEmotion: dominantEmotion || null,
      })
    }







  //6️⃣ 가장 많은 감정 찾기
  const mostFrequentEmotion =
    emotionDistribution.sort((a, b) => b.count - a.count)[0]?.emotion || null;

  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    emotionDistribution,
    dailyAverages: dailyAverages,
    totalRecords: total,
    mostFrequentEmotion,
  };
  /*
  위에 반환 데이터 예시
  {
    startDate: "이번주 시작",
    endDate: "이번주 끝",
    emotionDistribution: [...],
    totalRecords: 5,
    mostFrequentEmotion: "happy"
  }
  */
}

/**
 * 📌 감정 흐름 분석 (이건 그대로 유지 👍)
 */
export function analyzeEmotionTrend(stats: WeeklyStats): AIInsight["emotionalTrend"] {
  if (stats.totalRecords < 3) return "stable";

  const positiveCount = stats.emotionDistribution
    .filter((e) => POSITIVE_EMOTIONS.includes(e.emotion))
    .reduce((sum, e) => sum + e.count, 0);

  const negativeCount = stats.emotionDistribution
    .filter((e) => NEGATIVE_EMOTIONS.includes(e.emotion))
    .reduce((sum, e) => sum + e.count, 0);

  const ratio = positiveCount / (positiveCount + negativeCount);

  if (ratio > 0.7) return "improving";
  if (ratio < 0.3) return "declining";
  if (Math.abs(ratio - 0.5) < 0.15) return "mixed";

  return "stable";
}