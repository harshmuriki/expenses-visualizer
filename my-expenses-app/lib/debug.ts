/* Simple env-gated debug logger
 * Client: set NEXT_PUBLIC_DEBUG=true
 * Server: set DEBUG=true
 */

export const isClient = typeof window !== "undefined";
export const DEBUG_ENABLED = isClient
  ? process.env.NEXT_PUBLIC_DEBUG === "true"
  : process.env.DEBUG === "true";

export function debugLog(scope: string, message: string, extra?: unknown) {
  if (!DEBUG_ENABLED) return;
  const ts = new Date().toISOString();
  if (extra !== undefined) {
    console.log(`[${ts}] [${scope}] ${message}`, extra);
  } else {
    console.log(`[${ts}] [${scope}] ${message}`);
  }
}

export function timeStart(scope: string, label: string) {
  if (!DEBUG_ENABLED) return;
  console.time(`[${scope}] ${label}`);
}

export function timeEnd(scope: string, label: string) {
  if (!DEBUG_ENABLED) return;
  console.timeEnd(`[${scope}] ${label}`);
}
