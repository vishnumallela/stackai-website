import { m } from "motion/react";

import type { VisualProps } from "./types";

/* Machine perception, distilled: a scan beam sweeps and a single bracket locks
   onto the subject with a crosshair. One idea, no clutter. Computer Vision. */

function Bracket({ x, y, w, h, accent, len, sw }: { x: number; y: number; w: number; h: number; accent: string; len: number; sw: number }) {
  const seg = (px: number, py: number, dx: number, dy: number) => (
    <path d={`M ${px + dx * len} ${py} L ${px} ${py} L ${px} ${py + dy * len}`} stroke={accent} strokeWidth={sw} fill="none" strokeLinecap="round" />
  );
  return (
    <g>
      {seg(x, y, 1, 1)}
      {seg(x + w, y, -1, 1)}
      {seg(x, y + h, 1, -1)}
      {seg(x + w, y + h, -1, -1)}
    </g>
  );
}

export function VisionVisual({ accent, reduced }: VisualProps) {
  return (
    <div className="absolute inset-0">
      <svg viewBox="0 0 480 270" preserveAspectRatio="xMidYMid meet" className="h-full w-full">
        <defs>
          <linearGradient id="cv-scan" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0" />
            <stop offset="100%" stopColor={accent} stopOpacity="0.5" />
          </linearGradient>
        </defs>

        {/* primary lock-on bracket */}
        <m.g
          style={{ transformOrigin: "240px 135px" }}
          animate={reduced ? undefined : { scale: [1.04, 1, 1.04], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <Bracket x={158} y={73} w={164} h={124} accent={accent} len={24} sw={2.4} />
        </m.g>

        {/* secondary subject */}
        <g opacity={0.4}>
          <Bracket x={318} y={150} w={74} h={58} accent={accent} len={13} sw={1.6} />
        </g>

        {/* crosshair */}
        <g stroke={accent} strokeWidth={1.3} strokeLinecap="round" opacity={0.8}>
          <circle cx={240} cy={135} r={4.5} fill="none" />
          <line x1={240} y1={113} x2={240} y2={126} />
          <line x1={240} y1={144} x2={240} y2={157} />
          <line x1={218} y1={135} x2={231} y2={135} />
          <line x1={249} y1={135} x2={262} y2={135} />
        </g>

        {/* scan beam */}
        {!reduced && (
          <m.g animate={{ y: [-52, 270] }} transition={{ duration: 3.4, repeat: Infinity, ease: "linear" }}>
            <rect x={0} y={0} width={480} height={52} fill="url(#cv-scan)" />
            <line x1={0} y1={52} x2={480} y2={52} stroke={accent} strokeWidth={1.5} strokeOpacity={0.9} />
          </m.g>
        )}
      </svg>
    </div>
  );
}
