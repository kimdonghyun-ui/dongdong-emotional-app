'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function RecordCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardContent className="flex items-center gap-4 py-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-4 w-16" />
      </CardContent>
    </Card>
  )
}

export function HomeStatsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-32" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-3 w-8" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-48 w-full rounded-lg" />
      </CardContent>
    </Card>
  )
}

export function InsightSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-5 w-40" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-5/6" />
        <div className="space-y-2 pt-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
        </div>
      </CardContent>
    </Card>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 pt-2">
        <Skeleton className="h-9 w-9 rounded-full" />
        <Skeleton className="h-6 w-20" />
      </div>

      {/* Profile card */}
      <Card>
        <CardContent className="flex items-center gap-4 py-5">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-4 w-40" />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="flex flex-col items-center gap-1.5 py-4">
              <Skeleton className="h-9 w-9 rounded-full" />
              <Skeleton className="h-5 w-8" />
              <Skeleton className="h-3 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Settings */}
      <div className="space-y-3">
        <Skeleton className="ml-1 h-4 w-12" />
        <Card>
          <CardContent className="space-y-4 py-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-5 w-9 rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Info */}
      <div className="space-y-3">
        <Skeleton className="ml-1 h-4 w-12" />
        <Card>
          <CardContent className="space-y-4 py-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-4 w-28" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Logout */}
      <Skeleton className="h-10 w-full rounded-xl" />
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="p-4 space-y-4">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-4 w-60" />
      <div className="space-y-3 pt-4">
        {[...Array(3)].map((_, i) => (
          <RecordCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
