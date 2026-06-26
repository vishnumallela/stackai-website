import { motion } from "motion/react";

import type { VisualProps } from "./types";

/* Three isometric platforms with a single packet of light flowing through them.
   The pipeline, distilled to one gesture. Data Platforms. */

const W = 50;
const H = 25;

const STAGES = [
  { cx: 120, cy: 175 },
  { cx: 240, cy: 120 },
  { cx: 360, cy: 175 },
];

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function shade(hex: string, k: number) {
  const { r, g, b } = hexToRgb(hex);
  const f = (c: number) => Math.round(Math.min(255, Math.max(0, c * k)));
  return `rgb(${f(r)}, ${f(g)}, ${f(b)})`;
}

function IsoBlock({ cx, cy, accent, w = W, h = H, bh = 14 }: { cx: number; cy: number; accent: string; w?: number; h?: number; bh?: number }) {
  return (
    <g>
      <polygon points={`${cx - w},${cy} ${cx},${cy + h} ${cx},${cy + h + bh} ${cx - w},${cy + bh}`} fill={shade(accent, 0.4)} />
      <polygon points={`${cx + w},${cy} ${cx},${cy + h} ${cx},${cy + h + bh} ${cx + w},${cy + bh}`} fill={shade(accent, 0.25)} />
      <polygon points={`${cx},${cy - h} ${cx + w},${cy} ${cx},${cy + h} ${cx - w},${cy}`} fill={shade(accent, 0.9)} stroke={shade(accent, 1.2)} strokeWidth={0.75} />
    </g>
  );
}

export function DataVisual({ accent, reduced }: VisualProps) {
  return (
    <div className="absolute inset-0">
      <svg viewBox="0 0 480 270" preserveAspectRatio="xMidYMid meet" className="h-full w-full">
        {/* pipes */}
        {STAGES.slice(0, -1).map((s, i) => {
          const n = STAGES[i + 1];
          return <line key={i} x1={s.cx} y1={s.cy} x2={n.cx} y2={n.cy} stroke={accent} strokeWidth={2} strokeOpacity={0.28} strokeLinecap="round" />;
        })}

        {/* platforms, each with a floating data block */}
        {STAGES.map((s, i) => (
          <g key={i}>
            <IsoBlock cx={s.cx} cy={s.cy} accent={accent} />
            <motion.g
              animate={reduced ? undefined : { y: [0, -6, 0] }}
              transition={{ duration: 3, delay: i * 0.4, repeat: Infinity, ease: "easeInOut" }}
            >
              <IsoBlock cx={s.cx} cy={s.cy - 52} accent={accent} w={W * 0.5} h={H * 0.5} bh={10} />
            </motion.g>
          </g>
        ))}

        {/* single packet flowing the full chain */}
        {!reduced && (
          <motion.circle
            r={4.5}
            fill="#fff"
            initial={{ cx: STAGES[0].cx, cy: STAGES[0].cy, opacity: 0 }}
            animate={{
              cx: [STAGES[0].cx, STAGES[1].cx, STAGES[2].cx],
              cy: [STAGES[0].cy, STAGES[1].cy, STAGES[2].cy],
              opacity: [0, 1, 1, 0],
            }}
            transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 0.4, ease: "easeInOut" }}
            style={{ filter: `drop-shadow(0 0 6px ${accent})` }}
          />
        )}
      </svg>
    </div>
  );
}
