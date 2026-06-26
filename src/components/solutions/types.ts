import type { FC } from "react";

export type VisualProps = {
  /** Per-solution accent color (hex). */
  accent: string;
  /** True when the user prefers reduced motion — skip looping animations. */
  reduced: boolean;
};

export type SolutionVisual = FC<VisualProps>;
