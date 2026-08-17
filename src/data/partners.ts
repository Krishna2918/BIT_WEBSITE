export type Partner = {
  slug: string;
  name: string;
  line: string;
  logo: string;
};

/** Pulled from the partner strip on bitsolution.ca (June 2025 logos). */
export const PARTNERS: Partner[] = [
  {
    slug: "watchguard",
    name: "WatchGuard",
    line: "Network security and unified threat management.",
    logo: "/images/partners/1.jpg",
  },
  {
    slug: "webroot",
    name: "Webroot",
    line: "Endpoint and DNS protection for the desk.",
    logo: "/images/partners/2.jpg",
  },
  {
    slug: "trend-micro",
    name: "Trend Micro",
    line: "Enterprise threat detection across mail and cloud.",
    logo: "/images/partners/3.jpg",
  },
  {
    slug: "sonicwall",
    name: "SonicWall",
    line: "Firewalls and secure remote access.",
    logo: "/images/partners/4.jpg",
  },
  {
    slug: "sophos",
    name: "Sophos",
    line: "Endpoint, firewall, and managed detection.",
    logo: "/images/partners/5.jpg",
  },
  {
    slug: "sentinelone",
    name: "SentinelOne",
    line: "Autonomous endpoint detection and response.",
    logo: "/images/partners/6.jpg",
  },
  {
    slug: "microsoft",
    name: "Microsoft",
    line: "Cloud Solution Provider — 365, Azure, and the desktop.",
    logo: "/images/partners/7.jpg",
  },
  {
    slug: "huntress",
    name: "Huntress",
    line: "Managed detection for the mid-market floor.",
    logo: "/images/partners/8.jpg",
  },
  {
    slug: "fortinet",
    name: "Fortinet",
    line: "Security fabric — firewall, switch, and wireless as one.",
    logo: "/images/partners/9.jpg",
  },
  {
    slug: "eset",
    name: "ESET",
    line: "Endpoint antivirus with a light footprint.",
    logo: "/images/partners/10.jpg",
  },
  {
    slug: "crowdstrike",
    name: "CrowdStrike",
    line: "Cloud-native endpoint and identity protection.",
    logo: "/images/partners/11.jpg",
  },
  {
    slug: "bitdefender",
    name: "Bitdefender",
    line: "GravityZone endpoint and prevention.",
    logo: "/images/partners/12.jpg",
  },
];
