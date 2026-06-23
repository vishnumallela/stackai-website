/**
 * useVoiceAgent - Realtime voice (WebSocket) React hook
 * ============================================================================
 *
 * A browser voice-agent hook for the realtime voice agent API
 * (wss://api.x.ai/v1/realtime). This realtime voice API is OpenAI-Realtime
 * compatible at the event level, but the browser transport is a raw WebSocket
 * carrying base64 PCM16 audio (not WebRTC). So this hook keeps the same
 * surface as a WebRTC hook - connect / disconnect / tools / history /
 * interrupt / mute - while doing the audio plumbing itself:
 *
 *   - mic capture  → resample to 24 kHz → PCM16 → base64 → input_audio_buffer.append
 *   - server audio → response.output_audio.delta (base64 PCM16) → scheduled playback
 *   - server VAD handles turn-taking; we clear local playback on barge-in
 *   - tool calls run client-side handlers, then we reply + response.create
 *
 * The provider API key never reaches the browser: `getToken()` returns a short-lived
 * ephemeral client secret minted by our backend, passed as the WS subprotocol.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const TARGET_RATE = 24000;
const WS_ENDPOINT = "wss://api.x.ai/v1/realtime";

/* ── public types ─────────────────────────────────────────────────────── */

export interface VoiceFunctionTool {
  type: "function";
  name: string;
  description?: string;
  parameters: Record<string, unknown>;
  /** Runs in the browser when the model calls this tool. Return value is
   *  JSON-encoded and sent back as the function_call_output. */
  handler?: (args: Record<string, unknown>) => Promise<unknown> | unknown;
}

export interface TurnDetectionConfig {
  type: "server_vad";
  threshold?: number;
  silence_duration_ms?: number;
  prefix_padding_ms?: number;
}

export interface UseVoiceAgentOptions {
  /** Returns the bare ephemeral client secret (without the xai-client-secret. prefix). */
  getToken: () => Promise<string>;
  model?: string;
  voice?: "eve" | "ara" | "rex" | "sal" | "leo" | (string & {});
  instructions?: string;
  tools?: VoiceFunctionTool[];
  turnDetection?: TurnDetectionConfig;
  /** If set, the agent speaks an opening line right after connect. */
  greeting?: string;
  onToolCall?: (info: { name: string; args: Record<string, unknown> }) => void;
  onToolResult?: (info: { name: string; result: unknown }) => void;
  onError?: (message: string) => void;
}

export type VoiceStatus = "idle" | "connecting" | "connected" | "error" | "closed";

export interface VoiceHistoryItem {
  id: string;
  role: "user" | "assistant";
  text: string;
  status: "in_progress" | "completed";
}

export interface UseVoiceAgentReturn {
  status: VoiceStatus;
  isConnected: boolean;
  isUserSpeaking: boolean;
  isAgentSpeaking: boolean;
  isAgentThinking: boolean;
  isToolRunning: boolean;
  isMuted: boolean;
  levels: { user: number; agent: number };
  history: VoiceHistoryItem[];
  liveUserText: string;
  liveAgentText: string;
  lastToolName: string | null;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  mute: () => void;
  unmute: () => void;
  toggleMute: () => void;
  sendText: (text: string) => void;
  interrupt: () => void;
}

/* ── audio helpers ────────────────────────────────────────────────────── */

function floatToBase64PCM16(input: Float32Array): string {
  const pcm = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]!));
    pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  const bytes = new Uint8Array(pcm.buffer);
  let binary = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}

function base64ToInt16(b64: string): Int16Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Int16Array(bytes.buffer, 0, Math.floor(bytes.byteLength / 2));
}

function resampleTo24k(input: Float32Array, inputRate: number): Float32Array {
  if (inputRate === TARGET_RATE) return input;
  const ratio = inputRate / TARGET_RATE;
  const outLen = Math.round(input.length / ratio);
  const out = new Float32Array(outLen);
  for (let i = 0; i < outLen; i++) {
    const idx = i * ratio;
    const i0 = Math.floor(idx);
    const i1 = Math.min(i0 + 1, input.length - 1);
    const frac = idx - i0;
    out[i] = input[i0]! * (1 - frac) + input[i1]! * frac;
  }
  return out;
}

/** Schedules base64 PCM16 chunks into gap-free playback and tracks output level. */
class PcmPlayer {
  ctx: AudioContext;
  gain: GainNode;
  analyser: AnalyserNode;
  playhead = 0;
  sources = new Set<AudioBufferSourceNode>();
  private buf: Uint8Array<ArrayBuffer>;

