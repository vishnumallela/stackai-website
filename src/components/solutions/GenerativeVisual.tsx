import { motion } from "motion/react";

import type { VisualProps } from "./types";

/* A generative spark: a rotating four-point star with twinkles. Generative AI. */

const C = { x: 240, y: 135 };

function star(cx: number, cy: number, o: number, i: number) {
  return `M ${cx},${cy - o} C ${cx},${cy - i} ${cx + i},${cy} ${cx + o},${cy} C ${cx + i},${cy} ${cx},${cy + i} ${cx},${cy + o} C ${cx},${cy + i} ${cx - i},${cy} ${cx - o},${cy} C ${cx - i},${cy} ${cx},${cy - i} ${cx},${cy - o} Z`;
}

const TWINKLES = [
  { x: 158, y: 78, s: 15 },
  { x: 334, y: 96, s: 11 },
  { x: 322, y: 202, s: 13 },
  { x: 150, y: 196, s: 9 },
];

export function GenerativeVisual({ accent, reduced }: VisualProps) {
  return (
    <div className="absolute inset-0">
      <svg viewBox="0 0 480 270" preserveAspectRatio="xMidYMid meet" className="h-full w-full">
        <defs>
          <filter id="gen-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <motion.g
          style={{ transformOrigin: `${C.x}px ${C.y}px` }}
          animate={reduced ? undefined : { rotate: 360 }}
          transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
        >
          <motion.path
            d={star(C.x, C.y, 52, 11)}
            fill={accent}
            filter="url(#gen-glow)"
            style={{ transformOrigin: `${C.x}px ${C.y}px` }}
            animate={reduced ? undefined : { scale: [1, 1.12, 1], opacity: [0.85, 1, 0.85] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.g>
        <circle cx={C.x} cy={C.y} r={7} fill="#ffffff" />

        {TWINKLES.map((tw, i) => (
          <motion.path
            key={i}
            d={star(tw.x, tw.y, tw.s, tw.s * 0.22)}
            fill={accent}
            style={{ transformOrigin: `${tw.x}px ${tw.y}px` }}
            animate={reduced ? { opacity: 0.6 } : { scale: [0.4, 1, 0.4], opacity: [0, 1, 0] }}
            transition={{ duration: 2.4, delay: i * 0.55, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </svg>
    </div>
  );
}
