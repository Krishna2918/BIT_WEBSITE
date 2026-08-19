export type ClientSector =
  | "dental"
  | "transportation"
  | "construction"
  | "warehouses";

export type Client = {
  name: string;
  city: string;
  href?: string;
  logo?: string;
  /** Stock placeholder until the client sends a real photo. */
  photo: string;
  video?: string;
};

export const CLIENTS: Record<ClientSector, Client[]> = {
  dental: [
    {
      name: "Sandhu Dental Group",
      city: "Eastern Ontario",
      href: "https://sandhudental.ca/",
      logo: "/images/clients/sandhu-dental.png",
      photo: "/images/clients/stock/dental-1.jpg",
      video: "/videos/clients/dental.mp4",
    },
    {
      name: "Milestone Dentistry",
      city: "Mississauga",
      href: "https://www.milestonedentistry.ca/",
      photo: "/images/clients/stock/dental-2.jpg",
    },
    {
      name: "Revive Dental",
      city: "Mississauga",
      href: "https://revivedental.ca/",
      photo: "/images/clients/stock/dental-3.jpg",
    },
    {
      name: "Riverside West Dental",
      city: "Owen Sound",
      href: "https://www.riversidewestdental.ca/",
      photo: "/images/clients/stock/dental-4.jpg",
    },
    { name: "The Dentist", city: "Ontario", photo: "/images/industries/dental.jpg" },
    { name: "River Run Dental", city: "Mississauga", photo: "/images/lp/dental-office.jpg" },
    {
      name: "Mavis Dental Centre",
      city: "Mississauga",
      href: "https://mavisdentalcentre.com/",
      photo: "/images/lp/dental-desk.jpg",
    },
    { name: "Dentistry at Lakeshore", city: "Etobicoke", photo: "/images/lp/dental-infra.jpg" },
  ],
  transportation: [
    {
      name: "DM Transport",
      city: "Bolton",
      href: "https://dmtransport.ca/",
      logo: "/images/clients/dm-transport.png",
      photo: "/images/clients/stock/truck-1.jpg",
      video: "/videos/clients/truck.mp4",
    },
    { name: "American Systems", city: "Brampton", photo: "/images/clients/stock/truck-2.jpg" },
    {
      name: "ICAP Transport",
      city: "Brampton",
      href: "https://icaptransport.com/",
      photo: "/images/clients/stock/truck-3.jpg",
    },
    { name: "Velocity Transport", city: "Acton", photo: "/images/industries/transportation.jpg" },
    { name: "Moonstar", city: "Ontario", photo: "/images/lp/fleet-truck.jpg" },
    {
      name: "MPL Brokerage LLC",
      city: "Belleville, MI",
      href: "https://mplbrokeragellc.com/",
      photo: "/images/lp/fleet-dispatch.jpg",
    },
    { name: "Moonlight Carriers", city: "Ontario", photo: "/images/lp/fleet-telematics.jpg" },
    {
      name: "Skylark Logistics",
      city: "Cambridge",
      href: "https://www.skylarklogistics.com/",
      logo: "/images/clients/skylark.png",
      photo: "/images/industries/industrial.jpg",
    },
  ],
  construction: [
    {
      name: "Crown Royal Dental",
      city: "Ontario",
      photo: "/images/industries/construction.jpg",
    },
    {
      name: "D Rock Paving",
      city: "Brampton",
      href: "https://drockpaving.ca/",
      photo: "/images/clients/stock/pave-1.jpg",
      video: "/videos/clients/pave.mp4",
    },
  ],
  warehouses: [
    {
      name: "Vespa Packaging",
      city: "Brampton",
      href: "https://www.vespapackaging.com/",
      logo: "/images/clients/vespa.png",
      photo: "/images/clients/stock/wh-1.jpg",
      video: "/videos/clients/warehouse.mp4",
    },
    {
      name: "ShipMonk",
      city: "Brampton",
      href: "https://www.shipmonk.com/",
      photo: "/images/clients/stock/wh-2.jpg",
    },
  ],
};

export function clientsFor(slug: string): Client[] {
  if (slug in CLIENTS) return CLIENTS[slug as ClientSector];
  return [];
}
