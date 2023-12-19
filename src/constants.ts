export interface Suggestion {
  id: string;
  proverb: Proverb;
  relation: string;
}

export interface Proverb {
  text: string;
  meaning: string;
}
