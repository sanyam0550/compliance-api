import { Module } from '@nestjs/common';
import { LLMService } from './llm.service';
import { HuggingFaceService } from './huggingFace.service';

@Module({
  // Register the providers that will be available in this module
  providers: [
    {
      // Provide an instance of LLMService using a factory pattern
      provide: LLMService,

      // The factory function creates a new instance of LLMService,
      // injecting HuggingFaceService as its dependency
      // This structure allows for easily switching to another service (e.g., OpenAIService)
      useFactory: () => new LLMService(new HuggingFaceService()) // You can pass another implementation such as 'openai' to switch
    }
  ]
})
export class LlmModule {}
