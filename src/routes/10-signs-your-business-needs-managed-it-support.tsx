import { createFileRoute } from "@tanstack/react-router";
import { LegacyInsightPage } from "@/components/site/legacy-insight-page";
import { getInsight } from "@/data/insights";
import { SITE } from "@/lib/site";

const title = "10 Signs Your Business Needs Managed IT Support";
const insight = getInsight("managed-it-time")!;
export const Route = createFileRoute("/10-signs-your-business-needs-managed-it-support")({
  component: () => <LegacyInsightPage title={title} insight={insight} />,
  head: () => ({ links: [{ rel: "canonical", href: `${SITE.url}/10-signs-your-business-needs-managed-it-support/` }], meta: [{ title: `${title} — BIT Solution` }, { name: "description", content: insight.excerpt }] }),
});
