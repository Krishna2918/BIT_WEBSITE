import { SITE } from "@/lib/site";

export type LegacyBlock = { h2?: string; p: string };
export type LegacyPage = {
  path: string;
  kicker: string;
  date?: string;
  kind: "page" | "article";
  lede: string;
  blocks: LegacyBlock[];
  faqs: { q: string; a: string }[];
  crumbs: { name: string; path: string }[];
  disclosure: string;
};

const DISCLOSE =
  "Facts on this page are limited to locked BIT Solution details: legal name, Brampton address, Ontario coverage, phone, WhatsApp, emails, four pillars, extra desks, Microsoft Cloud Solution Provider, CRTC regulated wholesaler, PIPEDA, and PHIPA agent language. No case studies, headcount, or rankings are claimed.";

export const LEGACY_PAGES: Record<string, LegacyPage> = {
  "/about-us": {
    path: "/about-us",
    kicker: "Company",
    kind: "page",
    lede: `${SITE.name} is an Ontario IT company. Software, hardware, AI, and security — under one flag.`,
    crumbs: [
      { name: "Home", path: "/" },
      { name: "About", path: "/about-us" },
    ],
    disclosure: DISCLOSE,
    faqs: [
      {
        q: "Where is BIT Solution?",
        a: `Primary address: ${SITE.address}. We cover entire Ontario.`,
      },
      {
        q: "How do I reach you?",
        a: `Call or WhatsApp ${SITE.phoneDisplay}. Email ${SITE.email}. Support: ${SITE.supportEmail}.`,
      },
    ],
    blocks: [
      {
        h2: "Who we are",
        p: `${SITE.legalName} runs software, hardware, AI, and security as one team. Extra desks: digital marketing, procurement, and VoIP / business phones. Same flag on every floor.`,
      },
      {
        h2: "Where we work",
        p: `Headquarters: ${SITE.address}. Service coverage: entire Ontario — not only the GTA. Pins we already list include Ottawa, Brampton, Brantford, Kitchener, Montreal, and Australia. 425 Veterans Drive is not a BIT address.`,
      },
      {
        h2: "Providers we sit with",
        p: "Microsoft Cloud Solution Provider. CRTC regulated wholesaler. Product names from the partner field on this site. BIT Solution is the company you contract — partners are the stack behind the stack, not a second inbox.",
      },
      {
        h2: "Privacy",
        p: "Personal information under PIPEDA. We do not sell your information. Dental charts: PHIPA is mandatory; we sign a written agent agreement and follow those rules. Measurement on bitsolution.ca stays off until cookie consent, privacy/security approval, and QA.",
      },
    ],
  },
  "/accessibility-statement": {
    path: "/accessibility-statement",
    kicker: "Access",
    kind: "page",
    lede: "Ask us if a page, form, or consult does not work for you. We will take the request on the same number as the rest of the desk.",
    crumbs: [
      { name: "Home", path: "/" },
      { name: "Accessibility", path: "/accessibility-statement" },
    ],
    disclosure:
      "This page is a contact path. It is not a legal-reviewed AODA or WCAG conformance statement. Legal-reviewed Accessibility and Terms content was not available and is not invented here.",
    faqs: [
      {
        q: "How do I request another format?",
        a: `Call or WhatsApp ${SITE.phoneDisplay}, or email ${SITE.email}. Say which page and what you need.`,
      },
      {
        q: "Does this site claim a WCAG level?",
        a: "No. We do not publish a conformance level until legal review lands.",
      },
    ],
    blocks: [
      {
        h2: "How to reach us",
        p: `Phone and WhatsApp ${SITE.phoneDisplay}, 24/7. Email ${SITE.email}. Address: ${SITE.address}.`,
      },
      {
        h2: "On this site",
        p: "Every marketing page has a Skip to content link. Consultation is also available by phone if the form is not usable.",
      },
      {
        h2: "What this page is not",
        p: "It is not a substitute for a legal-reviewed accessibility policy. When that text is approved, it replaces this contact page — same URL.",
      },
    ],
  },
  "/solutions": {
    path: "/solutions",
    kicker: "Solutions",
    kind: "page",
    lede: "Four parts. Extra desks. One flag. Across all of Ontario.",
    crumbs: [
      { name: "Home", path: "/" },
      { name: "Solutions", path: "/solutions" },
    ],
    disclosure: DISCLOSE,
    faqs: [
      {
        q: "What IT services do you offer?",
        a: "Software, hardware, AI, and security — under one flag. Extra desks: digital marketing, procurement, and VoIP / business phones. Same team across Ontario.",
      },
      {
        q: "Do you offer customized IT solutions for small businesses?",
        a: "Yes. We size the work to the floor — a single clinic, a yard, a plant, or a multi-site group.",
      },
    ],
    blocks: [
      {
        h2: "Software",
        p: "Fleet, college ERP, clinic, and vision systems — or a custom build in 1, or you don’t pay for three. Built for how people work now.",
      },
      {
        h2: "Hardware",
        p: "Cameras first, then private servers, PCs, network, and phones. Software needs machines. BIT puts them in place.",
      },
      {
        h2: "AI",
        p: "Help that stays on. A person takes over when they should. Coming-soon items are labeled on the AI page.",
      },
      {
        h2: "Security",
        p: "The layer that holds the rest: watch, stop at the edge, lock devices, keep encrypted copies, recover, train people.",
      },
      {
        h2: "Extra desks",
        p: "Digital marketing, procurement, and VoIP / business phones. Same team. Same Ontario coverage.",
      },
    ],
  },
  "/cloud-services-brampton": {
    path: "/cloud-services-brampton",
    kicker: "Cloud",
    kind: "page",
    lede: "Canadian private cloud and Microsoft when the desk already lives in 365. Run from Brampton. Covers entire Ontario.",
    crumbs: [
      { name: "Home", path: "/" },
      { name: "Cloud in Brampton", path: "/cloud-services-brampton" },
    ],
    disclosure: DISCLOSE,
    faqs: [
      {
        q: "How secure is your cloud service?",
        a: "Canadian private cloud and data centres. CRTC regulated wholesaler. Microsoft Cloud Solution Provider. Personal information under PIPEDA. We do not sell your information.",
      },
      {
        q: "Do you only serve Brampton?",
        a: "HQ is 373 Steeles Ave W, Brampton. Coverage is entire Ontario.",
      },
    ],
    blocks: [
      {
        h2: "What we move",
        p: "We move what the floor needs, not the whole attic. Canadian private cloud when the files have to stay here. Microsoft when the desk already lives in 365.",
      },
      {
        h2: "The cutover",
        p: "Who owns the login, where the copy sits, and who we call at 2 a.m. if the first morning is wrong. A move that ignores the switch and the backup is just a new place to fail.",
      },
      {
        h2: "Backup is a restore",
        p: "A folder named backup is not a plan. We test a restore when we take the site. PIPEDA still applies to the copy.",
      },
      {
        h2: "Brampton HQ",
        p: `${SITE.address}. Same number 24/7: ${SITE.phoneDisplay}.`,
      },
    ],
  },
  "/how-to-choose-a-managed-it-services-provider": {
    path: "/how-to-choose-a-managed-it-services-provider",
    kicker: "Insights",
    kind: "article",
    date: "2025-10-30",
    lede: "Running a shop in Ontario means growth, people, and the stack at the same time. The tickets should not be your afternoon.",
    crumbs: [
      { name: "Home", path: "/" },
      { name: "Insights", path: "/insights" },
      { name: "Choose managed IT", path: "/how-to-choose-a-managed-it-services-provider" },
    ],
    disclosure: DISCLOSE,
    faqs: [
      {
        q: "How quickly can I get support if I have an issue?",
        a: `24/7 on ${SITE.phoneDisplay} or WhatsApp at the same number. Email ${SITE.supportEmail}. A person picks up when it is a person problem.`,
      },
      {
        q: "Is there a long-term contract required?",
        a: "We scope the site first. You see the work before anything is signed. We do not publish a one-size contract on this site.",
      },
    ],
    blocks: [
      {
        h2: "One flag, not five vendors",
        p: "Ask whether software, hardware, AI, and security sit with the same team. BIT runs them under one flag so a superintendent is not also the IT department.",
      },
      {
        h2: "A human on the ticket",
        p: "We do not sell a black-box NOC in another country as “your IT person.” A human in the business takes the floor when the ticket is a person.",
      },
      {
        h2: "A restore you have watched",
        p: "Ask to see a restore, not a backup logo. BIT will say plainly if what you have is already enough.",
      },
      {
        h2: "You can keep a working slice",
        p: "If you already have a vendor for one slice, we can sit above it. We do not need to rip a working desk to start.",
      },
    ],
  },
  "/cyber-security-tips-for-small-businesses": {
    path: "/cyber-security-tips-for-small-businesses",
    kicker: "Insights",
    kind: "article",
    date: "2025-09-29",
    lede: "For a small or mid-size Ontario business, security is part of keeping the doors open — not an optional add-on.",
    crumbs: [
      { name: "Home", path: "/" },
      { name: "Insights", path: "/insights" },
      { name: "Cyber tips", path: "/cyber-security-tips-for-small-businesses" },
    ],
    disclosure: DISCLOSE,
    faqs: [
      {
        q: "What do you actually lock?",
        a: "Guest net stays guest. Access follows the role. We keep an encrypted copy and a restore we have watched work.",
      },
    ],
    blocks: [
      { p: "Shared logins. Recorders on the guest wifi. No one who can pull footage after a claim. A vendor laptop on the plant net. These are the usual ones." },
      { p: "The fix is not a poster in the lunch room. It is access by role, a lock between office and guests, and a copy you can actually restore." },
      { p: "A locked door on the street does not lock the mailbox. BIT treats security as the shell around software, hardware, and AI — not a product you buy once." },
      { p: "We will not invent a scare number to sell a box. Book a consult and we walk the floor you already have." },
    ],
  },
  "/5-biggest-benefits-of-cloud-backups": {
    path: "/5-biggest-benefits-of-cloud-backups",
    kicker: "Insights",
    kind: "article",
    date: "2025-09-29",
    lede: "Customer files and the books are the firm. If the only copy is on one PC, the firm is on that PC.",
    crumbs: [
      { name: "Home", path: "/" },
      { name: "Insights", path: "/insights" },
      { name: "Cloud backups", path: "/5-biggest-benefits-of-cloud-backups" },
    ],
    disclosure: DISCLOSE,
    faqs: [
      {
        q: "Local or cloud?",
        a: "Most Ontario floors need both: a copy on a private server we hold, and a copy off-site we can restore. PIPEDA still applies to the copy.",
      },
    ],
    blocks: [
      { h2: "1. The building can be the problem", p: "Local storage is fast and you can touch it. It also burns, walks out, or dies on a Friday." },
      { h2: "2. A second place to stand", p: "Cloud backup is a second copy you can reach when the office is the outage." },
      { h2: "3. A restore, not a folder", p: "Backup is not a folder named backup. It is a restore we have watched work." },
      { h2: "4. The copy still has rules", p: "Canadian private cloud and data centres exist so the copy can stay under PIPEDA and still be reachable." },
      { h2: "5. We will not replace a working copy to sell a new one", p: "BIT will say plainly if what you have is already enough." },
    ],
  },
  "/10-signs-your-business-needs-managed-it-support": {
    path: "/10-signs-your-business-needs-managed-it-support",
    kicker: "Insights",
    kind: "article",
    date: "2025-10-30",
    lede: "The tickets should not be your afternoon. These are signs we walk on Ontario floors — not a scored ranking.",
    crumbs: [
      { name: "Home", path: "/" },
      { name: "Insights", path: "/insights" },
      { name: "Signs you need IT", path: "/10-signs-your-business-needs-managed-it-support" },
    ],
    disclosure: DISCLOSE,
    faqs: [
      {
        q: "Can you start without ripping what works?",
        a: "Yes. If you already have a vendor for one slice, we can sit above it.",
      },
    ],
    blocks: [
      { h2: "1. The chart or the dispatcher freezes", p: "The chair cannot wait on a frozen chart. The 401 does not wait on a frozen dispatcher." },
      { h2: "2. Tickets sit until morning", p: "A reefer alarm, a patient text, or a cooler at 11 p.m. sits in voicemail." },
      { h2: "3. Shared logins", p: "The front desk is one password. A departed associate still has the share." },
      { h2: "4. Guest wifi is the office wifi", p: "Patient files, card numbers, or bills of lading on the same net as the waiting room." },
      { h2: "5. The only copy is one PC", p: "If the firm lives on that tower, the firm is that tower." },
      { h2: "6. Cameras were installed and never watched", p: "Footage nobody can find after a claim is not a camera program." },
      { h2: "7. The server is a closet by the compressor", p: "Hot closets and leftover towers are not a private server." },
      { h2: "8. A vendor laptop on the plant net", p: "No record of what it saw. No time-box on the access." },
      { h2: "9. Three apps and a group chat", p: "Loads, hours, and the shop do not agree. Monday is a rebuild." },
      { h2: "10. You are the IT person", p: "A driver, a superintendent, or a dentist should not also be the help desk. 24/7 on the same BIT number." },
    ],
  },
  "/top-7-cyber-security-solutions-every-business-needs-in-2025": {
    path: "/top-7-cyber-security-solutions-every-business-needs-in-2025",
    kicker: "Insights",
    kind: "article",
    date: "2025-12-01",
    lede: "Not a scare story. The shell BIT already names on the Security page — plus the guest-net split we run on every floor.",
    crumbs: [
      { name: "Home", path: "/" },
      { name: "Insights", path: "/insights" },
      { name: "Seven solutions", path: "/top-7-cyber-security-solutions-every-business-needs-in-2025" },
    ],
    disclosure: DISCLOSE,
    faqs: [
      {
        q: "Is this a product ranking?",
        a: "No. These are the seven controls we already describe. We do not invent market share or scores.",
      },
    ],
    blocks: [
      { h2: "1. Watch around the clock", p: "Attacks are not rare. Small and mid-size shops in Ontario are in the same queue as everyone else." },
      { h2: "2. Stop threats at the edge", p: "The layer that holds the rest starts before the desk." },
      { h2: "3. Lock down every device", p: "Access that follows the role, and dies with the role." },
      { h2: "4. Keep encrypted copies", p: "A second copy you can reach when the building is the problem." },
      { h2: "5. Recover when something breaks", p: "A restore we have watched work — not a folder named backup." },
      { h2: "6. Train people and set the rules", p: "The fix is not a poster in the lunch room." },
      { h2: "7. Split the guest net", p: "Guest stays guest. Charts, bills of lading, and card data stay locked. We know who opened the record." },
    ],
  },
};
