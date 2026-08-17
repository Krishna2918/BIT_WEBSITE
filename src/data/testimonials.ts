export type Testimonial = {
  name: string;
  role: string;
  quote: string;
};

/** Only the two named quotes published on bitsolution.ca. */
export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Anaël Dupuis",
    role: "",
    quote:
      "BIT Solution ran a smooth collaboration from start to finish. Their skilled team offered helpful ideas and were highly accessible throughout the project.",
  },
  {
    name: "Léon Renaud",
    role: "Retail Manager",
    quote:
      "BIT Solution Team establishes an effective workflow through consistent communication. The team is knowledgeable, hard-working, and driven.",
  },
];
