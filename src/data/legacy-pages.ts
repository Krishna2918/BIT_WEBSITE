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
      "BIT Solution applies WCAG 2.0 Level AA as a mandatory launch standard for this website, regardless of employee threshold.",
    sections: [
      { title: "Using this site", body: "Navigation, headings, focus states, keyboard operation, touch targets, text alternatives, zoom, and contrast are tested against WCAG 2.0 Level AA without relying on colour alone." },
      { title: "Need another format?", body: "If a page or document creates a barrier, call BIT Solution at +1 905-867-6574 and tell us what you need." },
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
      { title: "Support", body: "A phone-only human support path for service questions and operational issues." },
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
