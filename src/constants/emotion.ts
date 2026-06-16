/**
 * 📌 감정 설정값 (고정 데이터)
 *
 * - UI, 통계, 색상 등에서 공통 사용
 */

export const EMOTION_MAP = {
  happy: {
    type: 'happy',
    label: "Happy",
    labelKo: "행복",
    color: "var(--emotion-happy)",
  },
  excited: {
    type: 'excited',
    label: "Excited",
    labelKo: "신남",
    color: "var(--emotion-excited)",
  },
  peaceful: {
    type: 'peaceful',
    label: "Peaceful",
    labelKo: "평온",
    color: "var(--emotion-peaceful)",
  },
  sad: {
    type: 'sad',
    label: "Sad",
    labelKo: "슬픔",
    color: "var(--emotion-sad)",
  },
  anxious: {
    type: 'anxious',
    label: "Anxious",
    labelKo: "불안",
    color: "var(--emotion-anxious)",
  },
  angry: {
    type: 'angry',
    label: "Angry",
    labelKo: "화남",
    color: "var(--emotion-angry)",
  },
  tired: {
    type: 'tired',
    label: "Tired",
    labelKo: "피곤",
    color: "var(--emotion-tired)",
  },
  confused: {
    type: 'confused',
    label: "Confused",
    labelKo: "혼란",
    color: "var(--emotion-confused)",
  },
} as const;