import { createRootRoute, Outlet } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { LazyMotion, domMax } from "motion/react";

import { VoiceProvider } from "@/lib/voice";

// Router devtools are loaded lazily and only in development.
const TanStackRouterDevtools = import.meta.env.PROD
  ? () => null
  : lazy(() =>
      import("@tanstack/react-router-devtools").then((m) => ({
        default: m.TanStackRouterDevtools,
      })),
    );

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <VoiceProvider>
      {/* LazyMotion + `m` components keep the full Motion feature set out of the
          bundle; domMax covers layout animations (Navbar notch/rail). */}
      <LazyMotion features={domMax}>
        <div className="flex min-h-dvh flex-col overflow-x-hidden antialiased">
          <main className="flex-1">
            <Outlet />
          </main>
          <Suspense>
            <TanStackRouterDevtools position="bottom-right" />
          </Suspense>
        </div>
      </LazyMotion>
    </VoiceProvider>
  );
}
