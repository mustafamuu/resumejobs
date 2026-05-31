/** Safe to import from shared modules — no Node-only APIs. */
export function serverEnv(name: string): string | undefined {
  const value = typeof process !== "undefined" ? process.env[name] : undefined;
  return value?.trim() || undefined;
}

export function basicAuthHeader(username: string): string {
  const token = `${username}:`;
  if (typeof Buffer !== "undefined") {
    return `Basic ${Buffer.from(token, "utf8").toString("base64")}`;
  }
  return `Basic ${btoa(token)}`;
}
