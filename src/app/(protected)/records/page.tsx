'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { format, isToday, isYesterday, startOfDay } from 'date-fns'
import { ko } from 'date-fns/locale'
import { ChevronRight, Search, Calendar } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { EmotionIconStatic } from '@/components/emotion-icon'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty'
import { Button } from '@/components/ui/button'
import { RecordCardSkeleton } from '@/components/loading-states'
import { useEmotionStore } from "@/store/emotionStore";
import { EMOTION_MAP } from '@/constants/emotion';
import { EmotionRecord } from '@/type'

interface GroupedRecords {
  date: Date
  dateLabel: string
  records: EmotionRecord[]
}

export default function RecordsPage() {
  /* store state */
  const records = useEmotionStore((s) => s.records);
  const loading = useEmotionStore((s) => s.loading);

  /* store actions */
  const fetchRecords = useEmotionStore((s) => s.fetchRecords);

  /* local state */
  const [searchQuery, setSearchQuery] = useState('');

  /* derived state */
  const filteredRecords = useMemo(() => {
    return searchQuery
      ? records.filter((r) => {
          const info = EMOTION_MAP[r.emotion];

          return (
            info.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            info.labelKo.includes(searchQuery) ||
            (r.content ?? '')
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
          );
        })
      : records;
  }, [records, searchQuery]);

  const groupedRecords = useMemo(() => {
    return groupRecordsByDate(filteredRecords);
  }, [filteredRecords]);

  /* effects */
  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  return (
    <AppShell>
      <div className="p-4 space-y-4">
        {/* Header */}
        <header className="space-y-4 pt-2">
          <h1 className="text-2xl font-bold">감정 기록</h1>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="감정이나 메모 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </header>
        {/* Records List */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <RecordCardSkeleton key={i} />
            ))}
          </div>
        ) : groupedRecords.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <Empty className="border-0">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Calendar className="h-5 w-5" />
                  </EmptyMedia>
                  <EmptyTitle>
                    {searchQuery ? '검색 결과가 없어요' : '아직 기록이 없어요'}
                  </EmptyTitle>
                  <EmptyDescription>
                    {searchQuery
                      ? '다른 검색어로 시도해보세요'
                      : '첫 번째 감정을 기록해보세요'}
                  </EmptyDescription>
                </EmptyHeader>
                {!searchQuery && (
                  <EmptyContent>
                    <Button asChild>
                      <Link href="/record">감정 기록하기</Link>
                    </Button>
                  </EmptyContent>
                )}
              </Empty>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {groupedRecords.map((group) => (
              <div key={group.dateLabel} className="space-y-3">
                <h2 className="text-sm font-semibold text-muted-foreground px-1">
                  {group.dateLabel}
                </h2>
                <div className="space-y-2">
                  {group.records.map((record) => (
                    <RecordCard key={record.id} record={record} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}


function RecordCard({ record }: { record: EmotionRecord }) {
  const info = EMOTION_MAP[record.emotion];
  const time = format(new Date(record.createdAt), 'a h:mm', { locale: ko })

  return (
    <Link href={`/records/${record.documentId}`}>
      <Card className="transition-all hover:shadow-md hover:border-primary/20 active:scale-[0.99]">
        <CardContent className="py-4 flex items-center gap-4">
          <EmotionIconStatic emotion={record.emotion} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{info.labelKo}</span>
              <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-muted">
                강도 {record.intensity}
              </span>
            </div>
            {record.content && (
              <p className="text-sm text-muted-foreground truncate mt-1">
                {record.content}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="text-xs">{time}</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function groupRecordsByDate(records: EmotionRecord[]): GroupedRecords[] {
  const groups = new Map<string, GroupedRecords>()

  for (const record of records) {
    const date = startOfDay(new Date(record.createdAt))
    const key = format(date, 'yyyy-MM-dd')

    if (!groups.has(key)) {
      let dateLabel: string
      if (isToday(date)) {
        dateLabel = '오늘'
      } else if (isYesterday(date)) {
        dateLabel = '어제'
      } else {
        dateLabel = format(date, 'M월 d일 EEEE', { locale: ko })
      }

      groups.set(key, {
        date,
        dateLabel,
        records: [],
      })
    }

    groups.get(key)!.records.push(record)
  }

  return Array.from(groups.values()).sort((a, b) => b.date.getTime() - a.date.getTime())
}
