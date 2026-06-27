import { m } from "motion/react";

import type { VisualProps } from "./types";

/* Scattered observations, a fitted trend, and a forecast cone projecting
   forward. Predictive ML. */

const PTS = [
  [150, 182], [176, 166], [198, 174], [224, 150],
  [248, 142], [272, 128], [298, 122], [318, 112],
];

export function PredictiveVisual({ accent, reduced }: VisualProps) {
  return (
    <div className="absolute inset-0">
      <svg viewBox="0 0 480 270" preserveAspectRatio="xMidYMid meet" className="h-full w-full">
        {/* forecast cone */}
        <m.path
          d="M 318 112 L 424 74 L 424 150 Z"
          fill={accent}
          fillOpacity={0.12}
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
        />
        {/* fitted trend */}
        <m.path
          d="M 150 180 L 318 112"
          fill="none"
          stroke={accent}
          strokeWidth={2.4}
          strokeLinecap="round"
          initial={reduced ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
        />
        {/* forecast extension */}
        <m.path
          d="M 318 112 L 424 112"
          fill="none"
          stroke={accent}
          strokeWidth={2}
          strokeDasharray="5 6"
          strokeLinecap="round"
          initial={reduced ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
        />
        {/* observations */}
        {PTS.map((p, i) => (
          <m.circle
            key={i}
            cx={p[0]}
            cy={p[1]}
            r={3.5}
            fill={accent}
            initial={reduced ? false : { scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: reduced ? 0 : i * 0.08, duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
          />
        ))}
        <circle cx={424} cy={112} r={5} fill="#ffffff" />
        {!reduced && (
          <m.circle cx={424} cy={112} r={5} fill="none" stroke={accent} animate={{ r: [5, 15], opacity: [0.8, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }} />
        )}
      </svg>
    </div>
  );
}
