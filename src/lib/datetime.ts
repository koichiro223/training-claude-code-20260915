// 日時ユーティリティ（functional-design.md 2.5）
// 保存は ISO8601（UTC基準）、入力/表示/グルーピングはローカルタイムゾーン。

/** 現在時刻の ISO8601 文字列 */
export function nowIso(): string {
  return new Date().toISOString();
}

/** ISO8601 → <input type="datetime-local"> 用のローカル値（YYYY-MM-DDTHH:mm） */
export function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const h = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${y}-${m}-${day}T${h}:${min}`;
}

/** datetime-local のローカル値 → ISO8601（不正値は null） */
export function fromDatetimeLocalValue(value: string): string | null {
  if (!value) return null;
  const d = new Date(value); // ローカルタイムとして解釈される
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

/** 表示用の日時整形（ローカル） */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** 表示用の時刻のみ整形（ローカル） */
export function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
}

/** ローカル暦日のグルーピングキー（YYYY-MM-DD） */
export function localDateKey(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** 日付見出し用の表示（ローカル暦日） */
export function formatDateHeading(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

/** パース可能な日時か */
export function isValidDateTime(iso: string): boolean {
  return !Number.isNaN(new Date(iso).getTime());
}
