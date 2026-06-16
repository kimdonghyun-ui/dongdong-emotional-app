"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Heart, Loader2 } from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect")

  const login = useAuthStore((s) => s.login)
  const error = useAuthStore((s) => s.error)
  const accessToken = useAuthStore((s) => s.accessToken)

  const [id, setId] = useState("fogtime@naver.com")
  const [pw, setPw] = useState("hello123")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (accessToken) {
      router.replace(redirect || "/")
    }
  }, [accessToken, redirect, router])

  const handleLogin = async () => {
    if (!id || !pw) return

    setLoading(true)

    try {
      await login(id, pw)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary shadow-lg shadow-primary/20">
            <Heart className="h-8 w-8 text-primary-foreground" fill="currentColor" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">다시 만나서 반가워요</h1>
          <p className="mt-2 text-sm text-muted-foreground text-pretty">
            오늘의 마음을 기록하러 가볼까요?
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="login-id">아이디</Label>
              <Input
                id="login-id"
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="아이디를 입력하세요"
                className="h-12 rounded-xl"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-pw">비밀번호</Label>
              <Input
                id="login-pw"
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="h-12 rounded-xl"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>

            {error && (
              <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </p>
            )}

            <Button
              onClick={handleLogin}
              disabled={loading || !id || !pw}
              className="h-12 w-full rounded-xl text-base font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  로그인 중...
                </>
              ) : (
                "로그인"
              )}
            </Button>
          </div>
        </div>

        {/* Signup Link */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          아직 계정이 없으신가요?{" "}
          <Link href="/signup" className="font-semibold text-primary hover:underline">
            회원가입
          </Link>
        </p>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
