"use client";

export default function FullScreenLoader({
  message = "로그인 상태 확인 중...",
}: {
  message?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-gray-600" />

        {/* Text */}
        <p className="text-sm text-gray-500">{message}</p>
      </div>
    </div>
  );
}
