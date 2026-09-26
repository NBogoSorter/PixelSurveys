export type TrustIconName = "licensed" | "insured" | "compliant" | "accurate";

export interface TrustPoint {
  title: string;
  description: string;
  icon: TrustIconName;
}

// Client's own copy, supplied 26 Sept 2026. Safe & Compliant is the one entry
// they left as it was; "Fully Insured" was renamed "Commercially Insured".
export const TRUST_POINTS: TrustPoint[] = [
  {
    title: "Licensed & Qualified",
    description:
      "CASA-compliant drone operations backed by professional surveying qualifications, technical expertise and industry experience.",
    icon: "licensed",
  },
  {
    title: "Commercially Insured",
    description:
      "Insured with Public Liability and Professional Indemnity cover for survey and commercial drone operations, providing protection and confidence for your project.",
    icon: "insured",
  },
  {
    title: "Safe & Compliant",
    description:
      "Every flight is planned around airspace, weather, site conditions and potential hazards to ensure safe and compliant operations.",
    icon: "compliant",
  },
  {
    title: "Accurate & Reliable Data",
    description:
      "Surveying expertise combined with precise GNSS positioning and professional data processing to deliver accurate and reliable spatial data.",
    icon: "accurate",
  },
];
