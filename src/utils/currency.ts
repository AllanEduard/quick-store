export const formatPeso = (amount: number) => `₱${amount.toFixed(2)}`;

export function parseNonNegativeAmount(value: string) {
  const normalized = value.trim().replace(",", ".");
  if (!normalized) return null;
  const amount = Number(normalized);
  return Number.isFinite(amount) && amount >= 0 ? amount : null;
}
