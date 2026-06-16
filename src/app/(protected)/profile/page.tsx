'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import {
  ChevronLeft,
  Bell,
  Moon,
  Shield,
  HelpCircle,
  FileText,
  LogOut,
  ChevronRight,
  Flame,
  NotebookPen,
  CalendarDays,
} from 'lucide-react'
import Link from 'next/link'
import { AppShell } from '@/components/app-shell'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
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
import { useAuthStore } from "@/store/authStore";
import { toast } from 'sonner'
import { useEmotionStore } from "@/store/emotionStore";
import { EMOTION_MAP } from '@/constants/emotion';
import { ProfileSkeleton } from '@/components/loading-states'

export default function ProfilePage() {
  /* hooks */

  /* local state */
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  /* auth store state */
  const user = useAuthStore((s) => s.user);

  /* emotion store state */
  const records = useEmotionStore((s) => s.records);
  const loading = useEmotionStore((s) => s.loading);
  const recordsTotalLength = useEmotionStore((s) => s.recordsTotalLength);

  /* auth store actions */
  const logout = useAuthStore((s) => s.logout);

  /* emotion store actions */
  const fetchRecords = useEmotionStore((s) => s.fetchRecords);

  /* derived state */
  const latestRecord = records[0];

  const stats = [
    {
      label: '전체 기록',
      value: recordsTotalLength,
      icon: NotebookPen,
    },
    {
      label: '최근 기록',
      value: latestRecord
        ? format(new Date(latestRecord.createdAt), 'MM/dd')
        : '-',
      icon: CalendarDays,
    },
    {
      label: '최근 감정',
      value: latestRecord
        ? EMOTION_MAP[latestRecord.emotion].labelKo
        : '-',
      icon: Flame,
    },
  ];

  /* effects */
  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  /* handlers */
  function handleLogout() {
    logout();
    toast.success('로그아웃되었어요');
  }

  if (loading) {
    return (
      <AppShell>
        <ProfileSkeleton />
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="p-4 space-y-6">
        {/* Header */}
        <header className="flex items-center gap-2 pt-2">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="뒤로 가기"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold text-foreground">프로필</h1>
        </header>

        {/* Profile Card */}
        <Card>
          <CardContent className="flex items-center gap-4 py-5">
            <Avatar className="h-16 w-16">
              {user?.avatar && (
                <AvatarImage src={user.avatar} />
              )}
              <AvatarFallback className="bg-primary text-xl font-semibold text-primary-foreground">
                {user?.username
                  ? user.username.slice(-2)
                  : '마음'}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-lg font-semibold text-foreground">
                { user ? user.username : '마음' } - 기록자
              </h2>
              <p className="truncate text-sm text-muted-foreground">
                {user
                  ? `${format(new Date(user.createdAt), 'yyyy년 M월 d일', { locale: ko })}부터 함께`
                  : '오늘부터 마음을 기록해보세요'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label}>
                <CardContent className="flex flex-col items-center gap-1.5 py-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-xl font-bold text-foreground">
                    {stat.value}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {stat.label}
                  </span>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Settings */}
        <div className="space-y-3">
          <h3 className="px-1 text-sm font-semibold text-muted-foreground">
            설정
          </h3>
          <Card>
            <CardContent className="p-0">
              <div className="flex items-center justify-between px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium">알림</span>
                </div>
                <Switch
                  checked={notifications}
                  onCheckedChange={(checked) => {
                    setNotifications(checked)
                    toast.info('알림은 곧 지원될 예정이에요')
                  }}
                  aria-label="알림 설정"
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <Moon className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium">다크 모드</span>
                </div>
                <Switch
                  checked={darkMode}
                  onCheckedChange={(checked) => {
                    setDarkMode(checked)
                    toast.info('다크 모드는 곧 지원될 예정이에요')
                  }}
                  aria-label="다크 모드 설정"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Support */}
        <div className="space-y-3">
          <h3 className="px-1 text-sm font-semibold text-muted-foreground">
            정보
          </h3>
          <Card>
            <CardContent className="p-0">
              {[
                { label: '개인정보 처리방침', icon: Shield },
                { label: '이용약관', icon: FileText },
                { label: '도움말', icon: HelpCircle },
              ].map((item, index, arr) => {
                const Icon = item.icon
                return (
                  <div key={item.label}>
                    <button
                      type="button"
                      onClick={() => toast.info('준비 중인 기능이에요')}
                      className="flex w-full items-center justify-between px-4 py-3.5 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                    {index < arr.length - 1 && <Separator />}
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>

        {/* Logout */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full text-destructive hover:bg-destructive/5 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              로그아웃
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>로그아웃 하시겠어요?</AlertDialogTitle>
              <AlertDialogDescription>
                로그아웃해도 기록된 감정 데이터는 안전하게 보관돼요.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleLogout}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                로그아웃
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <p className="pb-2 text-center text-xs text-muted-foreground">
          마음 기록 v1.0.0
        </p>
      </div>
    </AppShell>
  )
}
