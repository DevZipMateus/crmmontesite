/**
 * supabase.functions.invoke() only gives a generic "Edge Function returned a
 * non-2xx status code" in error.message — the real error body (what our own
 * functions put in the JSON response) sits in error.context, a raw Response.
 * This pulls that real message out so toasts show something actionable.
 */
export async function getFunctionErrorMessage(error: unknown, fallback: string): Promise<string> {
  if (error && typeof error === "object" && "context" in error) {
    const context = (error as { context?: Response }).context;
    if (context && typeof context.json === "function") {
      try {
        const body = await context.clone().json();
        if (body?.error) return body.error;
      } catch {
        // não era JSON, ignora e cai no fallback abaixo
      }
    }
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
