export type CapabilityIconName =
  | "construction"
  | "land"
  | "survey"
  | "infrastructure"
  | "monitoring"
  | "environment";

export interface Capability {
  title: string;
  description: string;
  icon: CapabilityIconName;
}

// Client's own copy, supplied 26 Sept 2026. Land Development & Planning is the
// only entry they left as it was; the rest were rewritten, and "Surveying &
// Mapping" was renamed "Surveying & GIS".
export const CAPABILITIES: Capability[] = [
  {
    title: "Construction & Earthworks",
    description:
      "Progress monitoring, terrain models, contours, cut and fill volumes and stockpile calculations. Data provided in the required project coordinate system.",
    icon: "construction",
  },
  {
    title: "Land Development & Planning",
    description:
      "Capture existing site conditions with detailed aerial imagery, terrain models, contour and feature surveys.",
    icon: "land",
  },
  {
    title: "Surveying & GIS",
    description:
      "Providing georeferenced aerial imagery, contours, terrain models, topographic and feature surveys. Capturing large or difficult to access areas safely and efficiently, with data supplied in the correct coordinate system required.",
    icon: "survey",
  },
  {
    title: "Infrastructure & Assets",
    description:
      "Remote inspection imagery, powerline clearance, corridor mapping, progress and maintenance monitoring.",
    icon: "infrastructure",
  },
  {
    title: "Monitoring & Progress",
    description:
      "Repeat drone surveys to track project progress through site progress imagery, stockpile volumes, earthwork surface comparisons and change detection over time.",
    icon: "monitoring",
  },
  {
    title: "Environmental & Land Management",
    description:
      "Capturing detailed information about terrain and vegetation, with mapping and monitoring of erosion, landform changes and deformation across sites.",
    icon: "environment",
  },
];
