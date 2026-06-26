import { motion } from "motion/react";

import type { VisualProps } from "./types";

/* A gyroscopic engine: glowing light streaks revolve on three tilted orbits
   around a pulsing core. Agentic AI. */

const C = { x: 240, y: 135 };

function ellipsePerim(a: number, b: number) {
  const h = Math.pow(a - b, 2) / Math.pow(a + b, 2);
  return Math.PI * (a + b) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
}

const RX = 132;
const RY = 48;
const ORBITS = [
  { tilt: 0, dur: 6, dir: 1 },
  { tilt: 60, dur: 8.5, dir: -1 },
  { tilt: 120, dur: 7.2, dir: 1 },
];

export function AgenticVisual({ accent, reduced }: VisualProps) {
  const perim = ellipsePerim(RX, RY);
  const streak = perim * 0.17;
  return (
    <div className="absolute inset-0">
      <svg viewBox="0 0 480 270" preserveAspectRatio="xMidYMid meet" className="h-full w-full">
        <defs>
          <radialGradient id="ag-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="35%" stopColor={accent} stopOpacity="0.9" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </radialGradient>
          <filter id="ag-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {ORBITS.map((o, i) => (
          <g key={i} transform={`rotate(${o.tilt} ${C.x} ${C.y})`}>
            <ellipse cx={C.x} cy={C.y} rx={RX} ry={RY} fill="none" stroke={accent} strokeOpacity={0.1} strokeWidth={1} />
            <motion.ellipse
              cx={C.x}
              cy={C.y}
              rx={RX}
              ry={RY}
              fill="none"
              stroke={accent}
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeDasharray={`${streak} ${perim - streak}`}
              filter="url(#ag-glow)"
              animate={reduced ? undefined : { strokeDashoffset: [0, o.dir * perim] }}
              transition={{ duration: o.dur, repeat: Infinity, ease: "linear" }}
            />
          </g>
        ))}

        {/* pulsing core */}
        <motion.g
          style={{ transformOrigin: `${C.x}px ${C.y}px` }}
          animate={reduced ? undefined : { scale: [1, 1.09, 1], opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <circle cx={C.x} cy={C.y} r={32} fill="url(#ag-core)" />
        </motion.g>
        <circle cx={C.x} cy={C.y} r={6} fill={accent} filter="url(#ag-glow)" />
        <circle cx={C.x} cy={C.y} r={2.5} fill="#ffffff" />
      </svg>
    </div>
  );
}
