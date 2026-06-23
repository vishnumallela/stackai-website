/**
 * Mints a short-lived xAI realtime client secret so the provider API key never
 * reaches the browser. Deployed as a Vercel Function (Node runtime). The same
 * logic runs in local dev via the Vite middleware in vite.config.ts.
 *
 * Requires the XAI_API_KEY environment variable.
 */

const MODEL = "grok-voice-latest";

export async function POST(): Promise<Response> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "XAI_API_KEY is not set on the server." }, { status: 500 });
  }
  try {
    const r = await fetch("https://api.x.ai/v1/realtime/client_secrets", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ expires_after: { seconds: 600 } }),
    });
    const text = await r.text();
    if (!r.ok) {
      console.error("[voice-token] mint failed:", r.status, text.slice(0, 500));
      return Response.json({ error: `Voice token mint failed (${r.status})` }, { status: 502 });
    }
    let data: Record<string, unknown> = {};
    try {
      data = JSON.parse(text) as Record<string, unknown>;
    } catch {
      /* ignore */
    }
    const nested = (data.client_secret as { value?: string } | undefined)?.value;
    const candidate =
      (data.value as string | undefined) ??
      (data.secret as string | undefined) ??
      (data.token as string | undefined) ??
      nested ??
      (typeof data.client_secret === "string" ? (data.client_secret as string) : undefined);
    const token = String(candidate ?? "").replace(/^xai-client-secret\./, "");
    if (!token) return Response.json({ error: "Could not parse voice token." }, { status: 502 });
    return Response.json({ token, model: MODEL });
  } catch (e) {
    console.error("[voice-token] error:", e);
    return Response.json({ error: e instanceof Error ? e.message : "Voice token error" }, { status: 502 });
  }
}
