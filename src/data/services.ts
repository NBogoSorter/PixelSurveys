import type { ImageMetadata } from "astro";

export interface SubService {
  title: string;
  /**
   * One line on what the client actually receives. PLACEHOLDER COPY - written
   * to show the shape, not supplied by the client. Needs their sign-off.
   */
  description: string;
  /**
   * Optional extra sentence or two. When set, the row becomes an expandable
   * <details> on the services page; when absent it stays a plain list item.
   * Currently only on Imagery & Visual Data, as a trial of the pattern - add
   * it to the others to roll the dropdowns out. Placeholder copy too.
   */
  moreInfo?: string;
}

export interface Service {
  title: string;
  /** Category lede. Placeholder copy, same caveat as SubService.description. */
  description: string;
  subServices: SubService[];
  href: string;
  /**
   * Category photo. Leave undefined until photography is supplied - the card
   * falls back to a labelled placeholder showing `imageBrief`. To add one, put
   * the file in src/assets/services/ and `import` it here.
   */
  image?: ImageMetadata;
  imageAlt?: string;
  /**
   * What photo this card needs. Shown inside the placeholder while `image` is
   * undefined, so the site itself doubles as the shot list for the client.
   */
  imageBrief: string;
  bandFrom: string;
  bandTo: string;
}

export const SERVICES: Service[] = [
  {
    title: "Imagery & Visual Data",
    description:
      "Georeferenced imagery you can measure from and drop straight into CAD or GIS.",
    subServices: [
      {
        title: "Orthomosaic Mapping",
        description:
          "A scaled, distortion-corrected map of the whole site.",
        moreInfo:
          "Hundreds of overlapping aerial photos stitched into one scaled image. Measure distances and areas straight off it, or drop it into CAD or GIS as a background layer.",
      },
      {
        title: "High-Resolution Site Photography",
        description: "Detail imagery for records and reporting.",
        moreInfo:
          "Close-range stills of specific features or trouble spots, for progress records, defect reporting and client updates.",
      },
    ],
    href: "/services/",
    imageBrief: "Orthomosaic over a site",
    bandFrom: "var(--color-ink)",
    bandTo: "var(--color-accent-green)",
  },
  {
    title: "Elevation & Terrain",
    description:
      "The shape of the ground, as contours and surface models your designers work from.",
    subServices: [
      {
        title: "Topographic & Contour Surveys",
        description: "Contours at your interval, with spot levels and detail.",
      },
      {
        title: "Terrain & Surface Models (DTM / DSM / TIN)",
        description: "Surfaces ready to bring into your design software.",
      },
    ],
    href: "/services/",
    imageBrief: "Contour overlay on terrain",
    bandFrom: "var(--color-ink-soft)",
    bandTo: "var(--color-canopy)",
  },
  {
    title: "3D Spatial Data",
    description:
      "A measurable three-dimensional record of the site, from raw points to full reality capture.",
    subServices: [
      {
        title: "Point Clouds",
        description: "Dense point data, classified on request.",
      },
      {
        title: "3D Models & Meshes",
        description: "Textured models for planning and stakeholder buy-in.",
      },
      {
        title: "Digital Twins & Reality Capture",
        description: "A navigable record of the site as it stands.",
      },
    ],
    href: "/services/",
    imageBrief: "Point cloud or 3D mesh render",
    bandFrom: "var(--color-accent)",
    bandTo: "var(--color-accent-green)",
  },
  {
    title: "Analysis & Reports",
    description:
      "Numbers you can act on: quantities, earthworks movement and month-on-month change.",
    subServices: [
      {
        title: "Stockpile Volumes",
        description: "Quantities with method and assumptions stated.",
      },
      {
        title: "Cut & Fill Calculations",
        description: "Earthworks measured against your design surface.",
      },
      {
        title: "Site Progress Monitoring",
        description: "Repeat flights, with change measured between them.",
      },
    ],
    href: "/services/",
    imageBrief: "Stockpiles or active earthworks",
    bandFrom: "var(--color-ink)",
    bandTo: "var(--color-canopy)",
  },
];
