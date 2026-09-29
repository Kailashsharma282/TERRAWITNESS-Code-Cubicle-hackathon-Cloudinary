/**
 * Deterministic JSON serialization with recursively sorted object keys.
 * Crucial for cryptographic hash reproducibility across platforms and database stores.
 */
export function canonicalJson(data: unknown): string {
  if (data === null || data === undefined) {
    return "null";
  }

  if (typeof data === "number" || typeof data === "boolean") {
    return JSON.stringify(data);
  }

  if (typeof data === "string") {
    return JSON.stringify(data);
  }

  if (Array.isArray(data)) {
    const serializedElements = data.map((item) => canonicalJson(item));
    return `[${serializedElements.join(",")}]`;
  }

  if (typeof data === "object") {
    const keys = Object.keys(data as Record<string, unknown>).sort();
    const serializedPairs = keys.map((key) => {
      const val = (data as Record<string, unknown>)[key];
      return `${JSON.stringify(key)}:${canonicalJson(val)}`;
    });
    return `{${serializedPairs.join(",")}}`;
  }

  return JSON.stringify(String(data));
}
