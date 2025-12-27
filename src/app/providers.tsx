"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import FullScreenLoader from "@/components/FullScreenLoader";

export default function Providers({ children }: { children: React.ReactNode }) {
  const restoreSession = useAuthStore((s) => s.restoreSession);
const authReady = useAuthStore((s) => s.authReady);
  useEffect(() => {
    restoreSession();
  }, [restoreSession]);


  // ⛔️ 렌더 차단은 Hook 이후에
  if (!authReady) {
    return <FullScreenLoader />;
  }

  return <>{children}</>;

}
