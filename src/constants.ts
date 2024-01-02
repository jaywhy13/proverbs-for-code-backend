import { SUGGESTIONS_OUTPUT_SCHEMA } from "./services/llm_suggestion";

import { z } from "zod";
export interface Suggestion {
  id: string;
  proverb: Proverb;
  relation: string;
}

export interface Proverb {
  text: string;
  meaning: string;
}

export type RemoteGetSuggestionResponse = z.infer<typeof SUGGESTIONS_OUTPUT_SCHEMA>;

