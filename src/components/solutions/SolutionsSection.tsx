import type { CSSProperties } from "react";
import { useReducedMotion } from "motion/react";

import { SOLUTIONS } from "./solutions";
import type { Solution } from "./solutions";

/** hex → rgba string */
function hexA(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}
/** Darken a hex accent so it reads as ink on a white card. */
function shade(hex: string, k: number) {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) => Math.round(c * k);
  return `rgb(${f((n >> 16) & 255)}, ${f((n >> 8) & 255)}, ${f(n & 255)})`;
}

// Cheap dithered-noise overlay (data-URI) — scales to the whole marquee with no WebGL.
const GRAIN = `url("data:image/svg+xml,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/><feComponentTransfer><feFuncA type='discrete' tableValues='0 0 0 0 0 1 0 0 1 0 0 0 1 0'/></feComponentTransfer></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>",
)}")`;

const SIZES: Record<string, number> = { lg: 300, md: 240, sm: 196 };
const SIZE_BY_ID: Record<string, keyof typeof SIZES> = {
  agentic: "lg", voice: "lg", document: "lg",
  vision: "md", data: "md", predictive: "md", genai: "md",
  analytics: "sm", language: "sm", mlops: "sm",
};

const COLUMNS: { dir: "up" | "down"; ids: string[] }[] = [
  { dir: "up", ids: ["agentic", "data", "language", "mlops"] },
  { dir: "down", ids: ["vision", "voice", "analytics"] },
  { dir: "up", ids: ["genai", "predictive", "document"] },
];

export function SolutionsSection() {
  const reduced = useReducedMotion() ?? false;

  return (
    <section
      id="solutions"
      className="relative mt-4 overflow-hidden rounded-3xl px-5 py-12 shadow-[0_24px_70px_-20px_rgba(0,0,0,0.45)] sm:mt-6 sm:px-8 sm:py-16 lg:px-12 lg:py-20"
    >
      {/* brand gradient backdrop, lightly blurred */}
      <div className="pointer-events-none absolute inset-0 scale-105 bg-cover bg-center blur-[5px]" style={{ backgroundImage: "url(/textures/bg-2.jpg)" }} />
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-white/60 via-white/25 to-white/10" />

      <div className="relative mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,46%)_1fr] lg:items-center lg:gap-12">
        {/* Left: heading */}
        <div>
          <div className="font-mono text-xs font-medium uppercase tracking-[0.25em] text-neutral-600">What we build</div>
          <h2 className="mt-4 text-balance font-display text-4xl font-semibold leading-[1.02] tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl">
            The full AI stack, engineered for the&nbsp;enterprise.
          </h2>
          <p className="mt-5 max-w-md text-pretty text-sm leading-relaxed text-neutral-700 sm:text-base">
            We design, build, and operate production-grade AI, integrated
            securely with your systems and governed end to end, to deliver
            measurable outcomes at scale.
          </p>
          <a
            href="#"
            className="group mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-900 transition-colors hover:text-neutral-600"
          >
            Explore our capabilities
            <svg viewBox="0 0 24 24" className="size-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
        </div>

        {/* Right: 3-lane marquee of cards (pauses on hover) */}
        <div
          className="group relative h-120 overflow-hidden lg:h-176"
          style={{
            maskImage: "linear-gradient(to bottom, transparent, #000 8%, #000 92%, transparent)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent, #000 8%, #000 92%, transparent)",
          }}
        >
          <div className="grid h-full grid-cols-2 items-start gap-4 lg:grid-cols-3">
            <MarqueeColumn ids={COLUMNS[0].ids} dir={COLUMNS[0].dir} reduced={reduced} />
            <MarqueeColumn ids={COLUMNS[1].ids} dir={COLUMNS[1].dir} reduced={reduced} />
            <div className="hidden lg:block">
              <MarqueeColumn ids={COLUMNS[2].ids} dir={COLUMNS[2].dir} reduced={reduced} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MarqueeColumn({ ids, dir, reduced }: { ids: string[]; dir: "up" | "down"; reduced: boolean }) {
  const cards = ids
    .map((id) => SOLUTIONS.find((s) => s.id === id))
    .filter((s): s is Solution => Boolean(s));
  const perCopy = cards.reduce((acc, s) => acc + SIZES[SIZE_BY_ID[s.id]] + 16, 0);
  const dur = perCopy / 36;
  const seq = [...cards, ...cards];

  const laneStyle: CSSProperties | undefined = reduced
    ? undefined
    : ({
        "--marquee-distance": `${perCopy}px`,
        animationName: dir === "up" ? "marquee-up" : "marquee-down",
        animationDuration: `${dur}s`,
        animationTimingFunction: "linear",
        animationIterationCount: "infinite",
      } as CSSProperties);

  return (
    <div className="relative">
      <div className="flex flex-col gap-4 will-change-transform group-hover:[animation-play-state:paused]" style={laneStyle}>
        {seq.map((s, i) => (
          <MarqueeCard key={`${s.id}-${i}`} solution={s} h={SIZES[SIZE_BY_ID[s.id]]} reduced={reduced} />
        ))}
      </div>
    </div>
  );
}

function MarqueeCard({ solution: s, h, reduced }: { solution: Solution; h: number; reduced: boolean }) {
  const Visual = s.Visual;
  const ink = shade(s.accent, 0.55);
  return (
    <a
      href="#"
      style={{ height: h }}
      className="relative flex shrink-0 flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_14px_40px_-20px_rgba(15,23,42,0.6)] transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-0.5 active:scale-[0.98]"
    >
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <CardField accent={s.accent} />
        {s.video ? (
          <video src={s.video} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <Visual accent={s.accent} reduced={reduced} />
        )}
      </div>
      <div className="p-3.5">
        <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.16em]" style={{ color: ink }}>
          {s.name}
        </div>
        <h3 className="mt-1 font-display text-[15px] font-semibold leading-snug tracking-tight text-neutral-900">{s.headline}</h3>
      </div>
    </a>
  );
}

function CardField({ accent }: { accent: string }) {
  return (
    <div className="absolute inset-0" style={{ backgroundColor: "#070a12" }}>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(120% 115% at 22% 12%, ${hexA(accent, 0.65)}, transparent 60%), radial-gradient(120% 120% at 86% 96%, ${hexA(accent, 0.42)}, transparent 55%)`,
        }}
      />
      <div className="absolute inset-0 opacity-15 mix-blend-overlay" style={{ backgroundImage: GRAIN, backgroundSize: "150px 150px" }} />
    </div>
  );
}
