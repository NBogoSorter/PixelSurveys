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

// "Monitoring & Progress" trails off with "....." in the client's draft -
// closed out with a period below until the real ending is supplied.
export const CAPABILITIES: Capability[] = [
  {
    title: "Construction & Earthworks",
    description:
      "Progress monitoring, surface models including TINs & DTMs, cut & fill volumes and stockpile calculations.",
    icon: "construction",
  },
  {
    title: "Land Development & Planning",
    description:
      "Capture existing site conditions with detailed aerial imagery, terrain models, contour and feature surveys.",
    icon: "land",
  },
  {
    title: "Surveying & Mapping",
    description:
      "Supplement traditional survey data with georeferenced imagery, terrain and surface models, contours, detailed survey information and data capture across large or difficult to access areas. Supplied in the coordinate system required.",
    icon: "survey",
  },
  {
    title: "Infrastructure & Assets",
    description:
      "Aerial imagery and spatial data for mapping, documenting and monitoring roads, utilities and other infrastructure assets.",
    icon: "infrastructure",
  },
  {
    title: "Monitoring & Progress",
    description:
      "Repeat drone surveys to track project progress, compare surfaces and document changes across a site over time. Including stockpiles, volumes and site monitoring.",
    icon: "monitoring",
  },
  {
    title: "Environmental & Land Management",
    description:
      "Capture detailed information about terrain, vegetation and deformation changes across sites.",
    icon: "environment",
  },
];
