import { Link } from "@tanstack/react-router";
import { ContactActions } from "@/components/site/contact-actions";
import type { Insight } from "@/data/insights";

export function LegacyInsightPage({ title, insight }: { title: string; insight: Insight }) {
  return (
    <main className="bg-bg">
      <article className="mx-auto max-w-2xl px-5 py-16">
        <p className="mb-2 text-[12px] font-medium uppercase tracking-[0.14em] text-link">
          Insights
        </p>
        <p className="text-[13px] text-muted">{insight.date}</p>
        <h1 className="mt-2 text-[clamp(1.8rem,5vw,2.6rem)] font-semibold tracking-[-0.03em] text-ink">
          {title}
        </h1>
        <p className="mt-5 text-[18px] leading-relaxed text-muted">{insight.excerpt}</p>
        {insight.body.map((paragraph) => (
          <p key={paragraph} className="mt-5 text-[17px] leading-relaxed text-muted">
            {paragraph}
          </p>
        ))}
        <div className="mt-12 border-t border-hairline pt-8">
          <ContactActions source={`legacy-insight-${insight.slug}`} />
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
