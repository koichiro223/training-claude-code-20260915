// ID 生成（architecture.md 7章：Secure Context 外での randomUUID 不在に備える）

/** 一意IDを生成する。crypto.randomUUID を優先し、使えない環境では疑似UUIDを返す。 */
export function generateId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return pseudoUuid();
}

/** 非セキュアコンテキスト向けのフォールバック（衝突可能性は極小で用途上許容） */
function pseudoUuid(): string {
  const rand = () => Math.floor(Math.random() * 0x10000).toString(16).padStart(4, "0");
  return `${rand()}${rand()}-${rand()}-${rand()}-${rand()}-${rand()}${rand()}${rand()}`;
}
