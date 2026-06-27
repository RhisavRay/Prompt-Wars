/**
 * Type declarations for Future Gemini/AI services
 */

export interface AiPromptTemplate {
  name: string;
  version: string;
  template: string;
  variables: string[];
}

export interface AiGenerationResult {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  modelName: string;
}
