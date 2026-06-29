import { APP_GLOBAL_PROVIDERS } from "@/setup/providers";
import { APP_ROUTES } from "@/setup/routes";
import { RgoProviders } from "@rgo/front-ui";
import React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, type RouteObject, RouterProvider } from "react-router";
import "./main.css";

// Marker change for PR check validation.

// dev-only console filter for Emotion's nth-child SSR warning
if (import.meta.env?.DEV) {
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    const first = args[0];
    if (
      typeof first === "string" &&
      first.includes('The pseudo class ":nth-child" is potentially unsafe when doing server-side rendering')
    ) {
      return;
    }
    originalError(...args);
  };
}

const router = createBrowserRouter(APP_ROUTES as RouteObject[]);

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RgoProviders list={APP_GLOBAL_PROVIDERS}>
      <RouterProvider router={router} />
    </RgoProviders>
  </React.StrictMode>,
);
