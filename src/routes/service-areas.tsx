import { createFileRoute } from "@tanstack/react-router";
import { OFFICES } from "@/data/locations";
import { ContactActions } from "@/components/site/contact-actions";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/service-areas")({
  component: ServiceAreasPage,
  head: () => pageHead("/service-areas"),
});

function ServiceAreasPage() {
  const ontario = OFFICES.filter((o) => o.region === "ON");
  const more = OFFICES.filter((o) => o.region !== "ON");

  return (
    <main className="bg-bg">
      <section className="page-band">
        <p className="mb-2 text-[12px] font-medium uppercase tracking-[0.14em] text-link">
          Coverage
        </p>
        <h1 className="text-[40px] font-semibold leading-none tracking-[-0.03em] text-ink sm:text-[56px]">
          Entire Ontario.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[17px] leading-relaxed text-muted">
          We run the province from Brampton. Offices and presence pins sit on
          the globe. 425 Veterans Drive is not an address we use.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-5 pb-8">
        <h2 className="mb-4 text-[13px] font-medium uppercase tracking-[0.14em] text-link">
          Ontario
        </h2>
        <ul className="office-list">
          {ontario.map((o) => (
            <li key={o.city}>
              <p className="office-kind">
                {o.kind === "hq" ? "Headquarters" : "Office"}
              </p>
              <h3>{o.city}</h3>
              <p>{o.address}</p>
              <p className="office-note">{o.note}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-3xl px-5 pb-16">
        <h2 className="mb-4 text-[13px] font-medium uppercase tracking-[0.14em] text-link">
          Beyond Ontario
        </h2>
        <ul className="office-list">
          {more.map((o) => (
            <li key={o.city}>
              <p className="office-kind">
                {o.kind === "office" ? "Office" : "Presence"}
              </p>
              <h3>{o.city}</h3>
              <p>{o.address}</p>
              <p className="office-note">{o.note}</p>
            </li>
          ))}
        </ul>
        <div className="mt-12">
          <ContactActions source="service-areas" />
        </div>
      </section>
    </main>
  );
}
