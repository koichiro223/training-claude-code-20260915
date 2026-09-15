"use client";

// 停止後の結果メッセージ（functional-design.md 4.3 / glossary.md 3章）。
import { Button } from "@/components/ui/Button";

interface GameResultProps {
  score: number;
  onRestart: () => void;
}

export function GameResult({ score, onRestart }: GameResultProps) {
  return (
    <div className="flex flex-col items-center gap-6 rounded-2xl bg-white px-6 py-10 text-center shadow-sm">
      <p
        aria-live="polite"
        className="text-2xl font-bold text-slate-800"
      >
        おめでとう {score}個 おせたね
      </p>
      <Button variant="primary" size="lg" onClick={onRestart}>
        もう一度
      </Button>
    </div>
  );
}
