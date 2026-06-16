'use client'

import { EmotionType } from '@/type'
import { EMOTION_MAP } from '@/constants/emotion';
import { cn } from '@/lib/utils'

interface EmotionIconProps {
  emotion: EmotionType
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showLabel?: boolean
  selected?: boolean
  onClick?: () => void
  className?: string
}

const sizeClasses = {
  sm: 'w-10 h-10 text-xl',
  md: 'w-14 h-14 text-2xl',
  lg: 'w-20 h-20 text-4xl',
  xl: 'w-24 h-24 text-5xl',
}

const emotionEmojis: Record<EmotionType, string> = {
  happy: '😊',
  excited: '🤩',
  peaceful: '😌',
  sad: '😢',
  anxious: '😰',
  angry: '😠',
  tired: '😴',
  confused: '😕',
}

export function EmotionIcon({
  emotion,
  size = 'md',
  showLabel = false,
  selected = false,
  onClick,
  className,
}: EmotionIconProps) {
  const info = EMOTION_MAP[emotion]
  
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-2 transition-all duration-200',
        onClick && 'cursor-pointer hover:scale-110 active:scale-95',
        !onClick && 'cursor-default',
        className,
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center rounded-full transition-all duration-200',
          sizeClasses[size],
          selected
            ? 'ring-4 ring-primary ring-offset-2 scale-110'
            : 'ring-2 ring-transparent',
        )}
        style={{
          backgroundColor: selected ? info.color : `color-mix(in oklch, ${info.color} 30%, white)`,
        }}
      >
        <span role="img" aria-label={info.label}>
          {emotionEmojis[emotion]}
        </span>
      </div>
      {showLabel && (
        <span
          className={cn(
            'text-sm font-medium transition-colors',
            selected ? 'text-foreground' : 'text-muted-foreground',
          )}
        >
          {info.labelKo}
        </span>
      )}
    </button>
  )
}

export function EmotionIconStatic({
  emotion,
  size = 'md',
  className,
}: {
  emotion: EmotionType
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}) {
  const info = EMOTION_MAP[emotion]
  
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full',
        sizeClasses[size],
        className,
      )}
      style={{
        backgroundColor: `color-mix(in oklch, ${info.color} 40%, white)`,
      }}
    >
      <span role="img" aria-label={info.label}>
        {emotionEmojis[emotion]}
      </span>
    </div>
  )
}
