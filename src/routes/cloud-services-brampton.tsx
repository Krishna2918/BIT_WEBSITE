import { createFileRoute } from "@tanstack/react-router";
import { legacyRoute } from "@/lib/legacy-route";

export const Route = createFileRoute("/cloud-services-brampton")(
  legacyRoute("/cloud-services-brampton"),
);
