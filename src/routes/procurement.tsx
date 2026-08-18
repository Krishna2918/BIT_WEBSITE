import { createFileRoute } from "@tanstack/react-router";
import { ExtraPage } from "@/components/site/extra-page";
import { getExtra } from "@/data/extras";
import { pageHead } from "@/lib/seo";

const extra = getExtra("procurement")!;

export const Route = createFileRoute("/procurement")({
  component: () => <ExtraPage extra={extra} />,
  head: () => pageHead("/procurement"),
});
