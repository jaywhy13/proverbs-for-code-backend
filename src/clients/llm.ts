import { ChatOpenAI } from "langchain/chat_models/openai";
import {
  OutputFixingParser,
  StructuredOutputParser,
} from "langchain/output_parsers";
import { SystemMessage } from "langchain/schema";
import { Schema } from "zod";

const llmModel = new ChatOpenAI({
  modelName: "gpt-3.5-turbo",
  openAIApiKey: process.env.OPENAPI_KEY,
});

export class LLMClient {
  public async getResponseForPrompt<SchemaDefinition>(
    prompt: string,
    outputSchema: Schema<SchemaDefinition>,
  ): Promise<SchemaDefinition> {
    const outputParser = StructuredOutputParser.fromZodSchema(outputSchema);

    const outputFixingParser = OutputFixingParser.fromLLM(
      llmModel,
      outputParser,
    );
    const systemMessageFromPrompt = new SystemMessage(prompt);
    const outputInstructionsMessage = new SystemMessage(
      outputFixingParser.getFormatInstructions(),
    );
    const result = await llmModel.call([
      systemMessageFromPrompt,
      outputInstructionsMessage,
    ]);
    console.log("Got back response:\n", result.content);
    const structuredOutput = await outputParser.parse(result.content);

    return structuredOutput;
  }
}
