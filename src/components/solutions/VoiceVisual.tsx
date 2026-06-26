import { useEffect, useRef } from "react";
import { motion } from "motion/react";

import type { VisualProps } from "./types";

/* An organic voice orb: a smooth waveform blob that undulates in real time,
   with sound rings emanating outward. Voice AI. */

const C = { x: 240, y: 135 };
const N = 120;
const R = 58;

function buildPath(t: number) {
  let d = "";
  for (let i = 0; i <= N; i++) {
    const a = (i / N) * Math.PI * 2;
    const rr =
      R +
      9 * Math.sin(2 * a + t * 1.1) +
      6 * Math.sin(3 * a - t * 1.7) +
      4 * Math.sin(5 * a + t * 0.9) +
      2.5 * Math.sin(8 * a - t * 1.3);
    const x = C.x + Math.cos(a) * rr;
    const y = C.y + Math.sin(a) * rr;
    d += `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)} `;
  }
  return `${d}Z`;
}

export function VoiceVisual({ accent, reduced }: VisualProps) {
  const ref = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    let t = 0;
    let last: number | null = null;
    const tick = (now: number) => {
      if (last === null) last = now;
      t += (now - last) / 1000;
      last = now;
      ref.current?.setAttribute("d", buildPath(t));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  return (
    <div className="absolute inset-0">
      <svg viewBox="0 0 480 270" preserveAspectRatio="xMidYMid meet" className="h-full w-full">
        <defs>
          <radialGradient id="vo-fill" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
            <stop offset="45%" stopColor={accent} stopOpacity="0.5" />
            <stop offset="100%" stopColor={accent} stopOpacity="0.04" />
          </radialGradient>
          <filter id="vo-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="3.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* emanating sound rings */}
        {!reduced &&
          [0, 1].map((i) => (
            <motion.circle
              key={i}
              cx={C.x}
              cy={C.y}
              r={R}
              fill="none"
              stroke={accent}
              strokeWidth={1.2}
              style={{ transformOrigin: `${C.x}px ${C.y}px` }}
              animate={{ scale: [0.85, 1.8], opacity: [0.5, 0] }}
              transition={{ duration: 3, delay: i * 1.5, repeat: Infinity, ease: "easeOut" }}
            />
          ))}

        {/* morphing voice orb */}
        <path ref={ref} d={buildPath(0)} fill="url(#vo-fill)" stroke={accent} strokeWidth={1.8} strokeOpacity={0.9} filter="url(#vo-glow)" />
        <circle cx={C.x} cy={C.y} r={6} fill="#ffffff" opacity={0.9} />
      </svg>
    </div>
  );
}
