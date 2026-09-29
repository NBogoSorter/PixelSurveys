// Provenance: every answer here is the client's own words. They supplied a
// first set of four on 29 Sept 2026, then replaced the whole FAQ with this
// nine-question set the same day. Nothing in this file is ours any more - the
// earlier placeholders on price, turnaround, datum and airspace are gone.
//
// Two of those placeholders were not carried across and now have no answer on
// the site at all: how long delivery takes, and flying near Adelaide Airport
// or Parafield. Airspace is touched on under "What kinds of sites can you
// survey?"; turnaround is not mentioned anywhere. Worth confirming that the
// omission is deliberate before launch.

export interface FaqItem {
  question: string;
  // An array renders as separate paragraphs. Most answers are one paragraph
  // and stay a plain string rather than a one-element array.
  answer: string | string[];
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "What is drone surveying?",
    answer:
      "At its core, drone surveying turns aerial data into accurate, measurable information. A drone flies a planned route over your site using the appropriate capture method. The data is then processed and tied to a known coordinate system using GNSS positioning and surveyed ground control. The result is detailed data that can be measured and used to create contours, terrain models, volumes and other deliverables. Drone surveying can provide a quicker, more cost-effective and safer way to capture detailed site information, while creating data that can be used for a wider range of measurements and analysis.",
  },
  {
    question: "How accurate is drone survey data?",
    answer:
      "Accuracy depends on the equipment, survey method, site conditions and how the results are checked. With PPK positioning and appropriate ground control, drone surveys can typically achieve around 30 mm horizontal and 50 mm vertical accuracy. Results vary with terrain and ground cover.",
  },
  {
    question: "Can drone surveying replace traditional surveying?",
    answer: [
      "For some topographic, volumetric and monitoring surveys, yes. Drone surveying can provide a quicker, more cost-effective and safer way to capture detailed site information. Drones can cover larger areas in less time while providing greater detail and new opportunities to analyse the data.",
      "However, drone surveying does not replace traditional surveying in every situation and never will. Boundary, cadastral and certified surveys require a licensed surveyor, while traditional methods may also be required where higher accuracy is needed.",
      "Pixel Surveys works closely with surveyors and engineers where required and will always recommend the most appropriate approach for the project, whether that involves drone data, traditional survey methods or a combination of both.",
    ],
  },
  {
    question: "What kinds of sites can you survey?",
    answer:
      "Most sites can be surveyed, from small construction sites to large earthworks, quarries and development areas. Large areas can be covered efficiently, subject to airspace, site conditions and safety requirements. Additional approvals may be required near airports or in restricted airspace, and drone operations must comply with requirements around people and property.",
  },
  {
    question: "How much does a survey cost?",
    answer:
      "Costs vary depending on the site, required accuracy, capture method and deliverables. Drone surveying can be a cost-effective alternative to traditional ground or manned aerial surveying, particularly for large or difficult to access areas, stockpiles, volume measurements and regular site monitoring. Each project is quoted individually based on the work required.",
  },
  {
    question: "Can drones survey large areas?",
    answer:
      "Drones can cover much larger areas than many people expect, with large projects divided into multiple flight operations where required. Low-level drone capture can provide greater detail and accuracy than manned aerial surveys in some situations, while also offering potential cost savings. The approach is tailored to the site, required data and project timeframe.",
  },
  {
    question: "Do you need access to the site?",
    answer:
      "Yes, but site access is generally minimal compared with traditional ground surveying. Access may be required to place ground control, verify results and collect any required ground measurements. Some projects can be completed using existing elevation data without requiring a site visit.",
  },
  {
    question: "Can you provide data in our local site grid?",
    answer:
      "Yes. Data can be supplied in your nominated coordinate system and height datum and can be tied into existing site control where required. Deliverables are provided in file formats suited to your software and workflow. If you’re unsure what you need, assistance is available to determine the appropriate format.",
  },
  {
    question: "Where in Australia do you work?",
    answer:
      "Pixel Surveys is Adelaide based, servicing projects across South Australia and interstate. Travel costs are calculated and included in your quote.",
  },
];
