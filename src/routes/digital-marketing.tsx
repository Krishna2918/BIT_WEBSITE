import { createFileRoute } from "@tanstack/react-router";
import { ExtraPage } from "@/components/site/extra-page";
import { getExtra } from "@/data/extras";

const extra = getExtra("digital-marketing")!;

export const Route = createFileRoute("/digital-marketing")({
  component: () => <ExtraPage extra={extra} />,
  head: () => ({
    meta: [
      { title: "Digital marketing — BIT Solution" },
      { name: "description", content: extra.line },
    ],
  }),
});
