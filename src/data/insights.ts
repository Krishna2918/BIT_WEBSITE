export type Insight = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  body: string[];
};

/** Titles and dates from bitsolution.ca/blog. Bodies rewritten in BIT voice from those posts — no invented metrics. */
export const INSIGHTS: Insight[] = [
  {
    slug: "protect-your-business",
    title: "Struggling with cyber attacks? Protect the floor before it is too late",
    date: "1 December 2025",
    excerpt:
      "Attacks are not rare. Small and mid-size shops in Ontario are in the same queue as everyone else.",
    body: [
      "A locked door on the street does not lock the mailbox. Most shops we walk still share a password, skip backups, and leave a camera recorder on the guest wifi.",
      "BIT treats security as the shell around software, hardware, and AI — not a product you buy once. Watches, locks the device, keeps a copy, and recovers when something breaks.",
      "If you are not sure where you stand, book a consult. We will walk the floor you already have. We will not invent a scare number to sell a box.",
    ],
  },
  {
    slug: "cloud-migration",
    title: "Cloud migration problems? A simple way to move the business",
    date: "1 December 2025",
    excerpt:
      "Cloud promises speed. The mess is usually the move — downtime, copies that do not match, and a login nobody owns.",
    body: [
      "We move what the floor needs, not the whole attic. Canadian private cloud and data centres when the files have to stay here. Microsoft when the desk already lives in 365.",
      "The job is the cutover: who owns the login, where the copy sits, and who we call at 2 a.m. if the first morning is wrong.",
      "BIT runs the hardware under the cloud too. A move that ignores the switch and the backup is just a new place to fail.",
    ],
  },
  {
    slug: "backup-vs-local",
    title: "Cloud backup vs local storage — which holds the business",
    date: "30 October 2025",
    excerpt:
      "Documents, mail, and customer files are the shop. A disk in a drawer is not a plan.",
    body: [
      "Local storage is fast and you can touch it. It also burns, walks out, or dies on a Friday. Cloud backup is a second copy you can reach when the building is the problem.",
      "Most Ontario floors need both: a copy on a private server we hold, and a copy off-site we can restore. PIPEDA still applies to the copy.",
      "We will not pick a brand for you in a blog post. Book a consult and we will say what already sits on your rack.",
    ],
  },
  {
    slug: "managed-it-time",
    title: "How managed IT saves the day you would have spent on tickets",
    date: "30 October 2025",
    excerpt:
      "Running a shop in Ontario means growth, people, and the stack — at the same time. The tickets should not be your afternoon.",
    body: [
      "Managed IT here is the same flag as the software and the cameras. One team watches, patches, and picks up. 24/7 on +1 905-867-6574.",
      "We do not sell a black-box NOC in another country as “your IT person.” A human in the business takes the floor when the ticket is a person.",
      "If you already have a vendor for one slice, we can sit above it. We do not need to rip a working desk to start.",
    ],
  },
  {
    slug: "cyber-mistakes",
    title: "The cybersecurity mistakes we still walk into",
    date: "29 September 2025",
    excerpt:
      "For a small or mid-size Ontario business, security is part of keeping the doors open — not an optional add-on.",
    body: [
      "Shared logins. Recorders on the guest wifi. No one who can pull footage after a claim. A vendor laptop on the plant net. These are the usual ones.",
      "The fix is not a poster in the lunch room. It is access by role, a lock between office and guests, and a copy you can actually restore.",
      "Open the Security page, or book a consult. We will talk about your site, not a generic list of ten tips.",
    ],
  },
  {
    slug: "why-cloud-backup",
    title: "Why Canadian businesses need a backup they can restore",
    date: "29 September 2025",
    excerpt:
      "Customer files and the books are the firm. If the only copy is on one PC, the firm is on that PC.",
    body: [
      "Canadian private cloud and data centres exist so the copy can stay under PIPEDA and still be reachable when the office is not.",
      "Backup is not a folder named “backup.” It is a restore we have watched work. We test that when we take the site.",
      "BIT will say plainly if what you have is already enough. We do not replace a working copy to sell a new one.",
    ],
  },
];

export function getInsight(slug: string) {
  return INSIGHTS.find((item) => item.slug === slug);
}
