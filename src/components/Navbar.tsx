import { AnimatePresence, motion } from "motion/react";

import { useVoice, formatDuration } from "@/lib/voice";
import { Orb } from "@/components/Orb";

const LINKS = [
  { label: "Home", href: "#" },
  { label: "Solutions", href: "#" },
  { label: "Company", href: "#" },
] as const;

export function Navbar() {
  const { active } = useVoice();

  return (
    <header className="absolute inset-x-0 top-0 z-30">
      {/* Notch — top-left: nav links + robot (desktop) / call pill (active) */}
      <motion.nav
        layout
        transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
        className="absolute left-6 top-0 flex items-center overflow-hidden rounded-b-2xl bg-background shadow-lg shadow-black/10 ring-1 ring-black/5"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {active ? <CallPill key="call" /> : <LinksRow key="links" />}
        </AnimatePresence>
      </motion.nav>

      {/* Brand — centered */}
      <a
        href="#"
        aria-label="Stack AI Solutions"
        className="absolute left-1/2 top-4 flex -translate-x-1/2 flex-col items-center font-display leading-none text-white"
      >
        <span className="text-xl font-bold uppercase tracking-tight">Stack AI</span>
        <span
          aria-label="Solutions"
          className="-mt-0.5 flex w-full justify-between text-[10px] font-bold uppercase tracking-wide"
        >
          {"SOLUTIONS".split("").map((char, i) => (
            <span key={i} aria-hidden>
              {char}
            </span>
          ))}
        </span>
      </a>
    </header>
  );
}

function LinksRow() {
  const { start } = useVoice();
  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(4px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, filter: "blur(4px)" }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center gap-1 p-1.5"
    >
      {/* Nav links — hidden on mobile so the notch stays compact */}
      <div className="hidden items-center gap-0.5 sm:flex">
        {LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="rounded-full px-3.5 py-1.5 text-sm text-muted transition-colors duration-150 ease-out hover:bg-subtle hover:text-foreground"
          >
            {link.label}
          </a>
        ))}
        <span className="mx-1 h-4 w-px shrink-0 bg-(--border)" />
      </div>

      {/* Voice orb — tap to talk to StackBot */}
      <button
        type="button"
        onClick={start}
        aria-label="Talk to StackBot, our voice assistant"
        className="shrink-0 rounded-full transition-transform duration-150 ease-out hover:scale-110 active:scale-95"
      >
        <Orb colors={["#F59E0B", "#FDE047"]} className="pointer-events-none size-8" />
      </button>
    </motion.div>
  );
}

function CallPill() {
  const { agent, seconds, end } = useVoice();
  const level = Math.min(Math.max(agent.levels.agent, agent.levels.user), 1);
  const status =
    agent.status === "connecting"
      ? "Connecting"
      : agent.error
        ? "Error"
        : agent.isAgentSpeaking
          ? "StackBot"
          : agent.isUserSpeaking
            ? "Listening"
            : "Live";

  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(4px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, filter: "blur(4px)" }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center gap-2.5 py-2 pl-3 pr-2"
    >
      <span className="relative grid size-6 place-items-center">
        <span
          className="absolute inset-0 rounded-full opacity-70 blur-[1px] transition-transform duration-100"
          style={{
            background: "conic-gradient(from 90deg, #FACC15, #F472B6, #2563EB, #22D3EE, #FACC15)",
            transform: `scale(${1 + level})`,
          }}
        />
        <span
          className="relative size-3 rounded-full"
          style={{
            background: "conic-gradient(from 90deg, #FACC15, #F472B6, #2563EB, #22D3EE, #FACC15)",
          }}
        />
      </span>
      <span className="min-w-[3ch] text-[13px] font-semibold tabular-nums text-foreground">
        {formatDuration(seconds)}
      </span>
      <span className="hidden text-xs text-muted sm:inline">{status}</span>
      <button
        type="button"
        onClick={end}
        aria-label="End call"
        className="grid size-7 place-items-center rounded-full bg-red-600 text-white transition-transform hover:scale-105 active:scale-95"
      >
        <svg viewBox="0 0 24 24" className="size-3.5 rotate-135" fill="currentColor" aria-hidden>
          <path d="M6.6 10.8a15.5 15.5 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.6 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.46.6 3.6a1 1 0 0 1-.25 1Z" />
        </svg>
      </button>
    </motion.div>
  );
}
