import { Link } from "@tanstack/react-router";
import type { Industry, IndustryPillar } from "@/data/industries";
import { INDUSTRIES } from "@/data/industries";
import { clientsFor } from "@/data/clients";

export function IndustryPage({ industry }: { industry: Industry }) {
  const others = INDUSTRIES.filter((item) => item.slug !== industry.slug);
  const software = industry.pillars.find((p) => p.key === "software");
  const hardware = industry.pillars.find((p) => p.key === "hardware");
  const clients = clientsFor(industry.slug);

  return (
    <main className="bg-bg">
      <section className="px-5 pb-8 pt-16 text-center">
        <p className="mb-2 text-[12px] font-medium uppercase tracking-[0.14em] text-link">
          Sectors
        </p>
        <p className="compliance-bar" aria-label="Applicable compliance">
          {industry.compliance.join(" · ")}
        </p>
        <h1 className="mt-3 text-[40px] font-semibold leading-none tracking-[-0.03em] text-ink sm:text-[56px]">
          {industry.name}.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[19px] leading-snug text-muted sm:text-[21px]">
          {industry.line}
        </p>
        <p className="mx-auto mt-3 max-w-xl text-[14px] leading-relaxed text-muted">
          {industry.complianceNote}
        </p>
        {clients.length > 0 ? <ClientTicker clients={clients} /> : null}
      </section>

      <img
        src={industry.image}
        alt={industry.imageAlt}
        className="mx-auto w-full max-w-5xl px-5"
      />

      <section className="mx-auto grid max-w-5xl gap-3 px-5 pt-3 sm:grid-cols-2">
        {software ? (
          <img
            src={software.image}
            alt={software.imageAlt}
            className="aspect-[16/10] w-full object-cover"
          />
        ) : null}
        {hardware ? (
          <img
            src={hardware.image}
            alt={hardware.imageAlt}
            className="aspect-[16/10] w-full object-cover"
          />
        ) : null}
      </section>

      <section className="mx-auto max-w-2xl px-5 py-14 text-center sm:text-left">
        <h2 className="text-[28px] font-semibold tracking-[-0.02em] text-ink">
          How BIT governs it
        </h2>
        <p className="mt-3 text-[17px] leading-relaxed text-muted">{industry.govern}</p>
        {industry.tools.length > 0 ? (
          <div className="industry-tools">
            <p className="industry-tools-label">Software already on the floor</p>
            <ul>
              {industry.tools.map((tool) => (
                <li key={tool}>{tool}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <section className="bg-bg-muted px-5 py-16">
        <div className="mx-auto max-w-5xl">
          <p className="mb-2 text-center text-[12px] font-medium uppercase tracking-[0.14em] text-link">
            Software · Hardware · AI · Security
          </p>
          <h2 className="mb-10 text-center text-[32px] font-semibold tracking-[-0.03em] text-ink sm:text-[40px]">
            How BIT runs it.
          </h2>
          <div className="grid gap-10 md:grid-cols-2">
            {industry.pillars.map((pillar) => (
              <PillarCard key={pillar.key} industry={industry} pillar={pillar} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 text-center">
        <p className="text-[21px] text-ink">Your ONE stop IT solution.</p>
        <p className="mt-1 text-[17px] text-muted">
          Software, hardware, AI, and security — under one flag.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-6 text-[17px]">
          <Link to="/software" className="text-link no-underline hover:underline">
            Software ›
          </Link>
          <Link to="/hardware" className="text-link no-underline hover:underline">
            Hardware ›
          </Link>
          <Link to="/ai" className="text-link no-underline hover:underline">
            AI ›
          </Link>
          <Link to="/security" className="text-link no-underline hover:underline">
            Security ›
          </Link>
        </div>
      </section>

      <section className="border-t border-hairline px-5 py-12">
        <div className="mx-auto flex max-w-5xl flex-wrap justify-center gap-x-5 gap-y-2">
          {others.map((item) => (
            <Link
              key={item.slug}
              to="/industries/$slug"
              params={{ slug: item.slug }}
              className="text-[13px] text-muted no-underline hover:text-ink hover:underline"
            >
              {item.name}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

function ClientTicker({
  clients,
}: {
  clients: ReturnType<typeof clientsFor>;
}) {
  const names = clients.map((c) => c.name);
  const pad = [...names];
  while (pad.length < 8) pad.push(...names);
  const loop = [...pad, ...pad];
  return (
    <div className="client-ticker">
      <p>Who trusts us. Who we trust.</p>
      <div className="client-ticker-mask">
        <ul>
          {loop.map((name, i) => (
            <li key={`${name}-${i}`}>{name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function PillarCard({
  industry,
  pillar,
}: {
  industry: Industry;
  pillar: IndustryPillar;
}) {
  return (
    <article className="bg-bg px-5 pb-8 pt-6">
      <img
        src={pillar.image}
        alt={pillar.imageAlt}
        className="mb-5 aspect-[16/10] w-full object-cover object-center"
      />
      <h3 className="text-[24px] font-semibold tracking-[-0.02em] text-ink">
        {pillar.title}
      </h3>
      {pillar.key === "software" && industry.tools.length > 0 ? (
        <ul className="industry-tool-row" aria-label={`Top ${industry.name} software`}>
          {industry.tools.map((tool) => (
            <li key={tool}>{tool}</li>
          ))}
        </ul>
      ) : null}
      <p className="mt-3 text-[16px] leading-relaxed text-muted">{pillar.pain}</p>
      <p className="mt-3 text-[16px] leading-relaxed text-ink">{pillar.solve}</p>
      <Link
        to={pillar.to}
        className="mt-4 inline-block text-[16px] text-link no-underline hover:underline"
      >
        {pillar.title} ›
      </Link>
    </article>
  );
}
