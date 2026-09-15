"use client";

// "use client" 境界の薄いラッパー（repository-structure.md §2）
// layout.tsx（Server Component）から children をこれで包む。
import type { ReactNode } from "react";
import { BabyLogProvider } from "@/context/BabyLogContext";
import { NoticeBar } from "@/components/ui/NoticeBar";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <BabyLogProvider>
      <NoticeBar />
      {children}
    </BabyLogProvider>
  );
}
