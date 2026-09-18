export type TrustIconName = "licensed" | "insured" | "compliant" | "accurate";

export interface TrustPoint {
  title: string;
  description: string;
  icon: TrustIconName;
}

export const TRUST_POINTS: TrustPoint[] = [
  {
    title: "Licensed & Qualified",
    description:
      "Operated by CASA-licensed Remote Pilots with professional surveying qualifications and experience.",
    icon: "licensed",
  },
  {
    title: "Fully Insured",
    description:
      "Appropriately insured for survey and commercial drone operations, providing confidence and protection for every project.",
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
      "Drone operations are carried out with surveying expertise, ensuring captured data is accurately processed, validated and delivered for project requirements.",
    icon: "accurate",
  },
];
