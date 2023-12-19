import { Suggestion } from "../constants";

export interface SuggestionService {
  getSuggestions({
    lesson,
    numberOfProverbs,
    excludeSuggestions,
  }: {
    lesson: string;
    numberOfProverbs: number;
    excludeSuggestions: Array<Suggestion>;
  }): Promise<Suggestion[]>;
}
