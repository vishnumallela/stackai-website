/**
 * Production server (Railway).
 * ----------------------------------------------------------------------------
 * Serves the built Vite SPA from ./dist and mints short-lived xAI realtime
 * voice tokens at POST /api/voice-token — the same contract the Vite dev
 * middleware (vite.config.ts) and the Vercel function (api/voice-token.ts)
 * provide, so the frontend code is identical across all three environments.
 *
 * Binds 0.0.0.0 on $PORT (required by Railway). Requires XAI_API_KEY.
 */
import { POST as mintVoiceToken } from "./api/voice-token";

const DIST = `${import.meta.dir}/dist`;
const port = Number(process.env.PORT) || 3000;

const server = Bun.serve({
  port,
  hostname: "0.0.0.0",
  async fetch(req) {
    const url = new URL(req.url);

    // Voice token endpoint (xAI client-secret minting, server-side only).
    if (url.pathname === "/api/voice-token") {
      if (req.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
      }
      return mintVoiceToken();
    }

    // Serve a matching static asset if one exists…
    const rel = url.pathname === "/" ? "/index.html" : url.pathname;
    const asset = Bun.file(`${DIST}${rel}`);
    if (await asset.exists()) return new Response(asset);

    // …otherwise fall back to the SPA entry for client-side routing.
    return new Response(Bun.file(`${DIST}/index.html`), {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  },
});

console.log(`stackai-website listening on :${server.port}`);
