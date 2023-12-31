import { RemoteGetSuggestionResponse, Suggestion } from "../constants";
import { PromptTemplate } from "langchain/prompts";
import { z } from "zod";
import { v4 } from "uuid";
import { SuggestionService } from "./suggestions";
import { LLMClient } from "../clients/llm";

const PROMPT_TEMPLATE_STRING = `
I want to summarize lessons I've learned as proverbs. You will be provided
with a summary of the lesson sorrounded by 3 tildas. For the summary I want you
to provide a list of proverbs that capture the essence of the summary.

Only choose proverbs that are relatively popular. If you can't find any proverbs
that apply, don't recommend any.

When you choose the proverbs, rank them by order of relevance. Select 
{number_of_proverbs_to_consider} proverbs,
and only provide the top {number_of_proverbs_to_return} that are most relevant to the summary. 

Count the number of proverbs you are returning to ensure you are not returning less or more
than {number_of_proverbs_to_return}. You should return exactly {number_of_proverbs_to_return}

For example, if the lesson is "ignoring small problems can wreak havoc later",
one proverb that would apply is "a little leak can sink a big ship".

For each proverb, you are to provide an explanation of the proverb and also indicate
how it relates to the summary.

Don't use any of the following proverbs:
{exclude_proverbs}

~~~
{lesson}
~~~
`;

export const SUGGESTIONS_OUTPUT_SCHEMA = z.object({
  suggestions: z
    .array(
      z.object({
        proverb: z.string().describe("The proverb that you are suggesting"),
        meaning: z
          .string()
          .describe(
            "The meaning of the proverb explained in a sentence or two",
          ),
        relation: z
          .string()
          .describe(
            "An explanation of how the proverb relates to the lesson that we are trying to capture with a proverb",
          ),
      }),
    )
    .describe(
      "A list of the proverbs, their meaning and relation to the lesson provided",
    ),
  error: z
    .string()
    .describe(
      "Any error message encountered that made it impossible to return a proper response",
    )
    .optional(),
});


const suggestionPromptTemplate = new PromptTemplate({
  template: PROMPT_TEMPLATE_STRING,
  inputVariables: [
    "lesson",
    "number_of_proverbs_to_return",
    "number_of_proverbs_to_consider",
    "exclude_proverbs",
  ],
});

export class LLMSuggestionService implements SuggestionService {

  llmClient: LLMClient
  promptTemplate: PromptTemplate

  public constructor({ llmClient, promptTemplate }: { llmClient?: LLMClient, promptTemplate?: PromptTemplate }) {
    this.llmClient = llmClient || new LLMClient();
    this.promptTemplate = promptTemplate || suggestionPromptTemplate;
  }

  /*
   * Generates a prompt for based on a template
   */
  private async generatePrompt({
    lesson,
    numberOfProverbs,
    excludeSuggestions,
  }: {
    lesson: string;
    numberOfProverbs: number;
    excludeSuggestions?: Suggestion[];
  }): Promise<string> {
    const excludeProverbs = (excludeSuggestions || []).map((excludedSuggestion) => excludedSuggestion.proverb)
      .join("\n")
    const prompt = await suggestionPromptTemplate.format({
      number_of_proverbs_to_consider: numberOfProverbs * 2,
      number_of_proverbs_to_return: numberOfProverbs,
      exclude_proverbs: excludeProverbs,
      lesson,
    });
    return prompt;
  }

  /**
  * Provides a list of suggestions from the LLM Client
  */
  public async getSuggestions({
    lesson,
    numberOfProverbs,
    excludeSuggestions,
  }: {
    lesson: string;
    numberOfProverbs: number;
    excludeSuggestions: Suggestion[];
  }): Promise<Suggestion[]> {
    const prompt = await this.generatePrompt({
      lesson,
      numberOfProverbs,
      excludeSuggestions,
    });
    const remoteGetSuggestionsResponse: RemoteGetSuggestionResponse = await this.llmClient.getResponseForPrompt(
      prompt,
      SUGGESTIONS_OUTPUT_SCHEMA,
    );
    if (remoteGetSuggestionsResponse.error) {
      throw new Error(remoteGetSuggestionsResponse.error);
    } else {
      const remoteSuggestions = remoteGetSuggestionsResponse.suggestions;
      return remoteSuggestions.map((remoteSuggestion) => ({
        id: v4(),
        proverb: {
          text: remoteSuggestion.proverb,
          meaning: remoteSuggestion.meaning,
        },
        relation: remoteSuggestion.relation,
      }));
    }
  }
}

const suggestionService: SuggestionService = new LLMSuggestionService({});
export default suggestionService;
