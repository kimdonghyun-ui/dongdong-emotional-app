'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Plus, TrendingUp, Calendar, ArrowRight } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { EmotionIconStatic } from '@/components/emotion-icon'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty'
import { HomeStatsSkeleton, RecordCardSkeleton } from '@/components/loading-states'
import { useEmotionStore } from "@/store/emotionStore";
import { useAuthStore } from "@/store/authStore";
import { EMOTION_MAP } from '@/constants/emotion';
import { isToday } from "@/utils/date";
import { getChartData } from "@/lib/emotion-utils";
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

export default function HomePage() {
  const records = useEmotionStore((s) => s.records);
  const latestInsight = useEmotionStore((s) => s.aiInsight);
  const fetchAIInsights = useEmotionStore((s) => s.fetchAIInsights);
  const loading = useEmotionStore((s) => s.loading);
  const fetchRecords = useEmotionStore((s) => s.fetchRecords);

  const user = useAuthStore((s) => s.user);

  const weeklyStats = getChartData(records);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  useEffect(() => {
    fetchAIInsights({ page:1, pageSize: 1 });
  }, [fetchAIInsights]);


  const greeting = getGreeting()
  const todayDate = format(new Date(), 'M월 d일 EEEE', { locale: ko })



  // 👉 오늘 기록 필터링
  const todayRecords  = records.filter((r) => isToday(r.createdAt));


  return (
    <AppShell>
      <div className="p-4 space-y-6">
        {/* Header */}
        <header className="flex items-start justify-between pt-2">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">{greeting}</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {todayDate}
            </p>
          </div>
          <Link
            href="/profile"
            className="rounded-full ring-offset-background transition-transform hover:scale-105 active:scale-95"
            aria-label="프로필 보기"
          >
            <Avatar className="h-10 w-10">
              {user?.avatar && (
                <AvatarImage src={user.avatar} />
              )}
              <AvatarFallback className="bg-primary text-sm font-semibold text-primary-foreground">
                {user?.username
                  ? user.username.slice(-2)
                  : '마음'}
              </AvatarFallback>
            </Avatar>
          </Link>
        </header>





        {/* Quick Record Button */}
        <Card className="bg-primary text-primary-foreground border-0">
          <CardContent className="py-4">
            <Link href="/record" className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-semibold">지금 기분이 어떠세요?</p>
                <p className="text-sm opacity-90">오늘의 감정을 기록해보세요</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                <Plus className="h-6 w-6" />
              </div>
            </Link>
          </CardContent>
        </Card>

        {/* Today's Summary */}
        {loading ? (
          <HomeStatsSkeleton />
        ) : todayRecords.length > 0 ? (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">오늘의 감정</CardTitle>
              <CardDescription>{todayRecords.length}개의 기록</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {todayRecords.slice(0, 5).map((record) => {
                  const info = EMOTION_MAP[record.emotion];
                  return (
                    <Link
                      key={record.id}
                      href={`/records/${record.id}`}
                      className="flex items-center gap-2 rounded-full bg-muted px-3 py-2 transition-colors hover:bg-accent"
                    >
                      <EmotionIconStatic emotion={record.emotion} size="sm" className="!w-6 !h-6 !text-sm" />
                      <span className="text-sm font-medium">{info.labelKo}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(record.createdAt), 'HH:mm')}
                      </span>
                    </Link>
                  )
                })}
                {todayRecords.length > 5 && (
                  <Link
                    href="/records"
                    className="flex items-center gap-1 rounded-full bg-muted px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    +{todayRecords.length - 5}개 더 보기
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-8">
              <Empty className="border-0">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Calendar className="h-5 w-5" />
                  </EmptyMedia>
                  <EmptyTitle>오늘의 첫 기록을 남겨보세요</EmptyTitle>
                  <EmptyDescription>
                    지금 느끼는 감정을 기록하면 나중에 패턴을 발견할 수 있어요
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button asChild>
                    <Link href="/record">
                      <Plus className="h-4 w-4" />
                      감정 기록하기
                    </Link>
                  </Button>
                </EmptyContent>
              </Empty>
            </CardContent>
          </Card>
        )}

        {/* Weekly Stats Preview */}
        {loading ? (
          <RecordCardSkeleton />
        ) : weeklyStats && weeklyStats.totalRecords > 0 ? (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">이번 주 통계</CardTitle>
                  <CardDescription>{weeklyStats.totalRecords}개의 기록</CardDescription>
                </div>
                <Link href="/stats">
                  <Button variant="ghost" size="sm" className="text-primary">
                    자세히 <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weeklyStats.emotionDistribution.slice(0, 3).map((item) => {
                  const info = EMOTION_MAP[item.emotion]
                  return (
                    <div key={item.emotion} className="flex items-center gap-3">
                      <EmotionIconStatic emotion={item.emotion} size="sm" className="!w-8 !h-8 !text-base" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{info.labelKo}</span>
                          <span className="text-xs text-muted-foreground">{item.count}회</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${item.percentage}%`,
                              backgroundColor: info.color,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ) : null}


        {/* AI Insight Preview */}
        {latestInsight && (
          <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="text-lg">AI 인사이트</CardTitle>
                </div>
                <Link href="/insights">
                  <Button variant="ghost" size="sm" className="text-primary">
                    더보기 <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {latestInsight.summary}
              </p>
            </CardContent>
          </Card>
        )}


      </div>
    </AppShell>
  )
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 6) return '좋은 새벽이에요'
  if (hour < 12) return '좋은 아침이에요'
  if (hour < 18) return '좋은 오후에요'
  return '좋은 저녁이에요'
}


