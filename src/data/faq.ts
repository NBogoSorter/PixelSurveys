export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "How much does a survey cost?",
    answer:
      "It depends on site size, access and the deliverables. Send a boundary and a short brief and you get a fixed fee, not an hourly rate.",
  },
  {
    question: "How accurate is the data?",
    answer:
      "On open ground we hold 20 to 30 mm vertically against held back check points. Grass, crop and scrub reduce that, which is when we add a LiDAR pass.",
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
