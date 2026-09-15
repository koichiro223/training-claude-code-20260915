"use client";

// 通知（読み込み/保存失敗など）へのアクセス
import { useContext } from "react";
import { BabyLogContext, type Notice } from "@/context/BabyLogContext";

export interface UseNotices {
  notices: Notice[];
  dismiss: (id: string) => void;
}

export function useNotices(): UseNotices {
  const ctx = useContext(BabyLogContext);
  if (!ctx) {
    throw new Error("useNotices must be used within BabyLogProvider");
  }
  return { notices: ctx.notices, dismiss: ctx.dismissNotice };
}
