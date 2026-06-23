import { AnimatePresence, motion } from "motion/react";

import { useVoice, formatDuration } from "@/lib/voice";

const LINKS = [
  { label: "Home", href: "#" },
  { label: "Solutions", href: "#" },
  { label: "Company", href: "#" },
] as const;

export function Navbar() {
  const { active, start } = useVoice();

  return (
    <header className="absolute inset-x-0 top-0 z-30 flex justify-center px-6">
      {/* Brand, top-left */}
      <a
        href="#"
        aria-label="Stack AI Solutions"
        className="absolute left-6 top-4 flex flex-col font-display leading-none text-white"
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

      {/* Notch: nav links (desktop) / call pill (active). Hidden on mobile when idle. */}
      <motion.nav
        layout
        transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
        className={`items-center overflow-hidden rounded-b-2xl bg-background shadow-lg shadow-black/10 ring-1 ring-black/5 ${active ? "flex" : "hidden sm:flex"}`}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {active ? <CallPill key="call" /> : <LinksRow key="links" />}
        </AnimatePresence>
      </motion.nav>

      {/* Voice orb — top-right call trigger */}
      {!active && (
        <button
          type="button"
          onClick={start}
          aria-label="Talk to StackBot, our voice assistant"
          className="absolute right-6 top-4 overflow-hidden rounded-full shadow-lg shadow-black/20 ring-1 ring-white/50 transition-transform duration-150 ease-out hover:scale-105 active:scale-95"
        >
          <motion.span
            aria-hidden
            className="block size-10 rounded-full"
            style={{
              background:
                "conic-gradient(from 0deg, #FACC15, #F472B6, #A855F7, #2563EB, #22D3EE, #FACC15)",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
        </button>
      )}
    </header>
  );
}

function LinksRow() {
  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(4px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, filter: "blur(4px)" }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center gap-0.5 p-1.5"
    >
      {LINKS.map((link) => (
        <a
          key={link.label}
          href={link.href}
          className="rounded-full px-3.5 py-1.5 text-sm text-muted transition-colors duration-150 ease-out hover:bg-subtle hover:text-foreground"
        >
          {link.label}
        </a>
      ))}
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
