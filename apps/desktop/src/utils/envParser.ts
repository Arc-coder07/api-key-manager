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
    // Sanitize key name for ENV format: uppercase, replace spaces/special chars with underscores
    const safeKey = item.key
      .toUpperCase()
      .replace(/[^A-Z0-9_]/g, '_')
      .replace(/__+/g, '_')
      .replace(/^_|_$/g, '');

    // If the value contains characters like spaces, it might be safer to quote it
    const needsQuotes = item.value.includes(' ') || item.value.includes('\n');
    const safeValue = needsQuotes ? `"${item.value}"` : item.value;
    return `${safeKey}=${safeValue}`;
  }).join('\n');
}

/**
 * Metadata-only export item (no secrets).
 */
export interface MetadataExportItem {
  name: string;
  provider: string;
  category: string;
  notes: string;
  projectName?: string;
}

/**
 * Full export item (with decrypted value).
 */
export interface FullExportItem extends MetadataExportItem {
  value: string;
}

/**
 * Generates JSON string for full export (includes decrypted values).
 */
export function generateJsonFullExport(items: FullExportItem[]): string {
  return JSON.stringify(items, null, 2);
}

/**
 * Generates JSON string for metadata-only export (no secrets).
 */
export function generateJsonMetadataExport(items: MetadataExportItem[]): string {
  return JSON.stringify(items, null, 2);
}
