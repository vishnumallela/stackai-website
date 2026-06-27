import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import type { Variants } from "motion/react";

import { buttonClass } from "@/components/ui/button";
import LogoLoop from "@/components/LogoLoop";
import { Navbar } from "@/components/Navbar";
import { SolutionsSection } from "@/components/solutions/SolutionsSection";

export const Route = createFileRoute("/")({
  component: HomePage,
});

// Hero headlines, cycled every 4s with a colourful glitch on each swap.
const HERO_TITLES = [
  "Engineering the next generation of AI products",
  "Automating the work that slows your team down",
  "Custom AI agents built for real-world impact",
];

function GlitchTitle() {
  const [index, setIndex] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const id = setInterval(
      () => setIndex((i) => (i + 1) % HERO_TITLES.length),
      4000,
    );
    return () => clearInterval(id);
  }, []);

  const title = HERO_TITLES[index];

  // Apple-style spring with subtle bounce; the incoming line springs up from
  // below while the old one floats off the top — both move at once (no "wait"
  // replace). Blur masks the brief overlap so it reads as one smooth swap.
  // Reduced motion keeps the crossfade but drops all positional movement.
  const variants: Variants = reduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.25 } },
        exit: { opacity: 0, transition: { duration: 0.2 } },
      }
    : {
        initial: { opacity: 0, y: "0.5em", scale: 0.96, filter: "blur(8px)" },
        animate: {
          opacity: 1,
          y: "0em",
          scale: 1,
          filter: "blur(0px)",
          transition: {
            type: "spring",
            duration: 0.75,
            bounce: 0.3,
            opacity: { duration: 0.4, ease: [0.23, 1, 0.32, 1] },
            filter: { duration: 0.45, ease: [0.23, 1, 0.32, 1] },
          },
        },
        exit: {
          opacity: 0,
          y: "-0.4em",
          scale: 0.98,
          filter: "blur(8px)",
          transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] },
        },
      };

  return (
    // Grid stacks both titles in one centered cell so enter + exit can overlap
    // without layout shift; each h1 stays sized to its own text.
    <div className="relative mx-auto grid min-h-[2.2em] w-full max-w-5xl place-items-center">
      <AnimatePresence initial={false}>
        <m.h1
          key={index}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="glitch col-start-1 row-start-1 max-w-5xl text-balance font-display text-4xl font-semibold leading-[1.05] tracking-tight text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.5)] sm:text-6xl lg:text-7xl"
          data-text={title}
        >
          <span className="glitch-base">{title}</span>
        </m.h1>
      </AnimatePresence>
    </div>
  );
}

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
        {/* Hero background — globe (rotated -90deg, pre-rendered) */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute inset-0 scale-105 bg-cover bg-center blur-sm"
            style={{ backgroundImage: "url(/textures/globe-rot.jpg)" }}
          />
          <div className="absolute inset-0 bg-black/35" />
        </div>

        {/* Notch navbar, anchored to the top of the hero card */}
        <Navbar />

        {/* Centered hero copy (3D object removed for now) */}
        <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6 pt-24 pb-6 text-center">
          <GlitchTitle />

          <m.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12, ease: [0.2, 0, 0, 1] }}
            className="mx-auto mt-5 max-w-2xl text-balance text-base font-medium leading-relaxed text-white/90 drop-shadow-[0_1px_10px_rgba(0,0,0,0.5)] sm:mt-6 sm:text-lg"
          >
            We build custom AI agents and automation that turn your data, tools,
            and workflows into real business outcomes.
          </m.p>

          <m.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2, ease: [0.2, 0, 0, 1] }}
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
          </m.div>
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

      {/* ── Solutions (interactive capability console) ── */}
      <SolutionsSection />
    </div>
  );
}
