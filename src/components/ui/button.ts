/**
 * Geist-style button class helper. Use on <button> or TanStack <Link>.
 *
 *   primary   — foreground fill + background text (highest emphasis)
 *   secondary — surface fill + tonal border
 *   ghost     — transparent, foreground text
 */
export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-sm font-medium " +
  "whitespace-nowrap transition-[transform,background-color,border-color,color] duration-150 " +
  "outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-background active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-foreground text-background hover:opacity-90",
  secondary: "bg-background text-foreground border border-strong hover:bg-subtle",
  ghost: "bg-transparent text-foreground hover:bg-subtle",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-[15px]",
};

export function buttonClass(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className = "",
): string {
  return [base, variants[variant], sizes[size], className].filter(Boolean).join(" ");
}
