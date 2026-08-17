export type GalleryGroup = "sector" | "hardware" | "desk";

export type GalleryItem = {
  src: string;
  alt: string;
  label: string;
  group: GalleryGroup;
};

export const GALLERY: GalleryItem[] = [
  { src: "/images/home/hardware.jpg", alt: "Assembled office with rack, desk, and camera", label: "Hardware", group: "hardware" },
  { src: "/images/hardware/server.jpg", alt: "Private server rack", label: "Private servers", group: "hardware" },
  { src: "/images/hardware/camera.jpg", alt: "Dome camera", label: "Cameras", group: "hardware" },
  { src: "/images/hardware/switch.jpg", alt: "Network switch", label: "Network", group: "hardware" },
  { src: "/images/hardware/pc.jpg", alt: "Workstation", label: "Workstations", group: "hardware" },
  { src: "/images/hardware/phone.jpg", alt: "Desk phone", label: "Phones", group: "hardware" },
  { src: "/images/home/software.jpg", alt: "Laptop showing a business dashboard", label: "Software", group: "desk" },
  { src: "/images/home/security.jpg", alt: "Glass security shell", label: "Security", group: "desk" },
  { src: "/images/industries/dental.jpg", alt: "Dental operatory", label: "Dental", group: "sector" },
  { src: "/images/industries/healthcare.jpg", alt: "Clinic floor", label: "Healthcare", group: "sector" },
  { src: "/images/industries/transportation.jpg", alt: "Ontario highway with a tractor-trailer", label: "Transportation", group: "sector" },
  { src: "/images/industries/warehouses.jpg", alt: "Warehouse aisle", label: "Warehouses", group: "sector" },
  { src: "/images/industries/construction.jpg", alt: "Job site", label: "Construction", group: "sector" },
  { src: "/images/industries/legal.jpg", alt: "Law office", label: "Legal", group: "sector" },
  { src: "/images/industries/accounting.jpg", alt: "Accounting desk", label: "Accounting", group: "sector" },
  { src: "/images/industries/industrial.jpg", alt: "Plant floor", label: "Industrial", group: "sector" },
  { src: "/images/industries/retail.jpg", alt: "Retail floor", label: "Retail", group: "sector" },
  { src: "/images/industries/hospitality.jpg", alt: "Hotel desk", label: "Hospitality", group: "sector" },
  { src: "/images/industries/schools.jpg", alt: "School building", label: "Schools", group: "sector" },
  { src: "/images/industries/colleges.jpg", alt: "Campus", label: "Colleges", group: "sector" },
  { src: "/images/industries/airports.jpg", alt: "Airport hall", label: "Airports", group: "sector" },
  { src: "/images/industries/auto-dealerships.jpg", alt: "Dealership floor", label: "Auto dealerships", group: "sector" },
  { src: "/images/lp/fleet-truck.jpg", alt: "Fleet truck", label: "Fleet", group: "desk" },
  { src: "/images/lp/dental-office.jpg", alt: "Dental office", label: "Dental desk", group: "desk" },
  { src: "/images/extras/digital-marketing.jpg", alt: "Marketing desk with search and maps", label: "Digital marketing", group: "desk" },
  { src: "/images/extras/procurement.jpg", alt: "Receiving table with IT cartons", label: "Procurement", group: "desk" },
  { src: "/images/extras/voip.jpg", alt: "Desk phones and a speakerphone", label: "VoIP", group: "desk" },
];

export const GALLERY_HOME = GALLERY.filter((_, i) =>
  [0, 8, 10, 11, 2, 16, 13, 6].includes(i),
);
