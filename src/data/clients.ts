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
};

export const CLIENTS: Record<ClientSector, Client[]> = {
  dental: [
    {
      name: "Sandhu Dental Group",
      city: "Eastern Ontario",
      href: "https://sandhudental.ca/",
      logo: "/images/clients/sandhu-dental.png",
    },
    {
      name: "Milestone Dentistry",
      city: "Mississauga",
      href: "https://www.milestonedentistry.ca/",
    },
    {
      name: "Revive Dental",
      city: "Mississauga",
      href: "https://revivedental.ca/",
    },
    {
      name: "Riverside West Dental",
      city: "Owen Sound",
      href: "https://www.riversidewestdental.ca/",
    },
    { name: "The Dentist", city: "Ontario" },
    { name: "River Run Dental", city: "Mississauga" },
    {
      name: "Mavis Dental Centre",
      city: "Mississauga",
      href: "https://mavisdentalcentre.com/",
    },
    { name: "Dentistry at Lakeshore", city: "Etobicoke" },
  ],
  transportation: [
    {
      name: "DM Transport",
      city: "Bolton",
      href: "https://dmtransport.ca/",
      logo: "/images/clients/dm-transport.png",
    },
    { name: "American Systems", city: "Brampton" },
    {
      name: "ICAP Transport",
      city: "Brampton",
      href: "https://icaptransport.com/",
    },
    { name: "Velocity Transport", city: "Acton" },
    { name: "Moonstar", city: "Ontario" },
    {
      name: "MPL Brokerage LLC",
      city: "Belleville, MI",
      href: "https://mplbrokeragellc.com/",
    },
    { name: "Moonlight Carriers", city: "Ontario" },
    {
      name: "Skylark Logistics",
      city: "Cambridge",
      href: "https://www.skylarklogistics.com/",
      logo: "/images/clients/skylark.png",
    },
  ],
  construction: [
    { name: "Crown Royal Dental", city: "Ontario" },
    {
      name: "D Rock Paving",
      city: "Brampton",
      href: "https://drockpaving.ca/",
    },
  ],
  warehouses: [
    {
      name: "Vespa Packaging",
      city: "Brampton",
      href: "https://www.vespapackaging.com/",
      logo: "/images/clients/vespa.png",
    },
    {
      name: "ShipMonk",
      city: "Brampton",
      href: "https://www.shipmonk.com/",
    },
  ],
};

export function clientsFor(slug: string): Client[] {
  if (slug in CLIENTS) return CLIENTS[slug as ClientSector];
  return [];
}
