import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { motion } from "motion/react";

import { buttonClass } from "@/components/ui/button";
import LogoLoop from "@/components/LogoLoop";
import { Navbar } from "@/components/Navbar";

const LogoScene = lazy(() =>
  import("@/components/LogoScene").then((m) => ({ default: m.LogoScene })),
);

export const Route = createFileRoute("/")({
  component: HomePage,
});

const CLIENT_LOGOS = [
  { src: "/client-logos/acrodocz.webp", alt: "Acrodocz" },
  { src: "/client-logos/biba.png", alt: "Biba" },
  { src: "/client-logos/khaitan.png", alt: "Khaitan Public School" },
  { src: "/client-logos/intalent.webp", alt: "Intalent" },
  { src: "/client-logos/prabhanews.webp", alt: "Prabha News" },
  { src: "/client-logos/propertybox.png", alt: "PropertyBox" },
  { src: "/client-logos/quellr.png", alt: "Quellr" },
  { src: "/client-logos/rahee.png", alt: "Rahee" },
  { src: "/client-logos/renuka.png", alt: "Renuka" },
  { src: "/client-logos/theranow.png", alt: "TheraNow" },
  { src: "/client-logos/cropped-logo-2B.png", alt: "Client" },
];

function HomePage() {
  return (
    <div className="dotted bg-background p-4 sm:p-6">
      {/* ── Hero (gradient framed by a white dotted cutout) ── */}
      <section className="relative flex min-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-3xl bg-black shadow-[0_24px_70px_-20px_rgba(0,0,0,0.45)] sm:min-h-[calc(100dvh-3rem)]">
        {/* Hero background image */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute inset-0 scale-105 bg-cover bg-center blur-sm"
            style={{ backgroundImage: "url(/textures/bg.jpg)" }}
          />
          <div className="absolute inset-0 bg-black/25" />
        </div>

        {/* Notch navbar, anchored to the top of the hero card */}
        <Navbar />

        {/* 3D object — zoomed & slanted, overflowing the right edge; BEHIND the text */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-1/2 right-[-22%] h-[170%] w-[95%] -translate-y-1/2 rotate-[-14deg] sm:right-[-8%] sm:w-[70%]">
            <Suspense fallback={null}>
              <LogoScene />
            </Suspense>
          </div>
        </div>

        {/* Text — centered, above the 3D */}
        <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-6 pt-24 pb-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }}
            className="mx-auto max-w-3xl text-balance font-display text-4xl font-semibold leading-[1.04] tracking-tight text-white drop-shadow-[0_2px_22px_rgba(0,0,0,0.65)] sm:text-6xl lg:text-7xl"
          >
            Engineering the next generation of AI products
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease: [0.2, 0, 0, 1] }}
            className="mx-auto mt-6 max-w-xl text-balance text-base font-medium leading-relaxed text-white/90 drop-shadow-[0_1px_12px_rgba(0,0,0,0.6)] sm:text-lg"
          >
            Stack AI Solutions builds custom AI agents and automation that turn
            your data, tools, and workflows into real business outcomes.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.2, 0, 0, 1] }}
            className="mt-8 flex justify-center"
          >
            <a
              href="#"
              className={buttonClass(
                "primary",
                "lg",
                "w-full max-w-xs bg-white text-black hover:bg-white/90 sm:w-auto sm:max-w-none",
              )}
            >
              Book a demo
            </a>
          </motion.div>
        </div>

        {/* Client logo loop, full width */}
        <div className="relative pb-10">
          <p className="px-8 text-left font-mono text-xs uppercase tracking-widest text-white/80">
            Partners growing with us
          </p>
          <div className="relative mt-8 [&_img]:brightness-0 [&_img]:invert">
            <LogoLoop
              logos={CLIENT_LOGOS}
              speed={55}
              direction="left"
              logoHeight={30}
              gap={56}
              scaleOnHover
              pauseOnHover
              ariaLabel="Our clients"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
