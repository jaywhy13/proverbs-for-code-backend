import { PromptTemplate } from "langchain/prompts"
import LLMClientMock, { getResponseForPromptMock } from "../clients/__tests__/factories"
import { LLMClient } from "../clients/llm"
import { Suggestion } from "../constants"
import { PromptTemplateMockFactory, RemoteGetSuggestionsResponseFactory } from "./__tests__/factories"
import { LLMSuggestionService } from "./llm_suggestion"
import { v4 } from 'uuid'

jest.mock('uuid')

describe('LLM Suggestion Service', () => {
  let llmClientMock: LLMClient;
  let promptTemplate: PromptTemplate;
  let llmSuggestionService: LLMSuggestionService;

  beforeEach(() => {

    llmClientMock = LLMClientMock()
    promptTemplate = PromptTemplateMockFactory.create()

    llmSuggestionService = new LLMSuggestionService({ llmClient: llmClientMock, promptTemplate })
  })


  it('should return suggestions obtained from the client', async () => {
    const id = 'd4f6bfae-78f5-46a0-961d-947c09ca1659';
    v4.mockReturnValueOnce(id)
    const remoteGetSuggestionsResponse = RemoteGetSuggestionsResponseFactory.createWithSingleSuggestion(
      {
        proverb: "This is the proverb",
        meaning: "This is the meaning",
        relation: "This is the relation"
      })

    getResponseForPromptMock.mockResolvedValue(remoteGetSuggestionsResponse)


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

  it('should throw an error if we get an error in the response', async () => {
    const remoteGetSuggestionsResponse = RemoteGetSuggestionsResponseFactory.createWithError({ error: "This is the error" })

    getResponseForPromptMock.mockResolvedValue(remoteGetSuggestionsResponse)


    const lesson = "My lesson"
    const numberOfProverbs = 5;
    const excludeSuggestions: Suggestion[] = []

    await expect(llmSuggestionService.getSuggestions({ lesson, numberOfProverbs, excludeSuggestions })).rejects.toThrow("This is the error")


  })
})
