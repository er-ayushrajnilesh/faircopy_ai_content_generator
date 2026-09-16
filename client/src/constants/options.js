// These values must match the keys in server/utils/promptBuilder.js exactly
// — the backend validates every request against that list and rejects
// anything else with a 400.

export const CONTENT_TYPES = [
  "Blog Post",
  "Email",
  "Resume Summary",
  "Cover Letter",
  "Product Description",
  "Advertisement",
  "Social Media Caption",
  "Story",
  "Essay",
  "Text Summary",
];

export const TONES = ["Professional", "Friendly", "Formal", "Casual", "Creative", "Academic", "Persuasive"];

export const LENGTHS = [
  { value: "Short", hint: "~150 words" },
  { value: "Medium", hint: "~375 words" },
  { value: "Long", hint: "~700 words" },
];

export const DEFAULT_FORM_VALUES = {
  prompt: "",
  type: CONTENT_TYPES[0],
  tone: TONES[0],
  length: "Medium",
};

export const PROMPT_MAX_LENGTH = 4000;

// A few starter prompts shown on the generator page to help first-time
// visitors get going without staring at a blank textarea.
export const EXAMPLE_PROMPTS = [
  { type: "Blog Post", tone: "Friendly", length: "Medium", prompt: "5 morning habits that actually improve focus" },
  { type: "Product Description", tone: "Persuasive", length: "Short", prompt: "A refillable glass water bottle with a built-in fruit infuser" },
  { type: "Cover Letter", tone: "Professional", length: "Medium", prompt: "Applying for a junior data analyst role, coming from a customer support background" },
  { type: "Social Media Caption", tone: "Creative", length: "Short", prompt: "A café's new seasonal pumpkin spice croissant" },
];
