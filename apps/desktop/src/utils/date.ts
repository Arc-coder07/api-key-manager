export function getDaysUntil(dateString: string | null): number | null {
  if (!dateString) return null;
  const expiry = new Date(dateString);
  const now = new Date();
  const diffTime = expiry.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
