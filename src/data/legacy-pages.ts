import type { LegacyPageContent } from "@/components/site/legacy-preserved-page";

export const LEGACY_PAGES = {
  about: {
    eyebrow: "About BIT Solution",
    title: "One team for the technology your business runs on.",
    summary:
      "BIT Solution supports Ontario organizations across infrastructure, software, AI workflows, cybersecurity, communications, and day-to-day IT.",
    sections: [
      { title: "Built around the operation", body: "We begin with the floor, clinic, office, fleet, or site—not a preselected box." },
      { title: "One accountable team", body: "Hardware, connected systems, software, and support stay coordinated through one conversation." },
      { title: "Ontario coverage", body: "Our public service-coverage commitment is the entire province of Ontario." },
      { title: "Clear next step", body: "A consultation confirms the current environment, the priority, and who should take the next action." },
    ],
  },
  accessibility: {
    eyebrow: "Accessibility",
    title: "Accessibility statement",
    summary:
      "BIT Solution is working to make this website useful with a keyboard, screen reader, touch input, and common zoom settings.",
    sections: [
      { title: "Using this site", body: "Navigation, forms, headings, focus states, labels, and error messages are designed to be understandable without relying on colour alone." },
      { title: "Need another format?", body: "If a page or document creates a barrier, contact BIT Solution and tell us what you need and how you would like us to respond." },
    ],
  },
  solutions: {
    eyebrow: "Solutions",
    title: "Technology that fits the work.",
    summary:
      "Explore the core BIT Solution service lanes, from connected hardware and managed support to custom software, AI workflows, and cybersecurity.",
    sections: [
      { title: "Hardware & connected devices", body: "Networks, computers, cameras, access control, communications, and the infrastructure underneath them." },
      { title: "Custom software & AI", body: "Workflow software and carefully bounded AI assistance designed around how the organization operates." },
      { title: "Cybersecurity", body: "Practical access, device, network, backup, and recovery controls coordinated with the environment." },
      { title: "Support", body: "A human support path for service questions and operational issues, with the existing Call and WhatsApp routes preserved." },
    ],
  },
  cloud: {
    eyebrow: "Cloud services",
    title: "Cloud Services Brampton",
    summary:
      "Plan cloud work around ownership, access, backup, recovery, and the people who need the system on the first working day.",
    sections: [
      { title: "Migration planning", body: "Map applications, identities, files, dependencies, and the cutover before moving the production workload." },
      { title: "Microsoft cloud", body: "Coordinate Microsoft 365 and related cloud services with the devices, identities, and operating process already in use." },
      { title: "Backup and recovery", body: "Define where copies live, who can restore them, and how recovery will be verified." },
      { title: "Hybrid environments", body: "Keep on-site infrastructure and cloud services working as one managed environment when both are required." },
    ],
  },
} satisfies Record<string, LegacyPageContent>;
