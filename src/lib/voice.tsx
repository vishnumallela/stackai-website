import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { useVoiceAgent, type UseVoiceAgentReturn } from "@/hooks/useVoiceAgent";
import { VOICE_INSTRUCTIONS, VOICE_GREETING } from "@/lib/voice-prompt";

/** Calls automatically end after this many seconds. */
const MAX_CALL_SECONDS = 5 * 60;

async function getToken(): Promise<string> {
  const r = await fetch("/api/voice-token", { method: "POST" });
  const data = (await r.json().catch(() => ({}))) as { token?: string; error?: string };
  if (!r.ok || !data.token) throw new Error(data.error ?? "Voice is unavailable right now.");
  return data.token;
}

interface VoiceContextValue {
  agent: UseVoiceAgentReturn;
  /** True from the moment the call is initiated until it's ended. */
  active: boolean;
  /** Elapsed call time in seconds. */
  seconds: number;
  start: () => void;
  end: () => void;
}

const VoiceContext = createContext<VoiceContextValue | null>(null);

export function VoiceProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const agent = useVoiceAgent({
    getToken,
    voice: "eve",
    instructions: VOICE_INSTRUCTIONS,
    greeting: VOICE_GREETING,
  });

  const start = useCallback(() => {
    setSeconds(0);
    setActive(true);
    void agent.connect();
  }, [agent]);

  const end = useCallback(() => {
    agent.disconnect();
    setActive(false);
  }, [agent]);

  // Tick the call timer while a call is active.
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [active]);

  // Auto-disconnect once the call reaches the max length.
  useEffect(() => {
    if (active && seconds >= MAX_CALL_SECONDS) end();
  }, [active, seconds, end]);

  const value = useMemo<VoiceContextValue>(
    () => ({ agent, active, seconds, start, end }),
    [agent, active, seconds, start, end],
  );

  return <VoiceContext.Provider value={value}>{children}</VoiceContext.Provider>;
}

export function useVoice(): VoiceContextValue {
  const ctx = useContext(VoiceContext);
  if (!ctx) throw new Error("useVoice must be used within <VoiceProvider>");
  return ctx;
}

export function formatDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
