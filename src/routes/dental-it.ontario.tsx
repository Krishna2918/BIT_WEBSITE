import { createFileRoute, Link } from "@tanstack/react-router";
import { LpFooter, LpHeader } from "@/components/site/lp-chrome";
import { SITE, SITE_INDEXABLE } from "@/lib/site";

export const Route = createFileRoute("/dental-it/ontario")({
  component: DentalOntario,
  head: () => ({
    meta: [
      { title: "Ontario Dental IT — BIT Solution" },
      {
        name: "description",
        content:
          `Clinic software, private servers, cameras, and IT support for Ontario dental practices. Call BIT Solution at ${SITE.phoneDisplay}.`,
      },
      { property: "og:title", content: "Ontario Dental IT — BIT Solution" },
      {
        name: "robots",
        content: SITE_INDEXABLE ? "index,follow" : "noindex,nofollow,noarchive",
      },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/dental-it/ontario` }],
  }),
});

function DentalOntario() {
  return (
    <div className="lp" id="main">
      <LpHeader />
      <main>
        <section className="lp-hero">
          <p className="lp-kicker">Ontario · Dental IT · PHIPA · PIPEDA</p>
          <h1>The chair cannot wait on a frozen chart.</h1>
          <p className="lp-lede">
            {SITE.positioning} Charts, cameras, and a private server as one
            stack — with a lock on who sees a patient file.
          </p>
          <div className="cta-pair lp-cta-row">
            <a
              className="cta-book"
              href={SITE.phoneHref}
            >
              Call {SITE.phoneDisplay}
            </a>
          </div>
        </section>

        <img
          className="lp-bleed"
          src="/images/lp/dental-office.jpg"
          alt="Quiet professional dental reception with no patient records on screen"
          width={1600}
          height={900}
        />

        <section className="lp-grid">
          <article>
            <h2>Clinic software at the desk</h2>
            <p>
              We support clinic software—and can design custom workflows when
              off-the-shelf tools do not fit your practice.
            </p>
          </article>
          <article>
            <h2>Machines that hold the night</h2>
            <p>
              Workstations at the chair, cameras in the hall, phones, and a
              private server. No leftover PCs beside the compressor.
            </p>
          </article>
          <article>
            <h2>Help after hours</h2>
            <p>
              24/7 intake for the desk and the chairs. A person when it is a
              patient or a leak — not a voicemail until morning.
            </p>
          </article>
          <article>
            <h2>Guest net stays guest</h2>
            <p>
              Patient files and card numbers do not belong on the waiting-room
              wifi. We lock the record and write down who opened it.
            </p>
          </article>
        </section>

        <div className="lp-pair">
          <img
            src="/images/lp/dental-infra.jpg"
            alt="Small private server and network gear in a clean closet"
            width={800}
            height={500}
          />
          <img
            src="/images/lp/dental-desk.jpg"
            alt="Empty front-desk workstation in a bright clinic"
            width={800}
            height={500}
          />
        </div>

        <section className="lp-contact-wrap" id="consult">
          <h2>Call about dental IT</h2>
          <p>Ontario practices can call us to discuss the operatory, front desk, and IT stack.</p>
          <a className="lp-book" href={SITE.phoneHref}>
            Call {SITE.phoneDisplay}
          </a>
        </section>
      </main>
      <LpFooter />
      <Link to="/" className="sr-only">
        Main BIT Solution site
      </Link>
    </div>
  );
}
