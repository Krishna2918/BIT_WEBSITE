export type MapMedia = {
  src: string;
  label: string;
  kind: "image" | "video";
};

/** Service and floor media. Stock stills until real client shots arrive. */
export const ONTARIO_MEDIA: MapMedia[] = [
  { src: "/images/home/software.jpg", label: "Software", kind: "image" },
  { src: "/images/home/hardware.jpg", label: "Hardware", kind: "image" },
  { src: "/images/home/ai.jpg", label: "AI", kind: "image" },
  { src: "/images/home/security.jpg", label: "Security", kind: "image" },
  { src: "/videos/software.mp4", label: "Software", kind: "video" },
  { src: "/videos/hardware.mp4", label: "Hardware", kind: "video" },
  { src: "/videos/ai.mp4", label: "AI", kind: "video" },
  { src: "/videos/security.mp4", label: "Security", kind: "video" },
  { src: "/images/hardware/server.jpg", label: "Private servers", kind: "image" },
  { src: "/images/hardware/camera.jpg", label: "Cameras", kind: "image" },
  { src: "/videos/camera.mp4", label: "Cameras", kind: "video" },
  { src: "/images/hardware/switch.jpg", label: "Network", kind: "image" },
  { src: "/images/hardware/pc.jpg", label: "Workstations", kind: "image" },
  { src: "/images/hardware/phone.jpg", label: "Phones", kind: "image" },
  { src: "/videos/phone.mp4", label: "Phones", kind: "video" },
  { src: "/images/extras/digital-marketing.jpg", label: "Digital marketing", kind: "image" },
  { src: "/images/extras/procurement.jpg", label: "Procurement", kind: "image" },
  { src: "/images/extras/voip.jpg", label: "VoIP", kind: "image" },
  { src: "/images/industries/dental.jpg", label: "Dental", kind: "image" },
  { src: "/images/industries/transportation.jpg", label: "Transportation", kind: "image" },
  { src: "/images/industries/construction.jpg", label: "Construction", kind: "image" },
  { src: "/images/industries/warehouses.jpg", label: "Warehouses", kind: "image" },
  { src: "/images/industries/healthcare.jpg", label: "Healthcare", kind: "image" },
  { src: "/images/industries/legal.jpg", label: "Legal", kind: "image" },
  { src: "/images/clients/stock/dental-1.jpg", label: "Dental floor", kind: "image" },
  { src: "/images/clients/stock/truck-1.jpg", label: "Fleet floor", kind: "image" },
  { src: "/images/clients/stock/pave-1.jpg", label: "Paving floor", kind: "image" },
  { src: "/images/clients/stock/wh-1.jpg", label: "Warehouse floor", kind: "image" },
  { src: "/videos/clients/dental.mp4", label: "Dental floor", kind: "video" },
  { src: "/videos/clients/truck.mp4", label: "Fleet floor", kind: "video" },
  { src: "/videos/clients/pave.mp4", label: "Paving floor", kind: "video" },
  { src: "/videos/clients/warehouse.mp4", label: "Warehouse floor", kind: "video" },
];

/** lng, lat ring — simplified Ontario shoreline, north-up. */
export const ONTARIO_RING: [number, number][] = [
  [-82.68, 41.68],
  [-81.2, 42.28],
  [-80.05, 42.55],
  [-79.07, 42.88],
  [-78.95, 43.26],
  [-79.42, 43.64],
  [-78.1, 43.92],
  [-76.75, 44.18],
  [-75.48, 44.72],
  [-74.36, 45.02],
  [-74.34, 45.52],
  [-75.9, 45.95],
  [-77.7, 46.65],
  [-79.05, 47.35],
  [-79.55, 50.4],
  [-80.15, 51.55],
  [-79.85, 54.5],
  [-81.4, 55.25],
  [-85.1, 55.85],
  [-88.6, 56.86],
  [-91.2, 54.9],
  [-94.15, 53.45],
  [-95.16, 52.75],
  [-94.7, 50.15],
  [-95.15, 49.0],
  [-92.4, 48.18],
  [-89.05, 47.96],
  [-87.35, 48.82],
  [-84.86, 46.78],
  [-83.55, 45.15],
  [-82.45, 43.05],
];

export const WEST = -95.3;
export const EAST = -74.2;
export const SOUTH = 41.55;
export const NORTH = 56.95;

export function project(lng: number, lat: number): { x: number; y: number } {
  return {
    x: ((lng - WEST) / (EAST - WEST)) * 1000,
    y: ((NORTH - lat) / (NORTH - SOUTH)) * 1180,
  };
}

export const ONTARIO_POINTS = ONTARIO_RING.map(([lng, lat]) => project(lng, lat));

export function pointInOntario(x: number, y: number): boolean {
  let inside = false;
  for (let i = 0, j = ONTARIO_POINTS.length - 1; i < ONTARIO_POINTS.length; j = i++) {
    const xi = ONTARIO_POINTS[i].x;
    const yi = ONTARIO_POINTS[i].y;
    const xj = ONTARIO_POINTS[j].x;
    const yj = ONTARIO_POINTS[j].y;
    const hit = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi + 0.0001) + xi;
    if (hit) inside = !inside;
  }
  return inside;
}

export function randomPointInOntario(): { x: number; y: number } {
  for (let n = 0; n < 40; n++) {
    const x = 40 + Math.random() * 920;
    const y = 40 + Math.random() * 1100;
    if (pointInOntario(x, y)) return { x, y };
  }
  return project(-79.76, 43.68);
}

export const HQ = project(-79.76, 43.68);

export const CITY_LABELS: { name: string; lng: number; lat: number }[] = [
  { name: "Brampton", lng: -79.76, lat: 43.68 },
  { name: "Ottawa", lng: -75.7, lat: 45.42 },
  { name: "Kitchener", lng: -80.49, lat: 43.45 },
  { name: "Brantford", lng: -80.26, lat: 43.14 },
  { name: "Windsor", lng: -83.04, lat: 42.31 },
  { name: "Thunder Bay", lng: -89.25, lat: 48.38 },
  { name: "Sudbury", lng: -80.99, lat: 46.49 },
];
