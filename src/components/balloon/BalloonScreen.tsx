"use client";

// バルーン遊び画面コンテナ（functional-design.md 4.3）。
// 開始/停止ボタン・スコア常時表示・idle/playing/stopped の分岐を担う。
import { useBalloonGame } from "@/hooks/useBalloonGame";
import { Button } from "@/components/ui/Button";
import { BalloonStage } from "./BalloonStage";
import { GameResult } from "./GameResult";

export function BalloonScreen() {
  const { state, score, balloon, remaining, elapsedMs, start, stop, popCurrent } =
    useBalloonGame();

  return (
    <main className="space-y-6">
      <header className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">バルーン遊び</h1>
          <p className="mt-1 text-sm text-slate-500">
            バルーンをタップしてはじけさせよう
          </p>
        </div>
        {/* スコアは常時表示し、変化は aria-live で通知する。 */}
        <div
          aria-live="polite"
          className="rounded-xl bg-white px-4 py-2 text-right shadow-sm"
        >
          <span className="block text-xs text-slate-500">スコア</span>
          <span className="block text-2xl font-bold tabular-nums text-slate-800">
            {score}
          </span>
        </div>
      </header>

      {state === "playing" ? (
        <>
          <BalloonStage
            balloon={balloon}
            remaining={remaining}
            elapsedMs={elapsedMs}
            onPop={popCurrent}
          />
          <div className="flex justify-center">
            <Button variant="danger" size="lg" onClick={stop}>
              停止
            </Button>
          </div>
        </>
      ) : null}

      {state === "idle" ? (
        <div className="flex flex-col items-center gap-6 rounded-2xl bg-white px-6 py-10 text-center shadow-sm">
          <p className="text-base text-slate-600">
            「開始」を押すとバルーンが出てくるよ
          </p>
          <Button variant="primary" size="lg" onClick={start}>
            開始
          </Button>
        </div>
      ) : null}

      {state === "stopped" ? (
        <GameResult score={score} onRestart={start} />
      ) : null}
    </main>
  );
}
