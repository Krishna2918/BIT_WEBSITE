import { createFileRoute } from "@tanstack/react-router";
import { LegacyInsightPage } from "@/components/site/legacy-insight-page";
import { getInsight } from "@/data/insights";
import { SITE } from "@/lib/site";

const title = "5 Biggest Benefits of Cloud Backups";
const insight = getInsight("why-cloud-backup")!;
export const Route = createFileRoute("/5-biggest-benefits-of-cloud-backups")({
  component: () => <LegacyInsightPage title={title} insight={insight} />,
  head: () => ({ links: [{ rel: "canonical", href: `${SITE.url}/5-biggest-benefits-of-cloud-backups/` }], meta: [{ title: `${title} — BIT Solution` }, { name: "description", content: insight.excerpt }] }),
});
