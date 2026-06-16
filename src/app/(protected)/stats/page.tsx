'use client'

import { useEffect, useMemo } from 'react'
import Link from 'next/link'
import { format, startOfWeek, addDays } from 'date-fns'
import { ko } from 'date-fns/locale'
import { TrendingUp, Calendar, BarChart3 } from 'lucide-react'
import { Bar, BarChart, XAxis, YAxis, Cell, PieChart, Pie, ResponsiveContainer, Legend } from 'recharts'
import { AppShell } from '@/components/app-shell'
import { EmotionIconStatic } from '@/components/emotion-icon'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty'
import { ChartSkeleton } from '@/components/loading-states'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { WeeklyStats, EmotionType, DailyStats } from '@/type'
import { getWeeklyStats, getDailyStats } from "@/lib/emotion-utils";
import { useEmotionStore } from "@/store/emotionStore";
import { EMOTION_MAP } from '@/constants/emotion';

// Compute colors in JavaScript for Recharts
const EMOTION_COLORS: Record<EmotionType, string> = {
  happy: '#e6c84a',
  excited: '#e68a4a',
  peaceful: '#6db892',
  sad: '#7a9dd9',
  anxious: '#b485c9',
  angry: '#d97070',
  tired: '#9a8fb3',
  confused: '#70b8c9',
}