  constructor() {
    type Ctor = typeof AudioContext;
    const AC = (window.AudioContext ||
      (window as unknown as { webkitAudioContext: Ctor }).webkitAudioContext) as Ctor;
    try {
      this.ctx = new AC({ sampleRate: TARGET_RATE });
    } catch {
      this.ctx = new AC();
    }
    this.gain = this.ctx.createGain();
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 256;
    this.gain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);
    this.buf = new Uint8Array(this.analyser.fftSize);
  }

  resume(): void {
    if (this.ctx.state === "suspended") void this.ctx.resume();
  }

  enqueue(int16: Int16Array): void {
    if (int16.length === 0) return;
    const f32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) f32[i] = int16[i]! / 32768;
    const audioBuf = this.ctx.createBuffer(1, f32.length, TARGET_RATE);
    audioBuf.copyToChannel(f32, 0);
    const src = this.ctx.createBufferSource();
    src.buffer = audioBuf;
    src.connect(this.gain);
    const startAt = Math.max(this.ctx.currentTime + 0.02, this.playhead);
    src.start(startAt);
    this.playhead = startAt + audioBuf.duration;
    this.sources.add(src);
    src.onended = () => this.sources.delete(src);
  }

  /** Barge-in: stop everything currently scheduled. */
  clear(): void {
    for (const s of this.sources) {
      try {
        s.stop();
      } catch {
        /* already stopped */
      }
    }
    this.sources.clear();
    this.playhead = this.ctx.currentTime;
  }

  get isPlaying(): boolean {
    return this.playhead > this.ctx.currentTime + 0.05;
  }

  level(): number {
    this.analyser.getByteTimeDomainData(this.buf);
    let peak = 0;
    for (let i = 0; i < this.buf.length; i++) {
      const v = Math.abs((this.buf[i]! - 128) / 128);
      if (v > peak) peak = v;
    }
    return peak;
  }

  close(): void {
    this.clear();
    try {
      void this.ctx.close();
    } catch {
      /* ignore */
    }
  }
}

/* ── the hook ─────────────────────────────────────────────────────────── */

