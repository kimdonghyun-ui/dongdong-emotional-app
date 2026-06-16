'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { ArrowLeft, Trash2, Clock, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { AppShell } from '@/components/app-shell'
import { EmotionIconStatic } from '@/components/emotion-icon'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useEmotionStore } from "@/store/emotionStore";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

import { EMOTION_MAP } from '@/constants/emotion';

export default function RecordDetailPage() {
  /* hooks */
  const params = useParams();
  const router = useRouter();

  /* store state */
  const selectedRecord = useEmotionStore((s) => s.selectedRecord);
  const loading = useEmotionStore((s) => s.loading);

  /* store actions */
  const fetchRecordById = useEmotionStore((s) => s.fetchRecordById);
  const deleteRecord = useEmotionStore((s) => s.deleteRecord);

  /* local state */
  const [isDeleting, setIsDeleting] = useState(false);

  /* effects */
  useEffect(() => {
    const documentId = params.id as string;
    fetchRecordById(documentId);
  }, [params.id, fetchRecordById]);

  /* handlers */
  const handleDelete = async () => {
    if (!selectedRecord) return
    
    setIsDeleting(true)
    try {
      await deleteRecord(selectedRecord.documentId);
      toast.success('기록이 삭제되었어요');
      router.push('/records');
    } catch {
      toast.error('삭제에 실패했어요')
    } finally {
      setIsDeleting(false)
    }
  }

  /* early returns */
  if (loading) {
    return (
      <AppShell hideNav>
        <div className="p-4 space-y-6">
          <header className="flex items-center gap-4">
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-6 w-32" />
          </header>
          <div className="flex flex-col items-center py-8">
            <Skeleton className="h-24 w-24 rounded-full" />
            <Skeleton className="h-6 w-20 mt-4" />
          </div>
          <Skeleton className="h-32 w-full" />
        </div>
      </AppShell>
    )
  }

  if (!selectedRecord) {
    return (
      <AppShell hideNav>
        <div className="p-4 space-y-6">
          <header className="flex items-center gap-4">
            <Link href="/records">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
          </header>
          <div className="flex flex-col items-center py-12 text-center">
            <p className="text-lg font-medium text-muted-foreground">
              기록을 찾을 수 없어요
            </p>
            <Button asChild className="mt-4">
              <Link href="/records">목록으로 돌아가기</Link>
            </Button>
          </div>
        </div>
      </AppShell>
    )
  }

  /* derived state */
  const info = EMOTION_MAP[selectedRecord.emotion];

  const date = new Date(selectedRecord.createdAt);
  const dateFormatted = format(date, 'yyyy년 M월 d일', { locale: ko });
  const timeFormatted = format(date, 'a h시 mm분', { locale: ko });
  const dayFormatted = format(date, 'EEEE', { locale: ko });

  const intensityLabels = ['매우 약함', '약함', '보통', '강함', '매우 강함'];


  return (
    <AppShell hideNav>
      <div className="p-4 space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <Link href="/records">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                <Trash2 className="h-5 w-5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>기록을 삭제할까요?</AlertDialogTitle>
                <AlertDialogDescription>
                  삭제된 기록은 복구할 수 없어요.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>취소</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? '삭제 중...' : '삭제하기'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </header>

        {/* Emotion Display */}
        <div className="flex flex-col items-center py-8">
          <EmotionIconStatic emotion={selectedRecord.emotion} size="xl" />
          <h1 className="text-2xl font-bold mt-4">{info.labelKo}</h1>
          <p className="text-muted-foreground">{info.label}</p>
        </div>

        {/* Details */}
        <Card>
          <CardContent className="py-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">날짜</p>
                <p className="font-medium">{dateFormatted} {dayFormatted}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">시간</p>
                <p className="font-medium">{timeFormatted}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Intensity */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">감정 강도</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className="h-3 flex-1 rounded-full transition-colors"
                      style={{
                        backgroundColor:
                          level <= selectedRecord.intensity
                            ? info.color
                            : 'var(--muted)',
                      }}
                    />
                  ))}
                </div>
              </div>
              <span className="text-sm font-medium min-w-20 text-right">
                {intensityLabels[selectedRecord.intensity - 1]}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* content */}
        {selectedRecord.content && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">메모</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {selectedRecord.content}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="pt-4">
          <Button asChild className="w-full" variant="outline">
            <Link href="/record">새 감정 기록하기</Link>
          </Button>
        </div>
      </div>
    </AppShell>
  )
}
