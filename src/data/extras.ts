export type ExtraService = {
  slug: "digital-marketing" | "procurement" | "voip";
  to: "/digital-marketing" | "/procurement" | "/voip";
  name: string;
  kicker: string;
  line: string;
  image: string;
  imageAlt: string;
  supportImage: string;
  supportAlt: string;
  points: { title: string; body: string }[];
};

export const EXTRAS: ExtraService[] = [
  {
    slug: "digital-marketing",
    to: "/digital-marketing",
    name: "Digital marketing",
    kicker: "Extra desk",
    line: "Search, local listings, and the pages that bring the floor new work.",
    image: "/images/extras/digital-marketing.jpg",
    imageAlt: "Marketing desk with search and maps on the screen",
    supportImage: "/images/extras/digital-marketing-seo.jpg",
    supportAlt: "Local listings map open on a workstation",
    points: [
      {
        title: "SEO",
        body: "Keyword work, technical fixes, local listings for Ontario, and content that can rank without tricks.",
      },
      {
        title: "Local search",
        body: "Maps, citations, and pages that match how people in Brampton and the rest of Ontario look for a shop.",
      },
      {
        title: "Social and content",
        body: "Posts and pages that send traffic to a site we can actually hold — not a pile of ads with no floor under them.",
      },
    ],
  },
  {
    slug: "procurement",
    to: "/procurement",
    name: "Procurement",
    kicker: "Extra desk",
    line: "Hardware, software, and the buy — sourced, priced, and delivered as one job.",
    image: "/images/extras/procurement.jpg",
    imageAlt: "Open cartons of switches, laptops, and phones on a receiving table",
    supportImage: "/images/extras/procurement-staging.jpg",
    supportAlt: "Staging cart with cameras, a switch, and a count sheet",
    points: [
      {
        title: "Strategic sourcing",
        body: "We buy the stack you will run: PCs, cameras, servers, licenses. Government pricing when the job needs it.",
      },
      {
        title: "Supplier desk",
        body: "One team talks to the vendors so you are not chasing five quotes that do not fit together.",
      },
      {
        title: "On-demand buy",
        body: "When the floor needs another switch or a set of phones, the same desk that runs the site places the order.",
      },
    ],
  },
  {
    slug: "voip",
    to: "/voip",
    name: "VoIP & phones",
    kicker: "Extra desk",
    line: "Cloud phones, meetings, and the desk number that follows the person.",
    image: "/images/extras/voip.jpg",
    imageAlt: "Two desk phones, a headset, and a speakerphone on a clean office desk",
    supportImage: "/images/extras/voip-room.jpg",
    supportAlt: "Small meeting room with a conference bar and speakerphone",
    points: [
      {
        title: "Business VoIP",
        body: "Calls on any device. Cisco and ShoreTel when the floor needs a known brand. Lower cost than a copper pair.",
      },
      {
        title: "Meetings and share",
        body: "Webex, GoTo Meeting, Jabber, and screen share — the same network we already hold.",
      },
      {
        title: "Mail and directory",
        body: "Exchange, SharePoint, and Active Directory sit with the phones so a leaver does not keep a line.",
      },
    ],
  },
];

export function getExtra(slug: string) {
  return EXTRAS.find((item) => item.slug === slug);
}
