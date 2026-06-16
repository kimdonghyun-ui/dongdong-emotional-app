"use client";

import { useEffect } from "react";
// import Header from "@/components/Header";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();       // 클라이언트 라우팅 제어
  const pathname = usePathname();   // 현재 경로 (/users, /posts 등)
  const accessToken = useAuthStore((s) => s.accessToken); // 로그인 여부 판단용 토큰

  useEffect(() => {
    // ❌ 로그인 안 된 상태면
    if (!accessToken) {
      // 로그인 페이지로 이동 + 원래 가려던 경로를 redirect로 전달
      router.replace(
        `/login?redirect=${encodeURIComponent(pathname)}`
      );
    }
  }, [accessToken, router, pathname]);

  return (
    <>
      {/* <Header /> */}
      <main>{children}</main>
    </>
  );
}
