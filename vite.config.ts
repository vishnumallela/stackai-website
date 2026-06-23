import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

/**
 * Dev-only middleware that mints an xAI realtime client secret, mirroring the
 * Vercel function in api/voice-token.ts so the voice agent works under
 * `bun run dev`. The key stays server-side (read from .env via loadEnv).
 */
function voiceTokenDev(apiKey: string | undefined): Plugin {
  return {
    name: "voice-token-dev",
    configureServer(server) {
      server.middlewares.use("/api/voice-token", async (_req, res) => {
        res.setHeader("content-type", "application/json");
        if (!apiKey) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: "XAI_API_KEY is not set in .env" }));
          return;
        }
        try {
          const r = await fetch("https://api.x.ai/v1/realtime/client_secrets", {
            method: "POST",
            headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
            body: JSON.stringify({ expires_after: { seconds: 600 } }),
          });
          const text = await r.text();
          if (!r.ok) {
            res.statusCode = 502;
            res.end(JSON.stringify({ error: `Voice token mint failed (${r.status})` }));
            return;
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
          if (!token) {
            res.statusCode = 502;
            res.end(JSON.stringify({ error: "Could not parse voice token." }));
            return;
          }
          res.end(JSON.stringify({ token, model: "grok-voice-latest" }));
        } catch (e) {
          res.statusCode = 502;
          res.end(JSON.stringify({ error: e instanceof Error ? e.message : "Voice token error" }));
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [
      // tanstackRouter MUST come before react()
      tanstackRouter({ target: "react", autoCodeSplitting: true }),
      react(),
      tailwindcss(),
      voiceTokenDev(env.XAI_API_KEY),
    ],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "./src"),
      },
    },
  };
});
