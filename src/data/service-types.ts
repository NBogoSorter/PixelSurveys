// Options for the "Service type" field on the contact forms - simplified,
// client-facing labels + a short description for the quote request, distinct
// from the fuller category names in services.ts used on the services page.
export interface ServiceTypeOption {
  title: string;
  description: string;
}

export const SERVICE_TYPES: ServiceTypeOption[] = [
  {
    title: "Aerial Imagery & Mapping",
    description: "orthomosaic map, georeferenced imagery, site photography",
  },
  {
    title: "Contours & Terrain Data",
    description: "DTM, TIN surface models, contours and topographic details",
  },
  {
    title: "3D Point Clouds & Models",
    description: "point clouds, 3D models & meshes",
  },
  {
    title: "Volumes & Site Monitoring",
    description:
      "cut & fill, stockpiles, progress monitoring, change detection",
  },
  {
    title: "Not Sure",
    description: "help me work out what I need",
  },
];
