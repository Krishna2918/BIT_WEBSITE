import { createFileRoute, Link } from "@tanstack/react-router";
import { canonicalLink } from "@/lib/seo";

export const Route = createFileRoute("/hardware")({
  component: HardwarePage,
  head: () => ({ links: [canonicalLink("/hardware")] }),
});

const ITEMS = [
  { name: "Cameras", line: "Eyes on site.", image: "/images/home/camera.jpg" },
  { name: "Private servers", line: "The backbone.", image: "/images/hardware/server.jpg" },
  { name: "PCs", line: "Everyday work machines.", image: "/images/hardware/pc.jpg" },
  { name: "Network", line: "Keeps the office connected.", image: "/images/hardware/switch.jpg" },
  { name: "Phones", line: "Clear business calls.", image: "/images/hardware/phone.jpg" },
];

function HardwarePage() {
  return (
    <main className="bg-bg">
      <section className="px-5 pb-8 pt-16 text-center">
        <p className="mb-2 text-[12px] font-medium uppercase tracking-[0.14em] text-link">Hardware</p>
        <h1 className="text-[40px] font-semibold leading-none tracking-[-0.03em] text-ink sm:text-[56px]">
          Software needs machines.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[19px] leading-snug text-muted sm:text-[21px]">
          BIT puts them in place — cameras first, then private servers, then
          everything they connect.
        </p>
      </section>
      <img
        src="/images/home/hardware.jpg"
        alt="Finished BIT office room"
        className="mx-auto w-full max-w-5xl px-5"
      />

      <section className="mx-auto grid max-w-5xl gap-12 px-5 py-16 sm:grid-cols-2">
        {ITEMS.map((item) => (
          <figure key={item.name} className="text-center">
            <img src={item.image} alt="" className="mx-auto h-48 w-auto object-contain sm:h-56" />
            <figcaption className="mt-5">
              <h2 className="text-[24px] font-semibold tracking-[-0.02em] text-ink">{item.name}</h2>
              <p className="mt-1 text-[16px] text-muted">{item.line}</p>
            </figcaption>
          </figure>
        ))}
      </section>

      <section className="bg-bg-muted px-5 py-16 text-center">
        <p className="text-[21px] text-ink">Hardware is one of four parts.</p>
        <div className="mt-5 flex flex-wrap justify-center gap-6 text-[17px]">
          <Link to="/software" className="text-link no-underline hover:underline">
            Software ›
          </Link>
          <Link to="/ai" className="text-link no-underline hover:underline">
            AI ›
          </Link>
          <Link to="/security" className="text-link no-underline hover:underline">
            Security ›
          </Link>
        </div>
      </section>
    </main>
  );
}
