'use client'

import { cn } from '@/lib/utils'

interface IntensitySelectorProps {
  value: number
  onChange: (value: number) => void
  className?: string
}

const intensityLabels = ['매우 약함', '약함', '보통', '강함', '매우 강함']

export function IntensitySelector({ value, onChange, className }: IntensitySelectorProps) {
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">감정 강도</span>
        <span className="text-sm font-semibold text-primary">
          {intensityLabels[value - 1]}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => onChange(level)}
            className={cn(
              'flex-1 h-12 rounded-xl transition-all duration-200 font-medium',
              level <= value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent',
            )}
          >
            {level}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground px-1">
        <span>약함</span>
        <span>강함</span>
      </div>
    </div>
  )
}
