import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getInsight } from "@/data/insights";
import { ContactActions } from "@/components/site/contact-actions";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/insights/$slug")({
  component: InsightPage,
  loader: ({ params }) => {
    const item = getInsight(params.slug);
    if (!item) throw notFound();
    return item;
  },
  head: ({ loaderData }) => pageHead(`/insights/${loaderData?.slug ?? ""}`),
});

function InsightPage() {
  const item = Route.useLoaderData();
  return (
    <main className="bg-bg">
      <article className="mx-auto max-w-2xl px-5 py-16">
        <p className="mb-2 text-[12px] font-medium uppercase tracking-[0.14em] text-link">
          Insights
        </p>
        <p className="text-[13px] text-muted">{item.date}</p>
        <h1 className="mt-2 text-[clamp(1.8rem,5vw,2.6rem)] font-semibold tracking-[-0.03em] text-ink">
          {item.title}
        </h1>
        {item.body.map((p) => (
          <p key={p} className="mt-5 text-[17px] leading-relaxed text-muted">
            {p}
          </p>
        ))}
        <div className="mt-12 border-t border-hairline pt-8">
          <ContactActions source={`insight-${item.slug}`} />
          <p className="mt-6">
            <Link to="/insights" className="text-[15px] text-link no-underline hover:underline">
              All insights ›
            </Link>
          </p>
        </div>
      </article>
    </main>
  );
}
