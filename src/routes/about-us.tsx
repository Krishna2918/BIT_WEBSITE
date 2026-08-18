import { createFileRoute } from "@tanstack/react-router";
import { LegacyPreservedPage } from "@/components/site/legacy-preserved-page";
import { LEGACY_PAGES } from "@/data/legacy-pages";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/about-us")({
  component: () => <LegacyPreservedPage page={LEGACY_PAGES.about} />,
  head: () => ({
    links: [{ rel: "canonical", href: `${SITE.url}/about-us/` }],
    meta: [{ title: "About Us — BIT Solution" }, { name: "description", content: LEGACY_PAGES.about.summary }],
  }),
});
