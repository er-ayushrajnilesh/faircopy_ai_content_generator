/**
 * Definitions for every supported content type, tone, and length, plus the
 * logic that turns a user's raw prompt into the system instructions and
 * generation parameters sent to the LLM.
 *
 * These lists intentionally mirror client/src/constants/options.js. The two
 * apps don't share a package in this simple architecture, so keep both
 * files in sync if you add or rename an option.
 */

export const CONTENT_TYPES = {
  "Blog Post": "a blog post with a clear, engaging title-worthy opening line, a well-organized body, and a natural conclusion. Use short paragraphs.",
  Email: "an email with an appropriate subject line on the first line (formatted as \"Subject: ...\"), a greeting, a clear body, and a fitting sign-off.",
  "Resume Summary": "a single professional summary paragraph suitable for the top of a resume. Focus on strengths and impact, not a full work history.",
  "Cover Letter": "a complete cover letter with a greeting, an opening hook, one or two body paragraphs connecting experience to the role, a closing paragraph, and a sign-off.",
  "Product Description": "product description copy that highlights concrete benefits and features and would work well on an e-commerce listing page.",
  Advertisement: "short, punchy advertisement copy built around a single clear call to action.",
  "Social Media Caption": "a social media caption: short, engaging, and written in a voice that fits the platform. Include a few relevant hashtags only if they add value.",
  Story: "a short work of narrative fiction with a clear setting, character, and arc appropriate to the requested length.",
  Essay: "an essay with a clear thesis in the opening, structured supporting paragraphs, and a conclusion that reinforces the thesis.",
  "Text Summary": "a concise summary of the text supplied by the user. Capture the key points and important details faithfully without adding outside information or personal opinion.",
};

export const TONES = {
  Professional: "polished, competent, and business-appropriate",
  Friendly: "warm, approachable, and conversational",
  Formal: "precise and respectful, avoiding contractions and slang",
  Casual: "relaxed and conversational, contractions welcome",
  Creative: "imaginative, vivid, and original in its phrasing",
  Academic: "scholarly, precise, and evidence-oriented",
  Persuasive: "confident and benefit-driven, built to convince the reader",
};

export const LENGTHS = {
  Short: { words: "120-180", maxOutputTokens: 500 },
  Medium: { words: "300-450", maxOutputTokens: 900 },
  Long: { words: "600-800", maxOutputTokens: 1600 },
};

export const CONTENT_TYPE_OPTIONS = Object.keys(CONTENT_TYPES);
export const TONE_OPTIONS = Object.keys(TONES);
export const LENGTH_OPTIONS = Object.keys(LENGTHS);

/**
 * Builds the system-level instructions and generation parameters for a
 * single generation request. `type`, `tone`, and `length` are assumed to
 * have already been validated against the option lists above.
 */
export function buildGenerationRequest({ prompt, type, tone, length }) {
  const typeGuidance = CONTENT_TYPES[type];
  const toneGuidance = TONES[tone];
  const lengthConfig = LENGTHS[length];

  const isStory = type === "Story";

  const instructions = [
    "You are a professional writing assistant inside a content generation tool.",
    `The user has chosen the content type "${type}". Always produce exactly that format.`,
    `Write ${typeGuidance}`,
    `If the user's request mentions another format (for example an email, letter, or post), treat that only as subject matter or as something that happens inside the piece. Never switch to that format.`,
    `Tone: write in a ${tone.toLowerCase()} tone — ${toneGuidance}.`,
    `Length: aim for approximately ${lengthConfig.words} words.`,
    "Formatting rules:",
    "- Write in clean plain text. Never use markdown symbols such as #, *, **, or _ for headings or emphasis.",
    "- Use natural paragraph breaks. Do not use bullet points unless the requested content type is naturally a list.",
    "- Output only the requested content itself: no introductory phrases like \"Here is your content:\", no closing remarks, and no surrounding quotation marks.",
    isStory
      ? "- This is fiction: invent character names, places, and details freely. Do not use bracketed placeholders, and do not write a greeting, subject line, or sign-off."
      : "- If the request depends on specific facts, names, or data that were not provided, use a clearly bracketed placeholder such as [Company Name] rather than inventing specifics and presenting them as fact.",
  ].join("\n");

  const inputLabel = type === "Text Summary" ? "Text to summarize" : "Request";

  return {
    instructions,
    input: `Content type: ${type}\n${inputLabel}: ${prompt}`,
    maxOutputTokens: lengthConfig.maxOutputTokens,
  };
}
