"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function Header() {
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="border-b bg-gray-800">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <h1
          className="cursor-pointer text-lg font-bold"
          onClick={() => router.push("/")}
        >
          MyApp
        </h1>

        <div className="flex items-center gap-4">
          {user && (
            <span className="text-sm text-gray-600">
              {user.username}
            </span>
          )}
          <button
            onClick={() => router.push("/login")}
            className="rounded-md bg-gray-800 px-3 py-1.5 text-sm text-gray
                       hover:bg-white"
          >
            로그인
          </button>
          <button
            onClick={() => router.push("/")}
            className="rounded-md bg-gray-800 px-3 py-1.5 text-sm text-gray
                       hover:bg-white"
          >
            /
          </button>
          <button
            onClick={() => router.push("/about")}
            className="rounded-md bg-gray-800 px-3 py-1.5 text-sm text-gray
                       hover:bg-white"
          >
            about
          </button>
          <button
            onClick={() => router.push("/users")}
            className="rounded-md bg-gray-800 px-3 py-1.5 text-sm text-gray
                       hover:bg-white"
          >
            유저
          </button>
          <button
            onClick={handleLogout}
            className="rounded-md bg-gray-800 px-3 py-1.5 text-sm text-white
                       hover:bg-gray-800"
          >
            로그아웃
          </button>
        </div>
      </div>
    </header>
  );
}
