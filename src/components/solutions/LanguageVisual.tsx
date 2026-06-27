import { m } from "motion/react";

import type { VisualProps } from "./types";

/* Knowledge lines with a retrieval highlight sweeping through, resolving to a
   generated answer. Language AI (NLP / RAG). */

const LINES = [
  { y: 72, w: 180 },
  { y: 92, w: 232 },
  { y: 112, w: 150 },
  { y: 146, w: 210 },
  { y: 166, w: 176 },
  { y: 186, w: 120 },
];

export function LanguageVisual({ accent, reduced }: VisualProps) {
  return (
    <div className="absolute inset-0">
      <svg viewBox="0 0 480 270" preserveAspectRatio="xMidYMid meet" className="h-full w-full">
        {LINES.map((l, i) => (
          <rect key={i} x={134} y={l.y} width={l.w} height={8} rx={4} fill={accent} fillOpacity={0.22} />
        ))}

        {!reduced && (
          <m.rect
            x={124}
            width={244}
            height={20}
            rx={6}
            fill={accent}
            fillOpacity={0.16}
            animate={{ y: [62, 182] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        {/* resolved answer */}
        <m.rect
          x={134}
          y={214}
          height={9}
          rx={4.5}
          fill={accent}
          animate={reduced ? { width: 156 } : { width: [0, 156] }}
          transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 1.8, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 5px ${accent})` }}
        />
      </svg>
    </div>
  );
}
