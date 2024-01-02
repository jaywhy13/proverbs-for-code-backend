import { PromptTemplate } from "langchain/prompts";
import { RemoteGetSuggestionResponse } from "../../constants";

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
export class PromptTemplateMockFactory {
  public static create({ template }: { template: string } = { template: PROMPT_TEMPLATE_STRING }): PromptTemplate {
    return new PromptTemplate({
      template: template,
      inputVariables: [
        "lesson",
        "number_of_proverbs_to_return",
        "number_of_proverbs_to_consider",
        "exclude_proverbs",
      ],
    });

  }
}


export class RemoteGetSuggestionsResponseFactory {
  public static createWithSingleSuggestion(
    { proverb, meaning, relation }: { proverb: string; meaning: string; relation: string }): RemoteGetSuggestionResponse {
    return {
      "suggestions": [
        {
          proverb,
          meaning,
          relation,
        }
      ],
      "error": ""
    }
  }

  public static createWithError({ error }: { error: string; }): RemoteGetSuggestionResponse {
    return {
      suggestions: [],
      error,
    }

  }
}
