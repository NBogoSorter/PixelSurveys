import type { ImageMetadata } from "astro";

export interface SubService {
  title: string;
  /** One line on what the client actually receives. Client-supplied copy. */
  description: string;
  /**
   * Detail page for this service. When set, the row on the services page
   * becomes a link; when absent it stays plain text, so a service without a
   * page yet never links to a 404. Add the page first, then the href.
   */
  href?: string;
}

export interface Service {
  title: string;
  /** Category lede. Client-supplied copy. */
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

// Copy below is the client's own, supplied 25 Sept 2026 - not placeholder text,
// with two exceptions marked "DESCRIPTION MISSING" where their list left the
// line blank.
export const SERVICES: Service[] = [
  {
    title: "Aerial Imagery & Mapping",
    description:
      "Current, high-resolution aerial imagery and detailed photos of structures and assets.",
    subServices: [
      {
        title: "Aerial Imagery (Orthomosaic)",
        description:
          "A single aerial image of the whole site corrected and georeferenced to your coordinate system.",
        href: "/services/orthomosaic-mapping/",
      },
      {
        title: "Aerial Inspection Photography",
        description:
          "Close-range photos of roofs, structures and hard to access assets.",
      },
    ],
    href: "/services/",
    imageBrief: "Orthomosaic over a site",
    bandFrom: "var(--color-ink)",
    bandTo: "var(--color-accent-green)",
  },
  {
    title: "Contours & Terrain Models",
    description:
      "Topographic surveys including accurate ground levels, contours and surface models.",
    subServices: [
      {
        title: "Site Levels & Contours",
        description:
          "Ground spot levels and contours at your nominated interval.",
      },
      {
        title: "Detail & Feature Surveys",
        description:
          "Feature detail extraction of assets and structures covering large areas.",
      },
      {
        title: "Terrain & Surface Models (DTM)",
        description:
          "Bare-earth or full-surface elevation models for design and earthworks.",
      },
      {
        title: "Preliminary Contours",
        description:
          "Contours from existing elevation data. Fast, low-cost and no site access needed. Lower accuracy, so suited to concept and feasibility work.",
      },
    ],
    href: "/services/",
    imageBrief: "Contour overlay on terrain",
    bandFrom: "var(--color-ink-soft)",
    bandTo: "var(--color-canopy)",
  },
  {
    title: "3D Models & Point Clouds",
    description: "3D data you can measure from, design with and share.",
    subServices: [
      {
        title: "Point Clouds",
        description:
          "Millions of measured points capturing the site in 3D. Classified on request and ready to use in your own software.",
      },
      {
        title: "3D Models & Digital Twins",
        description: "View, share and annotate a 3D replica of the site.",
      },
      {
        title: "As-Built 3D Capture",
        description:
          "A measured 3D record of what's been built, for checking dimensions, clearances and conformance.",
      },
    ],
    href: "/services/",
    imageBrief: "Point cloud or 3D mesh render",
    bandFrom: "var(--color-accent)",
    bandTo: "var(--color-accent-green)",
  },
  {
    title: "Volumes & Site Monitoring",
    description:
      "Accurate volume measurement and change tracking across the site.",
    subServices: [
      {
        title: "Stockpile Volumes",
        description:
          "Safe volume measurement of stockpiles across the whole site, reported for each pile with supporting aerial imagery.",
      },
      {
        title: "Cut & Fill Calculations",
        description:
          "Cut and fill quantities calculated against your design, or between two measured surfaces.",
      },
      {
        // DESCRIPTION MISSING - the client's list gave no line for this one.
        // Left visible rather than invented, so it gets filled in.
        title: "Site Progress Monitoring",
        description: "[description to come]",
      },
      {
        // DESCRIPTION MISSING - as above.
        title: "Asset & Structure Monitoring",
        description: "[description to come]",
      },
    ],
    href: "/services/",
    imageBrief: "Stockpiles or active earthworks",
    bandFrom: "var(--color-ink)",
    bandTo: "var(--color-canopy)",
  },
];
