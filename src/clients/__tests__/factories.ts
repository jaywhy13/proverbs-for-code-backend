
export const getResponseForPromptMock = jest.fn();

/**
 * This mock can be used as a stand-in replacement for the
 * real LLMClient
 */
const LLMClientMock = jest.fn().mockImplementation(() => {
  return {
    getResponseForPrompt: getResponseForPromptMock
  }
});

export default LLMClientMock;
