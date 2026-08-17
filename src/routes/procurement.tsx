import { createFileRoute } from "@tanstack/react-router";
import { ExtraPage } from "@/components/site/extra-page";
import { getExtra } from "@/data/extras";

const extra = getExtra("procurement")!;

export const Route = createFileRoute("/procurement")({
  component: () => <ExtraPage extra={extra} />,
  head: () => ({
    meta: [
      { title: "Procurement — BIT Solution" },
      { name: "description", content: extra.line },
    ],
  }),
});
