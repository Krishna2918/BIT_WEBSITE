import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type ComponentType } from "react";
import { CoverReel } from "@/components/site/cover-reel";
import { HeroGlobeActions } from "@/components/site/ask-ai";
import { ContactActions } from "@/components/site/contact-actions";
import { GalleryGrid } from "@/components/site/gallery-grid";
import { PARTNERS } from "@/data/partners";
import { EXTRAS } from "@/data/extras";
import { TESTIMONIALS } from "@/data/testimonials";
import { FAQS } from "@/data/faqs";
import { INSIGHTS } from "@/data/insights";
import { GALLERY_HOME } from "@/data/gallery";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/")({ component: Home });

const PILLARS = [
  {
    to: "/software" as const,
    title: "Software",
    line: "Modern systems that keep the work moving.",
    image: "/images/home/software.jpg",
    alt: "Laptop showing a clean business dashboard",
  },
  {
    to: "/hardware" as const,
    title: "Hardware",
    line: "Cameras, private servers, and the machines that hold it all.",
    image: "/images/home/hardware.jpg",
    alt: "Assembled office with rack, desk, and camera",
  },
  {
    to: "/ai" as const,
    title: "AI",
    line: "Help that’s there 24/7. Human when it matters.",
    image: "/images/home/ai.jpg",
    video: "/videos/ai.mp4",
    alt: "Ice-blue crystal field under moving light",
  },
  {
    to: "/security" as const,
    title: "Security",
    line: "The layer that holds the rest.",
    image: "/images/home/security.jpg",
    video: "/videos/security.mp4",
    alt: "Glass security shell turning in a white studio",
  },
];

const globeMod = import("@/components/globe/globe-scene");

