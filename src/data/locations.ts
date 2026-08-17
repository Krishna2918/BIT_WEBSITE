export type OfficeKind = "hq" | "office" | "presence";

export type Office = {
  city: string;
  region: string;
  address: string;
  kind: OfficeKind;
  note: string;
};

export const OFFICES: Office[] = [
  {
    city: "Brampton",
    region: "ON",
    address: "373 Steeles Ave W, Brampton, ON L6Y 0P8",
    kind: "hq",
    note: "Headquarters. Desk and the floor we run from.",
  },
  {
    city: "Ottawa",
    region: "ON",
    address: "879 Antonio Farley St, Ottawa, ON K4A 5K1",
    kind: "office",
    note: "National-capital office.",
  },
  {
    city: "Kitchener",
    region: "ON",
    address: "34 Commonwealth St, Kitchener, ON N2E 4K2",
    kind: "office",
    note: "Waterloo Region office.",
  },
  {
    city: "Brantford",
    region: "ON",
    address: "Brantford, ON",
    kind: "office",
    note: "Ontario office. Street on request.",
  },
  {
    city: "Montreal",
    region: "QC",
    address: "Montreal, QC",
    kind: "office",
    note: "Quebec office. Street on request.",
  },
  {
    city: "Sydney",
    region: "NSW",
    address: "Sydney, NSW, Australia",
    kind: "office",
    note: "Australia office.",
  },
  {
    city: "Melbourne",
    region: "VIC",
    address: "Melbourne, VIC, Australia",
    kind: "office",
    note: "Australia office.",
  },
  {
    city: "Frankfort",
    region: "KY",
    address: "Frankfort, Kentucky",
    kind: "presence",
    note: "United States presence.",
  },
  {
    city: "Harrisburg",
    region: "PA",
    address: "Harrisburg, Pennsylvania",
    kind: "presence",
    note: "United States presence.",
  },
  {
    city: "Carson City",
    region: "NV",
    address: "Carson City, Nevada",
    kind: "presence",
    note: "United States presence.",
  },
  {
    city: "Sacramento",
    region: "CA",
    address: "Sacramento, California",
    kind: "presence",
    note: "United States presence.",
  },
  {
    city: "Auckland",
    region: "NZ",
    address: "Auckland, New Zealand",
    kind: "presence",
    note: "New Zealand presence.",
  },
];
