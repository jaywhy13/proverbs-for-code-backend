import LLMClientMock, { getResponseForPromptMock } from "../clients/__tests__/factories"
import { Suggestion } from "../constants"
import { PromptTemplateMockFactory } from "./__tests__/factories"
import { LLMSuggestionService, SUGGESTIONS_OUTPUT_SCHEMA } from "./llm_suggestion"
import { v4 } from 'uuid'

jest.mock('uuid')

describe('LLM Suggestion Service', () => {
  it('should return suggestions obtained from the client', async () => {
    const id = 'd4f6bfae-78f5-46a0-961d-947c09ca1659';
    v4.mockReturnValueOnce(id)
    const llmClientMock = LLMClientMock()
    const output = SUGGESTIONS_OUTPUT_SCHEMA.parse({
      "suggestions": [
        {
          "proverb": "This is the proverb",
          "meaning": "This is the meaning",
          "relation": "This is the relation"
        }
      ],
      "error": ""
    })

    getResponseForPromptMock.mockResolvedValue(output)
    const promptTemplate = PromptTemplateMockFactory.create()

    const llmSuggestionService = new LLMSuggestionService({ llmClient: llmClientMock, promptTemplate })

    const lesson = "My lesson"
    const numberOfProverbs = 5;
    const excludeSuggestions: Suggestion[] = []
    const suggestions = await llmSuggestionService.getSuggestions({ lesson, numberOfProverbs, excludeSuggestions })

    expect(suggestions).toEqual([{
      "id": id,
      "proverb": {
        "text": "This is the proverb",
        "meaning": "This is the meaning"
      },
      "relation": "This is the relation"

    }])

  })
})
