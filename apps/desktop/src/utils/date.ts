export function getDaysUntil(dateString: string | null): number | null {
  if (!dateString) return null;
  const expiry = new Date(dateString);
  const now = new Date();
  const diffTime = expiry.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Format an ISO 8601 date string as a relative/short date.
 *   - < 1 day:    "today"
 *   - < 7 days:   "3d ago"
 *   - < 30 days:  "2w ago"
 *   - < 365 days: "Jul 28"
 *   - else:       "Jul 28, 2024"
 */
export function formatRelativeDate(isoString: string | undefined | null): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 1) return 'today';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const day = date.getDate();

  if (diffDays < 365) return `${month} ${day}`;
  return `${month} ${day}, ${date.getFullYear()}`;
}
