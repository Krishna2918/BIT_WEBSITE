import { createFileRoute } from "@tanstack/react-router";
import { ExtraPage } from "@/components/site/extra-page";
import { getExtra } from "@/data/extras";
import { canonicalLink } from "@/lib/seo";

const extra = getExtra("digital-marketing")!;

export const Route = createFileRoute("/digital-marketing")({
  component: () => <ExtraPage extra={extra} />,
  head: () => ({
    links: [canonicalLink("/digital-marketing")],
    meta: [
      { title: "Digital marketing — BIT Solution" },
      { name: "description", content: extra.line },
    ],
  }),
});
