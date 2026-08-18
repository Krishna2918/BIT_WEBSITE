import { createFileRoute } from "@tanstack/react-router";
import { LegacyInsightPage } from "@/components/site/legacy-insight-page";
import { getInsight } from "@/data/insights";
import { SITE } from "@/lib/site";

const title = "How to Choose a Managed IT Services Provider";
const insight = getInsight("managed-it-time")!;
export const Route = createFileRoute("/how-to-choose-a-managed-it-services-provider")({
  component: () => <LegacyInsightPage title={title} insight={insight} />,
  head: () => ({ links: [{ rel: "canonical", href: `${SITE.url}/how-to-choose-a-managed-it-services-provider/` }], meta: [{ title: `${title} — BIT Solution` }, { name: "description", content: insight.excerpt }] }),
});
