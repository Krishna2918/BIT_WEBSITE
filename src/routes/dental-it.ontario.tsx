import { createFileRoute, Link } from "@tanstack/react-router";
import { ConsultForm } from "@/components/site/consult-form";
import { LpFooter, LpHeader } from "@/components/site/lp-chrome";
import { SITE } from "@/lib/site";
import { track } from "@/lib/tracking";

import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/dental-it/ontario")({
  component: DentalOntario,
  head: () => pageHead("/dental-it/ontario"),
});

function DentalOntario() {
  return (
    <div className="lp" id="main">
      <LpHeader consultTo="#consult" />
      <main>
        <section className="lp-hero">
          <p className="lp-kicker">Ontario · Dental IT · PHIPA · PIPEDA</p>
          <h1>The chair cannot wait on a frozen chart.</h1>
          <p className="lp-lede">
            {SITE.positioning} Charts, cameras, and a private server as one
            stack — with a lock on who sees a patient file.
          </p>
          <div className="cta-pair lp-cta-row">
            <a className="cta-book" href="#consult">
              Book consultation
            </a>
            <a
              className="cta-ghost callrail rTapNumber"
              href={SITE.phoneHref}
              onClick={() => track("click_to_call", { source: "dental-hero" })}
            >
              {SITE.phoneDisplay}
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
              Charts, billing, and the chair should agree. We run clinic
              software built for the floor — or a custom build in 1 if the box
              will not fit.
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

        <section className="lp-download" id="checklist">
          <h2>PHIPA self-audit</h2>
          <p>
            A practice discussion guide for access, wifi, cameras, and vendors.
            It is not a PHIPA certification, legal advice, or a claim about
            clinical outcomes.
          </p>
          <a
            className="lp-book"
            href="/downloads/dental-phipa-self-audit.pdf"
            onClick={() => track("checklist_download", { file: "phipa" })}
          >
            Download the self-audit
          </a>
        </section>

        <section className="lp-form-wrap" id="consult">
          <h2>Book a dental IT consultation</h2>
          <p>Ontario practices. We will talk through the operatory and the desk.</p>
          <ConsultForm intent="dental" source="dental-it-ontario" />
        </section>
      </main>
      <LpFooter />
      <Link to="/" className="sr-only">
        Main BIT Solution site
      </Link>
    </div>
  );
}
