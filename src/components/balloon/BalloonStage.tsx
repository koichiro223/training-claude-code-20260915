"use client";

// プレイ領域（functional-design.md 4.3）。relative な固定領域にバルーンを絶対配置。
import type { BalloonModel } from "@/hooks/useBalloonGame";
import { Balloon } from "./Balloon";

interface BalloonStageProps {
  balloon: BalloonModel | null;
  remaining: number;
  /** 現在バルーンの生成からの経過時間（ms）。拡大演出に使う。 */
  elapsedMs: number;
  onPop: (id: string) => void;
}

export function BalloonStage({
  balloon,
  remaining,
  elapsedMs,
  onPop,
}: BalloonStageProps) {
  return (
    <div className="relative h-[60vh] min-h-80 w-full overflow-hidden rounded-2xl bg-gradient-to-b from-sky-50 to-indigo-50 shadow-inner">
      {balloon !== null ? (
        <Balloon
          balloon={balloon}
          remaining={remaining}
          elapsedMs={elapsedMs}
          onPop={onPop}
        />
      ) : null}
    </div>
  );
}