export function useVoiceAgent(options: UseVoiceAgentOptions): UseVoiceAgentReturn {
  const optsRef = useRef(options);
  optsRef.current = options;

  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [isAgentThinking, setIsAgentThinking] = useState(false);
  const [isToolRunning, setIsToolRunning] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [levels, setLevels] = useState({ user: 0, agent: 0 });
  const [history, setHistory] = useState<VoiceHistoryItem[]>([]);
  const [liveUserText, setLiveUserText] = useState("");
  const [liveAgentText, setLiveAgentText] = useState("");
  const [lastToolName, setLastToolName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const micCtxRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const playerRef = useRef<PcmPlayer | null>(null);
  const micLevelRef = useRef(0);
  const mutedRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const genRef = useRef(0);
  const greetedRef = useRef(false);
  // Voice-quality refs (see research findings applied below):
  const agentSpeakingRef = useRef(false); // is the agent's audio currently playing
  const userSpeakingRef = useRef(false); // is the user mid-utterance (VAD)
  const canStreamRef = useRef(false); // AEC warm-up gate - don't send mic audio yet
  const pendingToolResponseRef = useRef(false); // defer response.create until user stops

  const fail = useCallback((message: string) => {
    setError(message);
    setStatus("error");
    try {
      optsRef.current.onError?.(message);
    } catch {
      /* ignore */
    }
  }, []);

  const sendEvent = useCallback((event: Record<string, unknown>) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(event));
  }, []);

  const upsert = useCallback(
    (id: string, patch: Partial<VoiceHistoryItem> & { role: "user" | "assistant" }) => {
      setHistory((prev) => {
        const idx = prev.findIndex((h) => h.id === id);
        if (idx === -1) {
          return [
            ...prev,
            { id, role: patch.role, text: patch.text ?? "", status: patch.status ?? "in_progress" },
          ];
        }
        const next = prev.slice();
        next[idx] = { ...next[idx]!, ...patch };
        return next;
      });
    },
    [],
  );

  const buildSession = useCallback((): Record<string, unknown> => {
    const o = optsRef.current;
    return {
      type: "session.update",
      session: {
        voice: o.voice ?? "eve",
        instructions: o.instructions ?? "You are a helpful voice assistant.",
        turn_detection: o.turnDetection ?? {
          // Tuned for a near-field desktop mic with echo cancellation on.
          // threshold 0.5 (provider default) catches softer/natural speech;
          // 600ms end-of-turn is patient enough not to clip a mid-sentence
          // pause, while still feeling responsive; 300ms prefix keeps the
          // first syllable.
          type: "server_vad",
          threshold: 0.5,
          silence_duration_ms: 600,
          prefix_padding_ms: 300,
        },
        audio: {
          input: {
            format: { type: "audio/pcm", rate: TARGET_RATE },
            transcription: {},
          },
          output: {
            format: { type: "audio/pcm", rate: TARGET_RATE },
            speed: 1.0,
          },
        },
        tools: (o.tools ?? []).map((t) => ({
          type: "function",
          name: t.name,
          description: t.description,
          parameters: t.parameters,
        })),
      },
    };
  }, []);

  const runToolCall = useCallback(
    async (name: string, callId: string, argsRaw: string) => {
      let args: Record<string, unknown> = {};
      try {
        args = argsRaw ? (JSON.parse(argsRaw) as Record<string, unknown>) : {};
      } catch {
        /* leave empty */
      }
      setLastToolName(name);
      setIsToolRunning(true);
      try {
        optsRef.current.onToolCall?.({ name, args });
      } catch {
        /* ignore */
      }

      const tool = optsRef.current.tools?.find((t) => t.name === name);
      let output: unknown = { ok: true };
      if (tool?.handler) {
        try {
          output = await tool.handler(args);
          optsRef.current.onToolResult?.({ name, result: output });
        } catch (e) {
          output = { error: e instanceof Error ? e.message : String(e) };
        }
      }

      sendEvent({
        type: "conversation.item.create",
        item: {
          type: "function_call_output",
          call_id: callId,
          output: typeof output === "string" ? output : JSON.stringify(output),
        },
      });
      // "First word clipped" mitigation: if the user started speaking again
      // while the tool ran, defer response.create until they stop. Otherwise
      // the server clips the start of their next utterance.
      if (userSpeakingRef.current) {
        pendingToolResponseRef.current = true;
      } else {
        sendEvent({ type: "response.create" });
      }
      setIsToolRunning(false);
    },
    [sendEvent],
  );

  const handleServerEvent = useCallback(
    (ev: { type: string; [k: string]: unknown }) => {
      switch (ev.type) {
        case "session.created":
          sendEvent(buildSession());
          break;

        case "session.updated":
          setStatus("connected");
          // AEC warm-up: give the browser echo canceller ~1.2s to learn the
          // room before we start streaming mic audio. This is the cheapest fix
          // for the classic "agent talks over / answers itself in the first few
          // seconds" failure on laptop speakers.
          window.setTimeout(() => {
            canStreamRef.current = true;
          }, 1200);
          if (optsRef.current.greeting && !greetedRef.current) {
            greetedRef.current = true;
            sendEvent({
              type: "response.create",
              response: { instructions: `Greet the caller now: ${optsRef.current.greeting}` },
            });
          }
          break;

        case "input_audio_buffer.speech_started":
          userSpeakingRef.current = true;
          setIsUserSpeaking(true);
          // Barge-in: cut the agent off immediately and tell the server to stop
          // generating so its context matches what the user actually heard.
          if (agentSpeakingRef.current) {
            playerRef.current?.clear();
            agentSpeakingRef.current = false;
            setIsAgentSpeaking(false);
            sendEvent({ type: "response.cancel" });
          }
          break;

        case "input_audio_buffer.speech_stopped":
          userSpeakingRef.current = false;
          setIsUserSpeaking(false);
          // Fire a tool-result response that we deferred while the user spoke
          // (mitigates the "first word clipped" race).
          if (pendingToolResponseRef.current) {
            pendingToolResponseRef.current = false;
            sendEvent({ type: "response.create" });
          }
          break;

        case "conversation.item.input_audio_transcription.delta":
          setLiveUserText((t) => t + ((ev.delta as string) ?? ""));
          break;

        case "conversation.item.input_audio_transcription.completed": {
          const text = ((ev.transcript as string) ?? "").trim();
          if (text) {
            upsert((ev.item_id as string) ?? crypto.randomUUID(), {
              role: "user",
              text,
              status: "completed",
            });
          }
          setLiveUserText("");
          break;
        }

        case "response.created":
          setIsAgentThinking(true);
          break;

        case "response.output_audio.delta": {
          const delta = ev.delta as string | undefined;
          if (delta) {
            agentSpeakingRef.current = true;
            setIsAgentSpeaking(true);
            setIsAgentThinking(false);
            playerRef.current?.resume();
            playerRef.current?.enqueue(base64ToInt16(delta));
          }
          break;
        }

        case "response.output_audio.done":
          // playback drains on its own; speaking flag clears in the rAF loop
          break;

        case "response.output_audio_transcript.delta":
        case "response.audio_transcript.delta":
          setLiveAgentText((t) => t + ((ev.delta as string) ?? ""));
          break;

        case "response.output_audio_transcript.done":
        case "response.audio_transcript.done": {
          const text = ((ev.transcript as string) ?? "").trim();
          if (text) {
            upsert((ev.item_id as string) ?? crypto.randomUUID(), {
              role: "assistant",
              text,
              status: "completed",
            });
          }
          setLiveAgentText("");
          break;
        }

        case "response.function_call_arguments.done":
          void runToolCall(ev.name as string, ev.call_id as string, (ev.arguments as string) ?? "");
          break;

        case "response.done":
          setIsAgentThinking(false);
          break;

        case "error": {
          const e = ev.error as { message?: string } | undefined;
          const msg = e?.message ?? "Realtime error";
          if (/not found|no active response|cancel|already has an active response/i.test(msg)) {
            break;
          }
          setError(msg);
          try {
            optsRef.current.onError?.(msg);
          } catch {
            /* ignore */
          }
          break;
        }

        default:
          break;
      }
    },
    [buildSession, runToolCall, sendEvent, upsert],
  );

  const startMic = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        channelCount: 1,
      },
    });
    micStreamRef.current = stream;
    type Ctor = typeof AudioContext;
    const AC = (window.AudioContext ||
      (window as unknown as { webkitAudioContext: Ctor }).webkitAudioContext) as Ctor;
    const ctx = new AC();
    micCtxRef.current = ctx;
    const source = ctx.createMediaStreamSource(stream);
    const processor = ctx.createScriptProcessor(4096, 1, 1);
    processorRef.current = processor;

    processor.onaudioprocess = (e) => {
      const input = e.inputBuffer.getChannelData(0);
      // mic level for the visualizer (always, even when muted-for-display)
      let peak = 0;
      for (let i = 0; i < input.length; i++) {
        const a = Math.abs(input[i]!);
        if (a > peak) peak = a;
      }
      micLevelRef.current = peak;
      // Don't stream until the session is live AND the AEC warm-up has elapsed.
      if (mutedRef.current || !canStreamRef.current) return;
      const resampled = resampleTo24k(input, ctx.sampleRate);
      sendEvent({ type: "input_audio_buffer.append", audio: floatToBase64PCM16(resampled) });
    };

    source.connect(processor);
    // ScriptProcessor needs a sink to fire; route to a muted gain.
    const sink = ctx.createGain();
    sink.gain.value = 0;
    processor.connect(sink);
    sink.connect(ctx.destination);
  }, [sendEvent]);

  const teardown = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    try {
      processorRef.current?.disconnect();
    } catch {
      /* ignore */
    }
    processorRef.current = null;
    micStreamRef.current?.getTracks().forEach((t) => t.stop());
    micStreamRef.current = null;
    try {
      void micCtxRef.current?.close();
    } catch {
      /* ignore */
    }
    micCtxRef.current = null;
    playerRef.current?.close();
    playerRef.current = null;
    const ws = wsRef.current;
    wsRef.current = null;
    if (ws) {
      ws.onmessage = null;
      ws.onclose = null;
      ws.onerror = null;
      try {
        ws.close();
      } catch {
        /* ignore */
      }
    }
  }, []);

  const disconnect = useCallback(() => {
    genRef.current++;
    greetedRef.current = false;
    teardown();
    setStatus("closed");
    setIsUserSpeaking(false);
    setIsAgentSpeaking(false);
    setIsAgentThinking(false);
    setIsToolRunning(false);
    setLevels({ user: 0, agent: 0 });
    setLiveUserText("");
    setLiveAgentText("");
  }, [teardown]);

  const connect = useCallback(async () => {
    if (wsRef.current) return;
    const myGen = ++genRef.current;
    setError(null);
    setHistory([]);
    setStatus("connecting");
    greetedRef.current = false;
    canStreamRef.current = false;
    pendingToolResponseRef.current = false;
    agentSpeakingRef.current = false;
    userSpeakingRef.current = false;

    let token: string;
    try {
      token = await optsRef.current.getToken();
      if (!token) throw new Error("No token returned");
    } catch (e) {
      fail(e instanceof Error ? e.message : "Could not get a voice token");
      return;
    }
    if (myGen !== genRef.current) return;

    try {
      await startMic();
    } catch (e) {
      fail(
        e instanceof Error && e.name === "NotAllowedError"
          ? "Microphone permission denied"
          : `Microphone error: ${e instanceof Error ? e.message : String(e)}`,
      );
      teardown();
      return;
    }
    if (myGen !== genRef.current) {
      teardown();
      return;
    }

    playerRef.current = new PcmPlayer();

    const model = optsRef.current.model ?? "grok-voice-latest";
    const proto = token.startsWith("xai-client-secret.") ? token : `xai-client-secret.${token}`;
    const ws = new WebSocket(`${WS_ENDPOINT}?model=${encodeURIComponent(model)}`, [proto]);
    wsRef.current = ws;

    ws.onmessage = (msg) => {
      if (myGen !== genRef.current) return;
      try {
        handleServerEvent(JSON.parse(msg.data as string));
      } catch {
        /* ignore malformed frame */
      }
    };
    ws.onerror = () => {
      if (myGen !== genRef.current) return;
      fail("WebSocket error. Check your connection and try again.");
    };
    ws.onclose = (e) => {
      if (myGen !== genRef.current) return;
      if (status !== "error") setStatus("closed");
      if (e.code !== 1000 && e.reason) setError(e.reason);
    };

    // Visualizer loop. Runs at rAF rate but only commits level state ~25fps and
    // only when it actually changes, otherwise the whole console re-renders
    // 60x/s and keeps re-rendering through silence.
    let lastEmit = 0;
    let lastU = -1;
    let lastA = -1;
    const tick = () => {
      if (myGen !== genRef.current) return;
      const playing = playerRef.current?.isPlaying ?? false;
      agentSpeakingRef.current = playing;
      setIsAgentSpeaking((prev) => (prev !== playing ? playing : prev));

      const now = performance.now();
      if (now - lastEmit >= 40) {
        lastEmit = now;
        const a = Math.round((playerRef.current?.level() ?? 0) * 100) / 100;
        const u = mutedRef.current ? 0 : Math.round(micLevelRef.current * 100) / 100;
        if (u !== lastU || a !== lastA) {
          lastU = u;
          lastA = a;
          setLevels({ user: u, agent: a });
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fail, handleServerEvent, startMic, teardown]);

  const mute = useCallback(() => {
    mutedRef.current = true;
    setIsMuted(true);
  }, []);
  const unmute = useCallback(() => {
    mutedRef.current = false;
    setIsMuted(false);
  }, []);
  const toggleMute = useCallback(() => {
    mutedRef.current = !mutedRef.current;
    setIsMuted(mutedRef.current);
  }, []);

  const sendText = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      sendEvent({
        type: "conversation.item.create",
        item: { type: "message", role: "user", content: [{ type: "input_text", text }] },
      });
      sendEvent({ type: "response.create" });
    },
    [sendEvent],
  );

  const interrupt = useCallback(() => {
    playerRef.current?.clear();
    sendEvent({ type: "response.cancel" });
    setIsAgentSpeaking(false);
    setIsAgentThinking(false);
  }, [sendEvent]);

  useEffect(() => () => disconnect(), [disconnect]);

  return useMemo<UseVoiceAgentReturn>(
    () => ({
      status,
      isConnected: status === "connected",
      isUserSpeaking,
      isAgentSpeaking,
      isAgentThinking,
      isToolRunning,
      isMuted,
      levels,
      history,
      liveUserText,
      liveAgentText,
      lastToolName,
      error,
      connect,
      disconnect,
      mute,
      unmute,
      toggleMute,
      sendText,
      interrupt,
    }),
    [
      status,
      isUserSpeaking,
      isAgentSpeaking,
      isAgentThinking,
      isToolRunning,
      isMuted,
      levels,
      history,
      liveUserText,
      liveAgentText,
      lastToolName,
      error,
      connect,
      disconnect,
      mute,
      unmute,
      toggleMute,
      sendText,
      interrupt,
    ],
  );
}

export default useVoiceAgent;
