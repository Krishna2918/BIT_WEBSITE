import { createFileRoute } from "@tanstack/react-router";
import { legacyRoute } from "@/lib/legacy-route";

export const Route = createFileRoute("/accessibility-statement")(
  legacyRoute("/accessibility-statement"),
);
