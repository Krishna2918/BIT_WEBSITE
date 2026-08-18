import { createFileRoute } from "@tanstack/react-router";
import { LegacyPreservedPage } from "@/components/site/legacy-preserved-page";
import { LEGACY_PAGES } from "@/data/legacy-pages";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/accessibility-statement")({
  component: () => <LegacyPreservedPage page={LEGACY_PAGES.accessibility} />,
  head: () => ({
    links: [{ rel: "canonical", href: `${SITE.url}/accessibility-statement/` }],
    meta: [{ title: "Accessibility statement — BIT Solution" }, { name: "description", content: LEGACY_PAGES.accessibility.summary }],
  }),
});
