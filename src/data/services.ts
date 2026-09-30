import type { ImageMetadata } from "astro";

// Service card photography. Imported rather than referenced by path so
// astro:assets can resize and re-encode it at build time.
import topographicSurveys from "../assets/services/topographic-surveys.png";
import volumesAndSiteMonitoring from "../assets/services/volumes-and-site-monitoring.png";
import modelsAndPointClouds from "../assets/services/3d-models-point-cloud-classified.png";
import aerialImagery from "../assets/services/aerial-imagery-and-mapping.jpg";

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
   * Homepage card only, when that card should show a different photo from the
   * services page. The two cards crop very differently - 4:3 here against 16:9
   * there - so a shot that works in one can lose its subject in the other.
   * Falls back to `image` when unset, which is what most services do.
   *
   * If you set this, set `homeImageAlt` too: the card will not borrow
   * `imageAlt`, because that describes a different picture.
   *
   * No service uses this at present - the one that did turned out to have
   * been given the wrong photo. Kept because the crop difference that
   * motivated it is real, but treat it as untested against a live page.
   */
  homeImage?: ImageMetadata;
  homeImageAlt?: string;
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
    title: "Topographic Surveys",
    description:
      "Topographic surveys including accurate ground levels, contours and surface models.",
    image: topographicSurveys,
    imageAlt:
      "Contour lines drawn over aerial imagery of a cleared hillside, the labelled contours running from 150 up to 190.",
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
    title: "Volumes & Site Monitoring",
    description:
      "Accurate volume measurement and change tracking across the site.",
    image: volumesAndSiteMonitoring,
    imageAlt:
      "A triangulated surface model seen from a low angle, the mesh picking out a row of stockpiles rising from flat ground.",
    subServices: [
      {
        title: "Stockpile Volumes",
        description:
          "Safe volume measurement of stockpiles across the whole site, reported for each pile with supporting aerial imagery.",
      },
      {
        title: "Cut & Fill Calculations",
        description:
          "Cut and fill volumes calculated efficiently across the whole area from a measured surface or design.",
      },
      {
        title: "Site Progress Monitoring",
        description:
          "Repeat captures across the whole site, showing work completed through imagery, 3D models and measured volumes.",
      },
      {
        title: "Asset & Structure Monitoring",
        description:
          "Repeat monitoring of structures and surfaces where movement or volume change over time.",
      },
    ],
    href: "/services/",
    imageBrief: "Stockpiles or active earthworks",
    bandFrom: "var(--color-ink)",
    bandTo: "var(--color-canopy)",
  },
  {
    title: "Aerial Imagery & Mapping",
    description:
      "Current, high-resolution aerial imagery and detailed photos of structures and assets.",
    image: aerialImagery,
    imageAlt:
      "A vertical aerial photograph of a graded earth surface meeting a braided watercourse, with vegetation following the channels.",
    subServices: [
      {
        // No href: the detail page it linked to is being retired, and a
        // sub-service only becomes a link once a page exists behind it.
        title: "Aerial Imagery (Orthomosaic)",
        description:
          "A single aerial image of the whole site corrected and georeferenced to your coordinate system.",
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
    title: "3D Models & Point Clouds",
    description: "3D data you can measure from, design with and share.",
    image: modelsAndPointClouds,
    imageAlt:
      "A classified point cloud of a housing estate from above, the roofs picked out from the surrounding vegetation by colour.",
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
];
