import type { ImageMetadata } from "astro";

export interface Service {
  title: string;
  items: string[];
  href: string;
  /**
   * Category photo. Leave undefined until photography is supplied - the card
   * falls back to a brand gradient using bandFrom/bandTo. To add one, put the
   * file in src/assets/services/ and `import` it here.
   */
  image?: ImageMetadata;
  imageAlt?: string;
  bandFrom: string;
  bandTo: string;
}

export const SERVICES: Service[] = [
  {
    title: "Imagery & Visual Data",
    items: [
      "Orthomosaic map",
      "Georeferenced aerial imagery",
      "High resolution site photography",
      "CAD/GIS background imagery",
    ],
    href: "/services/",
    bandFrom: "var(--color-ink)",
    bandTo: "var(--color-accent-green)",
  },
  {
    title: "Elevation & Terrain",
    items: [
      "Digital Terrain Model (DTM)",
      "TIN surface models",
      "Contour lines",
      "Topographic information",
    ],
    href: "/services/",
    bandFrom: "var(--color-ink-soft)",
    bandTo: "var(--color-canopy)",
  },
  {
    title: "3D Spatial Data",
    items: [
      "3D Point Clouds",
      "Photogrammetric point clouds",
      "Classified point clouds",
      "3D Models & Meshes",
      "Digital Twins & Reality Capture",
    ],
    href: "/services/",
    bandFrom: "var(--color-accent)",
    bandTo: "var(--color-accent-green)",
  },
  {
    title: "Analysis & Reports",
    items: [
      "Cut & fill calculations",
      "Stockpile volumes & reporting",
      "Site progress monitoring",
      "Change detection & monitoring",
    ],
    href: "/services/",
    bandFrom: "var(--color-ink)",
    bandTo: "var(--color-canopy)",
  },
];
