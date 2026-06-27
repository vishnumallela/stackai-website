import { m } from "motion/react";

import type { VisualProps } from "./types";

/* A live model-health monitor: a heartbeat trace with a bright pulse traveling
   across it. MLOps. */

const ECG =
  "M 50 135 L 150 135 L 162 135 L 172 106 L 185 168 L 198 120 L 208 135 L 300 135 L 312 135 L 322 110 L 335 162 L 347 135 L 430 135";

export function MLOpsVisual({ accent, reduced }: VisualProps) {
  return (
    <div className="absolute inset-0">
      <svg viewBox="0 0 480 270" preserveAspectRatio="xMidYMid meet" className="h-full w-full">
        <line x1={40} y1={135} x2={440} y2={135} stroke="#ffffff" strokeOpacity={0.06} />
        <path d={ECG} fill="none" stroke={accent} strokeOpacity={0.18} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        {!reduced && (
          <m.path
            d={ECG}
            fill="none"
            stroke={accent}
            strokeWidth={2.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray="0.14 0.86"
            animate={{ strokeDashoffset: [1, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
            style={{ filter: `drop-shadow(0 0 5px ${accent})` }}
          />
        )}
        {/* uptime ticks */}
        {[78, 150, 300, 372].map((x, i) => (
          <m.circle
            key={i}
            cx={x}
            cy={200}
            r={3}
            fill={accent}
            animate={reduced ? { opacity: 0.5 } : { opacity: [0.25, 0.9, 0.25] }}
            transition={{ duration: 2, delay: i * 0.4, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </svg>
    </div>
  );
}
