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
        {/* Clear-sky image background */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute inset-0 scale-105 bg-cover bg-center blur-sm"
            style={{ backgroundImage: "url(/textures/sky.jpg)" }}
          />
          <div className="absolute inset-0 bg-white/10" />
        </div>

        {/* Notch navbar, anchored to the top of the hero card */}
        <Navbar />

        <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col px-6">
          {/* Text + 3D */}
          <div className="grid grid-cols-1 flex-1 items-center gap-6 pt-20 sm:gap-10 sm:pt-24 lg:grid-cols-[1fr_1.3fr]">
            {/* Left: copy */}
            <div className="min-w-0 text-center lg:text-left">
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05, ease: [0.2, 0, 0, 1] }}
                className="mx-auto max-w-2xl text-balance font-display text-3xl font-semibold leading-[1.07] tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.25)] sm:text-6xl lg:mx-0 lg:text-7xl"
              >
                Engineering the next generation of AI products
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.12, ease: [0.2, 0, 0, 1] }}
                className="mx-auto mt-4 max-w-md text-balance text-base font-medium leading-relaxed text-white/85 sm:mt-6 sm:text-lg lg:mx-0"
              >
                Stack AI Solutions builds custom AI agents and automation that
                turn your data, tools, and workflows into real business
                outcomes.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.2, ease: [0.2, 0, 0, 1] }}
                className="mt-7 flex justify-center sm:mt-8 lg:justify-start"
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

            {/* Right: 3D logo */}
            <div className="relative order-first h-60 min-w-0 sm:h-96 lg:order-last lg:h-176">
              <Suspense fallback={null}>
                <LogoScene />
              </Suspense>
            </div>
          </div>
        </div>

        {/* Client logo loop, full width */}
        <div className="relative pb-10">
          <p className="px-8 text-left font-mono text-xs uppercase tracking-widest text-white/80">
            Trusted by teams building what&apos;s next
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
