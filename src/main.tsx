import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";

import "@fontsource-variable/geist/index.css";
import "@fontsource-variable/geist-mono/index.css";
import "@fontsource-variable/space-grotesk/index.css";
import "@fontsource-variable/fraunces/opsz.css";
import "./styles.css";
import { routeTree } from "./routeTree.gen";

// react-grab (by Aiden Bai): click any UI element + ⌘C / Ctrl+C to copy its
// source location for your coding agent. Dev-only — never ships to production.
if (import.meta.env.DEV) {
  import("react-grab");
}

// Create a new router instance.
const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultViewTransition: true,
  scrollRestoration: true,
});

// Register the router instance for type safety.
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  createRoot(rootElement).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
}
