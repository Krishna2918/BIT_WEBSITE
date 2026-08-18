export type ConsultBrowserSuccess = {
  ok: true;
  qualified: boolean;
  transaction_id: string;
};

const TRANSACTION_ID = /^[a-f0-9]{64}$/;

export function isSafeTransactionId(value: unknown): value is string {
  return typeof value === "string" && TRANSACTION_ID.test(value);
}

export function buildConsultBrowserSuccess(
  transactionId: string,
  qualified: boolean,
): ConsultBrowserSuccess {
  if (!isSafeTransactionId(transactionId)) {
    throw new Error("invalid consultation transaction id");
  }
  return {
    ok: true,
    qualified: qualified === true,
    transaction_id: transactionId,
  };
}

export function parseConsultBrowserSuccess(value: unknown): ConsultBrowserSuccess | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const result = value as Record<string, unknown>;
  if (Object.keys(result).sort().join(",") !== "ok,qualified,transaction_id") return null;
  if (result.ok !== true || typeof result.qualified !== "boolean") return null;
  if (!isSafeTransactionId(result.transaction_id)) return null;
  return {
    ok: true,
    qualified: result.qualified,
    transaction_id: result.transaction_id,
  };
}
