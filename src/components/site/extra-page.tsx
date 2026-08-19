import { Link } from "@tanstack/react-router";
import type { ExtraService } from "@/data/extras";
import { EXTRAS } from "@/data/extras";
import { ContactActions } from "@/components/site/contact-actions";

export function ExtraPage({ extra }: { extra: ExtraService }) {
  const others = EXTRAS.filter((item) => item.slug !== extra.slug);

  return (
    <main className="bg-bg">
      <section className="page-band">
        <p className="mb-2 text-[12px] font-medium uppercase tracking-[0.14em] text-link">
          {extra.kicker}
        </p>
        <h1 className="text-[40px] font-semibold leading-none tracking-[-0.03em] text-ink sm:text-[56px]">
          {extra.name}.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[19px] leading-snug text-muted sm:text-[21px]">
          {extra.line}
        </p>
      </section>
      <section className="mx-auto grid max-w-5xl gap-3 px-5 sm:grid-cols-2">
        <img
          src={extra.image}
          alt={extra.imageAlt}
          className="aspect-[16/10] w-full object-cover"
        />
        <img
          src={extra.supportImage}
          alt={extra.supportAlt}
          className="aspect-[16/10] w-full object-cover"
        />
      </section>
      <section className="mx-auto max-w-2xl px-5 py-16">
        {extra.points.map((p) => (
          <div key={p.title} className="border-t border-hairline py-8">
            <h2 className="text-[28px] font-semibold tracking-[-0.02em] text-ink">
              {p.title}
            </h2>
            <p className="mt-2 text-[17px] leading-relaxed text-muted">{p.body}</p>
          </div>
        ))}
      </section>
      <section className="bg-bg-muted px-5 py-16 text-center">
        <p className="text-[21px] text-ink">Same team. Same flag.</p>
        <p className="mt-1 text-[17px] text-muted">
          Software, hardware, AI, and security sit under this desk too.
        </p>
        <div className="mt-6 flex justify-center">
          <ContactActions source={extra.slug} />
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-6 text-[16px]">
          {others.map((item) => (
            <Link
              key={item.slug}
              to={item.to}
              className="text-link no-underline hover:underline"
            >
              {item.name} ›
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
