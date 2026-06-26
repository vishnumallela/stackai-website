import { motion } from "motion/react";

import type { VisualProps } from "./types";

/* A document with fields being detected and extracted. Document AI (IDP). */

const LINES = [78, 96, 114, 132, 168, 186, 204];
const FIELDS = [
  { x: 206, y: 90, w: 78, h: 16, delay: 0.3 },
  { x: 160, y: 126, w: 126, h: 16, delay: 1.0 },
  { x: 188, y: 180, w: 96, h: 16, delay: 1.7 },
];

export function DocumentVisual({ accent, reduced }: VisualProps) {
  return (
    <div className="absolute inset-0">
      <svg viewBox="0 0 480 270" preserveAspectRatio="xMidYMid meet" className="h-full w-full">
        {/* page */}
        <rect x={150} y={52} width={180} height={166} rx={10} fill="#0b0f17" stroke={accent} strokeOpacity={0.35} />
        {LINES.map((y, i) => (
          <rect key={i} x={166} y={y} width={i % 2 ? 118 : 148} height={6} rx={3} fill={accent} fillOpacity={0.18} />
        ))}
        {/* extracted fields */}
        {FIELDS.map((f, i) => (
          <motion.rect
            key={i}
            x={f.x}
            y={f.y}
            width={f.w}
            height={f.h}
            rx={3}
            fill={accent}
            fillOpacity={0.12}
            stroke={accent}
            strokeWidth={1.5}
            style={{ transformOrigin: `${f.x + f.w / 2}px ${f.y + f.h / 2}px` }}
            initial={reduced ? false : { opacity: 0, scale: 0.9 }}
            animate={reduced ? { opacity: 1 } : { opacity: [0, 1, 1, 0.6], scale: 1 }}
            transition={{ duration: 0.6, delay: reduced ? 0 : f.delay, repeat: Infinity, repeatDelay: 2.4, ease: "easeOut" }}
          />
        ))}
      </svg>
    </div>
  );
}