function Home() {
  const [Scene, setScene] = useState<ComponentType | null>(null);

  useEffect(() => {
    let cancelled = false;
    void globeMod.then((mod) => {
      if (!cancelled) setScene(() => mod.GlobeScene);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main>
      <section className="hero-frame">
        <div className="relative z-10 px-5 pb-8 pt-8 text-center sm:pb-10 sm:pt-12">
          <h1 className="hero-lockup">
            <img
              className="hero-official"
              src="/images/bit-lockup-official.png"
              alt="BIT Solution — Delivering your technology solutions"
              width={1914}
              height={383}
            />
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-[17px] font-medium tracking-[-0.015em] text-ink sm:text-[20px]">
            Intelligent Infrastructure, Custom B2B Software & AI Workflows —
            Under One Flag.
          </p>
          <p className="mx-auto mt-2 max-w-lg text-[15px] leading-snug text-muted sm:text-[17px]">
            Your ONE stop IT solution. Across all of Ontario — from Brampton HQ
            to every site we run.
          </p>
          <div className="cta-pair mt-4 mb-1">
            <Link to="/consult" className="cta-book">
              Book consultation
            </Link>
            <a href="tel:+19058676574" className="cta-ghost callrail rTapNumber">
              +1 905-867-6574
            </a>
          </div>
        </div>
        <div className="hero-globe">
          <video
            className="hero-globe-bg"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/images/globe-studio-poster.jpg"
            aria-hidden
          >
            <source src="/videos/globe-studio.mp4" type="video/mp4" />
          </video>
          {Scene ? <Scene /> : null}
          <div className="hero-ask-wrap">
            <HeroGlobeActions />
          </div>
        </div>
      </section>

      <CoverReel />

      <section id="gallery" className="border-t border-hairline bg-bg px-5 py-16">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 text-center text-[12px] font-medium uppercase tracking-[0.16em] text-link">
            Gallery
          </p>
          <h2 className="text-center text-[clamp(1.5rem,4.5vw,2.25rem)] font-semibold tracking-[-0.03em] text-ink">
            The floors we walk.
          </h2>
          <p className="mx-auto mt-2 mb-8 max-w-xl text-center text-[16px] leading-snug text-muted">
            Hardware, sectors, and the desk. Click a photo to open it.
          </p>
          <GalleryGrid items={GALLERY_HOME} />
          <p className="mt-8 text-center">
            <Link to="/gallery" className="text-[16px] text-link no-underline hover:underline">
              Full gallery ›
            </Link>
          </p>
        </div>
      </section>

      <section id="partners" className="border-t border-hairline bg-bg-muted px-5 py-16">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 text-center text-[12px] font-medium uppercase tracking-[0.16em] text-link">
            Who we partner with
          </p>
          <h2 className="text-center text-[clamp(1.5rem,4.5vw,2.25rem)] font-semibold tracking-[-0.03em] text-ink">
            The stack behind the stack.
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-[16px] leading-snug text-muted">
            Microsoft Cloud Solution Provider. CRTC regulated wholesaler.
            Product solutions from every major IT vendor — the same names on
            bitsolution.ca — with government pricing when the job needs it.
          </p>
          <ul className="partner-field">
            {PARTNERS.map((p) => (
              <li key={p.slug}>
                <img src={p.logo} alt={p.name} />
                <span>{p.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="pillars" className="border-t border-hairline bg-bg px-5 py-16">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 text-center text-[12px] font-medium uppercase tracking-[0.16em] text-link">
            Four parts. One flag.
          </p>
          <h2 className="text-center text-[clamp(1.5rem,4.5vw,2.25rem)] font-semibold tracking-[-0.03em] text-ink">
            Software. Hardware. AI. Security.
          </h2>
          <p className="mx-auto mt-2 mb-8 max-w-xl text-center text-[16px] leading-snug text-muted">
            Pick a door. Each one is the same team.
          </p>
          <div className="pillar-grid">
            {PILLARS.map((tile) => (
              <Link key={tile.to} to={tile.to} className="pillar-tile">
                {"video" in tile && tile.video ? (
                  <video
                    className="pillar-tile-media"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    poster={tile.image}
                    aria-hidden
                  >
                    <source src={tile.video} type="video/mp4" />
                  </video>
                ) : (
                  <img src={tile.image} alt={tile.alt} />
                )}
                <div className="pillar-tile-body">
                  <h3>{tile.title}</h3>
                  <p>{tile.line}</p>
                  <span>Learn more ›</span>
                </div>
              </Link>
            ))}
          </div>
          <div className="extra-grid">
            {EXTRAS.map((item) => (
              <Link key={item.slug} to={item.to} className="pillar-tile extra-tile">
                <img src={item.image} alt={item.imageAlt} />
                <div className="pillar-tile-body">
                  <p className="extra-kicker">{item.kicker}</p>
                  <h3>{item.name}</h3>
                  <p>{item.line}</p>
                  <span>Learn more ›</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="proof" className="border-t border-hairline bg-bg-muted px-5 py-16">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 text-center text-[12px] font-medium uppercase tracking-[0.16em] text-link">
            Clients
          </p>
          <h2 className="text-center text-[clamp(1.5rem,4.5vw,2.25rem)] font-semibold tracking-[-0.03em] text-ink">
            Two people, in their words.
          </h2>
          <p className="mx-auto mt-2 mb-8 max-w-xl text-center text-[16px] leading-snug text-muted">
            Only the quotes already on bitsolution.ca. We do not write reviews.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {TESTIMONIALS.map((t) => (
              <figure key={t.name} className="quote-card">
                <blockquote>{t.quote}</blockquote>
                <figcaption>
                  <strong>{t.name}</strong>
                  {t.role ? <span>{t.role}</span> : null}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="border-t border-hairline bg-bg px-5 py-16">
        <div className="mx-auto max-w-2xl">
          <p className="mb-3 text-center text-[12px] font-medium uppercase tracking-[0.16em] text-link">
            FAQs
          </p>
          <h2 className="text-center text-[clamp(1.5rem,4.5vw,2.25rem)] font-semibold tracking-[-0.03em] text-ink">
            Before you call.
          </h2>
          <div className="mt-8">
            {FAQS.map((item) => (
              <details key={item.q} className="faq-item">
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
          <p className="mt-6 text-center">
            <Link to="/faq" className="text-[16px] text-link no-underline hover:underline">
              All FAQs ›
            </Link>
          </p>
        </div>
      </section>

      <section id="insights" className="border-t border-hairline bg-bg-muted px-5 py-16">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 text-center text-[12px] font-medium uppercase tracking-[0.16em] text-link">
            Insights
          </p>
          <h2 className="text-center text-[clamp(1.5rem,4.5vw,2.25rem)] font-semibold tracking-[-0.03em] text-ink">
            From the floor.
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {INSIGHTS.slice(0, 3).map((item) => (
              <article key={item.slug}>
                <p className="text-[12px] text-muted">{item.date}</p>
                <h3 className="mt-1 text-[18px] font-semibold tracking-[-0.02em] text-ink">
                  <Link
                    to="/insights/$slug"
                    params={{ slug: item.slug }}
                    className="text-ink no-underline hover:underline"
                  >
                    {item.title}
                  </Link>
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{item.excerpt}</p>
              </article>
            ))}
          </div>
          <p className="mt-8 text-center">
            <Link to="/insights" className="text-[16px] text-link no-underline hover:underline">
              All insights ›
            </Link>
          </p>
        </div>
      </section>

      <section className="border-t border-hairline bg-bg px-5 py-16 text-center">
        <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-link">
          24/7
        </p>
        <h2 className="mt-2 text-[clamp(1.5rem,4.5vw,2.25rem)] font-semibold tracking-[-0.03em] text-ink">
          Emergency is the same number.
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-[16px] text-muted">
          Call or WhatsApp {SITE.phoneDisplay}. Across all of Ontario.
        </p>
        <div className="mt-6 flex justify-center">
          <ContactActions source="home-emergency" />
        </div>
      </section>
    </main>
  );
}
