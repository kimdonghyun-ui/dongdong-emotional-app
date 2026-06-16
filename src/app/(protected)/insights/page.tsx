'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Sparkles, TrendingUp, TrendingDown, Minus, Shuffle, RefreshCw, Lightbulb, AlertCircle, CheckCircle, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { AppShell } from '@/components/app-shell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty'
import { InsightSkeleton } from '@/components/loading-states'
import { AIInsight } from '@/type'
import { useEmotionStore } from "@/store/emotionStore";
import Pagination from "@/components/pagination";
import { useSearchParams } from "next/navigation";

export default function InsightsPage() {
  /* hooks */
  const searchParams = useSearchParams();

  /* url state */
  const pageFromUrl = Number(searchParams.get("page") || 1);

  /* local state */
  const [isGenerating, setIsGenerating] = useState(false);
  const [page, setPage] = useState(pageFromUrl);

  /* store state */
  const records = useEmotionStore((s) => s.records);
  const loading = useEmotionStore((s) => s.loading);
  const aiInsights = useEmotionStore((s) => s.aiInsights);
  const aiInsightsTotalPages = useEmotionStore((s) => s.aiInsightsTotalPages);

  /* store actions */
  const fetchRecords = useEmotionStore((s) => s.fetchRecords);
  const createAIInsight = useEmotionStore((s) => s.createAIInsight);
  const fetchAIInsights = useEmotionStore((s) => s.fetchAIInsights);

  /* derived state */
  const hasRecords = records.length > 0;

  /* effects */
  useEffect(() => {
    fetchRecords({ page:1, pageSize:10 });
  }, [fetchRecords]);

  useEffect(() => {
    fetchAIInsights({ page, pageSize: 2 });
  }, [fetchAIInsights, page]);

  /* handlers */
  const handleGenerateInsight = async () => {
    if (records.length === 0) {
      toast.error("분석할 감정 기록이 없어요");
      return;
    }

    setIsGenerating(true);

    try {
      const result = await createAIInsight("weekly"); //open api(gpt)에 ai분석 요청하여 응답받기
  
      if (result.fallback) {
        toast.error(result.summary);
        return;
      }
      await fetchAIInsights({ page:pageFromUrl, pageSize:1 }); // 위에 응답한거 strapi에 저장해둔거 불러오기

      toast.success("새로운 분석이 생성되었어요");
    } catch {
      toast.error("분석 생성에 실패했어요");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <AppShell>
      <div className="p-4 space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between pt-2">
          <div>
            <h1 className="text-2xl font-bold">AI 인사이트</h1>
            <p className="text-muted-foreground text-sm mt-1">
              AI가 분석한 나의 감정 패턴
            </p>
          </div>
          <Button
            onClick={handleGenerateInsight}
            disabled={isGenerating || !hasRecords}
            size="sm"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                분석 중...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                새 분석
              </>
            )}
          </Button>
        </header>

        {/* 🔥 로딩 분기 */}
        {loading ? (
          <InsightSkeleton />
        ) : (
          <>
            {/* 감정기록이 없는 케이스(감정기록 유도) */}
            {!hasRecords && (
              <Card>
                <CardContent className="py-12">
                  <Empty className="border-0">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Calendar className="h-5 w-5" />
                      </EmptyMedia>
                      <EmptyTitle>감정 기록이 필요해요</EmptyTitle>
                      <EmptyDescription>
                        AI 분석을 받으려면 먼저 감정을 기록해주세요
                      </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                      <Button asChild>
                        <Link href="/record">감정 기록하기</Link>
                      </Button>
                    </EmptyContent>
                  </Empty>
                </CardContent>
              </Card>
            )}

            {/* 감정기록이 있고 분석결과가 없는케이스(분석 버튼 유도) */}
            {hasRecords && aiInsights.length === 0 && (
              <Card>
                <CardContent className="py-12">
                  <Empty className="border-0">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Sparkles className="h-5 w-5" />
                      </EmptyMedia>
                      <EmptyTitle>아직 분석 결과가 없어요</EmptyTitle>
                      <EmptyDescription>
                        버튼을 눌러 AI 분석을 시작해보세요
                      </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                      <Button onClick={handleGenerateInsight} disabled={isGenerating}>
                        {isGenerating ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            분석 중...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4" />
                            AI 분석 시작
                          </>
                        )}
                      </Button>
                    </EmptyContent>
                  </Empty>
                </CardContent>
              </Card>
            )}

            {/* 분서결과 있는케이스(분석 결과화면) */}
            {aiInsights.map((insight, index) => (
              
              <InsightCard key={insight.id} insight={insight} isLatest={index === 0} />
            ))}
          </>
        )}

        {/* 🔥 페이지네이션 */}
        <Pagination
          page={page}
          totalPages={aiInsightsTotalPages}
          pageSize={2}
          onChange={(p) => setPage(p)}
          // scrollTop
        />
      </div>
    </AppShell>
  )
}

// 분석결과 표 컴포넌트
function InsightCard({ insight, isLatest }: { insight: AIInsight; isLatest: boolean }) {
  const trendConfig = {
    improving: {
      icon: TrendingUp,
      label: '상승세',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    declining: {
      icon: TrendingDown,
      label: '하락세',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    stable: {
      icon: Minus,
      label: '안정적',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    mixed: {
      icon: Shuffle,
      label: '복합적',
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
  }

  const trend = trendConfig[insight.emotionalTrend]
  const TrendIcon = trend.icon
  const createdAt = format(new Date(insight.createdAt ?? ""), 'M월 d일 a h:mm', { locale: ko })

  return (
    <Card className={isLatest ? 'border-primary/30 shadow-md' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                AI 분석 리포트
                {isLatest && (
                  <Badge variant="secondary" className="text-xs">
                    최신
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-xs">{createdAt}</CardDescription>
            </div>
          </div>
          <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 ${trend.bgColor}`}>
            <TrendIcon className={`h-3.5 w-3.5 ${trend.color}`} />
            <span className={`text-xs font-medium ${trend.color}`}>{trend.label}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Summary */}
        <div className="rounded-lg bg-muted/50 p-4">
          <p className="text-sm leading-relaxed">{insight.summary}</p>
        </div>

        {/* Patterns */}
        {insight.patterns.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-primary" />
              <h4 className="font-semibold text-sm">발견된 패턴</h4>
            </div>
            <ul className="space-y-2">
              {insight.patterns.map((pattern, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>{pattern}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Suggestions */}
        {insight.suggestions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              <h4 className="font-semibold text-sm">추천 활동</h4>
            </div>
            <ul className="space-y-2">
              {insight.suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="rounded-lg border bg-card p-3 text-sm text-muted-foreground"
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
