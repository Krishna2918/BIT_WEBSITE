import { createRouter } from "@tanstack/react-router";
import { AppErrorComponent } from "@/lib/error-component";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  return createRouter({
    routeTree,
    defaultErrorComponent: AppErrorComponent,
    // Preserve the requested form so legacy trailing-slash URLs can remain
    // direct 200s instead of gaining a framework normalization hop.
    trailingSlash: "preserve",
  });
}
