import { m } from "motion/react";

import type { VisualProps } from "./types";

/* One self-drawing trend line with a glowing readout that rides the leading
   edge. Stripped to a single gesture. Analytics. */

const DATA = [40, 32, 50, 44, 60, 54, 76, 70, 96, 88, 116, 134];
const PAD_X = 40;
const BASE_Y = 200;
const TOP_Y = 56;

const xs = (i: number) => PAD_X + (i / (DATA.length - 1)) * (480 - PAD_X * 2);
const ys = (v: number) => BASE_Y - (v / 134) * (BASE_Y - TOP_Y);

const linePath = DATA.map((v, i) => `${i === 0 ? "M" : "L"} ${xs(i).toFixed(1)} ${ys(v).toFixed(1)}`).join(" ");
const areaPath = `${linePath} L ${xs(DATA.length - 1)} ${BASE_Y} L ${xs(0)} ${BASE_Y} Z`;

const lastX = xs(DATA.length - 1);
const lastY = ys(DATA[DATA.length - 1]);

export function AnalyticsVisual({ accent, reduced }: VisualProps) {
  return (
    <div className="absolute inset-0">
      <svg viewBox="0 0 480 270" preserveAspectRatio="xMidYMid meet" className="h-full w-full">
        <defs>
          <linearGradient id="an-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.32" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* baseline */}
        <line x1={PAD_X} y1={BASE_Y} x2={480 - PAD_X} y2={BASE_Y} stroke="#ffffff" strokeOpacity={0.08} />

        <m.path d={areaPath} fill="url(#an-area)" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9, delay: 0.7 }} />
        <m.path
          d={linePath}
          fill="none"
          stroke={accent}
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduced ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.8, ease: "easeInOut" }}
          style={{ filter: `drop-shadow(0 0 6px ${accent}99)` }}
        />

        {/* leading readout */}
        <circle cx={lastX} cy={lastY} r={5} fill="#fff" />
        {!reduced && (
          <m.circle
            cx={lastX}
            cy={lastY}
            r={5}
            fill="none"
            stroke={accent}
            animate={{ r: [5, 16], opacity: [0.85, 0] }}
            transition={{ duration: 1.7, repeat: Infinity, ease: "easeOut" }}
          />
        )}
      </svg>
    </div>
  );
}
