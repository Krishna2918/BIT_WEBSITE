import { createFileRoute } from "@tanstack/react-router";
import { LegacyPreservedPage } from "@/components/site/legacy-preserved-page";
import { LEGACY_PAGES } from "@/data/legacy-pages";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/solutions")({
  component: () => <LegacyPreservedPage page={LEGACY_PAGES.solutions} />,
  head: () => ({
    links: [{ rel: "canonical", href: `${SITE.url}/solutions/` }],
    meta: [{ title: "Solutions — BIT Solution" }, { name: "description", content: LEGACY_PAGES.solutions.summary }],
  }),
});
