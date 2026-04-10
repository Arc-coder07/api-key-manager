/**
 * Represents a single parsed environment variable.
 */
export interface ParsedEnvItem {
  key: string;
  value: string;
}

/**
 * Parses raw .env string content into an array of key-value pairs.
 * Ignores comments (lines starting with #) and empty lines.
 * Strips surrounding quotes from values.
 */
export function parseEnvContent(content: string): ParsedEnvItem[] {
  const lines = content.split('\n');
  const results: ParsedEnvItem[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    // Ignore empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) continue;

    // Split on the first '=' character
    const splitIndex = trimmed.indexOf('=');
    if (splitIndex === -1) continue;

    const key = trimmed.slice(0, splitIndex).trim();
    let val = trimmed.slice(splitIndex + 1).trim();

    // Strip surrounding quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.substring(1, val.length - 1);
    }

    if (key) {
      results.push({ key, value: val });
    }
  }

  return results;
}

/**
 * Generates formatted .env string content from an array of key-value pairs.
 */
export function generateEnvContent(items: ParsedEnvItem[]): string {
  return items.map(item => {
    // If the value contains characters like spaces, it might be safer to quote it
    const needsQuotes = item.value.includes(' ') || item.value.includes('\n');
    const safeValue = needsQuotes ? `"${item.value}"` : item.value;
    return `${item.key}=${safeValue}`;
  }).join('\n');
}
