"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Heart, Loader2, Camera } from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { uploadImage } from "@/utils/uploadImage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function SignupPage() {
  const router = useRouter()
  const [avatar, setAvatar] = useState<string>("")
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    passwordConfirm: "",
  })
  const { handleRegister } = useAuthStore()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const accessToken = useAuthStore((s) => s.accessToken)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    if (formData.password !== formData.passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.")
      setIsLoading(false)
      return
    }
    try {
      await handleRegister({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        avatar,
      })
      setIsLoading(false)
      router.replace("/")
    } catch {
      setIsLoading(false)
      // 에러는 스토어 error로 표시
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      try {
        const images = await uploadImage(event.target.files[0])
        setAvatar(images.url)
      } catch (error) {
        console.error("파일 변환 중 오류 발생:", error)
      }
    }
  }

  useEffect(() => {
    if (accessToken) {
      router.replace("/")
    }
  }, [accessToken, router])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary shadow-lg shadow-primary/20">
            <Heart className="h-8 w-8 text-primary-foreground" fill="currentColor" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">마음 기록 시작하기</h1>
          <p className="mt-2 text-sm text-muted-foreground text-pretty">
            매일의 감정을 기록하고 나를 더 알아가요
          </p>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSignup} className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          {/* Avatar Upload */}
          <div className="mb-6 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="group relative rounded-full transition-transform hover:scale-105 active:scale-95"
              aria-label="프로필 이미지 선택"
            >
              <Avatar className="h-20 w-20 border-2 border-border">
                {avatar ? (
                  <AvatarImage src={avatar || "/placeholder.svg"} alt="프로필 미리보기" />
                ) : null}
                <AvatarFallback className="bg-secondary text-secondary-foreground">
                  <Camera className="h-6 w-6 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
                <Camera className="h-3.5 w-3.5" />
              </span>
            </button>
            <span className="text-xs text-muted-foreground">프로필 이미지 선택</span>
            <input
              ref={fileInputRef}
              id="avata"
              name="avata"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="이름을 입력하세요"
                className="h-12 rounded-xl"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="example@email.com"
                className="h-12 rounded-xl"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="비밀번호를 입력하세요"
                className="h-12 rounded-xl"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="passwordConfirm">비밀번호 확인</Label>
              <Input
                id="passwordConfirm"
                type="password"
                value={formData.passwordConfirm}
                onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                placeholder="비밀번호를 다시 입력하세요"
                className="h-12 rounded-xl"
                required
              />
            </div>

            {error && (
              <p className="rounded-xl bg-destructive/10 px-4 py-3 text-center text-sm text-destructive">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="h-12 w-full rounded-xl text-base font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  가입 중...
                </>
              ) : (
                "가입하기"
              )}
            </Button>
          </div>
        </form>

        {/* Login Link */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </main>
  )
}
