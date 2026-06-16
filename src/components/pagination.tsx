"use client";

import {
  ChevronLeft,
  ChevronsLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

import { useRouter, useSearchParams } from "next/navigation";

type Props = {
  loading?: boolean;
  page: number;
  totalPages: number;
  pageSize: number;
  onChange: (page: number) => void;
  className?: string;
  scrollTop?: boolean;
};

export default function Pagination({
  loading = false,
  page,
  totalPages,
  pageSize,
  onChange,
  className,
  scrollTop = false,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // const pageSize = 5;

  // 🔥 현재 그룹 계산
  const currentGroup = Math.ceil(page / pageSize);

  // 🔥 시작 / 끝 페이지
  const startPage = (currentGroup - 1) * pageSize + 1;
  const endPage = Math.min(startPage + pageSize - 1, totalPages);

  // 🔥 보여줄 페이지 배열
  const pages = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );

  // =========================
  // 🔥 페이지 이동 (핵심)
  // =========================
  const changePage = (p: number) => {
    if (p === page) return;

    onChange(p);

    // 👉 기존 query 유지
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));

    router.push(`?${params.toString()}`, { scroll: false });

    // 👉 옵션: 스크롤 위로
    if (scrollTop) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // =========================
  // 🔥 핸들러
  // =========================
  const goFirst = () => changePage(1);
  const goPrev = () => page > 1 && changePage(page - 1);
  const goNext = () => page < totalPages && changePage(page + 1);
  const goLast = () => changePage(totalPages);

  // =========================
  // 🔥 스타일
  // =========================
  const baseBtn = "cursor-pointer";
  const disabledStyle = "pointer-events-none opacity-50";

  
  return (
    <nav
      className={cn("flex justify-center", className)}
      aria-label="pagination"
    >
      <ul className="flex items-center gap-1">

        {/* << 처음 */}
        <li>
          <button
            type="button"
            className={cn(
              buttonVariants({ variant: "ghost", size: "default" }),
              baseBtn,
              (loading || page === 1) && disabledStyle
            )}
            onClick={goFirst}
            disabled={loading || page === 1}
          >
            <ChevronsLeft />
          </button>
        </li>

        {/* < 이전 */}
        <li>
          <button
            type="button"
            className={cn(
              buttonVariants({ variant: "ghost", size: "default" }),
              baseBtn,
              (loading || page === 1) && disabledStyle
            )}
            onClick={goPrev}
            disabled={loading || page === 1}
          >
            <ChevronLeft />
          </button>
        </li>

        {/* 페이지 번호 */}
        {pages.map((p) => (
          <li key={p}>
            <button
              type="button"
              className={cn(
                buttonVariants({
                  variant: page === p ? "outline" : "ghost",
                  size: "icon",
                }),
                loading && disabledStyle
              )}
              onClick={() => !loading && changePage(p)}
              disabled={loading}
            >
              {p}
            </button>
          </li>
        ))}

        {/* > 다음 */}
        <li>
          <button
            type="button"
            className={cn(
              buttonVariants({ variant: "ghost", size: "default" }),
              baseBtn,
              (loading || page === totalPages) && disabledStyle
            )}
            onClick={goNext}
            disabled={loading || (page === totalPages)}
          >
            <ChevronRight />
          </button>
        </li>

        {/* >> 마지막 */}
        <li>
          <button
            type="button"
            className={cn(
              buttonVariants({ variant: "ghost", size: "default" }),
              baseBtn,
              (loading || page === totalPages) && disabledStyle
            )}
            onClick={goLast}
            disabled={loading || (page === totalPages)}
          >
            <ChevronsRight />
          </button>
        </li>

      </ul>
    </nav>
  );
}