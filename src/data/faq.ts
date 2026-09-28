// Provenance, so it is clear which answers are safe to quote back to a client
// and which are still ours:
//
//   - The first four are the client's own words, supplied 29 Sept 2026, and
//     are reproduced verbatim. "How accurate is drone survey data?" replaced
//     an earlier placeholder of ours that claimed 20-30 mm vertical; the
//     client's figures (30 mm horizontal, 50 mm vertical with PPK) supersede
//     it and are the only accuracy numbers the site should carry.
//   - The rest are placeholders written during the build. They commit the
//     business to a price model, a turnaround, a datum and an airspace
//     process that nobody has confirmed. See README "Before launch".

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
      "A drone flies a planned route over your site, capturing hundreds of overlapping photos. The data is tied to a known coordinate system through GPS/GNSS positioning and surveyed ground control. The result is accurate data you can measure from, including contours, terrain models and volumes.",
  },
  {
    question: "How accurate is drone survey data?",
    answer:
      "Accuracy depends on the equipment, survey method, site conditions and how the results are checked. With PPK positioning and appropriate ground control, drone surveys can typically achieve around 30 mm horizontal and 50 mm vertical accuracy. Results vary with terrain and ground cover.",
  },
  {
    question: "Where in Australia do you work?",
    answer:
      "Pixel Surveys is Adelaide based, servicing projects across South Australia and interstate. Travel costs are calculated and included in your quote.",
  },
  {
    question: "Can drone surveying replace traditional surveying?",
    answer: [
      "For some topographic, volumetric and monitoring surveys, yes. Drone surveying can provide a quicker, more cost-effective and safer way to capture detailed site information. Drones can cover larger areas in less time while providing greater detail and new opportunities to analyse the data.",
      "However, drone surveying does not replace traditional surveying in every situation and never will. Boundary, cadastral and certified surveys require a licensed surveyor, while traditional methods may also be required where higher accuracy is needed.",
      "We work closely with surveyors and engineers where required and will always recommend the most appropriate approach for the project, whether that involves drone data, traditional survey methods or a combination of both.",
    ],
  },
  {
    question: "How much does a survey cost?",
    answer:
      "It depends on site size, access and the deliverables. Send a boundary and a short brief and you get a fixed fee, not an hourly rate.",
  },
  {
    question: "How long until I get the files?",
    answer:
      "Most sites are processed and sent within three working days. Urgent volume checks can go back the same day if we fly early.",
  },
  {
    question: "Do you need access to the site?",
    answer:
      "Yes. We need to place control marks and launch from a safe point. Inductions and site rules are no problem, just tell us what is required.",
  },
  {
    question: "Which coordinate system do you deliver in?",
    answer:
      "MGA2020 by default, or your project grid. The transformation used is stated in the survey report.",
  },
  {
    question: "Can you fly near the airport?",
    answer:
      "Usually yes. Controlled airspace around Adelaide Airport and Parafield needs an approval, which we arrange before the flight.",
  },
];
