

export type EmotionType = 
  | 'happy'
  | 'excited' 
  | 'peaceful' 
  | 'sad' 
  | 'anxious' 
  | 'angry' 
  | 'tired' 
  | 'confused'

export interface EmotionRecord {
  id: number;
  emotion: EmotionType;
  intensity: number;
  content?: string;
  createdAt: string;
  documentId: string;
}

export interface DailyStats {
  date: string
  emotions: { emotion: EmotionType; count: number }[]
  averageIntensity: number
  totalRecords: number
}

export interface WeeklyStats {
  startDate: string
  endDate: string
  emotionDistribution: { emotion: EmotionType; count: number; percentage: number }[]
  dailyAverages: { date: string; averageIntensity: number; dominantEmotion: EmotionType | null }[]
  totalRecords: number
  mostFrequentEmotion: EmotionType | null
  displayEndDate: string
}

export interface AIInsight {
  createdAt?:string
  documentId?:string
  id?:number
  period: 'daily' | 'weekly'
  summary: string
  patterns: string[]
  suggestions: string[]
  emotionalTrend: 'improving' | 'stable' | 'declining' | 'mixed'
  fallback: boolean
}

