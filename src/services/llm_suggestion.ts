import { Suggestion } from "../constants";
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

const outputSchema = z.object({
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

const promptTemplate = new PromptTemplate({
  template: PROMPT_TEMPLATE_STRING,
  inputVariables: [
    "lesson",
    "number_of_proverbs_to_return",
    "number_of_proverbs_to_consider",
    "exclude_proverbs",
  ],
});

export class LLMSuggestionService implements SuggestionService {
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
    excludeSuggestions: Array<Suggestion>;
  }): Promise<string> {
    const prompt = await promptTemplate.format({
      number_of_proverbs_to_consider: numberOfProverbs * 2,
      number_of_proverbs_to_return: numberOfProverbs,
      exclude_proverbs: excludeSuggestions
        .map((excludedSuggestion) => excludedSuggestion.proverb)
        .join("\n"),
      lesson,
    });
    return prompt;
  }

  public async getSuggestions({
    lesson,
    numberOfProverbs,
    excludeSuggestions,
  }: {
    lesson: string;
    numberOfProverbs: number;
    excludeSuggestions: Array<Suggestion>;
  }): Promise<Suggestion[]> {
    const prompt = await this.generatePrompt({
      lesson,
      numberOfProverbs,
      excludeSuggestions,
    });
    const llmClient = new LLMClient();
    const structuredOutput = await llmClient.getResponseForPrompt(
      prompt,
      outputSchema,
    );
    if (structuredOutput.error) {
      throw new Error(structuredOutput.error);
    } else {
      const remoteSuggestions = structuredOutput.suggestions;
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

const suggestionService: SuggestionService = new LLMSuggestionService();
export default suggestionService;
