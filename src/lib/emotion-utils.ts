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
  /* 이번 주 기간 계산 (월요일 ~ 다음 주 월요일) */
  const today = new Date();
  const dayOfWeek = today.getDay() || 7;

  const start = new Date(today);
  start.setDate(today.getDate() - dayOfWeek + 1);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  /* 화면 표시용 마지막 날짜 (월~일 표시용) */
  const displayEndDate = new Date(end);
  displayEndDate.setDate(displayEndDate.getDate() - 1);

  /* 이번 주 기록만 추출 */
  const weekRecords = records.filter((record) => {
    const recordDate = new Date(record.createdAt);
    return recordDate >= start && recordDate < end;
  });

  /* 총 기록 수 */
  const total = weekRecords.length;

  /* 감정별 개수 집계 */
  const emotionCount: Record<string, number> = {};

  weekRecords.forEach((record) => {
    emotionCount[record.emotion] =
      (emotionCount[record.emotion] || 0) + 1;
  });

  /* 감정 비율 계산 */
  const emotionDistribution = Object.entries(emotionCount).map(
    ([emotion, count]) => ({
      emotion: emotion as EmotionType,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    })
  );

  /* 일별 평균 강도 + 대표 감정 */
  const dailyAverages: WeeklyStats["dailyAverages"] = [];

  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(start);
    currentDate.setDate(start.getDate() + i);

    const stats = getDailyStats(records, currentDate);

    const dayEmotionCounts = stats.emotions.reduce((acc, emotion) => {
      acc[emotion.emotion] = emotion.count;
      return acc;
    }, {} as Record<EmotionType, number>);

    const dominantEmotion = Object.entries(dayEmotionCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] as
      | EmotionType
      | undefined;

    dailyAverages.push({
      date: stats.date,
      averageIntensity: stats.averageIntensity,
      dominantEmotion: dominantEmotion ?? null,
    });
  }

  /* 이번 주 가장 많이 기록된 감정 */
  const mostFrequentEmotion =
    [...emotionDistribution]
      .sort((a, b) => b.count - a.count)[0]?.emotion ?? null;

  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),

    // 화면 표시용 (예: 6/15 ~ 6/21)
    displayEndDate: displayEndDate.toISOString(),

    emotionDistribution,
    dailyAverages,
    totalRecords: total,
    mostFrequentEmotion,
  };
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