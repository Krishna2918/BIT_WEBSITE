import { createFileRoute, Link } from "@tanstack/react-router";
import { ConsultForm } from "@/components/site/consult-form";
import { LpFooter, LpHeader } from "@/components/site/lp-chrome";
import { SITE, SITE_INDEXABLE } from "@/lib/site";
import { track } from "@/lib/tracking";

export const Route = createFileRoute("/fleet-operations/ontario")({
  component: FleetOntario,
  head: () => ({
    meta: [
      { title: "Ontario Fleet Operations IT — BIT Solution" },
      {
        name: "description",
        content:
          "Dispatch, telematics, cameras, and private servers for Ontario commercial fleets. Book a consultation with BIT Solution in Brampton.",
      },
      { property: "og:title", content: "Ontario Fleet Operations IT — BIT Solution" },
      {
        name: "robots",
        content: SITE_INDEXABLE ? "index,follow" : "noindex,nofollow,noarchive",
      },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/fleet-operations/ontario` }],
  }),
});

function FleetOntario() {
  return (
    <div className="lp" id="main">
      <LpHeader consultTo="#consult" />
      <main>
        <section className="lp-hero">
          <p className="lp-kicker">Ontario · Fleet operations · PIPEDA · MTO / CVOR</p>
          <h1>Keep the yard and the road on one stack.</h1>
          <p className="lp-lede">
            {SITE.positioning} Dispatch, telematics, cameras, and a private
            server back at the shop — so a driver is not also the IT desk.
          </p>
          <div className="cta-pair lp-cta-row">
            <a className="cta-book" href="#consult">
              Book consultation
            </a>
            <a
              className="cta-ghost callrail rTapNumber"
              href={SITE.phoneHref}
              onClick={() => track("click_to_call", { source: "fleet-hero" })}
            >
              {SITE.phoneDisplay}
            </a>
          </div>
        </section>

        <img
          className="lp-bleed"
          src="/images/lp/fleet-truck.jpg"
          alt="White commercial tractor-trailer on an Ontario highway"
          width={1600}
          height={900}
        />

        <section className="lp-grid">
          <article>
            <h2>Dispatch that the shop can trust</h2>
            <p>
              Loads, hours, and the shop should not live in three apps and a
              group chat. We already run fleet software — or we build a desk in
              1 if your lanes will not fit a box.
            </p>
          </article>
          <article>
            <h2>Telematics and yard cameras</h2>
            <p>
              Tracking devices, yard cameras, dispatch machines, and a private
              server that holds the day. Built for commercial transport — not a
              pickup and a consumer tablet.
            </p>
          </article>
          <article>
            <h2>Help when a reefer calls at 2 a.m.</h2>
            <p>
              24/7 intake that knows the unit and the load, and wakes a person
              when it should. Remote checks first. A human when the truck is
              waiting.
            </p>
          </article>
          <article>
            <h2>The lock on the board</h2>
            <p>
              Driver files and bills of lading do not belong on the shop wifi.
              We split the yard, lock the files, and write down who opened the
              gate.
            </p>
          </article>
        </section>

        <div className="lp-pair">
          <img
            src="/images/lp/fleet-dispatch.jpg"
            alt="Fleet dispatch monitors showing routes on a quiet operations desk"
            width={800}
            height={500}
          />
          <img
            src="/images/lp/fleet-telematics.jpg"
            alt="Telematics unit and tablet on a clean shop desk"
            width={800}
            height={500}
          />
        </div>

        <section className="lp-download" id="checklist">
          <h2>Ontario fleet checklist</h2>
          <p>
            A short internal checklist for cameras, trackers, dispatch, and
            access. It is not an official MTO form and it is not a certification.
          </p>
          <a
            className="lp-book"
            href="/downloads/mto-fleet-checklist.pdf"
            onClick={() => track("checklist_download", { file: "mto-fleet" })}
          >
            Download the checklist
          </a>
        </section>

        <section className="lp-form-wrap" id="consult">
          <h2>Book a fleet consultation</h2>
          <p>
            Brampton and the GTA first — we will talk through your yard, not a
            script.
          </p>
          <ConsultForm intent="fleet" source="fleet-operations-ontario" />
        </section>
      </main>
      <LpFooter />
      <Link to="/" className="sr-only">
        Main BIT Solution site
      </Link>
    </div>
  );
}
