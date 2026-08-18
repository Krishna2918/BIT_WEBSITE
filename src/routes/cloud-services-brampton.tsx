import { createFileRoute } from "@tanstack/react-router";
import { LegacyPreservedPage } from "@/components/site/legacy-preserved-page";
import { LEGACY_PAGES } from "@/data/legacy-pages";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/cloud-services-brampton")({
  component: () => <LegacyPreservedPage page={LEGACY_PAGES.cloud} />,
  head: () => ({
    links: [{ rel: "canonical", href: `${SITE.url}/cloud-services-brampton/` }],
    meta: [{ title: "Cloud Services Brampton — BIT Solution" }, { name: "description", content: LEGACY_PAGES.cloud.summary }],
  }),
});
