import { createFileRoute, Link } from "@tanstack/react-router";
import { INSIGHTS } from "@/data/insights";
import { canonicalLink } from "@/lib/seo";

export const Route = createFileRoute("/insights/")({
  component: InsightsIndex,
  head: () => ({
    links: [canonicalLink("/insights")],
    meta: [
      { title: "Insights — BIT Solution" },
      {
        name: "description",
        content:
          "Notes from BIT Solution on cloud, backup, managed IT, and security for Ontario businesses.",
      },
    ],
  }),
});

function InsightsIndex() {
  return (
    <main className="bg-bg">
      <section className="px-5 pb-10 pt-16 text-center">
        <p className="mb-2 text-[12px] font-medium uppercase tracking-[0.14em] text-link">
          Insights
        </p>
        <h1 className="text-[40px] font-semibold leading-none tracking-[-0.03em] text-ink sm:text-[56px]">
          From the floor.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[17px] leading-relaxed text-muted">
          Short notes. No scare numbers. The longer posts still live on
          bitsolution.ca if you want the archive.
        </p>
      </section>
      <section className="mx-auto max-w-2xl px-5 pb-20">
        {INSIGHTS.map((item) => (
          <article key={item.slug} className="border-t border-hairline py-8">
            <p className="text-[12px] text-muted">{item.date}</p>
            <h2 className="mt-1 text-[24px] font-semibold tracking-[-0.02em] text-ink">
              <Link
                to="/insights/$slug"
                params={{ slug: item.slug }}
                className="text-ink no-underline hover:underline"
              >
                {item.title}
              </Link>
            </h2>
            <p className="mt-2 text-[16px] leading-relaxed text-muted">{item.excerpt}</p>
            <Link
              to="/insights/$slug"
              params={{ slug: item.slug }}
              className="mt-3 inline-block text-[16px] text-link no-underline hover:underline"
            >
              Read ›
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
