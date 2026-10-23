import type { ImageMetadata } from "astro";

import topographicSurveys from "../assets/services/topographic-surveys.png";
import volumesAndSiteMonitoring from "../assets/services/volumes-and-site-monitoring.png";
import modelsAndPointClouds from "../assets/services/3d-models-point-cloud-classified.png";
import aerialImagery from "../assets/services/aerial-imagery-and-mapping.jpg";
import aboutPhoto from "../assets/about-avenue-dusk.jpg";
import servicesPhoto from "../assets/services-parklands-aerial.jpg";

export interface WhoWeWorkWithItem {
  name: string;
  desc: string;
}

export interface WhoWeWorkWith {
  id: string;
  label: string;
  image: ImageMetadata;
  alt: string;
  text: string;
  items: WhoWeWorkWithItem[];
}

// The client's "Who We Work With" content, from option C2 (side tabs) of the
// About layout exploration, built into the Services page on 23 Oct 2026.
// Each client type gets a photo, a line on what it needs and three example
// deliverables. The deliverable descriptions that repeat a service's own
// (stockpile volumes, orthomosaic, contours) are the client's wording and
// were kept as supplied.
//
// The photos are the closest existing shots, not client-chosen ones: the board
// borrowed the site's own images, and so does this.
export const WHO_WE_WORK_WITH: WhoWeWorkWith[] = [
  {
    id: "civil",
    label: "Civil Construction & Earthworks",
    image: volumesAndSiteMonitoring,
    alt: "A triangulated surface model picking out a row of stockpiles.",
    text: "Volumes, progress and as-built data captured quickly and safely across the whole site.",
    items: [
      {
        name: "Stockpile Volumes",
        desc: "Safe volume measurement of stockpiles across the whole site, reported for each pile with supporting aerial imagery.",
      },
      {
        name: "Cut and fill volumes",
        desc: "Cut and fill volumes calculated efficiently across the whole area from a measured surface or design.",
      },
      {
        name: "Site Progress Monitoring",
        desc: "Repeat captures across the whole site, showing work completed through imagery, 3D models and measured volumes.",
      },
    ],
  },
  {
    id: "land",
    label: "Land Development & Planning",
    image: aerialImagery,
    alt: "A vertical aerial photograph of graded earth meeting a braided watercourse.",
    text: "Understand the site before design begins, with detailed data on existing conditions to support feasibility, planning and design.",
    items: [
      {
        name: "Aerial imagery (Orthomosaic)",
        desc: "A detailed aerial map of the whole site, georeferenced and to scale, ready to import into CAD or use as background imagery.",
      },
      {
        name: "Contours and spot levels",
        desc: "Ground spot levels and contours at your nominated interval.",
      },
      {
        name: "Terrain models for concept and design",
        desc: "High accuracy bare-earth or full-surface elevation models for detailed design and engineering.",
      },
    ],
  },
  {
    id: "survey",
    label: "Surveying & GIS",
    image: topographicSurveys,
    alt: "Contour lines drawn over aerial imagery of a cleared hillside.",
    text: "Capture large or hard to access areas quickly and safely, with data tied to survey control and delivered in your coordinate system.",
    items: [
      {
        name: "Contours & surface models",
        desc: "Ground spot levels and contours at your nominated interval, plus bare-earth or full-surface models generated from the same capture.",
      },
      {
        name: "Detail and feature extraction",
        desc: "Assets, structures and site features extracted across large or hard to access areas, ready to combine with your ground survey.",
      },
      {
        name: "Subcontract drone surveys",
        desc: "We handle flight planning, capture and processing, then supply the data for you to deliver to your client, without the cost of equipment, licensing or training staff.",
      },
    ],
  },
  {
    id: "eng",
    label: "Engineering & Design",
    image: modelsAndPointClouds,
    alt: "A classified point cloud of a housing estate from above.",
    text: "Accurate surfaces and 3D models of current site conditions, ready to bring straight into your CAD or design software.",
    items: [
      {
        name: "Terrain and surface models",
        desc: "High accuracy bare-earth or full-surface elevation models for detailed design and engineering.",
      },
      {
        name: "Point clouds and 3D models",
        desc: "Accurate point clouds and 3D models for measuring, modelling and checking designs against existing conditions.",
      },
      {
        name: "Clearance and dimension checks",
        desc: "Measure heights, distances and clearances between structures, services and terrain before construction begins.",
      },
    ],
  },
  {
    id: "infra",
    label: "Infrastructure & Utilities",
    image: servicesPhoto,
    alt: "Aerial drone imagery of a project site.",
    text: "Capture assets and corridors quickly and safely, with detailed data collected from the air.",
    items: [
      {
        name: "Corridor mapping",
        desc: "Aerial imagery, terrain and feature data along roads, rail lines, pipelines and powerlines, captured efficiently over long distances.",
      },
      {
        name: "Powerline clearance assessments",
        desc: "Measure clearances between powerlines and nearby vegetation, structures and ground.",
      },
      {
        name: "Aerial inspection imagery",
        desc: "Close-range photos of roofs, towers, poles, structures and other hard to access assets.",
      },
    ],
  },
  {
    id: "env",
    label: "Environmental & Land Management",
    image: aboutPhoto,
    alt: "Aerial drone imagery of natural landscape.",
    text: "Track vegetation, disturbance and landform change over time, with repeatable surveys that support environmental compliance reporting.",
    items: [
      {
        name: "Vegetation mapping",
        desc: "High-resolution imagery and 3D data showing the extent, height and condition of vegetation, ideal for tracking revegetation and rehabilitation progress over time.",
      },
      {
        name: "Disturbance and clearing extents",
        desc: "Accurate measurement of cleared, disturbed and rehabilitated areas, checked against approved boundaries.",
      },
      {
        name: "Landfill monitoring",
        desc: "Surface models and volume comparisons that track cut and fill volumes and remaining capacity over time.",
      },
    ],
  },
];
