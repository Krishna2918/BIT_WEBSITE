import { createFileRoute } from "@tanstack/react-router";
import { LegacyInsightPage } from "@/components/site/legacy-insight-page";
import { getInsight } from "@/data/insights";
import { SITE } from "@/lib/site";

const title = "Top 7 Cyber Security Solutions Every Business Needs in 2025";
const insight = getInsight("protect-your-business")!;
export const Route = createFileRoute("/top-7-cyber-security-solutions-every-business-needs-in-2025")({
  component: () => <LegacyInsightPage title={title} insight={insight} />,
  head: () => ({ links: [{ rel: "canonical", href: `${SITE.url}/top-7-cyber-security-solutions-every-business-needs-in-2025/` }], meta: [{ title: `${title} — BIT Solution` }, { name: "description", content: insight.excerpt }] }),
});
