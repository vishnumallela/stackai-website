import { createRootRoute, Outlet } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

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
      <div className="flex min-h-dvh flex-col overflow-x-hidden antialiased">
        <main className="flex-1">
          <Outlet />
        </main>
        <Suspense>
          <TanStackRouterDevtools position="bottom-right" />
        </Suspense>
      </div>
    </VoiceProvider>
  );
}
