import { createFileRoute } from "@tanstack/react-router";
import { ExtraPage } from "@/components/site/extra-page";
import { getExtra } from "@/data/extras";
import { pageHead } from "@/lib/seo";

const extra = getExtra("digital-marketing")!;

export const Route = createFileRoute("/digital-marketing")({
  component: () => <ExtraPage extra={extra} />,
  head: () => pageHead("/digital-marketing"),
});
