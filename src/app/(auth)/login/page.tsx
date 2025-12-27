"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";


export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");


  const login = useAuthStore((s) => s.login);
  const error = useAuthStore((s) => s.error);

  const [id, setId] = useState("fogtime@naver.com");
  const [pw, setPw] = useState("hello123");
  const [loading, setLoading] = useState(false);
  const accessToken = useAuthStore((s) => s.accessToken);



  
  const handleLogin = async () => {
    if (!id || !pw) return;
    setLoading(true);
    try {
      await login(id, pw);
      router.replace(redirect || "/");
    } catch {
      // 에러는 스토어 error로 표시
    }
    setLoading(false);
  };

  useEffect(() => {
    if (accessToken) {
      router.replace("/");
    }
  }, [accessToken, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        {/* 제목 */}
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          로그인
        </h1>
        <p className="mb-6 text-sm text-gray-500">
          계정 정보를 입력해주세요
        </p>

        {/* 아이디 */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            아이디
          </label>
          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="아이디를 입력하세요"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                       focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          />
        </div>

        {/* 비밀번호 */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            비밀번호
          </label>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="비밀번호를 입력하세요"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                       focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          />
        </div>

        {/* 에러 메시지 */}
        {error && (
          <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        {/* 로그인 버튼 */}
        <button
          onClick={handleLogin}
          disabled={loading || !id || !pw}
          className="mt-2 w-full rounded-lg bg-gray-900 py-2.5 text-sm font-semibold text-white
                     transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </div>
    </div>
  );
}
