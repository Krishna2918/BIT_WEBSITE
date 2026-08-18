import { createFileRoute } from "@tanstack/react-router";
import { LegacyInsightPage } from "@/components/site/legacy-insight-page";
import { getInsight } from "@/data/insights";
import { SITE } from "@/lib/site";

const title = "Cyber Security Tips for Small Businesses";
const insight = getInsight("cyber-mistakes")!;
export const Route = createFileRoute("/cyber-security-tips-for-small-businesses")({
  component: () => <LegacyInsightPage title={title} insight={insight} />,
  head: () => ({ links: [{ rel: "canonical", href: `${SITE.url}/cyber-security-tips-for-small-businesses/` }], meta: [{ title: `${title} — BIT Solution` }, { name: "description", content: insight.excerpt }] }),
});
