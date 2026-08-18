import { createFileRoute } from "@tanstack/react-router";
import { ExtraPage } from "@/components/site/extra-page";
import { getExtra } from "@/data/extras";
import { canonicalLink } from "@/lib/seo";

const extra = getExtra("procurement")!;

export const Route = createFileRoute("/procurement")({
  component: () => <ExtraPage extra={extra} />,
  head: () => ({
    links: [canonicalLink("/procurement")],
    meta: [
      { title: "Procurement — BIT Solution" },
      { name: "description", content: extra.line },
    ],
  }),
});
