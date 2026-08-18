import { createFileRoute } from "@tanstack/react-router";
import { ExtraPage } from "@/components/site/extra-page";
import { getExtra } from "@/data/extras";
import { canonicalLink } from "@/lib/seo";

const extra = getExtra("voip")!;

export const Route = createFileRoute("/voip")({
  component: () => <ExtraPage extra={extra} />,
  head: () => ({
    links: [canonicalLink("/voip")],
    meta: [
      { title: "VoIP & phones — BIT Solution" },
      { name: "description", content: extra.line },
    ],
  }),
});
