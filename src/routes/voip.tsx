import { createFileRoute } from "@tanstack/react-router";
import { ExtraPage } from "@/components/site/extra-page";
import { getExtra } from "@/data/extras";

const extra = getExtra("voip")!;

export const Route = createFileRoute("/voip")({
  component: () => <ExtraPage extra={extra} />,
  head: () => ({
    meta: [
      { title: "VoIP & phones — BIT Solution" },
      { name: "description", content: extra.line },
    ],
  }),
});