export default function StatsPage() {
  /* store state */
  const records = useEmotionStore((s) => s.records);
  const loading = useEmotionStore((s) => s.loading);

  /* store actions */
  const fetchRecords = useEmotionStore((s) => s.fetchRecords);

  /* effects */
  useEffect(() => {
    fetchRecords({ page: 1, pageSize: 10 });
  }, [fetchRecords]);

  /* derived state */
  const hasData = records.length > 0;

  if (loading) {
    return (
      <AppShell>
        <div className="p-4 space-y-4">
          <header className="pt-2">
            <h1 className="text-2xl font-bold">통계</h1>
          </header>
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </AppShell>
    )
  }

  if (!hasData) {
    return (
      <AppShell>
        <div className="p-4 space-y-4">
          <header className="pt-2">
            <h1 className="text-2xl font-bold">통계</h1>
          </header>
          <Card>
            <CardContent className="py-12">
              <Empty className="border-0">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <BarChart3 className="h-5 w-5" />
                  </EmptyMedia>
                  <EmptyTitle>아직 데이터가 없어요</EmptyTitle>
                  <EmptyDescription>
                    감정을 기록하면 여기서 통계를 확인할 수 있어요
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button asChild>
                    <Link href="/record">첫 감정 기록하기</Link>
                  </Button>
                </EmptyContent>
              </Empty>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    )
  }

  /* derived state */
  const dailyStats = getDailyStats(records);
  const weeklyStats = getWeeklyStats(records);

  return (
    <AppShell>
      <div className="p-4 space-y-6">
        {/* Header */}
        <header className="pt-2">
          <h1 className="text-2xl font-bold">통계</h1>
          <p className="text-muted-foreground text-sm mt-1">
            나의 감정 패턴을 확인해보세요
          </p>
        </header>

        {/* Tabs */}
        <Tabs defaultValue="weekly" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="daily" className="flex-1">오늘</TabsTrigger>
            <TabsTrigger value="weekly" className="flex-1">이번 주</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-4 mt-4">
            { dailyStats && <DailyStatsView stats={dailyStats} /> }
            {/* {dailyStats && <DailyStatsView stats={dailyStats} />} */}
          </TabsContent>

          <TabsContent value="weekly" className="space-y-4 mt-4">
            {weeklyStats && <WeeklyStatsView stats={weeklyStats} />}
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}

function DailyStatsView({ stats }: { stats: DailyStats }) {
  const pieData = useMemo(() => {
    return stats.emotions.map((e) => {
      const info = EMOTION_MAP[e.emotion];
      return {
        name: info.labelKo,
        value: e.count,
        fill: EMOTION_COLORS[e.emotion],
      }
    })
  }, [stats])

  if (stats.totalRecords === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <Empty className="border-0">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Calendar className="h-5 w-5" />
              </EmptyMedia>
              <EmptyTitle>오늘 기록이 없어요</EmptyTitle>
              <EmptyDescription>
                지금 기분을 기록해보세요
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button asChild size="sm">
                <Link href="/record">기록하기</Link>
              </Button>
            </EmptyContent>
          </Empty>
        </CardContent>
      </Card>
    )
  }

  const chartConfig = stats.emotions.reduce((acc, e) => {
    const info = EMOTION_MAP[e.emotion];
    acc[info.labelKo] = {
      label: info.labelKo,
      color: EMOTION_COLORS[e.emotion],
    }
    return acc
  }, {} as Record<string, { label: string; color: string }>)

  return (
    <>
      {/* Summary Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">오늘 요약</CardTitle>
          <CardDescription>
            {format(new Date(), 'M월 d일 EEEE', { locale: ko })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-3xl font-bold text-primary">{stats.totalRecords}</p>
              <p className="text-sm text-muted-foreground">기록 횟수</p>
            </div>
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-3xl font-bold text-primary">
                {stats.averageIntensity.toFixed(1)}
              </p>
              <p className="text-sm text-muted-foreground">평균 강도</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emotion Distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">감정 분포</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Emotion List */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">기록된 감정</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {stats.emotions
            .sort((a, b) => b.count - a.count)
            .map((item) => {
              const info = EMOTION_MAP[item.emotion];
              const percentage = (item.count / stats.totalRecords) * 100
              return (
                <div key={item.emotion} className="flex items-center gap-3">
                  <EmotionIconStatic emotion={item.emotion} size="sm" className="!w-8 !h-8 !text-base" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{info.labelKo}</span>
                      <span className="text-xs text-muted-foreground">
                        {item.count}회 ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: EMOTION_COLORS[item.emotion],
                        }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
        </CardContent>
      </Card>
    </>
  )
}

function WeeklyStatsView({ stats }: { stats: WeeklyStats }) {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 })

  const barData = useMemo(() => {
    return stats.dailyAverages.map((day, index) => {
      const date = addDays(weekStart, index)
      const dayName = format(date, 'EEE', { locale: ko })
      const dominantEmotion = day.dominantEmotion
      return {
        name: dayName,
        intensity: day.averageIntensity || 0,
        fill: dominantEmotion ? EMOTION_COLORS[dominantEmotion] : '#94a3b8',
      }
    })
  }, [stats, weekStart])

  const pieData = useMemo(() => {
    return stats.emotionDistribution.map((e) => {
      const info = EMOTION_MAP[e.emotion];
      return {
        name: info.labelKo,
        value: e.count,
        fill: EMOTION_COLORS[e.emotion],
      }
    })
  }, [stats])

  if (stats.totalRecords === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <Empty className="border-0">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Calendar className="h-5 w-5" />
              </EmptyMedia>
              <EmptyTitle>이번 주 기록이 없어요</EmptyTitle>
              <EmptyDescription>
                감정을 기록하면 주간 통계를 볼 수 있어요
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button asChild size="sm">
                <Link href="/record">기록하기</Link>
              </Button>
            </EmptyContent>
          </Empty>
        </CardContent>
      </Card>
    )
  }

  const chartConfig = {
    intensity: {
      label: '평균 강도',
      color: 'hsl(var(--primary))',
    },
  }

  const pieChartConfig = stats.emotionDistribution.reduce((acc, e) => {
    const info = EMOTION_MAP[e.emotion];
    acc[info.labelKo] = {
      label: info.labelKo,
      color: EMOTION_COLORS[e.emotion],
    }
    return acc
  }, {} as Record<string, { label: string; color: string }>)

  return (
    <>
      {/* Summary Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            이번 주 요약
          </CardTitle>
          <CardDescription>
            {format(new Date(stats.startDate), 'M월 d일', { locale: ko })} - {format(new Date(stats.endDate), 'M월 d일', { locale: ko })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-3xl font-bold text-primary">{stats.totalRecords}</p>
              <p className="text-sm text-muted-foreground">총 기록</p>
            </div>
            <div className="rounded-lg bg-muted p-4">
              {stats.mostFrequentEmotion ? (
                <div className="flex flex-col items-center gap-1">
                  <EmotionIconStatic
                    emotion={stats.mostFrequentEmotion}
                    size="sm"
                    className="!w-8 !h-8 !text-base"
                  />
                  <p className="text-sm font-medium">
                    {EMOTION_MAP[stats.mostFrequentEmotion].labelKo}
                  </p>
                  <p className="text-xs text-muted-foreground">가장 많은 감정</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center">-</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Intensity Bar Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">일별 감정 강도</CardTitle>
          <CardDescription>막대 색상은 그 날의 주요 감정을 나타냅니다</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis domain={[0, 5]} tickLine={false} axisLine={false} />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  cursor={{ fill: 'hsl(var(--muted))' }}
                />
                <Bar dataKey="intensity" radius={[4, 4, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Emotion Distribution Pie Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">감정 분포</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={pieChartConfig} className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Top Emotions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">감정 순위</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {stats.emotionDistribution.slice(0, 5).map((item, index) => {
            const info = EMOTION_MAP[item.emotion];
            return (
              <div key={item.emotion} className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                  {index + 1}
                </span>
                <EmotionIconStatic emotion={item.emotion} size="sm" className="!w-8 !h-8 !text-base" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{info.labelKo}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.count}회 ({item.percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-1">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: EMOTION_COLORS[item.emotion],
                      }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </>
  )
}