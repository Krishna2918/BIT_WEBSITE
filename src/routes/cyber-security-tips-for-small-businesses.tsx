import { createFileRoute } from "@tanstack/react-router";
import { legacyRoute } from "@/lib/legacy-route";

export const Route = createFileRoute("/cyber-security-tips-for-small-businesses")(
  legacyRoute("/cyber-security-tips-for-small-businesses"),
);
